const env = require('../mod/env');

const template = require('backtick-template');

const fetch = require('node-fetch');

module.exports = { route, view };

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

  let tmpl;

  if (req.query.template.toLowerCase().includes('api.github')) {

    const response = await fetch(
      req.query.template,
      { headers: new fetch.Headers({ Authorization: `Basic ${Buffer.from(env.keys.GITHUB).toString('base64')}` }) });

    const b64 = await response.json();
    const buff = await Buffer.from(b64.content, 'base64');
    tmpl = await buff.toString('utf8');

  } else {

    const response = await fetch(`${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${env.path}${req.query.template}`);
    if (response.status !== 200) return res.type('text/plain').send('Failed to retrieve report template');
    tmpl = await response.text();

  }

  const html = template(tmpl, {
    dir: env.path,
    host: `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.req.hostname}${env.path || ''}`,
    token: req.query.token || token.signed || '""'
  });

  //Build the template with jsrender and send to client.
  res.type('text/html').send(html);

};