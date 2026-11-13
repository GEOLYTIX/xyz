#!/usr/bin/env bash
# Publishes the packed @geolytix/mapp tarball to a local Verdaccio registry.
#
# The registry must be running with tests-package/verdaccio/config.yaml, eg.
#   npx --yes verdaccio@6.11.1 --config tests-package/verdaccio/config.yaml --listen 4873
#
# The script adds a user to the registry, publishes .pack/geolytix-mapp.tgz with
# the user token, and doesn't change the npm config of the user.
#
# Usage, from apps/mapp: bash scripts/registryPublish.sh [registry url]
set -euo pipefail

registry="${1:-http://localhost:4873}"
host="${registry#*://}"

for _ in $(seq 1 30); do
  curl -sf "$registry/-/ping" > /dev/null && break
  sleep 1
done

curl -sf "$registry/-/ping" > /dev/null || {
  echo "The registry $registry is not running." >&2
  exit 1
}

# Verdaccio creates the user and returns a token for the htpasswd auth.
token=$(curl -sf -X PUT \
  -H 'content-type: application/json' \
  -d '{"name":"mapp-ci","password":"mapp-ci-password"}' \
  "$registry/-/user/org.couchdb.user:mapp-ci" \
  | node -e "process.stdin.on('data', (d) => process.stdout.write(JSON.parse(d).token))")

npmrc=$(mktemp)
trap 'rm -f "$npmrc"' EXIT
echo "//${host}/:_authToken=${token}" > "$npmrc"

version=$(tar -xzOf .pack/geolytix-mapp.tgz package/package.json \
  | node -e "process.stdin.on('data', (d) => process.stdout.write(JSON.parse(d).version))")

tag=latest
[[ "$version" == *-* ]] && tag=next

cd .pack
npm publish geolytix-mapp.tgz \
  --registry "$registry" \
  --userconfig "$npmrc" \
  --tag "$tag"

echo "Published @geolytix/mapp@$version to $registry with the $tag dist-tag."
