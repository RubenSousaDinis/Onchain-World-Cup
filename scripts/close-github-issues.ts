#!/usr/bin/env tsx

/**
 * Script to close GitHub Issues
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token GITHUB_OWNER=owner GITHUB_REPO=repo tsx scripts/close-github-issues.ts <issue_numbers>
 * 
 * Example:
 *   GITHUB_TOKEN=ghp_xxx GITHUB_OWNER=owner GITHUB_REPO=repo tsx scripts/close-github-issues.ts 11 12 13 14 15 16 17 18
 */

import 'dotenv/config'

const GITHUB_API = 'https://api.github.com'

async function closeIssue(token: string, owner: string, repo: string, issueNumber: number) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      state: 'closed',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to close issue #${issueNumber}: ${response.status} ${error}`)
  }

  return response.json()
}

async function main() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  
  if (!token || !owner || !repo) {
    console.error('Error: Missing required environment variables')
    console.error('Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO')
    process.exit(1)
  }
  
  const issueNumbers = process.argv.slice(2).map(arg => parseInt(arg, 10)).filter(n => !isNaN(n))
  
  if (issueNumbers.length === 0) {
    console.error('Error: No issue numbers provided')
    console.error('Usage: tsx scripts/close-github-issues.ts <issue_number> [<issue_number> ...]')
    console.error('Example: tsx scripts/close-github-issues.ts 11 12 13')
    process.exit(1)
  }
  
  console.log(`Closing ${issueNumbers.length} issue(s)...\n`)
  
  for (const issueNumber of issueNumbers) {
    try {
      console.log(`Closing issue #${issueNumber}...`)
      const issue = await closeIssue(token, owner, repo, issueNumber)
      console.log(`  ✅ Closed: #${issue.number} - ${issue.html_url}\n`)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`  ❌ Error closing issue #${issueNumber}:`, error)
    }
  }
  
  console.log('Done!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
