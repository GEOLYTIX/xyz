module.exports = {route};

function route(fastify) {

  const jsr = require('jsrender');

  fastify.route({
    method: 'GET',
    url: '/stream',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: (req, res)=>{

      const buffer = require('stream').Readable();

      buffer._read = () => {};

      setTimeout(()=>{

        console.log('uno');
        buffer.push('uno');

      }, 1000);

      setTimeout(()=>{

        console.log('due');
        buffer.push('due');

      }, 2000);

      setTimeout(()=>{

        console.log('tre');
        buffer.push('tre');

      }, 3000);

      setTimeout(()=>{

        console.log('fin');
        buffer.push(null);

      }, 4000);

      res.send(buffer);

    }
  });

  fastify.route({
    method: 'GET',
    url: '/stream_template',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: (req, res)=>{
 
      res.type('text/html').send(jsr.templates('./public/views/stream.html').render());

    }
  });

};