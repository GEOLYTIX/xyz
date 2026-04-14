/**
## ui/locations

The locations module compiles methods for the creation of location views.

- view
- listview
- infoj
- entries

@module /ui/locations
*/

import entries from './entries/_entries.mjs';
import infoj from './infoj.mjs';
import listview from './listview.mjs';
import view from './view.mjs';

export default {
  entries,
  infoj,
  listview,
  view,
};
