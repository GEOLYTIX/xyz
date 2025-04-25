/**
## /utils/sqlFilter
The sqlFilter module export a utility method to create SQL filter strings for SQL query templates.
@module /utils/sqlFilter
*/

/**
@typedef {Object} filterTypes
The filterTypes object contains methods for each filter type.
@property {function} eq The value is numeric and must be equal compared with the field.
@property {function} gt The value is numeric and must be greater than compared with the field.
@property {function} gte The value is numeric and must be greater than or equal compared with the field.
@property {function} lt The value is numeric and must be lesser than compared with the field.
@property {function} lte The value is numeric and must be lesser than or equal compared with the field.
@property {function} boolean The value is boolean and must be the same as IS the field.
@property {function} null The field must be NULL.
@property {function} ni The field must be NOT IN the value array.
@property {function} in The field must be IN the value array.
@property {function} like The value is a string which is like the field.
@property {function} match The value is a string which must be the same as the field.
*/
const filterTypes = {
  boolean: (col, val) => `"${col}" IS ${!!val}`,

  eq: (col, val) => `"${col}" = ${addValues(val, 'numeric')}`,

  gt: (col, val) => `"${col}" > ${addValues(val, 'numeric')}`,

  gte: (col, val) => `"${col}" >= ${addValues(val, 'numeric')}`,

  in: (col, val) => `"${col}" = ANY (${addValues([val], 'array')})`,

  like: (col, val) => {
    // The val string must be decoded.
    val = decodeURIComponent(val);

    return `(${val
      .split(',')
      .filter((val) => val.length > 0)
      .map((val) => `"${col}" ILIKE ${addValues(val + '%', 'string')}`)
      .join(' OR ')})`;
  },

  lt: (col, val) => `"${col}" < ${addValues(val, 'numeric')}`,

  lte: (col, val) => `"${col}" <= ${addValues(val, 'numeric')}`,

  match: (col, val) => `"${col}"::text = ${addValues(val, 'string')}`,

  ni: (col, val) => `NOT "${col}" = ANY (${addValues([val], 'array')})`,

  null: (col, val) => `"${col}" IS ${!val ? 'NOT' : ''} NULL`,
};

let SQLparams;

/**
@function addValues
@description
The addValues method is used to add values to the SQLparams array.

@param {string} val 
@returns {number} SQLparams.length
*/
function addValues(val, type) {
  const err = isValidParam(val, type);

  if (err instanceof Error) {
    console.error(err);
    SQLparams.push(err);
    return;
  }

  SQLparams.push(val);
  return '$' + SQLparams.length;
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
export default sqlfilter;

function sqlfilter(filter, req) {
  SQLparams = req.params.SQL;
  //Check to see that params is an array and that the values of the params are of valid type.
  if (!Array.isArray(SQLparams)) {
    throw new TypeError(
      'Expected params to be an array of valid types (string, number, boolean, object, or bigint)',
    );
  }

  if (typeof filter === 'string') return filter;

  // Filter in an array will be conditional OR
  if (Array.isArray(filter)) {
    const filters = filter.map((filter) => mapFilterEntries(filter, req));

    return `(${filters.join(' OR ')})`;
  }

  // Filter in an object will be conditional AND
  return mapFilterEntries(filter, req);
}

/**
@function mapFilterEntries
@description 
The mapFilterEntries method is used to map the filter entries and convert them into a SQL query string.
The method also validates the filter entries against SQL parameter validation.
A string match filter for the user.email is added to the filter if the filter entry value has a user property.
@param {Object} filter
@returns {string} SQL query string
*/
function mapFilterEntries(filter, req) {
  const SQLvalidation = /^[a-zA-Z_]\w*$/;

  if (Object.keys(filter).some((key) => !SQLvalidation.test(key))) {
    const unvalidatedKey = Object.keys(filter).find(
      (key) => !SQLvalidation.test(key),
    );

    console.warn(
      `"${unvalidatedKey}" field didn't pass SQL parameter validation`,
    );
    return;
  }

  const filters = [];

  for (const [field, value] of Object.entries(filter)) {
    // Array entry values represent conditional OR
    if (Array.isArray(value)) {
      filters.push(sqlfilter(value));
      continue;
    }

    const filter = Object.keys(value)
      .filter((filterType) => Object.hasOwn(filterTypes, filterType))
      .map((filterType) => filterTypes[filterType](field, value[filterType]));

    // Add user.email filter
    if (Object.hasOwn(value, 'email')) {
      filter.push(
        `"${field}"::text = ${addValues(req.params.user?.email, 'string')}`,
      );
    }

    filters.push(filter.join(' AND '));
  }

  // Return joined filters string.
  return `(${filters.join(' AND ')})`;
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

/**
@typedef {Object} typeCheckers
Object containing type checking functions for each supported type
@property {function} array The value is an array.
@property {function} string The value is typeof string.
@property {function} numeric The value is a number.
*/
const typeCheckers = {
  // Uses native Array.isArray for array checking
  array: Array.isArray,
  // Checks if value is strictly a string using typeof
  numeric: (val) => !isNaN(val) && val !== null,
  // Checks if value is a valid number and not null
  // Note: isNaN('123') returns false, so this also accepts numeric strings
  string: (val) => typeof val === 'string',
};
