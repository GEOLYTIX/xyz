const sqlfilter = require('../../../mod/utils/sqlFilter');

describe('sqlfilter function', () => {
  let params;
  beforeEach(() => {
    params = ['param1', 'param2'];
  });

  it('should return correct string for eq filter', () => {
    const filter = {
      fieldName: {
        eq: 'value1'
      }
    };
    expect(sqlfilter(filter, params)).toBe('("fieldName" = $3)');
  });

  it('should return correct string for multiple filters', () => {
    const filter = {
      fieldName1: {
        eq: 'value1'
      },
      fieldName2: {
        gt: 'value2'
      }
    };
    expect(sqlfilter(filter, params)).toBe('("fieldName1" = $3 AND "fieldName2" > $4)');
  });

  it('should return correct string for multiple filters in array', () => {
    const filter = [
      {
        fieldName1: {
          eq: 'value1'
        }
      },
      {
        fieldName2: {
          gt: 'value2'
        }
      }
    ];
    expect(sqlfilter(filter, params)).toBe('(("fieldName1" = $3) OR ("fieldName2" > $4))');
  });

  it('should warn for invalid field names and return undefined', () => {
    console.warn = jest.fn();
    const filter = {
      'invalid-field-name!!!': {
        eq: 'value1'
      }
    };
    expect(sqlfilter(filter, params)).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith('"invalid-field-name!!!" field didn\'t pass SQL parameter validation');
  });
});