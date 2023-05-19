const clone = require('../../mod/utils/clone');

describe('clone', () => {
  test('should return the cloned object', () => {
    const obj = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'New York',
      },
      hobbies: ['reading', 'painting'],
    };

    const clonedObj = clone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj);
  });

  test('should handle circular references', () => {
    const obj = { prop: null };
    obj.prop = obj;

    const clonedObj = clone(obj);

    expect(clonedObj).toEqual(obj);
    expect(clonedObj.prop).toBe(clonedObj);
  });

  test('should return the same value if not an object or null', () => {
    const str = 'hello';
    const num = 42;
    const bool = true;
    const fn = () => {};

    expect(clone(str)).toBe(str);
    expect(clone(num)).toBe(num);
    expect(clone(bool)).toBe(bool);
    expect(clone(fn)).toBe(fn);
  });
});
