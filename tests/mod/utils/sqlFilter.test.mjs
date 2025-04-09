import sqlfilter from '../../../mod/utils/sqlFilter.js';

const originalConsole = console.warn;

const mockWarns = [];

console.warn = (log) => {
  mockWarns.push(log);
};

codi.describe({ name: 'sqlFilter', id: 'sqlFilter' }, () => {
  codi.it(
    {
      name: 'should return correct string for eq filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // 'value1' is passed as $2 in the query
      const filter = {
        fieldname: {
          eq: '100',
        },
      };

      const expected = '("fieldname" = $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for gt filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // 99 is passed as $2 in the query
      const filter = {
        fieldname: {
          gt: 99,
        },
      };

      const expected = '("fieldname" > $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for gte filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // 99 is passed as $2 in the query
      const filter = {
        fieldname: {
          gte: 99,
        },
      };

      const expected = '("fieldname" >= $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for lt filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // 99 is passed as $2 in the query
      const filter = {
        fieldname: {
          lt: 99,
        },
      };

      const expected = '("fieldname" < $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for lte filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // 99 is passed as $2 in the query
      const filter = {
        fieldname: {
          lte: 99,
        },
      };

      const expected = '("fieldname" <= $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for boolean filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // true is passed as $2 in the query
      const filter = {
        fieldname: {
          boolean: true,
        },
      };

      const expected = '("fieldname" IS true)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for null filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // true is passed as $2 in the query
      const filter = {
        fieldname: {
          null: 'test',
        },
      };

      const expected = '("fieldname" IS  NULL)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for ni filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // true is passed as $2 in the query
      const filter = {
        fieldname: {
          ni: 'test',
        },
      };

      const expected = '(NOT "fieldname" = ANY ($2))';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for in filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // true is passed as $2 in the query
      const filter = {
        fieldname: {
          in: 'test',
        },
      };

      const expected = '("fieldname" = ANY ($2))';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for like filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // test is passed as $2 in the query
      const filter = {
        fieldname: {
          like: 'test',
        },
      };

      const expected = '(("fieldname" ILIKE $2))';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for match filter',
      parentId: 'sqlFilter',
    },
    () => {
      // Pass one parameter
      const SQLparams = ['param1'];

      // test is passed as $2 in the query
      const filter = {
        fieldname: {
          match: 'test',
        },
      };

      const expected = '("fieldname"::text = $2)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for multiple filters',
      parentId: 'sqlFilter',
    },
    () => {
      const SQLparams = ['param1', 'param2'];

      const filter = {
        fieldname_a: {
          eq: '100',
        },
        fieldname_b: {
          gt: '200',
        },
      };

      const expected = '("fieldname_a" = $3 AND "fieldname_b" > $4)';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return correct string for multiple filters in array',
      parentId: 'sqlFilter',
    },
    () => {
      const SQLparams = ['param1', 'param2'];

      const filter = [
        {
          fieldname_a: {
            eq: '100',
          },
        },
        {
          fieldname_b: {
            gt: 200,
          },
        },
      ];

      const expected = '(("fieldname_a" = $3) OR ("fieldname_b" > $4))';

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        expected,
      );
    },
  );

  codi.it(
    {
      name: 'should return undefined for invalid field name',
      parentId: 'sqlFilter',
    },
    () => {
      const SQLparams = ['param1', 'param2'];

      const filter = {
        'invalid-field-name!!!': {
          eq: 'value1',
        },
      };

      codi.assertEqual(
        sqlfilter(filter, { params: { SQL: SQLparams } }),
        undefined,
      );
    },
  );
});

console.warn = originalConsole;
