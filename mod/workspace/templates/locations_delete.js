module.exports = (_) => {
  // If no layer parameter, return
  if (!_.layer) {
    throw new Error(
      `You cannot delete locations data without providing the layer parameter.`,
    );
  }

  return `
    DELETE FROM ${_.table || _.layer.table}
    WHERE TRUE ${_.viewport || ''} \${filter};`;
};
