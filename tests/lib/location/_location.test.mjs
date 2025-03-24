import { get } from './get.test.mjs';

export const locationTest = {
  setup,
  get,
};

function setup() {
  codi.describe({ name: 'Location:', id: 'location' }, () => {});
}
