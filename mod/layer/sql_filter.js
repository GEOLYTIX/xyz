module.exports = async (filter, conjunction = 'AND') => {

  if (!filter.length) return '';

  const sql_filter = []
  
  for (const f of filter) {

    const field = Object.keys(f)[0]

    if(!field) continue;

    if (Array.isArray(f[field])) {

      if (sql_filter[sql_filter.length - 1] !== 'AND') sql_filter.push('AND')

      sql_filter.push('(')

      f[field].forEach(f => addField(f, field, 'OR'))

      sql_filter.pop()

      sql_filter.push(')')

      continue
    }

    addField(f[field], field, conjunction)

  }

  if (sql_filter[sql_filter.length - 1] !== ')') sql_filter.pop()
      
  if (sql_filter.length) return `AND (${sql_filter.join(' ')})`

  return ' '

  function addField(filter, field, conjunction) {

    if (filter.ni && filter.ni.length > 0) {
      sql_filter.push(`${field} NOT IN ('${filter.ni.join('\',\'')}')`)
      sql_filter.push(conjunction)
    }

    if (filter.in && filter.in.length > 0) {
      sql_filter.push(`${field} IN ('${filter.in.map(f=>decodeURIComponent(f)).join('\',\'')}')`)
      sql_filter.push(conjunction)
    }

    if(typeof(filter.gt) == 'number') {
      sql_filter.push(`${field} > ${filter.gt}`)
      sql_filter.push(conjunction)
    }

    if(typeof(filter.lt) == 'number') {
      sql_filter.push(`${field} < ${filter.lt}`)
      sql_filter.push(conjunction)
    }
          
    if(filter.gte) {
      sql_filter.push(`${field} >= ${filter.gte}`)
      sql_filter.push(conjunction)
    }

    if(filter.lte) {
      sql_filter.push(`${field} <= ${filter.lte}`)
      sql_filter.push(conjunction)
    }
          
    if((filter.like)) {
      const likes = decodeURIComponent(filter.like).split(',')
        .filter(like => like.length > 0)
        .map(like => `${field}::text ILIKE '${like.trim().replace(/'/g, "''")}%'`)
        sql_filter.push(`(${likes.join(' OR ')})`)
        sql_filter.push(conjunction)
    }

    if(filter.eq) {
      sql_filter.push(`${field} = ${filter.eq}`)
      sql_filter.push(conjunction)
    }

    if((filter.match)) {
      sql_filter.push(`${field}::text ILIKE '${decodeURIComponent(filter.match.toString().replace(/'/g, "''"))}'`)
      sql_filter.push(conjunction)
    }

    if((filter.boolean)){
      sql_filter.push(`${field} IS ${filter.boolean}`)
      sql_filter.push(conjunction)
    }

  }
}