module.exports = async params => {
    
  let mode = params.mode || 'car',
    coordinates = params.coordinates, // required
    rangetype = params.rangetype || layer.edit.isolines.rangetype,
    range = params.range ? matchUnit(params.rangetype)*params.range : 10*matchUnit(params.rangetype), // 10 mins by default
    type = param.type || 'fastest',
    traffic = param.traffic ? 'traffic:default' : 'traffic:disabled';

  let _mode = [type, mode, traffic];


  const q = `https://route.api.here.com/routing/7.2/calculateroute.json?${global.KEYS.HERE}&mode=${_mode.join(';')}&start=geo!${coordinates.join(',')}&range=${range}&rangetype=${rangetype}`;

  // Fetch results from Google maps places API.
  const fetched = await require(global.appRoot + '/mod/fetch')(q);

  if (fetched._err) return fetched;

  // Return results to route. Zero results will return an empty array.
  return await fetched;
         
};

function matchUnit(rangeType){
  let scale;
  switch(rangeType){
  case 'time': scale = 60; break;
  case 'distance': scale = 1000; break;
  case 'consumption': scale = 0; break;
  }
  return scale;
}