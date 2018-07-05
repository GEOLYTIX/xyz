module.exports = fastify => {

    const auth = require('./auth');
    auth.routes(fastify);

    const appsettings = require('./appsettings');
    appsettings.routes(fastify, auth);

    // Create constructor for mobile detect module.
    const Md = require('mobile-detect');

    // Set jsrender module for server-side templates.
    const jsr = require('jsrender');

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

    // Universal error handler.
    const errHandler = ourFunc => (...params) => ourFunc(...params).catch(console.error);

    // Add content type parser for octet stream.
    fastify.addContentTypeParser('*', (req, done) => done());

    fastify
        .decorate('authRoutes', (req, res, done) => auth.authToken(req, res, fastify, process.env.LOGIN ? true : false, done))
        .register((fastify, opts, next) => {

        fastify.route({
            method: 'GET',
            url: '/',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: async (req, res) => {

                await appsettings.get(fastify);

                const user_token = fastify.jwt.decode(req.cookies.xyz_user);
                const session_token = fastify.jwt.decode(req.cookies.xyz_session);

                global.appSettings.hooks = Object.assign(req.query, session_token);

                delete global.appSettings.hooks.iat;

                // Check whether request comes from a mobile platform and set template.
                let md = new Md(req.headers['user-agent']);

                let tmpl = global.appSettings.hooks.report ?
                    jsr.templates('./views/report.html') :
                    (md.mobile() === null || md.tablet() !== null) ?
                        jsr.templates('./views/desktop.html') :
                        jsr.templates('./views/mobile.html');

                // Build the template with jsrender and send to client.
                res.type('text/html').send(tmpl.render({
                    title: global.appSettings.title || 'GEOLYTIX | XYZ',
                    user: user_token.email || 'anonymous',
                    bundle_js: 'build/xyz_bundle.js',
                    btnDocumentation: global.appSettings.documentation ? '' : 'style="display: none;"',
                    hrefDocumentation: global.appSettings.documentation ? global.dir + '/' + global.appSettings.documentation : '',
                    btnReport: global.appSettings.report ? '' : 'style="display: none;"',
                    btnLogout: user_token.email ? '' : 'style="display: none;"',
                    btnAdmin: user_token.admin ? '' : 'style="display: none;"',
                    btnSearch: global.appSettings.gazetteer ? '' : 'style="display: none;"',
                    btnLocate: global.appSettings.locate ? '' : 'style="display: none;"',
                    dir: global.dir,
                    settings: `
                            <script>
                                const host = '${(global.dir || '/').substring(1)}/';
                                const _xyz = ${JSON.stringify(global.appSettings)};
                            </script>`
                }));
            }
        });

        fastify.route({
            method: 'GET',
            url: '/documentation',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('fs').readFile('./public/documentation.md', (err, md) => {
                    if (err) throw err;
                    res
                        .type('text/html')
                        .send(
                            jsr.templates('./views/github.html').render({
                                md: markdown.render(md.toString())
                            }));
                })
            }
        });

        fastify.route({
            method: 'GET',
            url: '/proxy/image',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                var q = `${req.query.uri}${req.query.size?'&size='+req.query.size+'&':''}${global.KEYS[req.query.provider]}`;
                res.send(require('request')(q));
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/mvt/get/:z/:x/:y',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/mvt').get(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/grid/get',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/grid').get(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/geojson/get',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/geojson').get(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/cluster/get',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/cluster').get(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/cluster/select',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/cluster').select(req, res, fastify);
            }
        });

        fastify.route({
            method: 'POST',
            url: '/api/location/select',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/select').select(req, res, fastify);
            }
        });

        // !!!should be taken from /select infoj
        fastify.route({
            method: 'POST',
            url: '/q_chart_data',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/select').chart_data(req, res, fastify);
            }
        });

        fastify.route({
            method: 'POST',
            url: '/api/location/new',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/edit').newRecord(req, res, fastify);
            }
        });

        fastify.route({
            method: 'POST',
            url: '/api/location/update',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/edit').updateRecord(req, res, fastify);
            }
        });

        // !!!this should be a get route
        fastify.route({
            method: 'POST',
            url: '/api/location/delete',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/edit').deleteRecord(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/location/aggregate',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/edit').newAggregate(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/gazetteer/autocomplete',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/gazetteer').gazetteer(req, res, fastify);
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/gazetteer/googleplaces',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/gazetteer').gazetteer_googleplaces(req, res, fastify);
            }
        });

        // fastify.route({
        //     method: 'GET',
        //     url: global.dir + '/api/gazetteer/glxplaces',
        //     beforeHandler: fastify.auth([fastify.authRoutes]),
        //     handler: (req, res) => {
        //         require('./mod/gazetteer').gazetteer_places(req, res, fastify);
        //     }
        // });

        fastify.route({
            method: 'GET',
            url: '/api/catchments',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/catchments').get(req, res, fastify);
            }
        });

        fastify.route({
            method: 'POST',
            url: '/api/images/new',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                var data = [];
                req.req.on('data', chunk => data.push(chunk));
                req.req.on('end', () => {
                    req.body = Buffer.concat(data);
                    require('./mod/images').save(req, res, fastify);
                });
            }
        });

        fastify.route({
            method: 'GET',
            url: '/api/images/delete',
            beforeHandler: fastify.auth([fastify.authRoutes]),
            handler: (req, res) => {
                require('./mod/images').remove(req, res, fastify);
            }
        });

        next();

    }, { prefix: global.dir });

}