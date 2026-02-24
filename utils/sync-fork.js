#!/usr/bin/env node

/**
@module /sync-fork

@description

The sync-fork script allows developers working on a fork to pull and merge
changes from the upstream (original) repository into their local branch.

This is useful when the upstream repo has moved ahead and you need to bring
your fork up to date.

Usage:
  node ./utils/sync-fork.js [options]

Options:
  --upstream=<url>            Git URL of the upstream repository (required on first run,
                              remembered as the 'upstream' remote afterwards)
  --branch=<name>             The local branch to sync [default: main]
  --upstream-branch=<name>    The upstream branch to merge from [default: value of --branch]
  --dry-run                   Show what would happen without making changes
  --help                      Show this help message

Examples:
  node ./utils/sync-fork.js --upstream=https://github.com/GEOLYTIX/xyz.git
  node ./utils/sync-fork.js --upstream=git@github.com:GEOLYTIX/xyz.git --branch=development
  node ./utils/sync-fork.js --branch=main --upstream-branch=development
  node ./utils/sync-fork.js                      # uses existing 'upstream' remote
  node ./utils/sync-fork.js --dry-run             # preview the sync steps
*/

import { execSync } from 'node:child_process';

// Parse CLI arguments
const args = process.argv.slice(2);

if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

const upstreamUrl =
  args.find((arg) => arg.startsWith('--upstream='))?.split('=')[1] || null;

const branch =
  args.find((arg) => arg.startsWith('--branch='))?.split('=')[1] || 'main';

const upstreamBranch =
  args.find((arg) => arg.startsWith('--upstream-branch='))?.split('=')[1] ||
  branch;

const dryRun = args.includes('--dry-run');

syncFork();

/**
@function syncFork

@description
Main function that orchestrates the fork sync process.
It ensures the upstream remote exists, fetches the latest changes,
checks out the target branch, and merges upstream changes into it.
*/
function syncFork() {
  try {
    console.log('Syncing fork with upstream repository...\n');

    if (dryRun) {
      console.log('[DRY RUN] No changes will be made.\n');
    }

    // Step 1: Ensure upstream remote is configured
    ensureUpstreamRemote();

    // Step 2: Fetch latest from upstream
    fetchUpstream();

    // Step 3: Checkout the target branch
    checkoutBranch();

    // Step 4: Merge upstream changes
    mergeUpstream();

    console.log(
      `\nDone. Local '${branch}' is now up to date with upstream/${upstreamBranch}.`,
    );
    console.log('Remember to push your updated branch if needed:');
    console.log(`  git push origin ${branch}`);
  } catch (error) {
    console.error(`\nSync failed: ${error.message}`);
    process.exit(1);
  }
}

/**
@function ensureUpstreamRemote

@description
Checks whether an 'upstream' remote already exists.
If not, adds one using the --upstream= CLI argument.
If the remote exists and a URL was provided, it updates the remote URL.
*/
function ensureUpstreamRemote() {
  const existingRemotes = git('git remote -v');
  const hasUpstream = existingRemotes
    .split('\n')
    .some((line) => line.startsWith('upstream'));

  if (hasUpstream) {
    // Extract the current upstream URL for display
    const upstreamLine = existingRemotes
      .split('\n')
      .find((line) => line.startsWith('upstream') && line.includes('(fetch)'));

    const currentUrl = upstreamLine?.split(/\s+/)[1] || 'unknown';

    if (upstreamUrl && upstreamUrl !== currentUrl) {
      console.log(`Updating upstream remote URL to: ${upstreamUrl}`);

      if (!dryRun) {
        git(`git remote set-url upstream ${upstreamUrl}`);
      }
    } else {
      console.log(`Using existing upstream remote: ${currentUrl}`);
    }

    return;
  }

  // No upstream remote exists — we need the URL
  if (!upstreamUrl) {
    console.error(
      'No upstream remote configured and no --upstream=<url> provided.\n' +
        'Please provide the upstream repository URL:\n' +
        '  node ./utils/sync-fork.js --upstream=https://github.com/OWNER/REPO.git',
    );
    process.exit(1);
  }

  console.log(`Adding upstream remote: ${upstreamUrl}`);

  if (!dryRun) {
    git(`git remote add upstream ${upstreamUrl}`);
  }
}

/**
@function fetchUpstream

@description
Fetches the latest refs and objects from the upstream remote.
*/
function fetchUpstream() {
  console.log(`Fetching from upstream...`);

  if (!dryRun) {
    git('git fetch upstream');
  }
}

