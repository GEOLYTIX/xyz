---
title: Location
tags: [configure]
layout: root.html
---

## infoj

`infoj` is a JSON array \[of Objects\] which describes the properties of a location.

```text
"infoj": [
  {
    "field": "name",
    "label": "Name: ",
    "type": "text"
  },
  {
    "label": "Label"
  },
  {...}
]
```

**Each infoj array entry must describe a single property only.**

The **`field`** is the datasource \(PostGIS table\) field to be queried for a property value to be presented in the location info.

The **`label`** will be displayed before the field value. A label without a field definition will be displayed on its own. The label will not be displayed if a field has no value and is not editable.

The **`type`** defines the nature of an entry and how the data should be displayed. `"text"` is the default content format.

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

## **Special property types**

`"type" : "group"`

Any subsequent entries can be added to a [**group entry**](groups.md).

`"type" : "images"`

The entry will be displayed as an image array in a scrollable table row. The entry must have edit set to true in order to upload or remove images. The database table field for image arrays must be of the type `TEXT[]` and have a default of `'{}'::TEXT[]`

A cloudinary account is required in order to upload images to the cloudinary image hosting platform. The access key for the cloudinary account must be defined in the environment settings as a 3rd party API key.

`"type" : "streetview"`

The entry will displayed as a Google Streetview image requested for the location of a marker. A Google API key with access to the Google Streetview service must be defined in the environment settings as a 3rd party API key.

`"type" : "geometry"`

A geometry associated with the location will be read from the table field and displayed in the map control together with the location's own geometry.

`"type": "key"`

This property displays layer name in location view.

## **Supporting infoj keys**

`"title" : "I am a tooltip"`

The title will be displayed when the cursor hovers over the info entry label.

`"level" : 1`

The level is a class which will be assigned to the table row which holds the entry label and value. This class can be used to assign hierarchical styling to entries.

`"fieldfx" : "(field_a + field_b)"`

Function fields can be used to calculate a value from other fields in the same table. These fields can not be edited.

`"prefix" : "$ "`

`"postfix" : " %"`

A prefix will be added at the beginning, a postfix at the end of the displayed value. Handy for adding units to the output.