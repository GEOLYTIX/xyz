/**
The bundle files and the local link and path field resolution which the
knowledge tools share.
*/
import { readdirSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

/** A path with forward slashes. */
export const posix = (path) => path.split(sep).join('/');

/** Indexes and logs are bundle files, not concepts. */
export const reserved = (name) => name === 'index.md' || name === 'log.md';

/** A directory and every directory below it. */
export function directories(directory, list = []) {
  list.push(directory);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) directories(resolve(directory, entry.name), list);
  }
  return list;
}

/** The Markdown files below a directory, sorted. */
export function markdownFiles(directory) {
  const files = [];
  for (const path of directories(directory)) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md'))
        files.push(resolve(path, entry.name));
    }
  }
  return files.sort();
}

/** The concept files below a directory, without indexes and logs, sorted. */
export const conceptFiles = (directory) =>
  markdownFiles(directory).filter((file) => !reserved(file.split(sep).pop()));

/** A path field value with an explicit local prefix. */
export const LOCAL_PREFIX = /^(\.\.?\/|\/)/;

/**
The absolute path of a local link or path field target, or undefined for
external URLs and anchors. A leading `/` is relative to the bundle root.
*/
export function localTarget(target, file, bundle) {
  if (typeof target !== 'string' || !target.trim() || target.startsWith('#'))
    return;
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(target)) return;
  const path = decodeURIComponent(target.split(/[?#]/)[0]);
  return path.startsWith('/')
    ? resolve(bundle, `.${path}`)
    : resolve(dirname(file), path);
}

/**
The repository-relative path of a path field value with a `./`, `../` or `/`
prefix, or undefined.
*/
export function localPath(value, file, root) {
  if (typeof value !== 'string' || !LOCAL_PREFIX.test(value)) return;
  const target = localTarget(value, file, resolve(root, 'knowledge'));
  return target && posix(relative(root, target));
}
