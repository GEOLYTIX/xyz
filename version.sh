#!/bin/bash
key="hash:.*"
hash=$(git rev-parse HEAD)
sed -i '' "s/$key/hash: '$hash',/g" ./lib/mapp.mjs
npm run _build