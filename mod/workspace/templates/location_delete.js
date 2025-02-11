module.exports = (_) => {
  return `DELETE FROM ${_.table} WHERE ${_.layer.qID} = %{id};`;
};
