import { describe, it, assertEqual, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.26';

export async function featureStyleTest() {
  await describe('mapp.layer.featureStyle', () => {
    it('should return cached styles if available', () => {
      const layer = {
        style: {
          cache: true,
        },
      };
      const feature = {
        get: (key) => {
          if (key === 'Styles') {
            return { fillColor: 'red' };
          }
        },
      };
  
      const styleFunction = mapp.layer.mapp.layer.featureStyle(layer);
      const styles = styleFunction(feature);

      console.log(styles);
  
      assertEqual(styles.fillColor, 'red', 'Should return cached styles');
    });
  
    it('should apply theme style to the feature', () => {
      const layer = {
        style: {
          theme: {
            type: 'customTheme',
          },
        },
        filter: {
          current: {},
        },
      };
      const feature = {
        get: () => {},
        getProperties: () => ({}),
      };
  
      mapp.layer.themes.customTheme = (theme, feat) => {
        feat.style.fillColor = 'blue';
      };
  
      const styleFunction = mapp.layer.featureStyle(layer);
      styleFunction(feature);
  
      assertEqual(feature.style.fillColor, 'blue', 'Should apply custom theme style');
    });
  
    it('should apply cluster style to the feature', () => {
      const layer = {
        style: {
          cluster: {
            clusterScale: 2,
          },
          default: {},
        },
        max_size: 100,
        mapview: {
          Map: {
            getView: () => ({
              getZoom: () => 10,
            }),
          },
        },
      };
      const feature = {
        get: () => {},
        getProperties: () => ({
          count: 50,
        }),
      };
  
      const styleFunction = mapp.layer.featureStyle(layer);
      styleFunction(feature);
  
      assertTrue(feature.style.clusterScale > 1, 'Should apply cluster scaling');
    });
  
    it('should apply highlight style to the feature', () => {
      const layer = {
        style: {
          default: {},
          highlight: {
            fillColor: 'yellow',
          },
        },
        highlight: 'feature1',
      };
      const feature = {
        get: (key) => {
          if (key === 'id') {
            return 'feature1';
          }
        },
      };
  
      const styleFunction = mapp.layer.featureStyle(layer);
      styleFunction(feature);
  
      assertEqual(feature.style.fillColor, 'yellow', 'Should apply highlight style');
    });
  
    it('should apply label style to the feature', () => {
      const layer = {
        style: {
          default: {},
          label: {
            display: true,
            field: 'name',
          },
        },
        mapview: {
          Map: {
            getView: () => ({
              getZoom: () => 10,
            }),
          },
        },
      };
      const feature = {
        get: () => {},
        getProperties: () => ({
          name: 'Feature 1',
        }),
        style: {},
      };
  
      const styleFunction = mapp.layer.featureStyle(layer);
      styleFunction(feature);
  
      assertEqual(feature.style.label.text, 'Feature 1', 'Should apply label style');
    });
  
    it('should apply selected style to the feature', () => {
      const layer = {
        key: 'layer1',
        style: {
          default: {},
          selected: {
            fillColor: 'green',
          },
        },
        mapview: {
          locations: {
            'layer1!feature1': true,
          },
        },
      };
      const feature = {
        get: () => {},
        getProperties: () => ({
          id: 'feature1',
        }),
      };
  
      const styleFunction = mapp.layer.featureStyle(layer);
      styleFunction(feature);
  
      assertEqual(feature.style.fillColor, 'green', 'Should apply selected style');
    });
  });
}