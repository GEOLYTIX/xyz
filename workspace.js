module.exports = async fastify => {

  global.workspace = {
    public: {},
    private: {},
    admin: {}
  };

  fastify.register((fastify, opts, next) => {

    fastify.route({
      method: 'GET',
      url: '/workspace/get',
      beforeHandler: fastify.auth([fastify.authAPI]),
      handler: (req, res) => {
        const token = req.query.token ?
          fastify.jwt.decode(req.query.token) : { access: 'public' };

        res.send(global.workspace[token.access].config);
      }
    });

    fastify.route({
      method: 'GET',
      url: '/admin/workspace',
      beforeHandler: fastify.auth([fastify.authAdmin]),
      handler: (req, res) => {
        res.type('text/html').send(require('jsrender').templates('./views/workspace_admin.html').render({
          dir: global.dir,
          mode: 'tree'
        }));
      }
    });

    fastify.route({
      method: 'GET',
      url: '/admin/workspacejson',
      beforeHandler: fastify.auth([fastify.authAdmin]),
      handler: (req, res) => {
        res.type('text/html').send(require('jsrender').templates('./views/workspace_admin.html').render({
          dir: global.dir,
          mode: 'code'
        }));
      }
    });

    fastify.route({
      method: 'POST',
      url: '/admin/workspace/save',
      beforeHandler: fastify.auth([fastify.authAdminAPI]),
      handler: async (req, res) => {

        if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'file')
          return res.code(406).send('Cannot save file based settings.');

        let db = await fastify.pg.workspace.connect(),
          q = `
                    INSERT INTO ${process.env.WORKSPACE.split('|').pop()} (settings)
                    SELECT $1 AS settings;`;

        await db.query(q, [JSON.stringify(req.body.settings)]);

        db.release();

        await loadWorkspace(fastify);

        res.code(200).send('Settings saved.');

      }
    });

    next();

  }, { prefix: global.dir });

  if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'postgres') {
    global.workspace.name = process.env.WORKSPACE.split('|').pop();
    await fastify.register(require('fastify-postgres'), {
      connectionString: process.env.WORKSPACE.split('|')[0],
      name: 'workspace'
    });

    workspace.load = async fastify => {
      let workspace_db = await fastify.pg.workspace.connect(),
        workspace_table = process.env.WORKSPACE.split('|').pop(),
        config = await workspace_db.query(`SELECT * FROM ${workspace_table} ORDER BY _id DESC LIMIT 1`);

      workspace_db.release();

      if (config.rows.length === 0) return {};

      return config.rows[0].settings;
    };
  }

  if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'file') {
    global.workspace.name = process.env.WORKSPACE;
    workspace.load = () => {
      let fs = require('fs');
      return fs.existsSync('./workspaces/' + process.env.WORKSPACE.split(':').pop()) ?
        JSON.parse(fs.readFileSync('./workspaces/' + process.env.WORKSPACE.split(':').pop()), 'utf8') : {};
    };
  }

  if (!process.env.WORKSPACE) {
    global.workspace.name = 'zero config';
    workspace.load = () => defaultWorkspace;
  }

  loadWorkspace(fastify);
};

const defaultWorkspace = {
  'locales': {
    'Global': {
      'layers': {
        'base': {
          'display': true,
          'format': 'tiles',
          'URI': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      }
    }
  }
};

async function loadWorkspace(fastify) {
  global.workspace.admin.config = await global.workspace.load(fastify);
  if(!global.workspace.admin.config.locales) global.workspace.admin.config = defaultWorkspace;
  await createLookup(global.workspace.admin);

  global.workspace.private.config = await removeAccess('admin');
  await createLookup(global.workspace.private);

  global.workspace.public.config = await removeAccess('private');
  await createLookup(global.workspace.public);
}

function removeAccess(access) {

  // deep clone the access level workspace.
  let config = JSON.parse(JSON.stringify(global.workspace[access].config));

  (function objectEval(o, parent, key) {

    // check whether the object has an access key matching the current level.
    if (Object.entries(o).some(e => e[0] === 'access' && e[1] === access)) {

      // if the parent is an array splice the key index.
      if (parent.length > 0) return parent.splice(parseInt(key), 1);

      // if the parent is an object delete the key from the parent.
      return delete parent[key];
    }

    // iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key);
    });

  })(config);

  return config;
}

function createLookup(workspace) {

  // store all workspace string values in lookup arrays.
  workspace.values = ['', 'geom', 'geom_3857', 'id', 'ST_asGeoJson(geom)', 'ST_asGeoJson(geom_4326)'];
  (function objectEval(o) {
    Object.keys(o).forEach((key) => {
      if (typeof key === 'string') workspace.values.push(key);
      if (typeof o[key] === 'string') workspace.values.push(o[key]);
      if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
    });
  })(workspace.config);
}