const fs = require('fs');
const { execSync } = require('child_process');

const key = 'hash:.*';
const hash = execSync('git rev-parse HEAD').toString().trim();

let data = fs.readFileSync('./lib/mapp.mjs', 'utf-8');
data = data.replace(new RegExp(key, 'g'), `hash: '${hash}',`);

fs.writeFileSync('./lib/mapp.mjs', data);

execSync('npm run _build');