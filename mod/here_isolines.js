module.exports = async params => {
    
  let mode = params.mode || 'car',
    coordinates = params.coordinates, // required
    rangetype = params.rangetype || 'time',
    range = params.range ? matchUnit(rangetype)*parseInt(params.range) : 10*matchUnit(rangetype), // 10 mins by default
    type = params.type || 'fastest',
    traffic = 'traffic:disabled';//params.traffic ? 'traffic:default' : 'traffic:disabled';

  let _mode = [type, mode, traffic];

  const q = `https://isoline.route.api.here.com/routing/7.2/calculateisoline.json?${global.KEYS.HERE}&mode=${_mode.join(';')}&start=geo!${coordinates}&range=${range}&rangetype=${rangetype}`;

  console.log(q);

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