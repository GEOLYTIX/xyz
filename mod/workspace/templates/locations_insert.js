/**
### /workspace/templates/insert

The locations_insert layer query inserts a record in the layer table.

@module /workspace/templates/insert
*/
export default (_) => {
  // The location ID must not be inserted.
  const table = _.layer?.table || _.table;
  if (!table) throw new Error('insert template requires a table');

  if (
    _.layer &&
    Object.keys(_.body.columns).some(
      (key) => key === _.layer.qID || key === 'id',
    )
  ) {
    throw new Error(
      `Layer ${_.layer}: You cannot insert the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  let data = _.body.data || _.body.values;
  const columns = _.body.fields;

  if (!Array.isArray(data)) data = [data];

  for (const indx in data) {
    if (typeof data[indx] === 'string') continue;

    data[indx] = Object.keys(data[indx]).map((key) => {
      if (data[indx][key] === null) return 'null';
      return data[indx][key];
    });

    data[indx] = `(${data[indx].join()})`;
  }

  return `INSERT INTO ${table} (${columns.join(',')}) VALUES ${data.join()};`;
};
