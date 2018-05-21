function sql_filter(filter, _sql_filter){
    
    Object.keys(filter).map(field => {
        
        if (filter[field].ni && filter[field].ni.length > 0) _sql_filter += ` AND ${field} NOT IN ('${filter[field].ni.join("','")}')`;
        
        if (filter[field].in && filter[field].in.length > 0) _sql_filter += ` AND ${field} IN ('${filter[field].in.join("','")}')`;
        
        if(typeof(filter[field].gt) == "number") _sql_filter += ` AND ${field} > ${filter[field].gt}`;
        if(typeof(filter[field].lt) == "number") _sql_filter += ` AND ${field} < ${filter[field].lt}`;
        if(typeof(filter[field].gte) == "number") _sql_filter += ` AND ${field} >= ${filter[field].gte}`;
        if(typeof(filter[field].lte) == "number") _sql_filter += ` AND ${field} <= ${filter[field].lte}`;
        
        if((filter[field].like)) _sql_filter += ` AND ${field} ILIKE '${filter[field].like}%'`;
        if((filter[field].match)) _sql_filter += ` AND ${field} ILIKE '${filter[field].match}'`;
    });
    
    return _sql_filter;
}

function legend_filter(filter, _legend_filter){
    
    Object.keys(filter).map(field => {

    if (filter[field].ni && filter[field].ni.length > 0) _legend_filter += ` AND ${field} NOT IN ('${filter[field].ni.join("','")}')`;
    if (filter[field].in && filter[field].in.length > 0) _legend_filter += ` AND ${field} IN ('${filter[field].in.join("','")}')`;

  });
    return _legend_filter;
}

module.exports = {
    sql_filter: sql_filter,
    legend_filter: legend_filter
}