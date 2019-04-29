import group from './group.mjs';

import streetview from './streetview.mjs';

import images from './images/_images.mjs';

import geometry from './geometry/_geometry.mjs';

import edit from './edit/_edit.mjs';

import valChange from './edit/valChange.mjs';

import tableDefinition from './tableDefinition.mjs';

import orderedList from './orderedList.mjs';

import report from './report.mjs';

import update from './update.mjs';

import boolean from './boolean.mjs';

export default function(_xyz) {

  return {

    location: this,
  
    update: update(_xyz, this),

    streetview: streetview(_xyz),

    images: images(_xyz),

    group: group(_xyz),

    geometry: geometry(_xyz),

    edit: edit(_xyz),

    boolean: boolean(_xyz),

    tableDefinition: tableDefinition(_xyz),

    orderedList: orderedList(_xyz),

    report: report(_xyz),

    valChange: valChange,

  };

};