/**
@function checkoutBranch

@description
Ensures we are on the correct local branch before merging.
If the branch does not exist locally, it creates one tracking the origin.
*/
function checkoutBranch() {
  const currentBranch = git('git rev-parse --abbrev-ref HEAD').trim();

  if (currentBranch === branch) {
    console.log(`Already on branch '${branch}'.`);
    return;
  }

  console.log(`Checking out branch '${branch}'...`);

  if (!dryRun) {
    // Check if branch exists locally
    const localBranches = git('git branch --list').trim();
    const branchExists = localBranches
      .split('\n')
      .some((b) => b.trim().replace('* ', '') === branch);

    if (branchExists) {
      git(`git checkout ${branch}`);
    } else {
      // Create local branch tracking origin
      git(`git checkout -b ${branch} origin/${branch}`);
    }
  }
}

/**
@function mergeUpstream

@description
Merges the upstream branch into the current local branch.
Warns the user if there are merge conflicts.
In dry-run mode, performs a no-commit merge to show the actual diff, then aborts.
*/
function mergeUpstream() {
  console.log(`Merging upstream/${upstreamBranch} into ${branch}...`);

  if (dryRun) {
    try {
      // Show the commits that would be merged
      const log = git(
        `git log --oneline ${branch}..upstream/${upstreamBranch}`,
      ).trim();

      if (!log) {
        console.log(`[DRY RUN] No new commits to merge — already up to date.`);
        return;
      }

      console.log(`\n[DRY RUN] Commits that would be merged:`);
      console.log(log);

      // Perform the merge without committing to show the actual diff
      git(`git merge --no-commit --no-ff upstream/${upstreamBranch}`);

      const diff = git('git diff --cached --stat').trim();

      if (diff) {
        console.log(`\n[DRY RUN] Changes that would be applied:`);
        console.log(diff);
      }

      // Abort the merge to leave the working tree clean
      git('git merge --abort');
    } catch (error) {
      // Ensure the merge is aborted even if something went wrong
      try {
        git('git merge --abort');
      } catch {
        // merge --abort may fail if no merge was in progress
      }

      if (error.message.includes('CONFLICT')) {
        console.log(
          `\n[DRY RUN] Merge would produce conflicts that need manual resolution.`,
        );
        return;
      }

      console.log(
        `[DRY RUN] Cannot preview changes (upstream may not be fetched yet).`,
      );
    }

    return;
  }

  try {
    const result = git(`git merge upstream/${upstreamBranch}`);
    console.log(result);
  } catch (error) {
    if (error.message.includes('CONFLICT')) {
      console.error(
        '\nMerge conflicts detected. Please resolve them manually, then:\n' +
          '  git add .\n' +
          '  git commit\n',
      );
      process.exit(1);
    }

    throw error;
  }
}

/**
@function git

@description
Executes a git command synchronously and returns the stdout as a string.

@param {string} command The git command to execute.
@returns {string} The stdout output of the command.
*/
function git(command) {
  return execSync(command, { encoding: 'utf-8' });
}

/**
@function showHelp

@description
Displays usage information in the terminal.
*/
function showHelp() {
  console.log(`
Sync Fork — Pull and merge upstream changes into your fork

Usage: node ./utils/sync-fork.js [options]

Options:
  --upstream=<url>            Git URL of the upstream (original) repository.
                              Required on first run; saved as the 'upstream' remote.
  --branch=<name>             Local branch to sync [default: main]
  --upstream-branch=<name>    Upstream branch to merge from [default: value of --branch]
  --dry-run                   Preview what would happen without making changes
  --help                      Show this help message

Examples:
  # First time — add upstream and sync main
  node ./utils/sync-fork.js --upstream=https://github.com/GEOLYTIX/xyz.git

  # Subsequent runs — upstream is already saved
  node ./utils/sync-fork.js

  # Sync a different branch
  node ./utils/sync-fork.js --branch=development

  # Merge upstream/develop into local main
  node ./utils/sync-fork.js --branch=main --upstream-branch=development

  # Preview what would be merged
  node ./utils/sync-fork.js --dry-run

Workflow:
  1. Adds or verifies the 'upstream' remote
  2. Fetches the latest from upstream
  3. Checks out the target branch locally
  4. Merges upstream/<upstream-branch> into your local branch
  5. You push to your fork: git push origin <branch>
`);
}
