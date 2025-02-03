/**
@module /file
@requires module:/utils/processEnv
*/

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current file path and directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function file(ref) {
  try {
    // Subtitutes {*} with xyzEnv.SRC_* key values.
    const path = (ref.params?.url || ref).replace(
      /{(?!{)(.*?)}/g,
      (matched) => xyzEnv[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`],
    );

    const file = readFileSync(join(__dirname, `../../${path}`));

    if (path.match(/\.json$/i)) {
      return JSON.parse(file, 'utf8');
    }

    return String(file);
  } catch (err) {
    console.error(err);
    return err;
  }
}
