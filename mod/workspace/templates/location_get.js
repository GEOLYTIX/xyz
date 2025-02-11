module.exports = (_) => {
  // The SQL array may be populated by a default filter which is not required for this query template.
  _.SQL = [];

  const fields = [_.layer.qID].concat(
    _.layer.infoj
      ?.filter((entry) => !entry.query)

      // Entry must have a field defined.
      .filter((entry) => entry.field)

      // Only include fields from the fields[] array param.
      .filter(
        (entry) => !_.fields || _.fields?.split(',').includes(entry.field),
      )

      // Map either fieldfx or template SQL if available.
      .map(
        (entry) =>
          `(${entry.fieldfx || _.workspace.templates[entry.field]?.template || entry.field}) AS ${entry.field}`,
      ),
  );

  return `
    SELECT ${fields.join()}
    FROM ${_.table}
    WHERE ${_.layer.qID} = %{id}`;
};
