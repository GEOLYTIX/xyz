/**
## /provider/file

The file provider module exports a method to fetch resources from the local file system.
@requires fs
@requires path
@requires /sign/file

@module /provider/file
*/

import { readFileSync } from 'fs';
import { join } from 'path';
import file_signer from '../sign/file.js';

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
const contentTypes = {
  json: 'application/json',
  html: 'text/html',
  js: 'text/javascript',
};
export default async function file(ref) {
  //Signed requests are alllowed limited file access.
  if (
    ref.params?.signed &&
    !ref.params.url?.startsWith?.(`${xyzEnv.FILE_RESOURCES}/`)
  )
    throw new Error('Unauthorized');

  try {
    // Subtitutes {*} with xyzEnv.SRC_* key values.
    const path = (ref.params?.url || ref).replace(
      /{(?!{)(.*?)}/g,
      (matched) => xyzEnv[`SRC_${matched.replace(/(^{)|(}$)/g, '')}`],
    );

    //A signed requested is being made.
    if (ref.params?.signing_key) {
      const signedUrl = file_signer(ref);

      //Different content types require Different request headers
      //These will get assigned based on the file ending
      const fileType = signedUrl.split('.').at(-1);
      const contentType = contentTypes[fileType] || 'text/plain';

      const response = await fetch(signedUrl, {
        headers: {
          'Content-Type': contentType,
        },
      });

      if(!response.ok) {
        return new Error(`Failed to fetch`)
      }

      const content =
        fileType === 'json' ? await response.json() : await response.text();

      return content;
    }

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
