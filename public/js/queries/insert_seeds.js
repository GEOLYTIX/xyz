module.exports = {
  dbs: 'PONZA',
  module: true,
  render: _ => {

    return `INSERT into model.pol_pre_seed (scenario_id, fad) VALUES ${_.body.join(',')}`

  }

}