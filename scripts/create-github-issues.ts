#!/usr/bin/env tsx

/**
 * Script to create GitHub Issues from markdown task files
 * Creates a parent issue for each phase and sub-issues for each subtask
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token GITHUB_OWNER=owner GITHUB_REPO=repo tsx scripts/create-github-issues.ts
 * 
 * Dry run (preview without creating):
 *   DRY_RUN=true tsx scripts/create-github-issues.ts
 * 
 * Or set in .env file:
 *   GITHUB_TOKEN=your_token
 *   GITHUB_OWNER=owner
 *   GITHUB_REPO=repo
 *   DRY_RUN=true (optional)
 */

import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import 'dotenv/config'

interface SubTask {
  id: string // e.g., "1.1"
  title: string // e.g., "Initialize Next.js Project"
  content: string // The full content of the subtask section
  isCompleted: boolean // Whether all checkboxes are checked
}

interface TaskFile {
  filename: string
  content: string
  phase: number
  title: string
  overview: string
  subtasks: SubTask[]
}

const GITHUB_API = 'https://api.github.com'
const TASKS_DIR = join(process.cwd(), 'project/tasks')

// GitHub API client
class GitHubClient {
  private token: string
  private owner: string
  private repo: string

  constructor(token: string, owner: string, repo: string) {
    this.token = token
    this.owner = owner
    this.repo = repo
  }

  async createIssue(title: string, body: string, labels: string[] = []) {
    const url = `${GITHUB_API}/repos/${this.owner}/${this.repo}/issues`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title,
        body,
        labels: labels.length > 0 ? labels : undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create issue: ${response.status} ${error}`)
    }

    return response.json()
  }

  async updateIssue(issueNumber: number, body: string) {
    const url = `${GITHUB_API}/repos/${this.owner}/${this.repo}/issues/${issueNumber}`
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ body }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update issue: ${response.status} ${error}`)
    }

    return response.json()
  }
}

