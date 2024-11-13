import { describe, it, assertEqual } from 'codi-test-framework';
import { check, objMerge } from '../../../mod/utils/roles.js';

await describe('Roles Module', async () => {
  await describe('check()', () => {
    it('should return the object if it has no roles', () => {
      const obj = { layer: 'I am a layer!' };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return the object if it has the * role', () => {
      const obj = { layer: 'I am a layer!', roles: { '*': true } };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return false if user_roles is undefined', () => {
      const obj = { roles: { admin: true } };
      const result = check(obj, undefined);
      assertEqual(result, false);
    });

    it('should return false if a negated role is included in user_roles', () => {
      const obj = { roles: { '!guest': true } };
      const result = check(obj, ['guest']);
      assertEqual(result, false);
    });

    it('should return the object if all roles are negated and none match user_roles', () => {
      const obj = { roles: { '!admin': true, '!user': true } };
      const result = check(obj, ['guest', 'users']);
      assertEqual(result, obj);
    });

    it('should return the object if a positive role is included in user_roles', () => {
      const obj = { roles: { admin: true, user: true } };
      const result = check(obj, ['admin']);
      assertEqual(result, obj);
    });

    it('should return false if no role matches user_roles', () => {
      const obj = { roles: { admin: true, user: true } };
      const result = check(obj, ['guest']);
      assertEqual(result, false);
    });
  });

  describe('objMerge()', () => {
    it('should return the input value if it is not an object', () => {
      assertEqual(objMerge(5), 5);
      assertEqual(objMerge('hello'), 'hello');
      assertEqual(objMerge(null), null);
    });

    it('should return the input object if user_roles is undefined', () => {
      const obj = { a: 1, b: 2 };
      assertEqual(objMerge(obj, undefined), obj);
    });

    it('should merge nested objects', () => {

      const obj = {
        'foo': 'bar',
        'bar': {
          'foo': 'bar',
          'bar': {
            'foo': 'bar'
          }
        },
        'roles': {
          'admin': {
            'foo': 'bar'
          },
          'user': {
            'foo': 'bar'
          }
        }
      };
      const user_roles = ['admin'];

      const expected = {
        'foo': 'bar',
        'bar': {
          'foo': 'bar',
          'bar': {
            'foo': 'bar'
          }
        },
        'roles': {
          'admin': {
            'foo': 'bar'
          },
          'user': {
            'foo': 'bar'
          }
        }
      }

      assertEqual(objMerge(obj, user_roles), expected);
    });

    it('should handle negated roles', () => {

      let obj = {
        roles: {
          'admin': {
            text: 'admin'
          },
          '!guest': {
            text: 'guest'
          },
          'user': {
            text: 'user'
          }
        }
      };

      const user_roles = ['user'];

      const expected = {
        text: 'user',
      }

      obj = objMerge(obj, user_roles);

      assertEqual(obj.text, expected.text);
    });

    it('should handle arrays', () => {
      const obj = [
        { foo: 'afoo' },
        { bar: 'abar' },
        [
          { foo: 'afoo' }
        ]
      ];
      const user_roles = [];

      const expected = [{ foo: 'afoo' }, { bar: 'abar' }, [{ foo: 'afoo' }]];

      assertEqual(objMerge(obj, user_roles), expected);
    });

    it('should merge unequal arrays for multiple roles', () => {

      let obj = {
        layer: {
          name: 'Test Me',
          roles: {
            foo: {
              filter: {
                current: {
                  'country': {
                    'in': ['ROI']
                  }
                }

              }
            },
            bar: {
              filter: {
                current: {
                  'country': {
                    'in': ['UK']
                  }
                }
              }
            }
          }
        }
      };

      const user_roles = ['foo', 'bar'];

      const expected_filter = {
        current: {
          'country': {
            'in': ['ROI', 'UK']
          }
        }
      };

      obj = objMerge(obj, user_roles);

      assertEqual(obj.layer.filter, expected_filter);
    });
  });
});