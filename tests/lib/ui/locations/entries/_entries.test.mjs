import { pin } from './pin.test.mjs';
import { geometry } from './geometry.test.mjs';
import { layer } from './layer.test.mjs';
import { cloudinary } from './cloudinary.test.mjs';

export const entries = {
  setup,
  pin,
  geometry,
  layer,
  cloudinary,
};

function setup() {
  codi.describe(
    { name: 'Entries:', id: 'ui_locations_entries', parentId: 'ui_locations' },
    () => {},
  );
}
