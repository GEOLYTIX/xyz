import { cloudinary } from './cloudinary.test.mjs';
import { geometry } from './geometry.test.mjs';
import { layer } from './layer.test.mjs';
import { pin } from './pin.test.mjs';

export const entries = {
  cloudinary,
  geometry,
  layer,
  pin,
  setup,
};

function setup() {
  codi.describe(
    { id: 'ui_locations_entries', name: 'Entries:', parentId: 'ui_locations' },
    () => {},
  );
}
