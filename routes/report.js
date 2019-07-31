const env = require('../mod/env');

const jsr = require('jsrender');

const nodefetch = require('node-fetch');

module.exports = {route, view};

function route(fastify) {

  fastify.route({
    method: 'GET',
    url: '/report',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true,
        login: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: '/report',
    handler: (req, res) => fastify.login.post(req, res, {
      view: view
    })
  });

};

async function view(req, res, token = { access: 'public' }) {

  let _tmpl;

  if (req.query.source === 'GITHUB') {

    const response = await nodefetch(`${req.query.template}?access_token=${env.keys.GITHUB}`);
    const b64 = await response.json();
    const buff = await Buffer.from(b64.content, 'base64');
    _tmpl = await buff.toString('utf8');
    

  } else {

    const response = await nodefetch(`${env.http || 'https'}://${req.headers.host}${env.path}${req.query.template}`);
    if (response.status !== 200) return res.type('text/plain').send('Failed to retrieve report template');
    _tmpl = await response.text();

  }

  const tmpl = jsr.templates('tmpl', _tmpl);

  //Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: env.path,
    host: `${env.http || 'https'}://${req.req.hostname}${env.path || ''}`,
    token: req.query.token || token.signed || '""'
  }));

};