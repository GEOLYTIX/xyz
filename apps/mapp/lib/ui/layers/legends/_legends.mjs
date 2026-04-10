/**
## /ui/layers/legends

The legends module exports an object that references core ui layers legends methods.

Custom methods can be added through plugins by assigning a method to the mapp.ui.layers.legends{} object.

@requires /ui/layers/legends/basic
@requires /ui/layers/legends/categorized
@requires /ui/layers/legends/distributed
@requires /ui/layers/legends/graduated

@module /ui/layers/legends
*/

import basicTheme from './basic.mjs';
import categorizedTheme from './categorized.mjs';
import distributedTheme from './distributed.mjs';
import graduatedTheme from './graduated.mjs';

export default {
  basic: basicTheme,
  categorized: categorizedTheme,
  distributed: distributedTheme,
  graduated: graduatedTheme,
};
