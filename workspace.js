module.exports = async fastify => {

  global.workspace = {
    _defaults: {},
    public: {},
    private: {},
    admin: {}
  };

  fastify.register((fastify, opts, next) => {

    // Get the stored workspace config for the token access level.
    fastify.route({
      method: 'GET',
      url: '/workspace/get',
      beforeHandler: fastify.auth([fastify.authAPI]),
      handler: (req, res) => {

        // Decode token from query or use a public access if no token has been provided.
        const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

        // Send workspace
        res.send(global.workspace[token.access].config);
      }
    });

    // Open workspace admin interface (tree view).
    fastify.route({
      method: 'GET',
      url: '/admin/workspace',
      beforeHandler: fastify.auth([fastify.authAdmin]),
      handler: (req, res) => {

        // Render and send admin template with 'tree' as view mode.
        res.type('text/html').send(require('jsrender').templates('./views/workspace_admin.html').render({
          dir: global.dir,
          mode: 'tree'
        }));
      }
    });

    // Open workspace admin interface (json view).
    fastify.route({
      method: 'GET',
      url: '/admin/workspacejson',
      beforeHandler: fastify.auth([fastify.authAdmin]),
      handler: (req, res) => {

        // Render and send admin template with 'code' as view mode.
        res.type('text/html').send(require('jsrender').templates('./views/workspace_admin.html').render({
          dir: global.dir,
          mode: 'code'
        }));
      }
    });

    // Save workspace provided in post body to the Postgres table.
    fastify.route({
      method: 'POST',
      url: '/admin/workspace/save',
      beforeHandler: fastify.auth([fastify.authAdminAPI]),
      handler: async (req, res) => {

        let workspace = chkWorkspace(req.body.settings);

        if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'postgres') {

          // Connect to Postgres database.
          let
            db = await fastify.pg.workspace.connect(),
            q = `INSERT INTO ${process.env.WORKSPACE.split('|').pop()} (settings)
               SELECT $1 AS settings;`;

          // INSERT query to update the workspace in Postgres table.
          await db.query(q, [JSON.stringify(workspace)]);

          db.release();

        }

        await loadWorkspace(fastify, workspace);

        res.code(200).send(workspace);

      }
    });

    next();

  }, { prefix: global.dir });

  // Create workspace loader from Postgres database.
  if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'postgres') {

    global.workspace.name = process.env.WORKSPACE.split('|').pop();

    // Register Postgres connection string to fastify.
    await fastify.register(require('fastify-postgres'), {
      connectionString: process.env.WORKSPACE.split('|')[0],
      name: 'workspace'
    });

    // Assign load method to global workspace object.
    global.workspace.load = async fastify => {

      let
        workspace_db = await fastify.pg.workspace.connect(),
        workspace_table = process.env.WORKSPACE.split('|').pop(),
        config = await workspace_db.query(`SELECT * FROM ${workspace_table} ORDER BY _id DESC LIMIT 1`);

      workspace_db.release();

      // Return empty object as workspace if no rows are returned from Postgres query.
      if (config.rows.length === 0) return {};

      // Return settings from first row as workspace.
      return chkWorkspace(config.rows[0].settings);
    };
  }

  // Create file stream reader.
  const fs = require('fs');

  // Store workspace defaults.
  global.workspace._defaults = await JSON.parse(fs.readFileSync('./workspaces/_defaults.json'), 'utf8');

  // Create workspace loader for file in workspaces directory.
  if (process.env.WORKSPACE && process.env.WORKSPACE.split(':')[0] === 'file') {

    global.workspace.name = process.env.WORKSPACE;

    // Assign load method to global workspace object.
    global.workspace.load = () => {

      // Return empty object as workspace if file does not exist.
      if (!fs.existsSync('./workspaces/' + process.env.WORKSPACE.split(':').pop())) return chkWorkspace(global.workspace.admin.config || {});

      // Return workspace parsed as JSON from file stream.
      try {

        return chkWorkspace(JSON.parse(fs.readFileSync('./workspaces/' + process.env.WORKSPACE.split(':').pop()), 'utf8'));
      } catch (err) {
        console.error(err);
        return chkWorkspace(global.workspace.admin.config || {});
      }

    };
  }

  // Create zero config workspace if the WORKSPACE is not defined in environment.
  if (!process.env.WORKSPACE) {
    global.workspace.name = 'zero config';
    global.workspace.load = () => chkWorkspace(global.workspace.admin.config || {});
  }

  loadWorkspace(fastify);

};

async function loadWorkspace(fastify, workspace) {

  // Get admin workspace.
  global.workspace.admin.config = workspace || await global.workspace.load(fastify);

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

function chkWorkspace(workspace) {

  let _workspace = global.workspace._defaults.ws;

  chkOptionals(workspace, _workspace);

  // Check locales.
  Object.keys(workspace.locales).forEach(key => {

    let
      locale = workspace.locales[key],
      _locale = global.workspace._defaults.locale;

    if (typeof locale !== 'object') {
      workspace.locales['__' + key] = locale;
      delete workspace.locales[key];
      return;
    }

    chkOptionals(locale, _locale);

    // Check layers.
    Object.keys(locale.layers).forEach(key => {

      const layer = locale.layers[key];

      if (typeof layer !== 'object'
        || !layer.format
        || !global.workspace._defaults.layers[layer.format]) {
        locale.layers['__' + key] = layer;
        delete locale.layers[key];
        return;
      }

      const _layer = Object.assign({},
        global.workspace._defaults.layers.default,
        global.workspace._defaults.layers[layer.format]
      );

      layer.key = key;
      layer.name = layer.name || key;

      chkOptionals(layer, _layer);

      if (layer.style) chkOptionals(layer.style, _layer.style);
    });

  });

  return workspace;

}

function chkOptionals(chk, opt) {

  // Check whether optionals exist.
  Object.keys(chk).forEach(key => {

    if (chk[key] === 'optional') return delete chk[key];

    if (!(key in opt)) {

      // Prefix key with double underscore if opt key does not exist.
      chk['__' + key] = chk[key];
      delete chk[key];
    }
  });

  // Set default for non optional key values.
  Object.keys(opt).forEach(key => {
    if (!(key in chk) && opt[key] !== 'optional') chk[key] = opt[key];
  });
}