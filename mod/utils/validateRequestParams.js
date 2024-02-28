/**
@module /utils/validateRequestParams
*/

module.exports = (params) => !Object.keys(params)
  .filter(key => key !== 'filter')
  .filter(key => !!params[key])
  .filter(key => typeof params[key] !== 'object')
  .some(key => !/^[A-Za-z0-9.,_-\s]*$/.test(params[key]))