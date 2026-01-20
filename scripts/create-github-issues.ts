#!/usr/bin/env tsx

/**
 * Script to create GitHub issues from phase markdown files
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token GITHUB_OWNER=owner GITHUB_REPO=repo tsx scripts/create-github-issues.ts [phase-number]
 * 
 * If no phase number is provided, it will process all phase files
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-org';
const GITHUB_REPO = process.env.GITHUB_REPO || 'your-repo';
const DRY_RUN = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');
const FEATURES_DIR = join(process.cwd(), 'features');

let octokit: Octokit | null = null;

if (!DRY_RUN) {
  if (!GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable is required (unless using --dry-run)');
    process.exit(1);
  }
  octokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
} else {
  console.log('🔍 DRY RUN MODE - No issues will be created\n');
}

interface PhaseData {
  phaseNumber: number;
  title: string;
  overview: string;
  subTasks: SubTask[];
  acceptanceCriteria: string[];
  dependencies: string[];
  complexity?: string;
}

interface SubTask {
  number: string;
  title: string;
  file?: string;
  tasks: string[];
  implementationNotes?: string[];
}

async function parsePhaseFile(filePath: string): Promise<PhaseData | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract phase number from filename (e.g., phase-10-viral-app.md -> 10)
    const filename = filePath.split('/').pop() || '';
    const phaseMatch = filename.match(/phase-(\d+)/);
    if (!phaseMatch) return null;
    
    const phaseNumber = parseInt(phaseMatch[1], 10);
    
    // Extract title (first # heading)
    const titleMatch = content.match(/^# (.+)$/m);
    let title = titleMatch ? titleMatch[1] : `Phase ${phaseNumber}`;
    
    // Check if this is the alternate format (phase-10 with PHASE 0, PHASE 1, etc.)
    const hasAlternateFormat = content.includes('# PHASE 0') || content.includes('# PHASE 1');
    
    // Extract overview (text after ## Overview)
    let overviewMatch = content.match(/## Overview\s*\n([^#]+)/);
    let overview = overviewMatch ? overviewMatch[1].trim() : '';
    
    // If alternate format, extract from first PHASE section's Goal
    if (!overview && hasAlternateFormat) {
      const goalMatch = content.match(/# PHASE 0[^#]*?## Goal\s*\n([^#]+)/);
      if (goalMatch) {
        overview = goalMatch[1].trim();
        title = `${title} — Implementation Overview`;
      }
    }
    
    // Extract sub-tasks (### X.Y sections)
    const subTasks: SubTask[] = [];
    const subTaskRegex = /### (\d+\.\d+)\s+([^\n]+)\n(?:File: `([^`]+)`)?\n([\s\S]*?)(?=\n### |\n## |$)/g;
    let match;
    
    while ((match = subTaskRegex.exec(content)) !== null) {
      const [, number, title, file, content] = match;
      const tasks: string[] = [];
      const implementationNotes: string[] = [];
      
      // Extract checkbox tasks (- [ ] ...)
      const taskRegex = /- \[ \] (.+)/g;
      let taskMatch;
      while ((taskMatch = taskRegex.exec(content)) !== null) {
        tasks.push(taskMatch[1].trim());
      }
      
      // Extract implementation notes
      const notesMatch = content.match(/#### Implementation Notes\s*\n([\s\S]*?)(?=\n#### |\n### |$)/);
      if (notesMatch) {
        notesMatch[1].split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && trimmed.startsWith('-')) {
            implementationNotes.push(trimmed.substring(1).trim());
          }
        });
      }
      
      subTasks.push({
        number,
        title: title.trim(),
        file: file?.trim(),
        tasks,
        implementationNotes: implementationNotes.length > 0 ? implementationNotes : undefined,
      });
    }
    
    // If alternate format, parse PHASE sections as sub-tasks
    if (subTasks.length === 0 && hasAlternateFormat) {
      const phaseSections = content.matchAll(/# PHASE (\d+)[^#]*?## Goal\s*\n([^#]+?)\n\n### Tasks\s*\n([\s\S]*?)(?=\n### Implementation Notes|\n---|$)/g);
      let subTaskIndex = 1;
      
      for (const phaseSection of phaseSections) {
        const [, phaseNum, goal, tasksContent] = phaseSection;
        const phaseTitle = tasksContent.match(/- (.+):/) || [null, `Phase ${phaseNum}`];
        const tasks: string[] = [];
        const implementationNotes: string[] = [];
        
        // Extract tasks from list items
        const taskItems = tasksContent.matchAll(/^[-*]\s+(.+)$/gm);
        for (const taskItem of taskItems) {
          const taskText = taskItem[1].trim();
          // Skip if it's a section header
          if (!taskText.includes(':')) {
            tasks.push(taskText);
          }
        }
        
        // Extract implementation notes
        const notesSection = content.match(new RegExp(`# PHASE ${phaseNum}[\\s\\S]*?### Implementation Notes\\s*\\n([\\s\\S]*?)(?=\n---|$)`, 'i'));
        if (notesSection) {
          notesSection[1].split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && trimmed.startsWith('-')) {
              implementationNotes.push(trimmed.substring(1).trim());
            }
          });
        }
        
        subTasks.push({
          number: `${phaseNumber}.${subTaskIndex}`,
          title: `PHASE ${phaseNum} — ${phaseTitle[1]}`,
          tasks,
          implementationNotes: implementationNotes.length > 0 ? implementationNotes : undefined,
        });
        subTaskIndex++;
      }
    }
    
    // Extract acceptance criteria
    const acceptanceMatch = content.match(/## Acceptance Criteria\s*\n([\s\S]*?)(?=\n## |$)/);
    const acceptanceCriteria = acceptanceMatch
      ? acceptanceMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('- ['))
          .map(line => line.replace(/^-\s*\[[ x]\]\s*/, '').trim())
          .filter(Boolean)
      : [];
    
    // Extract dependencies
    const dependenciesMatch = content.match(/## Dependencies\s*\n([\s\S]*?)(?=\n## |$)/);
    const dependencies = dependenciesMatch
      ? dependenciesMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(Boolean)
      : [];
    
    // Extract complexity
    const complexityMatch = content.match(/## Estimated Complexity\s*\n([^\n]+)/);
    const complexity = complexityMatch ? complexityMatch[1].trim() : undefined;
    
    return {
      phaseNumber,
      title,
      overview,
      subTasks,
      acceptanceCriteria,
      dependencies,
      complexity,
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

function createIssueBody(phase: PhaseData): string {
  let body = `## Overview\n\n${phase.overview}\n\n`;
  
  if (phase.complexity) {
    body += `**Estimated Complexity:** ${phase.complexity}\n\n`;
  }
  
  if (phase.dependencies.length > 0) {
    body += `## Dependencies\n\n${phase.dependencies.map(d => `- ${d}`).join('\n')}\n\n`;
  }
  
  body += `## Sub-tasks\n\n`;
  
  phase.subTasks.forEach(subTask => {
    body += `### ${subTask.number} ${subTask.title}\n\n`;
    
    if (subTask.file) {
      body += `**File:** \`${subTask.file}\`\n\n`;
    }
    
    if (subTask.tasks.length > 0) {
      body += `**Tasks:**\n`;
      subTask.tasks.forEach(task => {
        body += `- [ ] ${task}\n`;
      });
      body += `\n`;
    }
    
    if (subTask.implementationNotes && subTask.implementationNotes.length > 0) {
      body += `**Implementation Notes:**\n`;
      subTask.implementationNotes.forEach(note => {
        body += `- ${note}\n`;
      });
      body += `\n`;
    }
  });
  
  if (phase.acceptanceCriteria.length > 0) {
    body += `## Acceptance Criteria\n\n`;
    phase.acceptanceCriteria.forEach(criteria => {
      body += `- [ ] ${criteria}\n`;
    });
    body += `\n`;
  }
  
  body += `\n---\n\n*This issue was automatically generated from \`features/phase-${phase.phaseNumber}-*.md\`*\n`;
  
  return body;
}

async function createIssue(phase: PhaseData): Promise<void> {
  const title = `${phase.title} (Phase ${phase.phaseNumber})`;
  const body = createIssueBody(phase);
  const labels = ['enhancement', `phase-${phase.phaseNumber}`];
  
  if (DRY_RUN) {
    console.log('─'.repeat(80));
    console.log(`📋 Would create issue: ${title}`);
    console.log(`   Labels: ${labels.join(', ')}`);
    console.log(`   Sub-tasks: ${phase.subTasks.length}`);
    console.log(`   Acceptance Criteria: ${phase.acceptanceCriteria.length}`);
    console.log('\n--- Issue Body Preview ---\n');
    console.log(body.substring(0, 1000));
    if (body.length > 1000) {
      console.log(`\n... (${body.length - 1000} more characters)\n`);
    }
    console.log('─'.repeat(80) + '\n');
    return;
  }
  
  try {
    const { data } = await octokit!.rest.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title,
      body,
      labels,
    });
    
    console.log(`✅ Created issue #${data.number}: ${title}`);
    console.log(`   URL: ${data.html_url}\n`);
  } catch (error: any) {
    console.error(`❌ Error creating issue for ${title}:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

async function main() {
  // Filter out flags from arguments
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  const phaseNumber = args[0];
  
  try {
    const files = await readdir(FEATURES_DIR);
    const phaseFiles = files
      .filter(file => file.startsWith('phase-') && file.endsWith('.md'))
      .sort();
    
    let filesToProcess = phaseFiles;
    
    if (phaseNumber) {
      const targetPhase = `phase-${phaseNumber}`;
      filesToProcess = phaseFiles.filter(file => file.startsWith(targetPhase));
      
      if (filesToProcess.length === 0) {
        console.error(`No phase files found matching: ${targetPhase}`);
        process.exit(1);
      }
    }
    
    console.log(`Processing ${filesToProcess.length} phase file(s)...\n`);
    
    for (const file of filesToProcess) {
      const filePath = join(FEATURES_DIR, file);
      console.log(`Parsing: ${file}`);
      
      const phase = await parsePhaseFile(filePath);
      
      if (!phase) {
        console.warn(`⚠️  Could not parse ${file}, skipping...\n`);
        continue;
      }
      
      console.log(`Found phase ${phase.phaseNumber}: ${phase.title}`);
      console.log(`Sub-tasks: ${phase.subTasks.length}\n`);
      
      await createIssue(phase);
      
      // Rate limiting: wait 1 second between issues
      if (filesToProcess.indexOf(file) < filesToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
