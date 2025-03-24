/**
 * @module utils/numericFormatter
 */

/**
 * This function is used as an entry point for the numericFormatter Test
 * @function numericFormatterTest
 */
export function numericFormatter() {
  codi.describe(
    {
      name: 'numericFormatter Test:',
      id: 'utils_numeric_formatter',
      parentId: 'utils',
    },
    () => {
      const params = {
        value: 654321.987,
        prefix: '$',
        formatterParams: {
          locale: 'en-UK',
        },
      };

      const expected_unformated_value = 654321.99;
      let expected_formated_value = '$654,321.99';
      /**
       * ### Should format UK locale Numeric Values
       * This test is used to check if a numeric value gets formatted to the correct localised UK string.
       * @function it
       */
      codi.it(
        {
          name: 'Should format UK locale Numeric Values',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          const formattedValue = mapp.utils.formatNumericValue(params);
          codi.assertEqual(
            formattedValue,
            expected_formated_value,
            `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`,
          );
        },
      );
      /**
       * ### Should unformat UK locale string
       * This test is used to check if a localised string to UK returns the correct string.
       * @function it
       */
      codi.it(
        {
          name: 'Should unformat UK locale strings',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          const unformattedString = mapp.utils.unformatStringValue(params);
          codi.assertEqual(
            unformattedString,
            expected_unformated_value,
            `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`,
          );
        },
      );
      /**
       * ### Should format DE locale Numeric Values
       * This test is used to check if a numeric value gets formatted to the correct localised DE string.
       * @function it
       */
      codi.it(
        {
          name: 'Should format DE locale Numeric Values',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          //Settings the locale to 'DE'
          params.formatterParams.locale = 'DE';
          expected_formated_value = '$654.321,99';

          const formattedValue = mapp.utils.formatNumericValue(params);
          codi.assertEqual(
            formattedValue,
            expected_formated_value,
            `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`,
          );
        },
      );
      /**
       * ### Should unformat DE locale string
       * This test is used to check if a localised string to DE returns the correct string.
       * @function it
       */
      codi.it(
        {
          name: 'Should unformat DE locale strings',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          const unformattedString = mapp.utils.unformatStringValue(params);
          codi.assertEqual(
            unformattedString,
            expected_unformated_value,
            `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`,
          );
        },
      );

      /**
       * ### Should format PL locale Numeric Values
       * This test is used to check if a numeric value gets formatted to the correct localised PL string.
       * @function it
       */
      codi.it(
        {
          name: 'Should format PL locale Numeric Values',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          //Settings the locale to 'DE'
          params.formatterParams.locale = 'PL';
          expected_formated_value = '$654 321,99';

          const formattedValue = mapp.utils.formatNumericValue(params);
          codi.assertEqual(
            formattedValue,
            expected_formated_value,
            `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`,
          );
        },
      );

      codi.it(
        {
          name: 'Should unformat PL locale strings',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          mapp.utils.formatNumericValue(params);

          const unformattedString = mapp.utils.unformatStringValue(params);
          codi.assertEqual(
            unformattedString,
            expected_unformated_value,
            `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`,
          );
        },
      );

      /**
       * ### Should format RUB locale Numeric Values
       * This test is used to check if a numeric value gets formatted to the correct localised PL string.
       * @function it
       */
      codi.it(
        {
          name: 'Should format RUB locale Numeric Values',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          //Settings the locale to 'DE'
          params.formatterParams.locale = 'RUB';
          expected_formated_value = '$654,321.99';

          const formattedValue = mapp.utils.formatNumericValue(params);
          codi.assertEqual(
            formattedValue,
            expected_formated_value,
            `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`,
          );
        },
      );

      codi.it(
        {
          name: 'Should unformat RUB locale strings',
          parentId: 'utils_numeric_formatter',
        },
        () => {
          mapp.utils.formatNumericValue(params);

          const unformattedString = mapp.utils.unformatStringValue(params);
          codi.assertEqual(
            unformattedString,
            expected_unformated_value,
            `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`,
          );
        },
      );
    },
  );
}
