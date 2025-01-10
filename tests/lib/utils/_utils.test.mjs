import { numericFormatter } from './numericFormatter.test.mjs';
import { merge } from './merge.test.mjs';
import { paramString } from './paramString.test.mjs';
import { queryParams } from './queryParams.test.mjs';
import { compose } from './compose.test.mjs';
import { svgTemplates } from './svgTemplates.test.mjs';
import { versionCheck } from './versionCheck.mjs';
import { jsonParser } from './jsonParser.test.mjs';

export const utilsTest = {
    setup,
    numericFormatter,
    merge,
    paramString,
    queryParams,
    compose,
    svgTemplates,
    versionCheck,
    jsonParser
}

function setup() {
    codi.describe({ name: 'Utils:', id: 'utils' }, () => { });
}