module.exports = fastify => {

  // gazetteer

  require('./gazetteer/autocomplete')(fastify);

  require('./gazetteer/googleplaces')(fastify);

  // layer

  require('./layer/cluster')(fastify);

  require('./layer/extent')(fastify);

  require('./layer/geojson')(fastify);

  require('./layer/grid')(fastify);  

  require('./layer/mvt')(fastify);

  require('./layer/table')(fastify);

  // location/edit

  require('./location/edit/delete')(fastify);

  require('./location/edit/image_delete')(fastify);

  require('./location/edit/image_upload')(fastify);

  // Mapbox Isochrones

  require('./location/edit/catchment_create')(fastify);

  require('./location/edit/catchment_delete')(fastify);

  // HERE Isolines

  require('./location/edit/isoline_create')(fastify);

  require('./location/edit/isoline_delete')(fastify);
  

  require('./location/edit/draw')(fastify);

  require('./location/edit/draw_catchment')(fastify);

  require('./location/edit/draw_isoline')(fastify);

  require('./location/edit/update')(fastify);

  // location/select

  require('./location/select/cluster')(fastify);

  require('./location/select/id')(fastify);

  require('./location/select/latlng_intersect')(fastify);

  require('./location/select/latlng_nnearest')(fastify);

  require('./location/select/latlng_contains')(fastify);

  require('./location/select/aggregate')(fastify);

  require('./location/field_range')(fastify);

};