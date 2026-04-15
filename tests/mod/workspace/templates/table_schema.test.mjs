import { describe, expect, it } from 'vitest';

import table_schema from '../../../../mod/workspace/templates/table_schema.js';

describe('table_schema', () => {
  it('should be a valid SQL template string', () => {
    expect(typeof table_schema).toBe('string');
  });

  it('should query INFORMATION_SCHEMA.COLUMNS', () => {
    expect(table_schema.includes('INFORMATION_SCHEMA.COLUMNS')).toBe(true);
  });

  it('should use parameterised substitution for table_schema and table', () => {
    expect(table_schema.includes('%{table_schema}')).toBe(true);
    expect(table_schema.includes('%{table}')).toBe(true);
  });

  it('should select expected column metadata fields', () => {
    const expectedFields = [
      'column_name',
      'data_type',
      'udt_name',
      'character_maximum_length',
      'column_default',
      'is_nullable',
    ];

    for (const field of expectedFields) {
      expect(table_schema.includes(field)).toBe(true);
    }
  });

  it('should order by ordinal_position', () => {
    expect(table_schema.includes('ORDER BY ordinal_position')).toBe(true);
  });
});
