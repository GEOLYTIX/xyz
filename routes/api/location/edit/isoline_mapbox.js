const env = require('../../../../mod/env');

const fetch = require('../../../../mod/fetch');

module.exports = fastify => {

  fastify.route({
    method: 'GET',
    url: '/api/location/edit/isoline/mapbox',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          coordinates: { type: 'string' },
        },
        required: ['coordinates']
      }
    },
    preHandler: [
      fastify.evalParam.token,
    ],
    handler: async(req, res) => {
      
      const params = {
        coordinates: req.query.coordinates,
        minutes: req.query.minutes || 10,
        profile: req.query.profile || 'driving'
      };
         
      var q = `https://api.mapbox.com/isochrone/v1/mapbox/${params.profile}/${params.coordinates}?contours_minutes=${params.minutes}&generalize=${params.minutes}&polygons=true&${env.keys.MAPBOX}`;
      
      // Fetch results from Google maps places API.
      const mapbox_isolines = await fetch(q);
  
      if(!mapbox_isolines.features) return res.code(202).send({
        msg: 'No catchment found within this time frame.',
        res: mapbox_isolines
      });

      return res.code(200).send(mapbox_isolines.features[0].geometry);

    }
    
  });
};