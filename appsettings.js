module.exports = { routes, getAppSettings, saveAppSettings }

function routes(fastify, auth) {

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'postgres') {
        fastify.register(require('fastify-postgres'), {
            connectionString: process.env.APPSETTINGS.split('|')[0],
            name: 'settings'
        });
    }

    fastify
        .decorate('authSettings', (req, res, done) => auth.chkLogin(req, res, 'admin', done))
        .after(() => {

            fastify.route({
                method: 'GET',
                url: global.dir + '/settings',
                beforeHandler: fastify.auth([fastify.authSettings]),
                handler: async (req, res) => {

                    await getAppSettings(req, fastify);

                    res.type('text/html').send(require('jsrender').templates('./views/settings.html').render({
                        settings: `
                        <script>
                            const _xyz = ${JSON.stringify(global.appSettings)};
                        </script>`
                    }));
                }
            })

            fastify.route({
                method: 'POST',
                url: global.dir + '/settings/save',
                beforeHandler: fastify.auth([fastify.authSettings]),
                handler: (req, res) => {
                    saveAppSettings(req, res);
                }
            })

            fastify.route({
                method: 'GET',
                url: global.dir + '/settings/get',
                beforeHandler: fastify.auth([fastify.authSettings]),
                handler: async (req, res) => {
                    await getAppSettings(req, fastify);
                    res.send(global.appSettings);
                }
            })

        });
}

async function getAppSettings(req, fastify) {

    let settings = {};

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'postgres') settings = await getSettingsFromDB(fastify);

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'file') settings = await getSettingsFromFile();

    if (Object.keys(settings).length === 0) settings = {
        "locales": {
            "Global": {
                "layers": {
                    "base": {
                        "display": true,
                        "format": "tiles",
                        "URI": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                }
            }
        }
    };

    if (req.session.user) settings = await removeRestrictions(settings, req);

    global.appSettings = settings;

    // Store all string keys in global array to check for SQL injections.
    global.appSettingsValues = [];
    (function objectEval(o) {
        Object.keys(o).forEach((key) => {
            if (typeof key === 'string') global.appSettingsValues.push(key);
            if (typeof o[key] === 'string') global.appSettingsValues.push(o[key]);
            if (o[key] && typeof o[key] === 'object') objectEval(o[key]);
        })
    })(global.appSettings)

    // Push defaults into appSettingsValues
    Array.prototype.push.apply(global.appSettingsValues, ['geom', 'id']);
}

async function saveAppSettings(req, res) {

    if (process.env.APPSETTINGS && process.env.APPSETTINGS.split(':')[0] === 'file') res.code(406).send({ file: true });

    let existingSettings = await global.ORM.collections.settings.find();
    if (existingSettings.length === 0) {
        await global.ORM.collections.settings.create({
            settings: req.body.settings
        });
        req.session.hooks = {};
    } else {
        await global.ORM.collections.settings.update({})
            .set({
                settings: req.body.settings
            });
        req.session.hooks = {};
    }
    res.code(200).send({ ok: true });
}

async function getSettingsFromDB(fastify) {

    let settings_db = await fastify.pg.settings.connect(),
        settings_table = process.env.APPSETTINGS.split('|').pop(),
        settings = await settings_db.query(`SELECT * FROM ${settings_table} LIMIT 1`);

    settings_db.release();

    if (settings.rows.length === 0) return {};
    return settings.rows[0].settings;
}

async function getSettingsFromFile() {
    let fs = require('fs');
    return fs.existsSync('./settings/' + process.env.APPSETTINGS.split(':').pop()) ?
        JSON.parse(fs.readFileSync('./settings/' + process.env.APPSETTINGS.split(':').pop()), 'utf8') : {};
}

function removeRestrictions(settings, req) {
    (function objectEval(o, parent, key) {

        // check whether the object has restrictions.
        if (checkForRestrictions(o)) {
            // if the parent is an array splice the key index.
            if (parent.length > 0) return parent.splice(parseInt(key), 1);

            // if the parent is an object delete the key from the parent.
            return delete parent[key];
        };

        // iterate through the object tree.
        Object.keys(o).forEach((key) => {
            if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key);
        })
    })(settings)

    function checkForRestrictions(o) {
        return Object.entries(o).some((e) => {
            // check whether an entry has 'restriction' as key and the value is not a member of the user object.
            return e[0] === 'restriction' && !req.user[e[1]]
        })
    };

    return settings;
}