const filterTypes = {
  eq: (col, val) => `"${col}" = \$${addValues(val)}`,

  gt: (col, val) => `"${col}" > \$${addValues(val)}`,

  gte: (col, val) => `"${col}" >= \$${addValues(val)}`,

  lt: (col, val) => `"${col}" < \$${addValues(val)}`,

  lte: (col, val) => `"${col}" <= \$${addValues(val)}`,

  boolean: (col, val) => `"${col}" IS \$${addValues(val)}`,

  ni: (col, val) => `NOT "${col}" = ANY (\$${addValues([val])})`,

  in: (col, val) => `"${col}" = ANY (\$${addValues([val])})`,

  like: (col, val) =>
    `(${val
      .split(",")
      .filter((val) => val.length > 0)
      .map((val) => `"${col}" ILIKE \$${addValues(`${val}%`)}`)
      .join(" OR ")})`,

  match: (col, val) => `"${col}"::text ILIKE \$${addValues(val)}`
};

let SQLparams

function addValues(val) {
  SQLparams.push(val);
  return SQLparams.length;
}

module.exports = function sqlfilter(filter, params) {

  SQLparams = params

  // Filter in an array will be conditional OR
  if (filter.length)
    return `(${filter
  
        // Map filter in array with OR conjuction
        .map((filter) => mapFilterEntries(filter, " OR "))
        .join(" OR ")})`;

  // Filter in an object will be conditional AND
  return mapFilterEntries(filter, " AND ");
}

function mapFilterEntries(filter, conjunction) {
  return `(${Object.entries(filter)
  
      // Map filter entries
      .map((entry) => {
        // Array entry values represent conditional OR
        if (entry[1].length) return sqlfilter(entry[1], " OR ");
  
        // Get filter type from first key of the entry value
        const filterType = Object.keys(entry[1])[0];

        // Identifiers must be validated to prevent SQL injection
        if (!/^[A-Za-z0-9._-]*$/.test(entry[0])) {
          console.log(`${entry[0]} - ¡no bueno!`);
          return;
        }
  
        // Call filter type method for matching filter entry value
        if (filterTypes[filterType])
          return filterTypes[filterType](
            // The entry key is col
            entry[0],
  
            // The first entry value will be the filter val
            Object.values(entry[1])[0]
          );
      })

      // Filter out undefined / escaped filter
      .filter(f=>typeof f !== 'undefined')
  
      // Join filter with conjunction
      .join(conjunction)})`;
}