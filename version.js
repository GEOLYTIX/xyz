/**
 * ## Version script
 * This script is used for developers to update the commit SHA in the attribution of the mapp bundle.
 * This is used to track deployed applications and what exact version of the xyz framework it is using. 
 * To run this script you can execute `node version.js` in your terminal.
 * @module version
 */
// Import required Node.js modules
const fs = require('fs');                    // File system module for reading/writing files
const { execSync } = require('child_process'); // For executing shell commands synchronously

// Regular expression pattern to match 'hash: ' followed by any characters
const key = 'hash:.*';

// Get the current git commit hash
const hash = execSync('git rev-parse HEAD')  // Execute git command to get current commit hash
    .toString()                              // Convert Buffer to string
    .trim();                                 // Remove any whitespace

// Read the contents of mapp.mjs file
let data = fs.readFileSync(
    './lib/mapp.mjs',                        // Path to the file
    'utf-8'                                  // Specify encoding
);

// Replace all occurrences of the old hash with the new commit hash
data = data.replace(
    new RegExp(key, 'g'),                    // Global regex to match all occurrences
    `hash: '${hash}',`                       // Replace with new hash string
);

// Write the updated content back to the file
fs.writeFileSync(
    './lib/mapp.mjs',                        // Path to the file
    data                                     // Updated content
);

// Run the build script defined in package.json
execSync('npm run _build');                  // Execute build command