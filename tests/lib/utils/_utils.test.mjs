import { compose } from './compose.test.mjs';
import { gazetteer } from './gazetteer.test.mjs';
import { jsonParser } from './jsonParser.test.mjs';
import { keyvalue_dictionary } from './keyvalue_dictionary.test.mjs';
import { merge } from './merge.test.mjs';
import { numericFormatter } from './numericFormatter.test.mjs';
import { paramString } from './paramString.test.mjs';
import { queryParams } from './queryParams.test.mjs';
import { scriptElementTest } from './scriptElement.test.mjs';
import { svgTemplates } from './svgTemplates.test.mjs';
import { temporal } from './temporal.test.mjs';
import { versionCheck } from './versionCheck.mjs';

export const utilsTest = {
  compose,
  gazetteer,
  jsonParser,
  keyvalue_dictionary,
  merge,
  numericFormatter,
  paramString,
  queryParams,
  setup,
  svgTemplates,
  temporal,
  versionCheck,
  scriptElementTest,
};

function setup() {
  codi.describe({ id: 'utils', name: 'Utils:' }, () => {});
}
