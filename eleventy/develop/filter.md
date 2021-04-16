---
title: SQL Filter
layout: root.html
---

# SQL Filter

The XYZ/Mapp architecture prevents SQL injection by validating parameter to be substituted in query templates. This prevents SQL filter from being sent as query parameter to be substituted in query templates. The `${filter}` is reserved in query templates.

The [sql_filter](https://github.com/GEOLYTIX/xyz/blob/development/mod/layer/sql_filter.js) module is used by the gazetteer, query, and layer modules to generate SQL where statements from JSON objects. Provdided as a stringified and URLencoded filter parameter this allows for creation of complex filter conditions.

All filter types and nesting of filters are shown in the this test object.

**The filter types are reserved and cannot be column identifiers.**

```javascript
{
  "is equal to": {
    eq: "foo"
  },
  matches: {
    match: "bar"
  },
  "is like": {
    like: "foo, bar"
  },
  "greater than": {
    gt: 123
  },
  "lesser than": {
    lt: 123
  },
  "greater or equal than": {
    gte: 123.45
  },
  "lesser or equal than": {
    lte: 123.45
  },
  or: [
    {
      "boolean true": {
        boolean: true
      }
    },
    {
      "boolean false": {
        boolean: false
      }
    }
  ],
  "not in array": {
    ni: ["foo", "bar"]
  },
  "in array": {
    in: ["foo", "bar"]
  }
}
```

## Filter conditions

The filter object key represents the column/field name to be filtered. Multiple keys inside a filter object will use the `AND` condition. Multiple filter objects inside an array will use the `OR` condition.

```javascript
const AND_condition = {
  a: {
    like: "H"
  },
  b: {
    gt: 116
  }
};

// (('a' ILIKE 'H%') AND 'b' > 116)

const OR_condition = [
  {
    a: {
      like: "H"
    }
  },
  {
    b: {
      gt: 116
    }
  }
]

// ((('a' ILIKE 'H%')) OR ('b' > 116))
```

## eq

The *equal* filter checks whether the filter value equals the field value.

```javascript
{
  "col": {
    eq: "value"
  }
}

// ('col' = 'value')
```

## match

The *match* filter checks whether the filter value is `ILIKE` to the field value.

```javascript
{
  "col": {
    match: "value"
  }
}

// ('col'::text ILIKE 'value')
```

## like

The *like* filter checks whether the filter value is `ILIKE` to the field value. The like filter will split the value on comma and add a wildcard to each segment.

```javascript
{
  "col": {
    like: "foo, bar"
  }
}

// (('col' ILIKE 'foo%' OR 'col' ILIKE 'bar%'))
```

## gt, gte, lt, lte

The *greater* or *lesser than*, *greater* or *lesser and equal to* filter compare numeric values to the column.

```javascript
{
  "col": {
    gte: 123.45
  }
}

// ('col' >= 123.45)
```

## in

The *in* array filter checks whether the column is in an array of values.

```javascript
{
  "col": {
    in: ['foo', 'bar']
  }
}

// ('col' IN ('foo','bar'))
```

## ni

The *not in* array filter checks whether the column is in an array of values.

```javascript
{
  "col": {
    ni: ['foo', 'bar']
  }
}

// ('col' NOT IN ('foo','bar'))
```