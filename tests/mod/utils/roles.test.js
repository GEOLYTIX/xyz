const {
  check,
  get
} = require('../../../mod/utils/roles');

describe('Testing module functions', () => {

  describe('Testing check function', () => {
    it('should return the object when all roles are negated', () => {
      const obj = { roles: { '!admin': true } };
      const roles = ['user'];
      expect(check(obj, roles)).toEqual(obj);
    });

  });

  describe('Testing get function', () => {
    it('should return array of roles from the object', () => {
      const obj = { roles: { 'user': true }, test: { roles: { 'admin': true } } };
      expect(get(obj)).toEqual(['user', 'admin']);
    });

  });

});