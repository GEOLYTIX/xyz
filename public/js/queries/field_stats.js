module.exports = {
  render: _ => `

  SELECT
    min(${_.field}),
    max(${_.field}),
    avg(${_.field})
    FROM ${_.table}
    WHERE true ${_.filter};`
}