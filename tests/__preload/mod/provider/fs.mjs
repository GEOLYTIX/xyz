import file from '../../../../mod/provider/file.js';

const filefn = codi.mock.fn(file);

codi.mock.module('../../../../mod/provider/file.js', {
  defaultExport: filefn,
});

globalThis.fileFn = filefn;