// Parse markdown task file and extract subtasks
async function parseTaskFile(filepath: string): Promise<TaskFile> {
  const content = await readFile(filepath, 'utf-8')
  const filename = filepath.split('/').pop() || ''
  
  // Extract phase number from filename (e.g., "phase-1-project-setup.md" -> 1)
  const phaseMatch = filename.match(/phase-(\d+)/)
  const phase = phaseMatch ? parseInt(phaseMatch[1], 10) : 0
  
  // Extract title (first line after #)
  const titleMatch = content.match(/^# (.+)$/m)
  const title = titleMatch ? titleMatch[1] : filename.replace('.md', '')
  
  // Extract overview (content after "## Overview" until next ##)
  const overviewMatch = content.match(/## Overview\s*\n\s*([\s\S]+?)(?=\n## |$)/)
  const overview = overviewMatch ? overviewMatch[1].trim() : ''
  
  // Extract subtasks (sections starting with ### X.X)
  const subtasks: SubTask[] = []
  const subtaskRegex = /^### ((\d+)\.(\d+))\s+(.+)$/gm
  let match
  
  while ((match = subtaskRegex.exec(content)) !== null) {
    const id = match[1] // e.g., "1.1"
    const title = match[4] // e.g., "Initialize Next.js Project"
    
    // Find the content of this subtask (until the next ### or end)
    const startIndex = (match.index || 0) + match[0].length
    const nextSubtaskMatch = content.substring(startIndex).match(/^###/m)
    const endIndex = nextSubtaskMatch && nextSubtaskMatch.index !== undefined
      ? startIndex + nextSubtaskMatch.index 
      : content.length
    
    const subtaskContent = content.substring(startIndex, endIndex).trim()
    
    // Check if subtask is completed (all checkboxes are checked)
    const checkboxRegex = /^- \[([ x])\]/gm
    const checkboxes = subtaskContent.match(checkboxRegex) || []
    const isCompleted = checkboxes.length > 0 && checkboxes.every(cb => cb.includes('[x]'))
    
    subtasks.push({
      id,
      title,
      content: subtaskContent,
      isCompleted,
    })
  }
  
  return {
    filename,
    content,
    phase,
    title,
    overview,
    subtasks,
  }
}

// Format parent issue body
function formatParentIssueBody(task: TaskFile, subIssueNumbers: Array<{ id: string, number: number, title: string }>): string {
  let body = ''
  
  if (task.overview) {
    body += `## Overview\n\n${task.overview}\n\n`
  }
  
  // Add task list of sub-issues
  if (subIssueNumbers.length > 0) {
    body += `## Sub-tasks\n\n`
    subIssueNumbers.forEach(sub => {
      body += `- [ ] #${sub.number} ${sub.id} ${sub.title}\n`
    })
    body += '\n'
  }
  
  // Add reference to original file
  body += `---\n*This issue was automatically created from \`project/tasks/${task.filename}\`*`
  
  return body
}

// Format sub-issue body
function formatSubIssueBody(subtask: SubTask, parentIssueNumber: number, task: TaskFile): string {
  let body = `**Parent Issue:** #${parentIssueNumber}\n\n`
  body += `${subtask.content}\n\n`
  body += `---\n*Sub-task of #${parentIssueNumber} | Created from \`project/tasks/${task.filename}\`*`
  return body
}

async function main() {
  // Get environment variables
  const isDryRun = process.env.DRY_RUN === 'true'
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  
  if (!isDryRun && (!token || !owner || !repo)) {
    console.error('Error: Missing required environment variables')
    console.error('Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO')
    console.error('\nExample:')
    console.error('  GITHUB_TOKEN=ghp_xxx GITHUB_OWNER=your-username GITHUB_REPO=your-repo tsx scripts/create-github-issues.ts')
    console.error('\nOr for dry run:')
    console.error('  DRY_RUN=true tsx scripts/create-github-issues.ts')
    process.exit(1)
  }
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No issues will be created\n')
  }
  
  const github = isDryRun ? null : new GitHubClient(token!, owner!, repo!)
  
  // Read task files (phases 2-9, skipping phase 1)
  console.log(`Reading task files from ${TASKS_DIR}...`)
  const files = await readdir(TASKS_DIR)
  const taskFiles = files
    .filter(f => f.endsWith('.md') && f.startsWith('phase-'))
    .sort()
    .filter(f => {
      // Skip phase 1, process phases 2-9
      const phaseMatch = f.match(/phase-(\d+)/)
      if (phaseMatch) {
        const phase = parseInt(phaseMatch[1], 10)
        return phase >= 2 && phase <= 9
      }
      return false
    })
  
  if (taskFiles.length === 0) {
    console.error('No task files found!')
    process.exit(1)
  }
  
  console.log(`Processing ${taskFiles.length} task file(s) (phases 2-9)\n`)
  
  // Parse and create issues
  const results = []
  for (const file of taskFiles) {
    const filepath = join(TASKS_DIR, file)
    console.log(`Processing ${file}...`)
    
    try {
      const task = await parseTaskFile(filepath)
      console.log(`  Found ${task.subtasks.length} subtasks\n`)
      
      // Create parent issue first
      console.log(`  ${isDryRun ? '[DRY RUN] Would create' : 'Creating'} parent issue: ${task.title}`)
      const parentLabels = ['phase', `phase-${task.phase}`]
      
      let parentIssueNumber = 0
      if (isDryRun) {
        parentIssueNumber = 999 // Placeholder for dry run
        console.log(`  ✅ [DRY RUN] Would create parent issue with labels: ${parentLabels.join(', ')}\n`)
      } else {
        const parentIssue = await github!.createIssue(
          task.title,
          '## Overview\n\n' + task.overview + '\n\n---\n*Sub-issues will be added below*',
          parentLabels
        )
        parentIssueNumber = parentIssue.number
        console.log(`  ✅ Parent issue created: #${parentIssue.number} - ${parentIssue.html_url}\n`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Create sub-issues (skip completed ones)
      const subIssues = []
      const incompleteSubtasks = task.subtasks.filter(st => !st.isCompleted)
      const completedSubtasks = task.subtasks.filter(st => st.isCompleted)
      
      if (completedSubtasks.length > 0) {
        console.log(`  Skipping ${completedSubtasks.length} completed subtask(s):`)
        completedSubtasks.forEach(st => {
          console.log(`    - ${st.id} ${st.title}`)
        })
        console.log()
      }
      
      for (const subtask of incompleteSubtasks) {
        console.log(`  ${isDryRun ? '[DRY RUN] Would create' : 'Creating'} sub-issue: ${subtask.id} ${subtask.title}`)
        
        if (isDryRun) {
          subIssues.push({
            id: subtask.id,
            number: 999 + subIssues.length + 1, // Placeholder for dry run
            title: subtask.title,
            url: `https://github.com/${owner}/${repo}/issues/999${subIssues.length + 1}`,
          })
          console.log(`  ✅ [DRY RUN] Would create sub-issue with labels: phase-${task.phase}, subtask\n`)
        } else {
          const subIssueBody = formatSubIssueBody(subtask, parentIssueNumber, task)
          const subIssue = await github!.createIssue(
            `${task.title} - ${subtask.id} ${subtask.title}`,
            subIssueBody,
            [`phase-${task.phase}`, 'subtask']
          )
          
          subIssues.push({
            id: subtask.id,
            number: subIssue.number,
            title: subtask.title,
            url: subIssue.html_url,
          })
          
          console.log(`  ✅ Sub-issue created: #${subIssue.number} - ${subIssue.html_url}\n`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // Update parent issue with task list of sub-issues
      if (!isDryRun) {
        console.log(`  Updating parent issue with sub-issue references...`)
        const parentBody = formatParentIssueBody(task, subIssues)
        await github!.updateIssue(parentIssueNumber, parentBody)
        console.log(`  ✅ Parent issue updated\n`)
      } else {
        console.log(`  [DRY RUN] Would update parent issue with ${subIssues.length} sub-issue references\n`)
      }
      
      results.push({
        parent: {
          number: parentIssueNumber,
          title: task.title,
          url: isDryRun ? `https://github.com/${owner}/${repo}/issues/999` : `https://github.com/${owner}/${repo}/issues/${parentIssueNumber}`,
        },
        subIssues,
      })
      
      if (!isDryRun) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error)
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Summary')
  console.log('='.repeat(60))
  results.forEach(result => {
    console.log(`\nParent Issue: #${result.parent.number}: ${result.parent.title}`)
    console.log(`  ${result.parent.url}\n`)
    console.log(`Sub-issues (${result.subIssues.length}):`)
    result.subIssues.forEach(sub => {
      console.log(`  #${sub.number}: ${sub.id} ${sub.title}`)
      console.log(`    ${sub.url}`)
    })
  })
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
