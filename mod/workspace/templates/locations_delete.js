module.exports = _ => {

  // If no layer parameter, return 
  if (!_.layer) {
    throw new Error(`You cannot delete locations data without providing the layer parameter.`)
  }

  let where;
  
  // If filter is not empty, set the where clause
  if (_.filter.length > 1) {
    // If the filter begins ' AND ' remove it
    if (_.filter.startsWith(' AND ')) {
      _.filter = _.filter.slice(5)
    }
    // Set the where clause
    where = `WHERE ${_.filter}`
  } 

  // Delete from the table where data matches the filter
  return `DELETE FROM ${_.table} ${where};`
}