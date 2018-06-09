function routes(fastify) {

    // Declare a route
    // fastify.get('/', (request, reply) => reply.send({ hello: 'world' }));

    fastify
        .decorate('testauth', function (req, res, done) {
            // your validation logic

            if (!req.query.auth) {
                return done(new Error('missing auth query param'))
            }
            done() // pass an error if the authentication fails
        })
        .register(require('fastify-auth'))
        .after(() => {
            fastify.route({
                method: 'GET',
                url: '/auth',
                beforeHandler: fastify.auth([
                    fastify.testauth
                ]),
                handler: (req, res) => {
                    //req.log.info('Auth route')
                    res.send({ hello: 'world' })
                }
            })
        });

    // Create constructor for mobile detect module.
    const Md = require('mobile-detect');

    // Set jsrender module for server-side templates.
    const jsr = require('jsrender');

    // Request application bundle.
    fastify.get('/', async (req, res) => {

        await require('./mod/appsettings').getAppSettings(req);

        // Get params from URL.
        // let params = req.originalUrl.substring(req.baseUrl.length + 2).split('&');

        // Assign session hooks from params.
        // req.session.hooks = {};
        // if (params[0] !== '') params.forEach(p => {
        //     let kv = p.split('=');
        //     req.session.hooks[kv[0]] = kv[1];
        // });

        // global.appSettings.hooks = req.session.hooks;

        // Check whether request comes from a mobile platform and set template.
        let md = new Md(req.headers['user-agent']);

        let tmpl = req.session && req.session.hooks && req.session.hooks.report ?
            jsr.templates('./views/report.html') : (md.mobile() === null || md.tablet() !== null) ?
                jsr.templates('./views/desktop.html') : jsr.templates('./views/mobile.html');

        // Build the template with jsrender and send to client.
        res
            .type('text/html')
            .send(
                tmpl.render({
                    title: global.appSettings.title || 'GEOLYTIX | XYZ',
                    bundle_js: 'build/xyz_bundle.js',
                    btnDocumentation: global.appSettings.documentation ? '' : 'style="display: none;"',
                    hrefDocumentation: global.appSettings.documentation ? appSettings.documentation : '',
                    btnReport: global.appSettings.report ? '' : 'style="display: none;"',
                    btnLogout: req.user ? '' : 'style="display: none;"',
                    btnAdmin: (req.user && req.user.admin) ? '' : 'style="display: none;"',
                    btnSearch: global.appSettings.gazetteer ? '' : 'style="display: none;"',
                    btnLocate: global.appSettings.locate ? '' : 'style="display: none;"',
                    settings: `
                        <script>
                            const host = '';
                            const _xyz = ${JSON.stringify(global.appSettings)};
                        </script>`
                }))
    });

    // Open the settings view.
    fastify.get('/settings', async (req, res) => {

        await require('./mod/appsettings').getAppSettings(req);

        res
            .type('text/html')
            .send(
                jsr.templates('./views/settings.html').render({
                    settings: `
                <script>
                    const _xyz = ${JSON.stringify(global.appSettings)};
                </script>`
                }));
    });

    // Get data for selected item.
    fastify.post('/q_settings_save', (req, res) => require('./mod/appsettings').saveAppSettings(req, res));

    // Set highlight and and markdown-it to turn markdown into flavoured html.
    const hljs = require('highlight.js');
    const markdown = require('markdown-it')({
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }
            return ''; // use external default escaping
        }
    });

    // Read documentation.md into file stream and send render of the github flavoured markdown template to client.
    fastify.get('/documentation', (req, res) => {
        require('fs').readFile('./public/documentation.md', function (err, md) {
            if (err) throw err;
            res
                .type('text/html')
                .send(
                    jsr.templates('./views/github.html').render({
                        md: markdown.render(md.toString())
                    }));
        })
    });

    const errHandler = ourFunc => (...params) => ourFunc(...params).catch(console.error);

    // Vector layers with PGSQL MVT.
    fastify.get('/mvt/:z/:x/:y', (req, res) => require('./mod/mvt').fetchTiles(req, res));

    // Proxy for 3rd party services.
    fastify.get('/proxy_request', (req, res) => {
        res.send(require('request')(`${req.query.uri}${global.KEYS[req.query.provider]}`));
    });

    // Proxy for 3rd party services.
    fastify.get('/proxy_uri', (req, res) => {
        let uri = req.url.replace('/proxy_uri?', '');
        uri = uri.split('provider=');
        res.send(require('request')(`${uri[0]}${global.KEYS[uri[1]]}`))
    });

    // Get grid data.
    fastify.get('/q_grid', (req, res) => require('./mod/grid').grid(req, res));

    // Get grid stats from geojson geometry.
    fastify.post('/q_grid_info', (req, res) => require('./mod/grid').info(req, res));

    // Calculate catchments from distance matrix.
    fastify.get('/q_catchments', (req, res) => require('./mod/catchments').catchments(req, res));

    // Get cluster layer data.
    fastify.get('/q_cluster', (req, res) => require('./mod/cluster').cluster(req, res));

    // Get id array from cluster layer.
    fastify.get('/q_cluster_select', (req, res) => require('./mod/cluster').cluster_select(req, res));

    // Get geojson data.
    fastify.get('/q_geojson', (req, res) => require('./mod/geojson').geojson(req, res));

    // Get data for selected item.
    fastify.post('/q_select', (req, res) => require('./mod/select').select(req, res));

    // Get chart data for selected item.
    fastify.post('/q_chart_data', (req, res) => require('./mod/select').chart_data(req, res));

    // Create a new feature.
    fastify.post('/q_save', (req, res) => require('./mod/edit').newRecord(req, res));

    // Get cluster layer data.
    fastify.get('/q_aggregate', (req, res) => require('./mod/edit').newAggregate(req, res));

    // Update a feature.
    fastify.post('/q_update', (req, res) => require('./mod/edit').updateRecord(req, res));

    // Delete a feature.
    fastify.post('/q_delete', (req, res) => require('./mod/edit').deleteRecord(req, res));

    // Get autocomplete records from search term.
    fastify.get('/q_gazetteer', (req, res) => require('./mod/gazetteer').gazetteer(req, res));

    // Get place details from own data source.
    // fastify.get('/q_gazetteer_places', (req, res) => require('./mod/gazetteer').gazetteer_places(req, res));

    // Get place details from Google places.
    fastify.get('/q_gazetteer_googleplaces', (req, res) => require('./mod/gazetteer').gazetteer_googleplaces(req, res));

    // Request puppeteer to create a report.
    // fastify.post('/q_report_request', (req, res) => require('./mod/report').request(req, res));

    // Ping whether a report is ready.
    // fastify.get('/q_report_ping', (req, res) => require('./mod/report').ping(req, res));

    // Open a PDF report from local file.
    // fastify.get('/q_pdf_open', (req, res) => res.sendFile(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));

    // Download a PDF report.
    // fastify.get('/q_pdf_download', (req, res) => res.download(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));

    // Post a new image to be stored.
    fastify.post('/q_save_image', (req, res) => require('./mod/images').save(req, res));

    // Remove a stored image.
    fastify.get('/q_remove_image', (req, res) => require('./mod/images').remove(req, res));

    // Get a stored image.
    fastify.get('/q_get_image', (req, res) => res.sendFile(process.env.IMAGES + req.query.image.replace(/ /g, '+')));


}

module.exports = routes;