# GitHub Development Workflow Guide

This guide outlines the standard workflow for working with GitHub Issues during development of the Crypto World Cup application.

## Overview

We use a **GitHub Issues-driven development workflow** where:
- All work is tracked in GitHub Issues
- Each feature/task has a corresponding issue
- Branches are created from issues
- Commits and PRs reference issues
- Issues automatically close when PRs are merged

## Workflow Steps

### 1. Start Working on an Issue

Create a branch from the issue number (e.g., #13):

```bash
# Fetch the latest from main
git checkout main
git pull origin main

# Create branch with issue number
git checkout -b issue-13-setup-supabase

# Or using a shorter format
git checkout -b 13-setup-supabase
```

### 2. Work on Your Changes

Make your code changes as usual:

```bash
# Edit files, make changes...

# Stage changes
git add .

# Commit with issue reference (see commit message format below)
git commit -m "Add Supabase configuration - closes #13"
```

### 3. Commit Message Format

**Always reference the issue in your commit messages:**

```bash
# Format 1: Simple reference
git commit -m "Implement feature - closes #13"

# Format 2: More descriptive
git commit -m "Add Supabase client setup and configuration

- Configure environment variables
- Set up Supabase client
- Add connection helpers

Closes #13"

# Format 3: Multiple commits (use "see #13" for intermediate commits)
git commit -m "Add Supabase config - see #13"
git commit -m "Add connection helpers - see #13"
git commit -m "Complete Supabase setup - closes #13"
```

**Keywords that close issues:**
- `closes #123` - Closes issue when PR is merged
- `fixes #123` - Same as closes
- `resolves #123` - Same as closes
- `see #123` - Links but doesn't close (for intermediate commits)

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin issue-13-setup-supabase

# Then create a PR on GitHub (or via CLI if configured)
```

**PR Description Template:**

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Closes #13

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
- [ ] Tested locally
- [ ] Added tests (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
```

**Important:** Include `Closes #13` (or `Fixes #13`) in the PR description. When the PR is merged, GitHub will automatically close the issue.

### 5. Code Review & Merge

Once your PR is reviewed and approved:
- Merge the PR (via GitHub UI or CLI)
- GitHub automatically closes the linked issue
- Update the parent issue task list if this was a sub-issue

### 6. Clean Up

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local branch (optional)
git branch -d issue-13-setup-supabase

# Delete remote branch (if not auto-deleted)
git push origin --delete issue-13-setup-supabase
```

## Branch Naming Conventions

Use consistent branch naming:

**Format:** `issue-{number}-{short-description}`

**Examples:**
- `issue-13-setup-supabase`
- `issue-20-app-initialization`
- `issue-42-qualification-contract`
- `15-setup-database` (shorter version)

**Rules:**
- Use kebab-case (lowercase with hyphens)
- Include issue number
- Keep description short but descriptive
- Avoid special characters

## Issue Linking Patterns

### In Commits

```bash
# Single issue
git commit -m "Add feature - closes #13"

# Multiple issues (use "closes" for each)
git commit -m "Fix bugs - closes #13, closes #14"

# Link without closing (for work-in-progress)
git commit -m "WIP: Working on feature - see #13"
```

### In PR Titles

```
Add Supabase configuration (#13)
```

### In PR Descriptions

```markdown
This PR implements the Supabase setup as described in #13.

Related issues:
- Closes #13
- See also #12 (related work)
```

## Working with Parent/Sub Issues

Our project uses a **parent-child issue structure**:
- **Parent issues** (e.g., "Phase 1: Project Setup & Database")
- **Sub-issues** (e.g., "1.1 Initialize Next.js Project")

### Workflow for Sub-Issues

1. **Work on the sub-issue** (e.g., #13)
   - Create branch: `issue-13-setup-supabase`
   - Make changes
   - Reference in commits: `closes #13`

2. **When PR is merged:**
   - Sub-issue (#13) automatically closes
   - **Manually update parent issue** (#2) to check off the task:
     ```markdown
     - [x] #13 1.2 Set Up Supabase  ✅
     ```

3. **When all sub-issues are done:**
   - Parent issue can be closed
   - Or update parent issue to reflect completion status

## GitHub Projects Integration

If using GitHub Projects:

1. **Add issue to project** when starting work
2. **Move issue to "In Progress"** column
3. **Update issue with comments** as you work:
   ```
   Starting work on this issue...
   ```
4. **Move to "Done"** when PR is merged

## Best Practices

### ✅ Do

- Always create branches from `main` (or latest)
- Reference issues in every commit
- Use descriptive commit messages
- Include `Closes #X` in PR descriptions
- Keep branches focused on single issues
- Delete branches after merging
- Update parent issues when sub-issues complete

### ❌ Don't

- Work directly on `main` branch
- Commit without issue references
- Mix multiple unrelated issues in one branch
- Forget to link PRs to issues
- Leave stale branches around

## Quick Reference Commands

```bash
# Start working on issue #13
git checkout main && git pull
git checkout -b issue-13-short-description

# Make changes and commit
git add .
git commit -m "Your changes - closes #13"

# Push and create PR
git push origin issue-13-short-description
# Then create PR on GitHub with "Closes #13" in description

# After merge, clean up
git checkout main && git pull
git branch -d issue-13-short-description
```

## Troubleshooting

### Issue didn't close after PR merge

**Check:**
- PR description includes `Closes #13` (or `Fixes #13`)
- The keyword is in the PR description (not just commit messages)
- Issue number is correct
- PR was actually merged (not just closed)

**Fix:**
- Edit the PR description to add `Closes #13`
- Or manually close the issue and add a comment referencing the PR

### Accidentally committed without issue reference

**Fix:**
```bash
# Amend the last commit
git commit --amend -m "Your message - closes #13"
git push --force-with-lease origin your-branch
```

**Note:** Only force push if you haven't pushed yet, or if it's your own branch.

### Need to link existing commits to an issue

**Fix:**
- Add issue reference in PR description
- Or create a new commit: `git commit --allow-empty -m "Link to issue - see #13"`

## Examples

### Example 1: Simple Feature

**Issue:** #13 - Set Up Supabase

```bash
# 1. Create branch
git checkout -b issue-13-setup-supabase

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "Add Supabase configuration and client setup - closes #13"

# 4. Push
git push origin issue-13-setup-supabase

# 5. Create PR with description:
# "Implements Supabase setup as described in #13. Closes #13"
```

### Example 2: Multiple Commits

**Issue:** #20 - App Initialization System

```bash
git checkout -b issue-20-app-initialization

# First commit (work in progress)
git commit -m "Add initialization hook - see #20"

# Second commit
git commit -m "Add Farcaster SDK initialization - see #20"

# Final commit (closes issue)
git commit -m "Complete app initialization system - closes #20"

git push origin issue-20-app-initialization
```

### Example 3: Sub-Issue with Parent

**Parent Issue:** #2 - Phase 1: Project Setup & Database  
**Sub-Issue:** #13 - 1.2 Set Up Supabase

```bash
# Work on sub-issue
git checkout -b issue-13-setup-supabase
# ... make changes ...
git commit -m "Set up Supabase - closes #13"
git push origin issue-13-setup-supabase

# Create PR with "Closes #13"
# When merged, #13 closes automatically
# Then manually update #2's task list to check off the sub-issue
```

## Additional Resources

- [GitHub Docs: Linking PRs to Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [GitHub Docs: Closing Issues via Commit Messages](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests)
- [GitHub Docs: Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)

---

**Remember:** The goal is to maintain a clear connection between your code changes and the issues they address, making it easy to track progress and understand what each change accomplishes.
