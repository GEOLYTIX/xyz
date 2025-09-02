#!/usr/bin/env node

/**
@module /sync-vercel-env

@description

The Sync Vercel env script is to allow developers to push the .env variables that they have locally to a specified project and environment in vercel.
The script requires a vercel token in either the .env.vercel file or specified in the args when calling the script.

eg: `node ./utils/sync-vercel-env --token=`

When providing the env variable in the .env.vercel the key is `VERCEL_TOKEN` it is important not to provide the key in the .env.

To generate a vercel token see the following docs: https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token

Other arguments you can provide the script are:

- `--help` - shows a help menu
- `--dry-run` - show the keys that will be pushed to the project
- `--env=` - specifies the environment in vercel you want to push to (Defaults to development)
- `--file=` - specifies the .env file location that you want to push.
*/

import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import https from 'https';
import { join } from 'path';

//get the vercel token from a separate .env file
config({ path: '.env.vercel' });

// Get the command line arguments
const args = process.argv.slice(2);

//if we need help show and exit process
if (args.includes('--help')) {
  showHelp();
  process.exit(0);
}

const envType =
  args.find((arg) => arg.startsWith('--env='))?.split('=')[1] || 'development';
const token =
  args.find((arg) => arg.startsWith('--token='))?.split('=')[1] ||
  process.env.VERCEL_TOKEN;
const dryRun = args.includes('--dry-run');
const envFile =
  args.find((arg) => arg.startsWith('--file='))?.split('=')[1] || '.env';

// Get project and org IDs
const { projectId, orgId } = readVercelConfig();

//sync env method call.
syncEnv().catch(console.error);

/**
@function syncEnv
@async

@description
The syncEnv function is the main function for this script that will run when the script is executed with node.
*/
async function syncEnv() {
  if (!token) {
    console.error(
      '❌ No Vercel token provided. Use --token=<token> or set VERCEL_TOKEN env variable',
    );
    console.log('\nGet your token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  //Details of the upload.
  console.log(`🔄 Syncing environment variables to Vercel...`);
  console.log(`Project: ${projectId}`);
  console.log(`Organization: ${orgId}`);
  console.log(`Environment: ${envType}`);
  console.log(`Reading from: ${envFile}`);
  if (dryRun) console.log(`!  DRY RUN MODE - No changes will be made`);
  console.log('');

  const envVars = parseEnvFile(envFile);
  const totalVars = Object.keys(envVars).length;
  const vercelVars = Object.keys(envVars).filter((key) =>
    key.startsWith('VERCEL_'),
  ).length;

  console.log(
    `Found ${totalVars} environment variables (${vercelVars} Vercel system vars will be skipped)\n`,
  );

  //Call to the batchupsert
  await batchUpsertEnvs(envVars);

  if (!dryRun) {
    console.log('\n✅ Done!');
  }
}

function readVercelConfig() {
  const vercelConfigPath = join(process.cwd(), '.vercel', 'project.json');

  if (!existsSync(vercelConfigPath)) {
    console.error(
      '❌ No .vercel/project.json found. Please run "vercel link" first.',
    );
    process.exit(1);
  }

  try {
    const config = JSON.parse(readFileSync(vercelConfigPath, 'utf8'));
    return {
      projectId: config.projectId,
      orgId: config.orgId,
    };
  } catch (error) {
    console.error('❌ Failed to read .vercel/project.json:', error.message);
    process.exit(1);
  }
}

// Parse .env file
function parseEnvFile(path) {
  if (!existsSync(path)) {
    console.error(`❌ Environment file not found: ${path}`);
    process.exit(1);
  }

  const content = readFileSync(path, 'utf8');
  const vars = {};

  content.split('\n').forEach((line) => {
    if (!line.trim() || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/(^["'])|(["']$)/g, '');
      vars[key] = value;
    }
  });

  return vars;
}

/**
@function batchUpsertEnvs
@async

@description
Batch upsert environment variables to the vercel api.

@param {Object} envVars Environment Variables to push to vercel.
*/
async function batchUpsertEnvs(envVars) {
  // Prepare batch array
  const batch = Object.entries(envVars)
    .filter(([key]) => !key.startsWith('VERCEL_'))
    .map(([key, value]) => ({
      key,
      value,
      type: 'encrypted',
      target: [envType],
    }));

  if (batch.length === 0) {
    console.log('No variables to sync (all were Vercel system variables)');
    return;
  }

  //If it's a dryRun then we don't actually push the keys.
  if (dryRun) {
    console.log('[DRY RUN] Would sync the following variables:');
    batch.forEach(({ key }) => console.log(`  - ${key}`));
    return;
  }

  // Use upsert=true to update existing or create new
  const { status, data } = await apiRequest(
    'POST',
    `/v10/projects/${projectId}/env?upsert=true`,
    batch,
  );

  if (status === 201) {
    const created = data.created || [];
    const failed = data.failed || [];

    if (Array.isArray(created)) {
      created.forEach((env) => console.log(`✓ Synced: ${env.key}`));
    } else if (created.key) {
      console.log(`✓ Synced: ${created.key}`);
    }

    if (failed.length > 0) {
      failed.forEach(({ error }) => {
        console.error(
          `✗ Failed: ${error.key || error.envVarKey} - ${error.message}`,
        );
      });
    }

    console.log(
      `\n📊 Summary: ${Array.isArray(created) ? created.length : 1} synced, ${failed.length} failed`,
    );
  } else {
    console.error(`✗ Batch sync failed with status ${status}`);
    if (data.error) {
      console.error(`   Error: ${data.error.message || data.error.code}`);
    }
  }
}
/**
 * @function apiRequest
 * @description
 * This function is used to send a authorized request to the vercel api.
 * It will specify the orgiId and projectid.
 * @param {String} method api method
 * @param {String} path vercel api path
 * @param {object} data req body data
 */
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.vercel.com${path}`);
    // Use teamId parameter for org-level projects
    if (orgId?.startsWith('team_')) {
      url.searchParams.append('teamId', orgId);
    }

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
          console.error(e.message);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * @function showHelp
 * @description
 * This function is used to display a help dialog in the terminal to the dev.
 */
function showHelp() {
  console.log(`
Sync Environment Variables to Vercel

Usage: node sync-vercel-env.js [options]

Options:
  --env=<type>     Environment type (development, preview, production) [default: development]
  --token=<token>  Vercel API token (or set VERCEL_TOKEN env variable)
  --file=<path>    Path to env file [default: .env]
  --dry-run        Preview changes without applying them
  --help           Show this help message

Examples:
  node sync-vercel-env.js                           # Sync .env to development
  node sync-vercel-env.js --env=production          # Sync to production
  node sync-vercel-env.js --file=.env.local         # Use different env file
  node sync-vercel-env.js --dry-run                 # Preview changes

Note: This script requires a linked Vercel project. Run 'vercel link' first.
`);
}
