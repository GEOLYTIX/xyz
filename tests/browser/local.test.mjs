import { base } from './_base.test.mjs';
import { booleanTest } from '../lib/ui/locations/entries/boolean.test.mjs';

const mapview = await base();
booleanTest();