/**
## /utils/freeze-env

Resolves and validates the Varlock environment for a deployment target and
freezes the resolved values into a .varlock.blob file at the repository root.

The blob ships to Vercel via the vercel.json includeFiles configuration. At
runtime processEnv.js hydrates the environment from the blob instead of
resolving gsm() secret references, so serverless invocations make no Secret
Manager or STS calls.

Run the script before a deployment, from a machine which can resolve gsm()
references with Application Default Credentials:

```sh
pnpm freeze-env --env=production
vercel --prod
```

When the schema enables @encryptInjectedEnv for the target environment, the
blob is encrypted with AES-256-GCM. The _VARLOCK_ENV_KEY must be set in the
local environment (or .env.local) and in the Vercel project environment.
Generate a key with `pnpm exec varlock generate-key --plain`.
*/

import { writeFileSync } from 'node:fs';
import { internal } from 'varlock';
import { encryptEnvBlobSync } from 'varlock/encrypt-env';

const targetEnv =
  process.argv.find((arg) => arg.startsWith('--env='))?.split('=')[1] ||
  'production';

process.env.APP_ENV = targetEnv;

const envGraph = await internal.loadVarlockEnvGraph();

for (const plugin of envGraph.plugins) {
  if (plugin.loadingError) throw plugin.loadingError;
}
internal.checkForConfigErrors(envGraph);

await envGraph.resolveEnvValues();
internal.checkForConfigErrors(envGraph);

const serialized = envGraph.getSerializedGraph();
let blob = JSON.stringify(serialized);
let encrypted = false;

if (serialized.settings?.encryptInjectedEnv) {
  const key =
    process.env._VARLOCK_ENV_KEY || serialized.config?._VARLOCK_ENV_KEY?.value;

  if (!key) {
    console.error(
      `The schema enables encryptInjectedEnv for the ${targetEnv} environment but no _VARLOCK_ENV_KEY is set.`,
    );
    console.error(
      'Generate a key with `pnpm exec varlock generate-key --plain` and set it in the local environment and the Vercel project environment.',
    );
    process.exit(1);
  }

  blob = encryptEnvBlobSync(blob, key);
  encrypted = true;
}

writeFileSync('.varlock.blob', blob);

console.log(
  `Frozen ${targetEnv} environment written to .varlock.blob${encrypted ? ' (encrypted)' : ''}`,
);
