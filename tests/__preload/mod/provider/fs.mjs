import file from '../../../../mod/provider/file.js';

/**
 * @type {import('../../../../mod/provider/file.js').default}
 */
const filefn = codi.mock.fn(file);

codi.mock.module('../../../../mod/provider/file.js', {
  defaultExport: filefn,
});

/**
 * A globally exposed mock function for the file module.
 * @global
 * @type {import('../../../../mod/provider/file.js').default}
 */
globalThis.fileFn = filefn;
