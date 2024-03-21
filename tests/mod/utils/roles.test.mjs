import { describe, it, assertEqual, assertDeepEqual } from 'codi-test-framework';
import { check, filter, get } from '../../../mod/utils/roles.js';

describe('Roles Module', () => {
  describe('check()', () => {
    it('should return the object if no roles are assigned', () => {
      const obj = { name: 'John' };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return the object if the asterisk role is present', () => {
      const obj = { name: 'John', roles: { '*': true } };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return false if user roles are not provided or not an array', () => {
      const obj = { name: 'John', roles: { user: true } };
      const result1 = check(obj, null);
      const result2 = check(obj, 'user');
      assertEqual(result1, false);
      assertEqual(result2, false);
    });

    it('should return false if a negated role is included in user roles', () => {
      const obj = { name: 'John', roles: { '!admin': true } };
      const result = check(obj, ['user', 'admin']);
      assertEqual(result, false);
    });

    it('should return the object if all roles are negated and not included in user roles', () => {
      const obj = { name: 'John', roles: { '!admin': true, '!superuser': true } };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return the object if a positive role is included in user roles', () => {
      const obj = { name: 'John', roles: { user: true, admin: true } };
      const result = check(obj, ['user']);
      assertEqual(result, obj);
    });

    it('should return false if no positive role is included in user roles', () => {
      const obj = { name: 'John', roles: { admin: true } };
      const result = check(obj, ['user']);
      assertEqual(result, false);
    });
  });

  describe('filter()', () => {
    it('should return undefined if the layer has no roles', () => {
      const layer = { name: 'Layer' };
      const result = filter(layer, ['user']);
      assertEqual(result, undefined);
    });

    it('should return undefined if user roles are not an array', () => {
      const layer = { name: 'Layer', roles: { user: { filter: { status: 'active' } } } };
      const result = filter(layer, 'user');
      assertEqual(result, undefined);
    });

    it('should return the role filter for matching roles', () => {
      const layer = { name: 'Layer', roles: { user: { filter: { status: 'active' } } } };
      const result = filter(layer, ['user']);
      assertDeepEqual(result, { user: { status: 'active' } });
    });

    it('should return the role filter for negated roles not included in user roles', () => {
      const layer = { name: 'Layer', roles: { '!admin': { filter: { status: 'active' } } } };
      const result = filter(layer, ['user']);
      assertDeepEqual(result, { '!admin': { status: 'active' } });
    });
  });

  describe('get()', () => {
    it('should return an array of unique roles from the object tree', () => {
      const obj = {
        roles: { user: true, admin: true },
        foo: { roles: { superuser: true } },
      };
      const result = get(obj);
      assertDeepEqual(result, ['user', 'admin', 'superuser']);
    });

    it('should remove the negation prefix from roles', () => {
      const obj = {
        roles: { '!user': true, admin: true },
        foo: { roles: { '!superuser': true } },
      };
      const result = get(obj);
      assertDeepEqual(result, ['user', 'admin', 'superuser']);
    });

    it('should exclude the restricted asterisk role', () => {
      const obj = {
        roles: { '*': true, user: true },
        foo: { roles: { admin: true } },
      };
      const result = get(obj);
      assertDeepEqual(result, ['user', 'admin']);
    });
  });
});