/**
## /provider/file

The file provider module exports a method to fetch resources from the local file system.

@module /provider/file
*/

import { readFileSync } from 'fs';
import { join } from 'path';

/**
@function file

@description
The file method requires a reference for a file in the local filesystem. A path for the file will be extracted from the reference.

Matched `SRC_*` variables in the src reference string are replaced with values from the global xyzEnv.

The file is read synchronous from the filesystem.

The buffer returned from the read process will be parsed as json if the referenced filename extension is matched. Otherwise the buffer is returned as string.

The [node import module attributes]{@link https://nodejs.org/api/esm.html#import-attributes} allow access to the directory name through the meta property.

@param {object|string} ref The file reference maybe defined as an object or string. A string is assumed to be the params.url property of the file location.
@returns {File|Error} The file will be returned as parsed json or string if the readFileSync process succeeds.
*/
export default function file(ref) {
  try {
    // Subtitutes {*} with xyzEnv.SRC_* key values.
    const path = (ref.params?.url || ref).replace(
      /{(?!{)(.*?)}/g,
      (matched) => xyzEnv[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`],
    );

    // Join the releative path with the import directory name to generate a path with platform specific separator as delimiter.
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
