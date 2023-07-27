const {
    check,
    filter,
    get
} = require('../../../mod/utils/roles');

describe('Testing module functions', () => {

    describe('Testing check function', () => {
      it('should return the object when all roles are negated', () => {
        const obj = {roles: {'!admin': true}};
        const roles = ['user'];
        expect(check(obj, roles)).toEqual(obj);
      });
       
    });
  
    describe('Testing filter function', () => {
      it('should return filter objects for user_roles matched with layer.roles', () => {
        const layer = {roles: {'user': { filter: 'test' }}};
        const user_roles = ['user'];
        expect(filter(layer, user_roles)).toEqual({});
      });
  
       
    });
  
    describe('Testing get function', () => {
      it('should return array of roles from the object', () => {
        const obj = {roles: {'user': true}, test: {roles: {'admin': true}}};
        expect(get(obj)).toEqual(['user', 'admin']);
      });
  
    });
  
  });