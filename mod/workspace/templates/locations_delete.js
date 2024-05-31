module.exports = _ => {

  // If no layer parameter, return 
  if (!_.layer) {
    throw new Error(`You cannot delete locations data without providing the layer parameter.`)
  }

  // Delete from the table where data matches the filter
  return `DELETE FROM ${_.table} WHERE ${filter};`
}