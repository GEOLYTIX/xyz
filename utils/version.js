/**
## Version script
This script is used for developers to update the commit SHA in the attribution of the mapp bundle.
This is used to track deployed applications and what exact version of the xyz framework it is using.
To run this script you can execute `node version.js` in your terminal.

@requires module:fs

@module version
*/

import { execSync } from 'child_process'; // For executing shell commands synchronously
// File system module for reading/writing files
import { readFileSync, writeFileSync } from 'fs';

// Regular expression pattern to match 'hash: ' followed by any characters
const key = 'hash:.*';

// Get the current git commit hash
// Execute git command to get current commit hash
const hash = execSync('git rev-parse HEAD')
  // Convert Buffer to string
  .toString()

  // Remove any whitespace
  .trim();

// Read the contents of mapp.mjs file
let data = readFileSync(
  // Path to the file
  './lib/mapp.mjs',

  // Specify encoding
  'utf-8',
);

// Replace all occurrences of the old hash with the new commit hash
data = data.replace(
  // Global regex to match all occurrences
  new RegExp(key, 'g'),

  // Replace with new hash string
  `hash: '${hash}',`,
);

// Write the updated content back to the file
writeFileSync(
  // Path to the file
  './lib/mapp.mjs',

  // Updated content
  data,
);

// Run the build script defined in package.json
// Execute build command
execSync('pnpm _build');
