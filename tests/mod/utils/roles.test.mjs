import { check, objMerge } from '../../../mod/utils/roles.js';

codi.describe({ name: 'Roles Module', id: 'roles_module' }, async () => {
  codi.describe(
    { name: 'check()', id: 'roles_module_check', parentId: 'roles_module' },
    () => {
      codi.it(
        {
          name: 'should return the object if it has no roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { layer: 'I am a layer!' };
          const result = check(obj, ['user']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should return the object if it has the * role',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { layer: 'I am a layer!', roles: { '*': true } };
          const result = check(obj, ['user']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should return false if user_roles is undefined',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { admin: true } };
          const result = check(obj, undefined);
          codi.assertEqual(result, false);
        },
      );

      codi.it(
        {
          name: 'should return false if a negated role is included in user_roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { '!guest': true } };
          const result = check(obj, ['guest']);
          codi.assertEqual(result, false);
        },
      );

      codi.it(
        {
          name: 'should return the object if all roles are negated and none match user_roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { '!admin': true, '!user': true } };
          const result = check(obj, ['guest', 'users']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should return the object if a positive role is included in user_roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { admin: true, user: true } };
          const result = check(obj, ['admin']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should return false if no role matches user_roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { admin: true, user: true } };
          const result = check(obj, ['guest']);
          codi.assertEqual(result, false);
        },
      );
    },
  );

  codi.describe(
    {
      name: 'objMerge()',
      id: 'roles_module_objMerge',
      parentId: 'roles_module',
    },
    () => {
      codi.it(
        {
          name: 'should return the input value if it is not an object',
          parentId: 'roles_module_objMerge',
        },
        () => {
          codi.assertEqual(objMerge(5), 5);
          codi.assertEqual(objMerge('hello'), 'hello');
          codi.assertEqual(objMerge(null), null);
        },
      );

      codi.it(
        {
          name: 'should return the input object if user_roles is undefined',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = { a: 1, b: 2 };
          codi.assertEqual(objMerge(obj, undefined), obj);
        },
      );

      codi.it(
        {
          name: 'should merge nested objects',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            foo: 'bar',
            bar: {
              foo: 'bar',
              bar: {
                foo: 'bar',
              },
            },
            roles: {
              admin: {
                foo: 'bar',
              },
              user: {
                foo: 'bar',
              },
            },
          };
          const user_roles = ['admin'];

          const expected = {
            foo: 'bar',
            bar: {
              foo: 'bar',
              bar: {
                foo: 'bar',
              },
            },
            roles: {
              admin: {
                foo: 'bar',
              },
              user: {
                foo: 'bar',
              },
            },
          };

          codi.assertEqual(objMerge(obj, user_roles), expected);
        },
      );

      codi.it(
        {
          name: 'should handle negated roles',
          parentId: 'roles_module_objMerge',
        },
        () => {
          let obj = {
            roles: {
              admin: {
                text: 'admin',
              },
              '!guest': {
                text: 'guest',
              },
              user: {
                text: 'user',
              },
            },
          };

          const user_roles = ['user'];

          const expected = {
            text: 'user',
          };

          obj = objMerge(obj, user_roles);

          codi.assertEqual(obj.text, expected.text);
        },
      );

      codi.it(
        { name: 'should handle arrays', parentId: 'roles_module_objMerge' },
        () => {
          const obj = [{ foo: 'afoo' }, { bar: 'abar' }, [{ foo: 'afoo' }]];
          const user_roles = [];

          const expected = [
            { foo: 'afoo' },
            { bar: 'abar' },
            [{ foo: 'afoo' }],
          ];

          codi.assertEqual(objMerge(obj, user_roles), expected);
        },
      );

      codi.it(
        {
          name: 'should merge unequal arrays for multiple roles',
          parentId: 'roles_module_objMerge',
        },
        () => {
          let obj = {
            layer: {
              name: 'Test Me',
              roles: {
                foo: {
                  filter: {
                    current: {
                      country: {
                        in: ['ROI'],
                      },
                    },
                  },
                },
                bar: {
                  filter: {
                    current: {
                      country: {
                        in: ['UK'],
                      },
                    },
                  },
                },
              },
            },
          };

          const user_roles = ['foo', 'bar'];

          const expected_filter = {
            current: {
              country: {
                in: ['ROI', 'UK'],
              },
            },
          };

          obj = objMerge(obj, user_roles);

          codi.assertEqual(obj.layer.filter, expected_filter);
        },
      );
    },
  );
});
