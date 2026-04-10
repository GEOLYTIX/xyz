/**
## /ui/layers

The module requires and exports methods to build a MAPP layers listview and layer.view elements for the MAPP.UI.

@requires /ui/layers/filters
@requires /ui/layers/legends
@requires /ui/layers/listview
@requires /ui/layers/panels
@requires /ui/layers/view
@requires /ui/layers/viewHeader

@module /ui/layers
*/

import filters from './filters.mjs';
import legends from './legends/_legends.mjs';
import listview from './listview.mjs';
import panels from './panels/_panels.mjs';
import view from './view.mjs';
import viewHeader from './viewHeader.mjs';

export default {
  filters,
  legends,
  listview,
  panels,
  view,
  viewHeader,
};
