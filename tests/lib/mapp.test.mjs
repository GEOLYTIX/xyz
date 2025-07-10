export const mappTest = {
  base,
};

/**
 * Function used to test the mapp objct to see if all the base objects * properties are present
 * @function base
 */
function base() {
  codi.describe({ name: 'Mapp:', id: 'mapp' }, () => {
    codi.it({ name: 'Ensure we have base objects', parentId: 'mapp' }, () => {
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'version',
          'The mapp object needs to have an version object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'hash',
          'The mapp object needs to have an hash object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'host',
          'The mapp object needs to have an host object',
        ),
      );

      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'language',
          'The mapp object needs to have an language object',
        ),
      );

      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'dictionaries',
          'The mapp object needs to have an dictionaries object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'dictionary',
          'The mapp object needs to have an dictionary object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'hooks',
          'The mapp object needs to have an hooks object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'layer',
          'The mapp object needs to have an layer object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'location',
          'The mapp object needs to have an location object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'Mapview',
          'The mapp object needs to have an Mapview object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'utils',
          'The mapp object needs to have an utils object',
        ),
      );
      codi.assertTrue(
        Object.hasOwn(
          mapp,
          'plugins',
          'The mapp object needs to have an plugins object',
        ),
      );
    });
  });
}
