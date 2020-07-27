---
title: Location
tags: [workspace]
layout: root.html
orderPath: /workspace/locations/_infoj
---

# infoj

The infoj is a location schema which must defined inside the layer configuration object. Given a query ID **(qID)** the XYZ library might request the location data as defined in the infoj schema from the Location API.

The infoj schema is an array of objects. Each infoj entry may either represent a field to be queried for a value from the layer table or a complex object such as a dataview or even a custom script to be loaded and executed.

The **`field`** is the datasource (PostGIS table) field to be queried for a property value to be presented in the location info.

The **`title`** will be displayed before the field value.

## Entry types

The entry type defines the nature of an entry and how the data should be displayed.

The default being a simple text value.

`"type" : "text"`

In order to split data rows with label headers define entry as:

`"type" : "label"`

A text will be displayed on a new line below the label.

`"type" : "textarea"`

A multi-line input will be provided for an editable textarea. Otherwise the display of a textarea does not deviate from a simple text type.

`"type" : "integer"`

Integer will be rounded and displayed with comma delimiter.

`"type" : "numeric"`

Numeric values will be rounded to 2 decimal places and displayed with comma delimiter.

`"type" : "date"`

Dates will be displayed as a formatted string. **Important**: internally dates are stored as [_unix timestamps_](https://www.unixtimestamp.com/). The database field must be of the type `bigint` in order to store dates.

Dates, integer and numeric values will be displayed inline with the label. Text will displayed on a new line below the label.

`"type": "boolean"`

Boolean data type is displayed as a checkbox element in the location view and can be also set up as editable. Boolean data type is stored in the database as [_boolean_](https://www.postgresql.org/docs/11/datatype-boolean.html).

The checkbox is also shown when it is not editable.

`"type" : "html"`

Setting the type to html will render the field value as html rather than text.

`"inline" : true`

Setting the inline key in an `infoj` entry will force text values to be displayed inline with the label.

`"type" : "images"`

The entry will be displayed as an image array in a scrollable table row. The entry must have edit set to true in order to upload or remove images. The database table field for image arrays must be of the type `TEXT[]` and have a default of `'{}'::TEXT[]`

A cloudinary account is required in order to upload images to the cloudinary image hosting platform. The access key for the cloudinary account must be defined in the environment settings as a 3rd party API key.

`"type" : "streetview"`

The entry will displayed as a Google Streetview image requested for the location of a marker. A Google API key with access to the Google Streetview service must be defined in the environment settings as a 3rd party API key.

`"type" : "geometry"`

A geometry associated with the location will be read from the table field and displayed in the map control together with the location's own geometry.

`"tooltip": <text>`

To enable tooltip on mouse hover. 

`"type": "json"`

This entry stores string representation of JSON object. To enable editing add flag `"edit": true`. The recommended PostgreSQL database column type to store this value is `jsonb`.