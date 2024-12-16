import { numericFormatter } from './numericFormatter.test.mjs';
import { merge } from './merge.test.mjs';
import { paramString } from './paramString.test.mjs';
import { queryParams } from './queryParams.test.mjs';
import { composeTest } from './compose.test.mjs';
import { svgTemplatesTest } from './svgTemplates.test.mjs';
import { versionCheck } from './versionCheck.mjs';

export const utilsTest = {
    setup,
    numericFormatter,
    merge,
    paramString,
    queryParamsTest: queryParams,
    // composeTest,
    // svgTemplatesTest,
    // versionCheck
}

function setup() {
    codi.describe({ name: 'Utils:', id: 'utils' }, () => { });
}