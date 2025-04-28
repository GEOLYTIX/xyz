import { compose } from './compose.test.mjs';
import { jsonParser } from './jsonParser.test.mjs';
import { keyvalue_dictionary } from './keyvalue_dictionary.test.mjs';
import { merge } from './merge.test.mjs';
import { numericFormatter } from './numericFormatter.test.mjs';
import { paramString } from './paramString.test.mjs';
import { svgTemplates } from './svgTemplates.test.mjs';
import { temporal } from './temporal.test.mjs';
import { versionCheck } from './versionCheck.mjs';

export const utilsTest = {
  setup,
  numericFormatter,
  merge,
  paramString,
  compose,
  svgTemplates,
  versionCheck,
  jsonParser,
  temporal,
  keyvalue_dictionary,
};

function setup() {
  codi.describe({ name: 'Utils:', id: 'utils' }, () => {});
}
