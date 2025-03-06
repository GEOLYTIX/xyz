/**
@module /file
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
