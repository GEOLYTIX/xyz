export default (_) => {
  console.log(_);
  if (!Array.isArray(_.body)) _.body = [_.body];

  const fields = Object.keys(_.body[0]);

  const data_map = {};
  for (const values of _.body) {
    Object.keys(values).forEach((key) => {
      data_map[key] ??= [];
      data_map[key].push(values[key] || 'null');
    });
  }

  const select_stmnt = [];
  Object.keys(data_map).forEach((field) => {
    _[field] = data_map[field].join();
    select_stmnt.push(`unnest(ARRAY[%{${field}}]) as ${field}`);
  });

  const sql = `INSERT INTO ${_.table} 
    (${fields.join(',')})
    SELECT ${select_stmnt.join(',')}`;

  console.log(sql);
  return sql;
};
