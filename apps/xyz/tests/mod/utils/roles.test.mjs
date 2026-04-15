import {
  check,
  combine,
  objMerge,
  setInObj,
} from '@geolytix/xyz-app/mod/utils/roles.js';
import { describe, expect, it } from 'vitest';

describe('Roles Module', () => {
  describe('check()', () => {
    it('should return true if object has no roles', () => {
      const obj = { layer: 'I am a layer!' };
      const result = check(obj, ['user']);
      expect(result).toBeTruthy();
    });

    it('should return true if object has the * role', () => {
      const obj = { layer: 'I am a layer!', roles: { '*': true } };
      const result = check(obj, ['user']);
      expect(result).toBeTruthy();
    });

    it('should return false if user_roles is undefined', () => {
      const obj = { roles: { admin: true } };
      const result = check(obj, undefined);
      expect(result).toBeFalsy();
    });

    it('should return false if a negated role is included in user_roles', () => {
      const obj = { roles: { '!guest': true } };
      const result = check(obj, ['guest']);
      expect(result).toBeFalsy();
    });

    it('should return true if all roles are negated and none match user_roles', () => {
      const obj = { roles: { '!admin': true, '!user': true } };
      const result = check(obj, ['guest', 'users']);
      expect(result).toBeTruthy();
    });

    it('should return true if a positive role is included in user_roles', () => {
      const obj = { roles: { admin: true, user: true } };
      const result = check(obj, ['admin']);
      expect(result).toBeTruthy();
    });

    it('should return false if no role matches user_roles', () => {
      const obj = { roles: { admin: true, user: true } };
      const result = check(obj, ['guest']);
      expect(result).toBeFalsy();
    });

    it('should return true if final dot notation role is provided', () => {
      const obj = { roles: { 'namespace.admin': true } };
      const result = check(obj, ['admin']);
      expect(result).toBeTruthy();
    });

    it('should return false if user_roles is null', () => {
      const obj = { roles: { admin: true } };
      const result = check(obj, null);
      expect(result).toBeFalsy();
    });

    it('should handle mixed positive and negated roles', () => {
      const obj = { roles: { admin: true, '!guest': true } };
      const result = check(obj, ['guest']);
      expect(result).toBeFalsy();
    });

    it('should return the object with empty roles object', () => {
      const obj = { roles: {} };
      const result = check(obj, ['user']);
      expect(result).toBeTruthy();
    });
  });

  describe('objMerge()', () => {
    it('should return the input value if it is not an object', () => {
      expect(objMerge(5)).toEqual(5);
      expect(objMerge('hello')).toEqual('hello');
      expect(objMerge(null)).toEqual(null);
    });

    it('should return the input object if user_roles is undefined', () => {
      const obj = { a: 1, b: 2 };
      expect(objMerge(obj, undefined)).toEqual(obj);
    });

    it('should merge nested objects', () => {
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

      expect(objMerge(obj, user_roles)).toEqual(expected);
    });

    it('should handle negated roles', () => {
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

      expect(obj.text).toEqual(expected.text);
    });

    it('should handle arrays', () => {
      const obj = [{ foo: 'afoo' }, { bar: 'abar' }, [{ foo: 'afoo' }]];
      const user_roles = [];

      const expected = [{ foo: 'afoo' }, { bar: 'abar' }, [{ foo: 'afoo' }]];

      expect(objMerge(obj, user_roles)).toEqual(expected);
    });

    it('should merge unequal arrays for multiple roles', () => {
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

      expect(obj.layer.filter).toEqual(expected_filter);
    });

    it('should return the input object if user_roles is not an array', () => {
      const obj = { a: 1, b: 2 };
      expect(objMerge(obj, 'not-array')).toEqual(obj);
    });

    it('should handle objects with null/undefined nested values', () => {
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        roles: {
          admin: { text: 'admin' },
        },
      };
      const result = objMerge(obj, ['admin']);
      expect(result.nullValue).toEqual(null);
      expect(result.undefinedValue).toEqual(undefined);
      expect(result.text).toEqual('admin');
    });

    it('should handle roles object that is an array', () => {
      const obj = {
        data: 'test',
        roles: ['admin', 'user'],
      };
      const result = objMerge(obj, ['admin']);
      expect(result).toEqual(obj);
    });

    it('should handle roles object that is a function', () => {
      const obj = {
        data: 'test',
        roles: () => 'function',
      };
      const result = objMerge(obj, ['admin']);
      expect(result).toEqual(obj);
    });

    it('should handle dot notation roles', () => {
      const obj = {
        roles: {
          'namespace.admin': { text: 'admin' },
          'namespace.user': { text: 'user' },
        },
      };
      const result = objMerge(obj, ['admin']);
      expect(result.text).toEqual('admin');
    });

    it('should filter out roles with true values', () => {
      const obj = {
        roles: {
          admin: true,
          user: { text: 'user' },
        },
      };
      const result = objMerge(obj, ['admin', 'user']);
      expect(result.text).toEqual('user');
    });

    it('should filter out roles with null values', () => {
      const obj = {
        roles: {
          admin: null,
          user: { text: 'user' },
        },
      };
      const result = objMerge(obj, ['admin', 'user']);
      expect(result.text).toEqual('user');
    });

    it('should handle deep nested structures with roles at multiple levels', () => {
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
      expect(result.rootText).toEqual('root');
      expect(result.level1.midText).toEqual('mid user');
      expect(result.level1.level2.deepText).toEqual('deep admin');
    });
  });

  describe('setInObj()', () => {
    it('should add roles to Set', () => {
      const rolesSet = new Set();
      const obj = {
        roles: {
          admin: true,
          user: true,
          guest: true,
        },
      };
      setInObj(rolesSet, obj);
      expect(rolesSet.has('admin')).toEqual(true);
      expect(rolesSet.has('user')).toEqual(true);
      expect(rolesSet.has('guest')).toEqual(true);
    });

    it('should handle negated roles by removing ! prefix', () => {
      const rolesSet = new Set();
      const obj = {
        roles: {
          '!admin': true,
          '!guest': true,
          user: true,
        },
      };
      setInObj(rolesSet, obj);
      expect(rolesSet.has('admin')).toEqual(true);
      expect(rolesSet.has('guest')).toEqual(true);
      expect(rolesSet.has('user')).toEqual(true);
      expect(rolesSet.has('!admin')).toEqual(false);
      expect(rolesSet.has('!guest')).toEqual(false);
    });

    it('should recurse through nested objects', () => {
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
      setInObj(rolesSet, obj);
      expect(rolesSet.has('admin')).toEqual(true);
      expect(rolesSet.has('user')).toEqual(true);
      expect(rolesSet.has('guest')).toEqual(true);
    });

    it('should handle arrays', () => {
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
      setInObj(rolesSet, obj);
      expect(rolesSet.has('admin')).toEqual(true);
      expect(rolesSet.has('user')).toEqual(true);
    });

    it('should handle null and undefined values', () => {
      const rolesSet = new Set();
      const obj = {
        nullValue: null,
        undefinedValue: undefined,
        roles: {
          admin: true,
        },
      };
      setInObj(rolesSet, obj);
      expect(rolesSet.has('admin')).toEqual(true);
    });

    it('should not duplicate roles in Set', () => {
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
      setInObj(rolesSet, obj);
      expect(rolesSet.size).toEqual(2);
      expect(rolesSet.has('admin')).toEqual(true);
      expect(rolesSet.has('user')).toEqual(true);
    });

    it('should handle empty objects', () => {
      const rolesSet = new Set();
      const obj = {};
      setInObj(rolesSet, obj);
      expect(rolesSet.size).toEqual(0);
    });

    it('should handle objects with no roles property', () => {
      const rolesSet = new Set();
      const obj = {
        data: 'test',
        nested: {
          value: 'nested',
        },
      };
      setInObj(rolesSet, obj);
      expect(rolesSet.size).toEqual(0);
    });
  });

  describe('combine()', () => {
    it('should combine parent roles with child roles', () => {
      const child = { roles: { Child: true } };
      const parent = { roles: { Parent: true } };
      combine(child, parent);
      expect(child.roles.Child).toBeTruthy();
      expect(child.roles['Parent.Child']).toBeTruthy();
    });

    it('should handle string role properties', () => {
      const child = { role: 'Child' };
      const parent = { role: 'Parent' };
      combine(child, parent);
      expect(child.roles.Child).toBeTruthy();
      expect(child.roles['Parent.Child']).toBeTruthy();
    });

    it('should not combine if parent role is same as child role', () => {
      const child = { roles: { Common: true } };
      const parent = { roles: { Common: true } };
      combine(child, parent);
      expect(child.roles.Common).toBeTruthy();
      // Should NOT have 'Common.Common'
      expect(!!child.roles['Common.Common']).toBeFalsy();
    });
  });
});
