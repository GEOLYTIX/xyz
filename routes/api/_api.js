module.exports = (fastify, authToken) => {

  // gazetteer

  require('./gazetteer/autocomplete')(fastify, authToken);

  require('./gazetteer/googleplaces')(fastify, authToken);

  // layer

  require('./layer/cluster')(fastify, authToken);

  require('./layer/extent')(fastify, authToken);

  require('./layer/geojson')(fastify, authToken);

  require('./layer/grid')(fastify, authToken);  

  require('./layer/mvt')(fastify, authToken);

  require('./layer/table')(fastify, authToken);

  // location

  require('./location/field_range')(fastify, authToken);

  require('./location/table')(fastify, authToken);

  // location/edit

  require('./location/edit/delete')(fastify, authToken);

  require('./location/edit/image_delete')(fastify, authToken);

  require('./location/edit/image_upload')(fastify, authToken);

  require('./location/edit/isoline_mapbox')(fastify, authToken);

  require('./location/edit/isoline_here')(fastify, authToken);

  require('./location/edit/draw')(fastify, authToken);

  require('./location/edit/update')(fastify, authToken);

  require('./location/edit/setnull')(fastify, authToken);

  // location/select

  require('./location/select/cluster')(fastify, authToken);

  require('./location/select/id')(fastify, authToken);

  require('./location/select/latlng_intersect')(fastify, authToken);

  require('./location/select/latlng_nnearest')(fastify, authToken);

  require('./location/select/latlng_contains')(fastify, authToken);

  require('./location/select/aggregate')(fastify, authToken);

};