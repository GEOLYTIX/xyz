module.exports = filter => {

  let sql_filter = '';
    
  Object.keys(filter).forEach(field => {
    if (filter[field].ni && filter[field].ni.length > 0) sql_filter += ` AND ${field} NOT IN ('${filter[field].ni.join('\',\'')}')`;
    if (filter[field].in && filter[field].in.length > 0) sql_filter += ` AND ${field} IN ('${filter[field].in.join('\',\'')}')`;
          
    if(typeof(filter[field].gt) == 'number') sql_filter += ` AND ${field} > ${filter[field].gt}`;
    if(typeof(filter[field].lt) == 'number') sql_filter += ` AND ${field} < ${filter[field].lt}`;
          
    // must work for date string
    if(filter[field].gte) sql_filter += ` AND ${field} >= ${filter[field].gte}`;
    if(filter[field].lte) sql_filter += ` AND ${field} <= ${filter[field].lte}`;
          
    if((filter[field].like)) sql_filter += ` AND ${field} ILIKE '${filter[field].like}%'`;
    if((filter[field].match)) sql_filter += ` AND ${field} ILIKE '${filter[field].match}'`;
  });
      
  return sql_filter;
};