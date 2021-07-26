const filterTypes = {
  eq: (col, val) => `"${col}" = \$${addValues(val)}`,

  gt: (col, val) => `"${col}" > \$${addValues(val)}`,

  gte: (col, val) => `"${col}" >= \$${addValues(val)}`,

  lt: (col, val) => `"${col}" < \$${addValues(val)}`,

  lte: (col, val) => `"${col}" <= \$${addValues(val)}`,

  boolean: (col, val) => `"${col}" IS ${!!val}`,

  ni: (col, val) => `NOT "${col}" = ANY (\$${addValues([val])})`,

  in: (col, val) => `"${col}" = ANY (\$${addValues([val])})`,

  like: (col, val) =>
    `(${val
      .split(",")
      .filter((val) => val.length > 0)
      .map((val) => `"${col}" ILIKE \$${addValues(`${val}%`)}`)
      .join(" OR ")})`,

  match: (col, val) => `"${col}"::text ILIKE \$${addValues(val)}`
}

let SQLparams

function addValues(val) {
  SQLparams.push(val)
  return SQLparams.length
}

module.exports = function sqlfilter(filter, params) {

  SQLparams = params

  // Filter in an array will be conditional OR
  if (filter.length)
    return `(${filter
  
        // Map filter in array with OR conjuction
        .map((filter) => mapFilterEntries(filter))
        .join(' OR ')})`

  // Filter in an object will be conditional AND
  return mapFilterEntries(filter)
}

function mapFilterEntries(filter) {
  return `(${Object.entries(filter)
  
      // Map filter entries
      .map((entry) => {

        const field = entry[0]
        const value = entry[1]

        // Array entry values represent conditional OR
        if (value.length) return sqlfilter(value);
  

        // Identifiers must be validated to prevent SQL injection
        if (!/^[A-Za-z0-9._-]*$/.test(field)) {
          console.log(`${field} - ¡no bueno!`)
          return
        }
  
        // Call filter type method for matching filter entry value
        // Multiple filterTypes for the same field will be joined with AND
        return Object.keys(value)
            .filter(filterType => !!filterTypes[filterType])
            .map((filterType) => filterTypes[filterType](field, value[filterType]))
            .join(" AND ")
            
      })

      // Filter out undefined / escaped filter
      .filter(f=>typeof f !== 'undefined')

      .filter((f) => f!=="")
  
      // Join filter with conjunction
      .join(' AND ')})`;
}