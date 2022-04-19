#!/bin/bash
key="hash:.*"
hash=$(git rev-parse HEAD)
sed -i -e "s/$key/hash: '$hash',/g" ./lib/mapp.mjs
npx snowpack build