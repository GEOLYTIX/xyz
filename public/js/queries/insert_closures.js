module.exports = {
  dbs: 'PONZA',
  module: true,
  render: _ => {

    return `INSERT into model.pol_scenario_closure (scenario_id, fad) VALUES ${_.body.join(',')}`

  }

}