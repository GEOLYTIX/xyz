/**
 * @jest-environment jsdom
 */

var XYZ_VERSION = 'v3.6.0';

import square from './test.mjs';
import _xyz from '../lib/index.mjs';

var params = { hooks: true, host: "/kfc"}
var thing = _xyz(params)

console.log(thing.mapview) 

describe('XYZ Init', () => {
    it('Test', () => {

    });
});