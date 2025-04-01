/**
### /workspace/templates/insert

The locations_insert layer query inserts a record in the layer table.

@module /workspace/templates/insert
*/
export default (_) => {
  // The location ID must not be inserted.
  if (
    Object.keys(_.body.columns).some(
      (key) => key === _.layer.qID || key === 'id',
    )
  ) {
    throw new Error(
      `Layer ${_.layer}: You cannot insert the ${_.layer.qID} or ID field as it is a reserved parameter.`,
    );
  }

  if (!Array.isArray(_.body.data)) _.body.data = [_.body.data];

  const data = _.body.data;
  const columns = _.body.columns;

  return `INSERT INTO ${_.layer.table} (${columns.join(',')}) VALUES ${data.join()};`;
};
