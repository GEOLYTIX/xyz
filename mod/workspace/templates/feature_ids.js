export default (_) => {
  return `select \${qID} as id from ${_.table} where true \${filter};`;
};
