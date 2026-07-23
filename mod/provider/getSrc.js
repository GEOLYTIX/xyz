/**
## /provider/getSrc

The getSrc module resolves src references through a provider determined from the src prefix, eg. `file:`, `https:`, `cloudfront:`, or a signer provider from a SIGN_* xyzEnv key.

All source responses are cached in a module scope source map regardless of their provider. Promises are stored in the map before provider requests are awaited so concurrent requests for the same src share one request. The source map must be cleared when the workspace cache is rebuilt.

The module has a single getSrc export. The params determine the behaviour:

- A src string or `{src}` params object resolves a single source response from the source map.
- `{src, cache: false}` bypasses the source map for a fresh provider response, eg. a workspace rebuild.
- `{src, test: true}` checks whether a provider exists for the src reference.
- `{clear: true}` flushes the source map.
- `{workspace}` recursively discovers and caches every source in the workspace.

@requires /sign/file
@requires /utils/envReplace
@requires /utils/logger
@requires /provider/cloudfront
@requires /provider/file

@module /provider/getSrc
*/

import file_signer from '../sign/file.js';
import envReplace from '../utils/envReplace.js';
import logger from '../utils/logger.js';
import cloudfront from './cloudfront.js';
import file from './file.js';

const providers = {
  cloudfront: Cloudfront,
  file: File,
  https: Https,
};

// Assign XYZ signer provider for each SIGN_* key in xyzEnv.
for (const key in xyzEnv) {
  const PROVIDER = new RegExp(/^SIGN_(.*)/).exec(key)?.[1];
  if (PROVIDER === undefined) continue;
  providers[PROVIDER] = XYZ;
}

/**
Module scope source promise map. The map must be cleared when the workspace cache is rebuilt.
*/
const srcMap = new Map();

/**
@function getSrc
@async

@description
The getSrc method resolves a src reference to its source response. The provider for the request is determined from the resolved src prefix.

Errors are returned rather than thrown. Object responses are cloned to prevent modification of the cached response.

The behaviour of the method is determined by the params. A string param is shorthand for a params object with a src property.

@param {String|Object} params A src reference string or params object.
@property {String} [params.src] Source reference.
@property {Boolean} [params.cache] The source map is bypassed for a fresh provider response with cache being false.
@property {Boolean} [params.test] Returns whether a provider exists for the src reference.
@property {Boolean} [params.clear] Flushes the source map.
@property {Object} [params.workspace] Workspace to recursively discover and cache sources in.

@returns {Promise<String|Object|Error>} Cloned source response.
*/
export default async function getSrc(params) {
  if (typeof params === 'string') params = { src: params };

  if (params?.clear) {
    srcMap.clear();
    return;
  }

  if (params?.workspace) {
    return cacheSources(params.workspace);
  }

  if (typeof params?.src !== 'string') {
    return new Error('A src string is required to get a source.');
  }

  if (params.test) {
    return Object.hasOwn(providers, envReplace(params.src).split(':')[0]);
  }

  if (params.cache === false) {
    // A fresh provider response is required, eg. for a workspace rebuild.
    return providerPromise(envReplace(params.src));
  }

  const response = await getSrcPromise(params.src);

  if (response instanceof Error) {
    return response;
  }
  if (response === undefined) {
    return new Error(`Unable to load src: ${params.src}`);
  }

  return cloneSource(response);
}

/**
@function getSrcPromise
@description
Retrieves the source promise for the given src. If the source promise does not exist, it is created with the provider determined from the resolved src prefix.

Environment variables in the src are only substituted on a map miss. A src with environment variables is stored as an alias for the resolved src promise so envReplace runs once per unique src string.

@param {String} src Source identifier.
@returns {Promise<Object|Error>} Source response promise.
*/
function getSrcPromise(src) {
  let responsePromise = srcMap.get(src);

  if (responsePromise) return responsePromise;

  const resolvedSrc = envReplace(src);

  responsePromise = srcMap.get(resolvedSrc);

  if (!responsePromise) {
    responsePromise = providerPromise(resolvedSrc);

    srcMap.set(resolvedSrc, responsePromise);
  }

  // Alias the unresolved src so subsequent requests hit the map without envReplace.
  if (src !== resolvedSrc) srcMap.set(src, responsePromise);

  return responsePromise;
}

/**
@function providerPromise
@description
Creates a provider request promise for a resolved src. Provider errors are resolved rather than thrown.

@param {String} resolvedSrc Resolved source reference.
@returns {Promise<String|Object|Error>} Provider response promise.
*/
function providerPromise(resolvedSrc) {
  const method = resolvedSrc.split(':')[0];

  if (!Object.hasOwn(providers, method)) {
    return Promise.resolve(
      new Error(`Unknown getSrc provider: ${resolvedSrc}`),
    );
  }

  return Promise.resolve()
    .then(() => providers[method](resolvedSrc))
    .catch((err) => err);
}

