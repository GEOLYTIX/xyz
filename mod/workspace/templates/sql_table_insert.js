export default (_) => {
  let data = _.body.data;
  const columns = _.body.fields;

  if (!Array.isArray(data)) data = [data];

  const fields = Object.keys(columns);

  const data_map = {};
  for (const values of data) {
    Object.keys(values).forEach((key) => {
      data_map[key] ??= [];
      data_map[key].push(values[key] || null);
    });
  }

  const select_stmnt = [];
  Object.keys(data_map).forEach((field) => {
    _[field] = data_map[field];
    select_stmnt.push(`unnest(%{${field}}::${columns[field]}[]) as ${field}`);
  });

  const sql = `INSERT INTO ${_.table} 
    (${fields.join(',')})
    SELECT ${select_stmnt.join(',')}`;

  return sql;
};
