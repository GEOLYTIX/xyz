/**
 * ## layer.decorateTest()
 * @module ui/elements/alert
 */
/**
 * This function is used to test the alert method
 * @function alertTest
 */
export function alert() {
  codi.describe(
    { name: 'Alert test:', id: 'ui_elements_alert', parentId: 'ui_elements' },
    () => {
      // Test providing params
      codi.describe(
        {
          name: 'Should create an alert with params provided',
          id: 'ui_elements_alert_with_params',
          parentId: 'ui_elements_alert',
        },
        async () => {
          const alert = await mapp.ui.elements.alert({
            title: 'ALERT TITLE',
            text: 'ALERT TEXT',
          });

          codi.it(
            {
              name: 'we expect to see an alert',
              parentId: 'ui_elements_alert_with_params',
            },
            () => {
              codi.assertTrue(
                alert !== undefined,
                'We expect to see the alert element',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a title of ALERT TITLE',
              parentId: 'ui_elements_alert_with_params',
            },
            () => {
              // Get the alert title
              const alert_title = alert.title;
              codi.assertEqual(
                alert_title,
                'ALERT TITLE',
                'We expect to see the alert title',
              );
            },
          );

          codi.it(
            {
              name: 'Should have a text of ALERT TEXT',
              parentId: 'ui_elements_alert_with_params',
            },
            () => {
              // Get the alert text
              const alert_text = alert.text;
              codi.assertEqual(
                alert_text,
                'ALERT TEXT',
                'We expect to see the alert text',
              );
            },
          );
          // Close the alert
          alert.close();
        },
      );

      // Test providing no params
      codi.describe(
        {
          name: 'Should create an alert with no params provided',
          id: 'ui_elements_alert_no_params',
          parentId: 'ui_elements_alert',
        },
        async () => {
          const alert = await mapp.ui.elements.alert({});

          codi.it(
            {
              name: 'We expect to see the alert element',
              parentId: 'ui_elements_alert_no_params',
            },
            () => {
              codi.assertTrue(alert !== undefined);
            },
          );

          codi.it(
            {
              name: 'Should have a title of Information',
              parentId: 'ui_elements_alert_no_params',
            },
            () => {
              // Get the alert title
              const alert_title = alert.title;
              codi.assertEqual(
                alert_title,
                'Information',
                'We expect to see the alert title',
              );
            },
          );

          codi.it(
            {
              name: 'Should have no text',
              parentId: 'ui_elements_alert_no_params',
            },
            () => {
              // Get the alert text
              const alert_text = alert.text;
              codi.assertEqual(
                alert_text,
                undefined,
                'We expect to see no alert text',
              );
            },
          );
          // Close the alert
          alert.close();
        },
      );
    },
  );
}
