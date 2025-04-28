import styleParserJson from '../../assets/styles/styleParser.json' with {
  type: 'json',
};

export async function styleParser(mapview) {
  await codi.describe('Layer: styleParserTest', async () => {
    await codi.it('stypeParser Test:', async () => {
      const layer = styleParserJson;

      mapp.layer.styleParser(layer);
      // Test legacy property migrations
      codi.assertFalse(
        layer.hasOwnProperty('hover'),
        'Legacy hover property should be removed',
      );
      codi.assertTrue(
        layer.hasOwnProperty('icon_scaling'),
        'Legacy icon_scaling property should be removed',
      );

      // Test style property existence and structure
      codi.assertTrue(
        layer.hasOwnProperty('style'),
        'Style object should exist',
      );
      codi.assertTrue(
        layer.style.hasOwnProperty('hover'),
        'Hover should be moved to style object',
      );
      codi.assertEqual(
        layer.style.hover.method,
        'legacy_hover_method',
        'Hover method should be preserved',
      );

      // Test default style
      codi.assertTrue(
        layer.style.hasOwnProperty('default'),
        'Default style should exist',
      );
      codi.assertTrue(
        layer.style.default.hasOwnProperty('icon'),
        'Default style should have icon for cluster layer',
      );
      codi.assertFalse(
        layer.style.default.hasOwnProperty('strokeColor'),
        'Stroke color should be removed from cluster layer default style',
      );
      codi.assertFalse(
        layer.style.default.hasOwnProperty('fillColor'),
        'Fill color should be removed from cluster layer default style',
      );

      // Test cluster style
      codi.assertTrue(
        layer.style.hasOwnProperty('cluster'),
        'Cluster style should exist',
      );
      codi.assertTrue(
        layer.style.cluster.hasOwnProperty('clusterScale'),
        'Cluster style should have clusterScale',
      );
      codi.assertEqual(
        layer.style.cluster.clusterScale,
        1,
        'Cluster scale should default to 1',
      );
      codi.assertFalse(
        layer.style.cluster.hasOwnProperty('zoomInScale'),
        'zoomInScale should be moved from cluster style',
      );
      codi.assertFalse(
        layer.style.cluster.hasOwnProperty('zoomOutScale'),
        'zoomOutScale should be moved from cluster style',
      );

      // Test zoom scale properties
      codi.assertTrue(
        layer.style.hasOwnProperty('zoomInScale'),
        'zoomInScale should be moved to style root',
      );
      codi.assertTrue(
        layer.style.hasOwnProperty('zoomOutScale'),
        'zoomOutScale should be moved to style root',
      );
      codi.assertEqual(
        layer.style.zoomInScale,
        1.2,
        'zoomInScale value should be preserved',
      );
      codi.assertEqual(
        layer.style.zoomOutScale,
        0.8,
        'zoomOutScale value should be preserved',
      );

      // Test icon styling
      codi.assertTrue(
        layer.style.default.icon.hasOwnProperty('type'),
        'Default icon should have type',
      );
      codi.assertEqual(
        layer.style.default.icon.type,
        'dot',
        'Default icon type should be preserved',
      );

      // Test highlight style
      if (layer.style.highlight) {
        codi.assertTrue(
          layer.style.highlight.hasOwnProperty('zIndex'),
          'Highlight should have zIndex',
        );
        codi.assertEqual(
          layer.style.highlight.zIndex,
          Infinity,
          'Highlight zIndex should be Infinity',
        );
      }

      // Test theme handling
      if (layer.style.themes) {
        Object.values(layer.style.themes).forEach((theme) => {
          codi.assertTrue(
            theme.hasOwnProperty('title'),
            'Theme should have title',
          );
          codi.assertTrue(theme.hasOwnProperty('key'), 'Theme should have key');

          checkGraduatedTheme(theme);

          if (theme.categories) {
            theme.categories.forEach((category) => {
              codi.assertTrue(
                category.hasOwnProperty('label'),
                'Category should have label',
              );
              codi.assertTrue(
                category.hasOwnProperty('value'),
                'Category should have value',
              );
              if (category.style?.icon) {
                codi.assertFalse(
                  category.hasOwnProperty('icon'),
                  'Category should not have direct icon property',
                );
              }
            });
          }
        });
      }

      // Test hover configuration
      if (layer.style.hovers) {
        Object.values(layer.style.hovers).forEach((hover) => {
          codi.assertTrue(
            hover.hasOwnProperty('title'),
            'Hover should have title',
          );
          codi.assertTrue(hover.hasOwnProperty('key'), 'Hover should have key');
        });
      }

      // Test label configuration
      if (layer.style.labels) {
        Object.values(layer.style.labels).forEach((label) => {
          codi.assertTrue(
            label.hasOwnProperty('title'),
            'Label should have title',
          );
          codi.assertTrue(label.hasOwnProperty('key'), 'Label should have key');
        });
      }
    });
  });
}

function checkGraduatedTheme(theme) {
  if (theme.type === 'graduated') {
    // Check graduated_breaks default
    if (!theme.graduated_breaks) {
      codi.assertEqual(
        theme.graduated_breaks,
        'less_than',
        'Graduated theme should default to less_than breaks',
      );
    }

    // Verify all values are numbers
    theme.categories.forEach((cat) => {
      codi.assertTrue(
        typeof cat.value === 'number',
        'Graduated theme category values should be numbers',
      );
    });

    // Check ordering
    const isOrdered = theme.categories.every((cat, i) => {
      if (i === 0) return true;
      const prev = theme.categories[i - 1].value;
      const curr = cat.value;

      if (theme.graduated_breaks === 'less_than') {
        return prev <= curr;
      } else {
        return prev >= curr;
      }
    });

    codi.assertTrue(
      isOrdered,
      `Categories should be ordered ${theme.graduated_breaks === 'less_than' ? 'ascending' : 'descending'}`,
    );
  }
}
