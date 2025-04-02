export default (_) => {

  const fields = Object.keys(_.body)

  fields.forEach(field => {
    _[field] = _.body[field];
  })

  const sql = `INSERT INTO ${_.table} 
    (${fields.join(',')}) 
    VALUES (%{${fields.join('},%{')}});`;

  return sql
};
