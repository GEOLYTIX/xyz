import table_schema from '../../../../mod/workspace/templates/table_schema.js';

export function tableSchemaTests() {
  codi.describe(
    {
      name: 'table_schema',
      id: 'template_table_schema',
      parentId: 'template',
    },
    () => {
      codi.it(
        {
          name: 'Should be a valid SQL template string',
          parentId: 'template_table_schema',
        },
        () => {
          codi.assertTrue(
            typeof table_schema === 'string',
            'table_schema template should be a string',
          );
        },
      );

      codi.it(
        {
          name: 'Should query INFORMATION_SCHEMA.COLUMNS',
          parentId: 'template_table_schema',
        },
        () => {
          codi.assertTrue(
            table_schema.includes('INFORMATION_SCHEMA.COLUMNS'),
            'Template should query INFORMATION_SCHEMA.COLUMNS',
          );
        },
      );

      codi.it(
        {
          name: 'Should use parameterised substitution for table_schema and table',
          parentId: 'template_table_schema',
        },
        () => {
          codi.assertTrue(
            table_schema.includes('%{table_schema}'),
            'Template should use %{table_schema} substitution parameter',
          );
          codi.assertTrue(
            table_schema.includes('%{table}'),
            'Template should use %{table} substitution parameter',
          );
        },
      );

      codi.it(
        {
          name: 'Should select expected column metadata fields',
          parentId: 'template_table_schema',
        },
        () => {
          const expectedFields = [
            'column_name',
            'data_type',
            'udt_name',
            'character_maximum_length',
            'column_default',
            'is_nullable',
          ];

          for (const field of expectedFields) {
            codi.assertTrue(
              table_schema.includes(field),
              `Template should select ${field}`,
            );
          }
        },
      );

      codi.it(
        {
          name: 'Should order by ordinal_position',
          parentId: 'template_table_schema',
        },
        () => {
          codi.assertTrue(
            table_schema.includes('ORDER BY ordinal_position'),
            'Template should order results by ordinal_position',
          );
        },
      );
    },
  );
}
