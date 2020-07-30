---
title: Charts
tags: [workspace]
layout: root.html
---

# Charts

The chart object configures the display of data returned from a query as a chart.

Data from a query may be returned as an array, an object with key/value pairs, or as an array of objects. An array of objects would be returned from a query which matches several records. Each record being an object in the array and the field names from the query being the keys in each of the record objects.

Please refer to the [ChartJS documentation](https://www.chartjs.org/docs/latest/) for detailed information in regard to the individual chart types and layout options.

ChartJS requires the definition of datasets as an array. Each dataset may receive styling parameter such as backgroundColor or borderWidth to define the styling of the dataset elements.

By defining a field, or an fields array, it is possible to map individual fields in a dataset.

The options object allows for a global layout confiuration. Element styles defined in the options object are applied accross all datasets in the chart.

The legend is set to be hidden in the default options configuration.

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
      "fields": ["ab", "c1", "c2", "de"],
      "backgroundColor": ["#cddc39","#00bcd4","#ffc107","#33691e"]
    }
  ]
}
```