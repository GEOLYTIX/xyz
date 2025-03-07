/**
## /provider/file

The file provider module exports a method to fetch resources from the local file system.

Since node v21.2.0 & v20.11.0
node added the `import.meta.dirname` property into their [import attributes](https://nodejs.org/api/esm.html#import-attributes).
It provides the directory name of the current module.
This is the same as the `path.dirname()` of the `import.meta.filename`.

@module /provider/file
@requires module:/utils/processEnv
*/

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function file(ref) {
  try {
    // Subtitutes {*} with xyzEnv.SRC_* key values.
    const path = (ref.params?.url || ref).replace(
      /{(?!{)(.*?)}/g,
      (matched) => xyzEnv[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`],
    );

    const file = readFileSync(join(import.meta.dirname, `../../${path}`));

    if (path.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8');
    }

    return String(file);
  } catch (err) {
    console.error(err);
    return err;
  }
}
