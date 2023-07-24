const sqlfilter = require('../../../mod/utils/sqlFilter');

describe('sqlfilter function', () => {
  let params;
  beforeEach(() => {
    params = ['param1', 'param2'];
  });

  it('should return empty string for empty array', () => {
    expect(sqlfilter([], params)).toBe('()');
  });

  it('should return correct string for eq filter', () => {
    const arr = [
      {
        filter: {
          fieldName: {
            eq: 'value1'
          }
        }
      }
    ];
    expect(sqlfilter(arr, params)).toBe('(("fieldName" = $3))');
  });

  it('should return correct string for multiple filters', () => {
    const arr = [
      {
        filter: {
          fieldName1: {
            eq: 'value1'
          },
          fieldName2: {
            gt: 'value2'
          }
        }
      }
    ];
    expect(sqlfilter(arr, params)).toBe('(("fieldName1" = $3 AND "fieldName2" > $4))');
  });

  it('should return correct string for multiple filters in array', () => {
    const arr = [
      {
        filter: {
          fieldName1: {
            eq: 'value1'
          }
        }
      },
      {
        filter: {
          fieldName2: {
            gt: 'value2'
          }
        }
      }
    ];
    expect(sqlfilter(arr, params)).toBe('(("fieldName1" = $3) OR ("fieldName2" > $4))');
  });

  it('should skip invalid field names', () => {
    console.log = jest.fn();
    const arr = [
      {
        filter: {
          'invalid-field-name': {
            eq: 'value1'
          }
        }
      }
    ];
    expect(sqlfilter(arr, params)).toBe('invalid field');
    expect(console.log).toHaveBeenCalledWith('invalid-field-name - ¡no bueno!');
  });
});