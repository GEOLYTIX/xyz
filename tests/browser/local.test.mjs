import { base } from './_base.test.mjs';
import { baseDictionaryTest } from '../lib/dictionaries/_dictionaries.test.mjs';
import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

const mapview = await base();
baseDictionaryTest();
booleanTest();