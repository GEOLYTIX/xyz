import { check, fromObj, objMerge } from '../../../mod/utils/roles.js';

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

      codi.it(
        {
          name: 'should handle dot notation roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { 'namespace.admin': true } };
          const result = check(obj, ['admin']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should return false if user_roles is null',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { admin: true } };
          const result = check(obj, null);
          codi.assertEqual(result, false);
        },
      );

      codi.it(
        {
          name: 'should handle mixed positive and negated roles',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: { admin: true, '!guest': true } };
          const result = check(obj, ['guest']);
          codi.assertEqual(result, false);
        },
      );

      codi.it(
        {
          name: 'should return the object with empty roles object',
          parentId: 'roles_module_check',
        },
        () => {
          const obj = { roles: {} };
          const result = check(obj, ['user']);
          codi.assertEqual(result, obj);
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

      codi.it(
        {
          name: 'should return the input object if user_roles is not an array',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = { a: 1, b: 2 };
          codi.assertEqual(objMerge(obj, 'not-array'), obj);
        },
      );

      codi.it(
        {
          name: 'should handle objects with null/undefined nested values',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            nullValue: null,
            undefinedValue: undefined,
            roles: {
              admin: { text: 'admin' },
            },
          };
          const result = objMerge(obj, ['admin']);
          codi.assertEqual(result.nullValue, null);
          codi.assertEqual(result.undefinedValue, undefined);
          codi.assertEqual(result.text, 'admin');
        },
      );

      codi.it(
        {
          name: 'should handle roles object that is an array',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            data: 'test',
            roles: ['admin', 'user'],
          };
          const result = objMerge(obj, ['admin']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should handle roles object that is a function',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            data: 'test',
            roles: () => 'function',
          };
          const result = objMerge(obj, ['admin']);
          codi.assertEqual(result, obj);
        },
      );

      codi.it(
        {
          name: 'should handle dot notation roles',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            roles: {
              'namespace.admin': { text: 'admin' },
              'namespace.user': { text: 'user' },
            },
          };
          const result = objMerge(obj, ['admin']);
          codi.assertEqual(result.text, 'admin');
        },
      );

      codi.it(
        {
          name: 'should filter out roles with true values',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            roles: {
              admin: true,
              user: { text: 'user' },
            },
          };
          const result = objMerge(obj, ['admin', 'user']);
          codi.assertEqual(result.text, 'user');
        },
      );

      codi.it(
        {
          name: 'should filter out roles with null values',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            roles: {
              admin: null,
              user: { text: 'user' },
            },
          };
          const result = objMerge(obj, ['admin', 'user']);
          codi.assertEqual(result.text, 'user');
        },
      );

      codi.it(
        {
          name: 'should handle deep nested structures with roles at multiple levels',
          parentId: 'roles_module_objMerge',
        },
        () => {
          const obj = {
            level1: {
              level2: {
                roles: {
                  admin: { deepText: 'deep admin' },
                },
              },
              roles: {
                user: { midText: 'mid user' },
              },
            },
            roles: {
              root: { rootText: 'root' },
            },
          };
          const result = objMerge(obj, ['admin', 'user', 'root']);
          codi.assertEqual(result.rootText, 'root');
          codi.assertEqual(result.level1.midText, 'mid user');
          codi.assertEqual(result.level1.level2.deepText, 'deep admin');
        },
      );
    },
  );

  codi.describe(
    {
      name: 'fromObj()',
      id: 'roles_module_fromObj',
      parentId: 'roles_module',
    },
    () => {
      codi.it(
        {
          name: 'should add roles to Set',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            roles: {
              admin: true,
              user: true,
              guest: true,
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.has('admin'), true);
          codi.assertEqual(rolesSet.has('user'), true);
          codi.assertEqual(rolesSet.has('guest'), true);
        },
      );

      codi.it(
        {
          name: 'should handle negated roles by removing ! prefix',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            roles: {
              '!admin': true,
              '!guest': true,
              user: true,
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.has('admin'), true);
          codi.assertEqual(rolesSet.has('guest'), true);
          codi.assertEqual(rolesSet.has('user'), true);
          codi.assertEqual(rolesSet.has('!admin'), false);
          codi.assertEqual(rolesSet.has('!guest'), false);
        },
      );

      codi.it(
        {
          name: 'should recurse through nested objects',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            level1: {
              roles: {
                admin: true,
              },
              level2: {
                roles: {
                  user: true,
                },
                level3: {
                  roles: {
                    guest: true,
                  },
                },
              },
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.has('admin'), true);
          codi.assertEqual(rolesSet.has('user'), true);
          codi.assertEqual(rolesSet.has('guest'), true);
        },
      );

      codi.it(
        {
          name: 'should handle arrays',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            items: [
              {
                roles: {
                  admin: true,
                },
              },
              {
                roles: {
                  user: true,
                },
              },
            ],
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.has('admin'), true);
          codi.assertEqual(rolesSet.has('user'), true);
        },
      );

      codi.it(
        {
          name: 'should handle null and undefined values',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            nullValue: null,
            undefinedValue: undefined,
            roles: {
              admin: true,
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.has('admin'), true);
        },
      );

      codi.it(
        {
          name: 'should not duplicate roles in Set',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            section1: {
              roles: {
                admin: true,
              },
            },
            section2: {
              roles: {
                admin: true,
                user: true,
              },
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.size, 2);
          codi.assertEqual(rolesSet.has('admin'), true);
          codi.assertEqual(rolesSet.has('user'), true);
        },
      );

      codi.it(
        {
          name: 'should handle empty objects',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {};
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.size, 0);
        },
      );

      codi.it(
        {
          name: 'should handle objects with no roles property',
          parentId: 'roles_module_fromObj',
        },
        () => {
          const rolesSet = new Set();
          const obj = {
            data: 'test',
            nested: {
              value: 'nested',
            },
          };
          fromObj(rolesSet, obj);
          codi.assertEqual(rolesSet.size, 0);
        },
      );
    },
  );
});
