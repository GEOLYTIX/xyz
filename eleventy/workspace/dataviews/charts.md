---
title: Charts
tags: [workspace]
layout: root.html
---

# Charts

The chart object configures the display of data returned from a query as a chart.

Charts require data structure to comply with ChartJS `"datasets"` object.

Please refer to the [ChartJS documentation](https://www.chartjs.org/docs/latest/) for detailed information in regard to the individual chart types and layout options.

ChartJS support the definition of datasets as an array. Each dataset may receive styling parameter such as backgroundColor or borderWidth to define the styling of the dataset elements. When dataview is constructed each element of `"datasets"` will be inherited by endpoint response.

Chart query result *must contain* `"datasets"` field which stores data in format required by ChartJS chart object.
Additionally the query result may contain `"labels"` list with data labels used in the chart. Alternatively `"labels"` can be defined inside `"chart"` object.

The options object allows for a global layout confiuration. Element styling defined in the options object are applied accross all datasets in the chart.

Example chart query with labels and some custom styling:

```sql
SELECT
    array_agg(json_build_object(
    'data', ARRAY[
        ROUND(comp_pct),
        ROUND(fbl_pct),
        ROUND(conv_pct),
        ROUND(serv_pct)
        ],
    'backgroundColor', ARRAY[
        '#ffb300',
        '#d81b60',
        '#8e24aa',
        '#5e35b1'
        ],
     'borderColor', ARRAY [
         '#ffb300',
         '#d81b60',
         '#8e24aa',
         '#5e35b1']
        )) AS datasets,
       ARRAY['Comparison', 'F/B/L', 'Convenience', 'Services'] AS labels

FROM retail
WHERE id = ${id};
```
* Read more on ChartJS `"datasets"` [here](https://www.chartjs.org/docs/latest/).

The legend is set to be hidden in the default options configuration.

The chart uses [*Datalabels*](https://chartjs-plugin-datalabels.netlify.app/) and [*Annotation*](https://github.com/chartjs/chartjs-plugin-annotation) plugins. Their configurations should be included within `"options.plugins"` level.

Below is an example for a single dataset pie chart with legend display and position, as well as layout padding defined in the chart options.

```
"chart": {
  "options": {
    "legend": {
      "display": true,
      "position": "bottom"
    },
    "layout": {
      "padding": {
        "left": 5,
        "right": 5,
        "top": 10,
        "bottom": 15
      }
    }
  },
  "type": "pie",
  "labels": ["AB", "C1", "C2", "DE"],
  "datasets": [
    {
      "borderWidth": 0,
      "backgroundColor": ["#cddc39","#00bcd4","#ffc107","#33691e"]
    }
  ]
}
```