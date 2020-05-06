module.exports = {
  render: _ => `
  
  UPDATE ${_.table}
  SET ${_.field} = array_${_.action}(${_.field}, '${_.secure_url}')
  WHERE ${_.layer.qID} = ${_.id};`
}