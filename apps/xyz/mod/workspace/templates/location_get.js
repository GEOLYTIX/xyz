/**
### /workspace/templates/location_get

The location_get layer query returns the field values from a location record in the layer table where the location qID matches the provided id param.

The layer filter is applied to the query. The qID identifies the record, but the layer.filter.default decides whether the layer may access the record. A layer with a default filter only shows some records of its table, eg. `"category": { "match": "public" }`. The layer list and tile queries apply the default filter, and the request can not alter it. Workspaces use the default filter to restrict the records of a table which is shared by several layers, eg. for different roles. Location ids are serial and can be enumerated. Without the filter a request with an id could return a record which the layer does not show.

A location which does not pass the layer.filter.default is not returned. The query responds without rows, as for an id which does not exist. A new location whose values do not pass the default filter is inserted by location_new but can not be returned by location_get.

@module /workspace/templates/location_get
*/
export default (_) => {
  // The layer.qID will be returned from the select statement.
  const fields = [_.layer.qID];

  if (_.infojMap) {
    for (const [key, value] of _.infojMap.entries()) {
      fields.push(`(${value}) as ${key}`);
    }
  }

  return `
    SELECT ${fields.join()}
    FROM ${_.table}
    WHERE ${_.layer.qID} = %{id} \${filter}`;
};
