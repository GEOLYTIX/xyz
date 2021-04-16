const filterTypes = {
  eq: (col, val) => `"${col}" = '${val}'`,

  gt: (col, val) => `"${col}" > ${val}`,

  gte: (col, val) => `"${col}" >= ${val}`,

  lt: (col, val) => `"${col}" < ${val}`,

  lte: (col, val) => `"${col}" <= ${val}`,

  boolean: (col, val) => `"${col}" IS ${val}`,

  ni: (col, val) =>
    `"${col}" NOT IN ('${val.map((f) => decodeURIComponent(f)).join("','")}')`,

  in: (col, val) =>
    `"${col}" IN ('${val.map((f) => decodeURIComponent(f)).join("','")}')`,

  like: (col, val) =>
    `(${decodeURIComponent(val)
      .split(",")
      .filter((like) => like.length > 0)
      .map((like) => `"${col}" ILIKE '${like.trim().replace(/'/g, "''")}%'`)
      .join(" OR ")})`,

  match: (col, val) =>
    `"${col}"::text ILIKE '${decodeURIComponent(
      val.toString().replace(/'/g, "''")
    )}'`
};

module.exports = sqlfilter

function sqlfilter(filter) {
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
  
        // Call filter type method for matching filter entry value
        if (filterTypes[filterType])
          return filterTypes[filterType](
            // The entry key is col
            entry[0],
  
            // The first entry value will be the filter val
            Object.values(entry[1])[0]
          );
      })
  
      // Join filter with conjunction
      .join(conjunction)})`;
}