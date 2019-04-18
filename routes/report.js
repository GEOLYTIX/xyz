const env = require('../mod/env');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Nanoid is used to pass a unique id on the client view.
const nanoid = require('nanoid');

const fetch = require('../mod/fetch');

const fs = require('fs');

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

  let
    github,
    github_env = process.env.RESOURCES_GITHUB ? process.env.RESOURCES_GITHUB.split(' ') : null;

  let local_html;

  try {
    // try if template exists in repository
    local_html = await fs.readFileSync(`/public/views/report/${req.query.template}.html`, 'utf8');
  } catch (err) {
    // apply fallback default template
    local_html = await fs.readFileSync(`/public/views/report/map_location.html`, 'utf8');
  }

  // send back local if no github resources
  if (!github_env) sendBack(local_html);

  // Github settings
  github = {
    access_token: github_env[0],
    owner: github_env[1],
    repo: github_env[2],
    folder: github_env[3] || null
  };

  const url = `https://api.github.com/repos/${github.owner}/${github.repo}/contents/${github.folder ? `${github.folder}/` : ''}${req.query.template}.html?access_token=${github.access_token}`;

  try {
    // Get file meta from Github
    const fetched = await fetch(url);
    // Process file content
    let base64 = fetched.content,
      buff = Buffer.from(base64, 'base64'),
      html = buff.toString('utf8');
    sendBack(html);
  } catch (err) {
    sendBack(local_html);
  }

  // Check whether request comes from a mobile platform and set template.
  // const md = new Md(req.headers['user-agent']);

  function sendBack(html) {
    const tmpl = jsr.templates('./public/views/report.html');

    // Build the template with jsrender and send to client.
    res.type('text/html').send(tmpl.render({
      dir: env.path,
      title: env.workspace.title || 'GEOLYTIX | XYZ',
      nanoid: nanoid(6),
      token: req.query.token || token.signed || '""',
      template: html || null,
      script_js: 'views/report.js'
    }));
  }

};