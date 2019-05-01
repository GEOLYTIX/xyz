module.exports = fastify => {

  // gazetteer

  require('./gazetteer/autocomplete')(fastify);

  require('./gazetteer/googleplaces')(fastify);

  // layer

  require('./layer/cluster')(fastify);

  require('./layer/extent')(fastify);

  require('./layer/count')(fastify);  

  require('./layer/geojson')(fastify);

  require('./layer/grid')(fastify);  

  require('./layer/mvt')(fastify);

  require('./layer/table')(fastify);

  // location

  require('./location/field_range')(fastify);

  require('./location/field')(fastify);

  require('./location/table')(fastify);

  require('./location/list')(fastify);

  // location/edit

  require('./location/edit/delete')(fastify);

  require('./location/edit/image_delete')(fastify);

  require('./location/edit/image_upload')(fastify);

  require('./location/edit/isoline_mapbox')(fastify);

  require('./location/edit/isoline_here')(fastify);

  require('./location/edit/draw')(fastify);

  require('./location/edit/update')(fastify);

  require('./location/edit/setnull')(fastify);

  // location/select

  require('./location/select/cluster')(fastify);

  require('./location/select/id')(fastify);

  require('./location/select/latlng_intersect')(fastify);

  require('./location/select/latlng_nnearest')(fastify);

  require('./location/select/latlng_contains')(fastify);

  require('./location/select/aggregate')(fastify);

};