/**
@function cacheSources
@async

@description
Recursively discovers src properties in a workspace and in fetched responses. Every source promise in a breadth is inserted into the source map before responses are inspected, so duplicate and concurrent references share one request.

All sources are fetched and inspected regardless of their provider. Sources nested in a source response, eg. a template src in a template, are discovered by inspecting the response.

Objects with the srcLoaded flag have their source response assembled in the cached workspace and their src is not read.

@param {Object} workspace Workspace to scan.
@returns {Promise<Object|Error>} Workspace or source discovery Error.
*/
async function cacheSources(workspace) {
  const inspectedSrcs = new Set();
  const inspectedObjects = new WeakSet();
  const errors = [];
  let queue = [workspace];

  while (queue.length) {
    const sources = new Set();

    queue.forEach((value) => collectSrcs(value, sources, inspectedObjects));

    // Calling getSrcPromise for the whole breadth starts every new request before any response is awaited.
    const responses = Array.from(sources)
      .filter((src) => !inspectedSrcs.has(src))
      .map((src) => {
        inspectedSrcs.add(src);
        return [src, getSrcPromise(src)];
      });

    queue = [];

    for (const [src, responsePromise] of responses) {
      const response = await responsePromise;

      if (response instanceof Error || response === undefined) {
        errors.push(
          `${src}: ${response?.message || `Unable to load src: ${src}`}`,
        );
        continue;
      }

      queue.push(response);
    }
  }

  if (errors.length) return new Error(errors.join('\n'));

  return workspace;
}

/**
@function collectSrcs
@description
Recursively collects src properties from the value object and adds them to the sources Set. Inspected objects are tracked in the inspectedObjects WeakSet to avoid infinite recursion.

The src of an object with the srcLoaded flag is not collected.

@param {Object} value
@param {Set} sources
@param {WeakSet} inspectedObjects
@returns {void}
*/
function collectSrcs(value, sources, inspectedObjects) {
  if (!value || typeof value !== 'object') return;
  if (inspectedObjects.has(value)) return;
  inspectedObjects.add(value);

  if (typeof value.src === 'string' && !value.srcLoaded) {
    sources.add(value.src);
  }

  Object.values(value).forEach((item) =>
    collectSrcs(item, sources, inspectedObjects),
  );
}

function cloneSource(response) {
  return typeof response === 'object' && response !== null
    ? structuredClone(response)
    : response;
}

/**
@function Cloudfront
@async

@description
The method will extract a cloudfront URL from the ref param string.

The fetch request will be created from the cloudfront provider module with the cloudfront url.

@param {string} ref Cloudfront resource reference.

@returns {Promise<String|JSON|Error>} The fetch is resolved into either a string or JSON depending on the url ending.
*/
async function Cloudfront(ref) {
  if (!xyzEnv.KEY_CLOUDFRONT) {
    return new Error('Cloudfront key is missing');
  }

  const url = ref.split(':')[1];

  return await cloudfront(url);
}

function File(ref) {
  const src = ref.split(':')[1];

  return file(src);
}

async function Https(url) {
  try {
    const response = await fetch(url);

    logger(`${response.status} - ${response.url}`, 'fetch');

    if (url.match(/\.json$/i)) {
      return await response.json();
    }

    return await response.text();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
@function XYZ
@async

@description
The method splits the reference string into a params object for the XYZ file signer.

@param {string} ref Reference for the XYZ signer.

@returns {Promise<String|JSON|Error>} The fetch is resolved into either a string or JSON depending on the url ending.
*/
async function XYZ(ref) {
  const params = {
    signing_key: ref.split(':')[0],
    url: ref.split(':')[1],
  };

  const signedUrl = file_signer({ params });

  // Different content types require different request headers. These will get assigned based on the file ending.
  const fileType = signedUrl.split('.').at(-1);
  const contentTypes = {
    json: 'application/json',
    html: 'text/html',
    js: 'text/javascript',
  };
  const contentType = contentTypes[fileType] || 'text/plain';

  const timestamp = Date.now();

  const response = await fetch(signedUrl, {
    headers: {
      'Content-Type': contentType,
    },
  });

  logger(
    `${Date.now() - timestamp}: ${response.ok} - ${params.signing_key}/${params.url}`,
    'xyzfetch',
  );

  if (!response.ok) {
    return new Error(`Failed to fetch`);
  }

  const content =
    fileType === 'json' ? await response.json() : await response.text();

  return content;
}
