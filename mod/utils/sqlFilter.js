/**
@module /utils/sqlFilter
@description The sqlFilter module is used to convert the filter object into a SQL query string.
@exports sqlfilter
*/

// The filterTypes object contains methods for each filter type.
const filterTypes = {
  eq: (col, val) => `"${col}" = \$${addValues(val, 'numeric')}`,

  gt: (col, val) => `"${col}" > \$${addValues(val, 'numeric')}`,

  gte: (col, val) => `"${col}" >= \$${addValues(val, 'numeric')}`,

  lt: (col, val) => `"${col}" < \$${addValues(val, 'numeric')}`,

  lte: (col, val) => `"${col}" <= \$${addValues(val, 'numeric')}`,

  boolean: (col, val) => `"${col}" IS ${!!val}`,

  null: (col, val) => `"${col}" IS ${!val ? 'NOT' : ''} NULL`,

  ni: (col, val) => `NOT "${col}" = ANY (\$${addValues([val], 'array')})`,

  in: (col, val) => `"${col}" = ANY (\$${addValues([val], 'array')})`,

  like: (col, val) =>
    `(${val
      .split(',')
      .filter((val) => val.length > 0)
      .map((val) => `"${col}" ILIKE \$${addValues(`${val}%`, 'string')}`)
      .join(' OR ')})`,

  match: (col, val) => `"${col}"::text = \$${addValues(val, 'string')}`
}

let SQLparams;

/**
@function addValues
@description
The addValues method is used to add values to the SQLparams array.

@param {string} val 
@returns {number} SQLparams.length
*/
function addValues(val, type) {

  const err = isValidParam(val, type)

  if (err instanceof Error) {

    console.error(err)
    SQLparams.push(err)
    return;
  }

  SQLparams.push(val);
  return SQLparams.length;
}

/**
@function sqlfilter
@description
The sqlfilter method is used to convert the filter object into a SQL query string.
If the filter is an array, the filter will be conditional OR.
If the filter is a string, the filter will be returned as is.

@param {Object} filter
@param {Array} params
@returns {string} SQL query string
*/
module.exports = sqlfilter; 

function sqlfilter(filter, params) {

  //Check to see that params is an array and that the values of the params are of valid type.
  if (!Array.isArray(params)) {
    throw new TypeError('Expected params to be an array of valid types (string, number, boolean, object, or bigint)');
  }

  if (typeof filter === 'string') return filter;

  SQLparams = params

  // Filter in an array will be conditional OR
  if (filter.length)
    return `(${filter

      // Map filter in array with OR conjuction
      .map((filter) => mapFilterEntries(filter))
      .join(' OR ')})`;

  // Filter in an object will be conditional AND
  return mapFilterEntries(filter);
}

/**
@function mapFilterEntries
@description 
The mapFilterEntries method is used to map the filter entries and convert them into a SQL query string.
The method also validates the filter entries against SQL parameter validation.
@param {Object} filter
@returns {string} SQL query string
*/

function mapFilterEntries(filter) {

  const SQLvalidation = /^[a-zA-Z_]\w*$/

  if (Object.keys(filter).some(key => !SQLvalidation.test(key))) {

    let unvalidatedKey = Object.keys(filter).find(key => !SQLvalidation.test(key))

    console.warn(`"${unvalidatedKey}" field didn't pass SQL parameter validation`)
    return;
  }

  return `(${Object.entries(filter)

    // Map filter entries
    .map((entry) => {

      const field = entry[0]
      const value = entry[1]

      // Array entry values represent conditional OR
      if (value.length) return sqlfilter(value);

      // Call filter type method for matching filter entry value
      // Multiple filterTypes for the same field will be joined with AND
      return Object.keys(value)
        .filter(filterType => !!filterTypes[filterType])
        .map(filterType => filterTypes[filterType](field, value[filterType]))
        .join(' AND ')

    })

    // Filter out undefined / escaped filter
    .filter(f => typeof f !== 'undefined')

    // Join filter with conjunction
    .join(' AND ')})`;
}

/**
@function isValidParam 
@description
Check whether val param is of expected type.

@param {*} val 
@param {string} type
@returns boolean 
*/
function isValidParam(val, type) {
  // Object containing type checking functions for each supported type
  const typeCheckers = {
    // Uses native Array.isArray for array checking
    array: Array.isArray,
    // Checks if value is strictly a string using typeof
    string: (val) => typeof val === 'string',
    // Checks if value is a valid number and not null
    // Note: isNaN('123') returns false, so this also accepts numeric strings
    numeric: (val) => !isNaN(val) && val !== null
  };

  // Check if the requested type is supported
  if (!typeCheckers.hasOwnProperty(type)) {
    return new Error(`Unsupported type: ${type}`);
  }

  // Perform the type check using the appropriate function
  if (!typeCheckers[type](val)) {
    // Determine the actual type of the value
    // Special handling for arrays since typeof [] returns 'object'
    const actualType = Array.isArray(val) ? 'array' : typeof val;
    return new Error(`Expected ${type} type val param, got ${actualType}`);
  }

  // If we reach here, the value is valid
  return null;
}