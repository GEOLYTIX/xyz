// Set express router.
const router = require('express').Router();

// Set header for CORS.
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Create constructor for mobile detect module.
const Md = require('mobile-detect');

// Set jsrender module for server-side templates.
const jsr = require('jsrender');

// Request application bundle.
router.get('/', isLoggedIn, async (req, res) => {

    await require('./mod/appsettings').getAppSettings();

    // Get params from URL.
    let params = req.originalUrl.substring(req.baseUrl.length + 2).split('&');

    // Assign session hooks from params.
    if (req.session) {
        if (!req.session.hooks || !process.env.LOGIN) req.session.hooks = {};
        if (params[0] !== '')
            params.forEach(p => {
                let kv = p.split('=');
                req.session.hooks[kv[0]] = kv[1];
            });

        global.appSettings.hooks = req.session.hooks;
    }

    // Check whether request comes from a mobile platform and set template.
    let md = new Md(req.headers['user-agent']);

    let tmpl = req.session && req.session.hooks && req.session.hooks.report ?
        jsr.templates('./views/report.html') : (md.mobile() === null || md.tablet() !== null) ?
            jsr.templates('./views/desktop.html') : jsr.templates('./views/mobile.html');

    // Build the template with jsrender and send to client.
    res.send(
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
router.get('/settings', isAdmin, async (req, res) => {

    await require('./mod/appsettings').getAppSettings();

    res.send(
        jsr.templates('./views/settings.html').render({
            settings: `
                <script>
                    const _xyz = ${JSON.stringify(global.appSettings)};
                </script>`
        }));
});

// Get data for selected item.
router.post('/q_settings_save', isAdmin, require('./mod/appsettings').saveAppSettings);

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
router.get('/documentation', (req, res) => {
    require('fs').readFile('..' + (process.env.DIR || '') + '/public/documentation.md', function (err, md) {
        if (err) throw err;
        res.send(
            jsr.templates('./views/github.html').render({
                md: markdown.render(md.toString())
            }));
    })
});

const errHandler = ourFunc => (...params) => ourFunc(...params).catch(console.error);

// Vector layers with PGSQL MVT.
router.get('/mvt/:z/:x/:y', require('./mod/mvt').fetchTiles);

// Proxy for 3rd party services.
router.get('/proxy_request', (req, res) => {
    require('request')(`${req.query.uri}${global.KEYS[req.query.provider]}`).pipe(res)
});

// Proxy for 3rd party services.
router.get('/proxy_uri', (req, res) => {
    let uri = req.url.replace('/proxy_uri?', '');
    uri = uri.split('provider=');
    require('request')(`${uri[0]}${global.KEYS[uri[1]]}`).pipe(res)
});

// Get grid data.
router.get('/q_grid', require('./mod/grid').grid);

// Get grid stats from geojson geometry.
router.post('/q_grid_info', isLoggedIn, require('./mod/grid').info);

// Calculate catchments from distance matrix.
router.get('/q_catchments', isLoggedIn, require('./mod/catchments').catchments);

// Get cluster layer data.
router.get('/q_cluster', isLoggedIn, require('./mod/cluster').cluster);

// Get id array from cluster layer.
router.get('/q_cluster_select', isLoggedIn, require('./mod/cluster').cluster_select);

// Get geojson data.
router.get('/q_geojson', isLoggedIn, require('./mod/geojson').geojson);

// Get data for selected item.
router.post('/q_select', isLoggedIn, require('./mod/select').select);

// Create a new feature.
router.post('/q_save', isLoggedIn, require('./mod/edit').newRecord);

// Get cluster layer data.
router.get('/q_aggregate', isLoggedIn, require('./mod/edit').newAggregate);

// Update a feature.
router.post('/q_update', isLoggedIn, require('./mod/edit').updateRecord);

// Delete a feature.
router.post('/q_delete', isLoggedIn, require('./mod/edit').deleteRecord);

// Get autocomplete records from search term.
router.get('/q_gazetteer', isLoggedIn, require('./mod/gazetteer').gazetteer);

// Get place details from own data source.
//router.get('/q_gazetteer_places', require('./mod/gazetteer').gazetteer_places);

// Get place details from Google places.
router.get('/q_gazetteer_googleplaces', require('./mod/gazetteer').gazetteer_googleplaces);

// Request puppeteer to create a report.
router.post('/q_report_request', isLoggedIn, require('./mod/report').request);

// Ping whether a report is ready.
router.get('/q_report_ping', isLoggedIn, require('./mod/report').ping);

// Open a PDF report from local file.
router.get('/q_pdf_open', isLoggedIn, (req, res) => res.sendFile(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));

// Download a PDF report.
router.get('/q_pdf_download', isLoggedIn, (req, res) => res.download(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));

// Post a new image to be stored.
router.post('/q_save_image', isLoggedIn, require('./mod/images').save);

// Remove a stored image.
router.get('/q_remove_image', isLoggedIn, require('./mod/images').remove);

// Get a stored image.
router.get('/q_get_image', isLoggedIn, (req, res) => res.sendFile(process.env.IMAGES + req.query.image.replace(/ /g, '+')));



// ACCESS CONTROLL

// Open the login / register view.
router.get('/login', (req, res) => {
    res.render('login.ejs', {
        user: req.user,
        session_messages: req.session.messages || [],
        dir: process.env.DIR || ''
    });
});

// Logout from application and destroy session.
router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect((process.env.DIR || '') + '/login');
});

const security = require('./security');

// Send login information for authentication to passport.
router.post('/login', security.passport.authenticate('localLogin', {
    failureRedirect: (process.env.DIR || '') + '/login',
    successRedirect: (process.env.DIR || '') + '/',
    failureMessage: 'Invalid username or password'
}));

// Send account information for registration to passport.
router.post('/register', security.passport.authenticate('localRegister', {
    failureRedirect: (process.env.DIR || '') + '/login',
    successMessage: 'A verification email has been sent to the account email.',
    successRedirect: (process.env.DIR || '') + '/login',
    failureMessage: 'Registration failure'
}));

// Check verification token and verify account
router.get('/verify/:token', (req, res) => security.verify(req, res));

// Check verification token and approve account
router.get('/approve/:token', (req, res) => security.approve(req, res));

// Open the user admin panel with a list of all user accounts.
router.get('/admin', isAdmin, async (req, res) => {

    // Get all user accounts from the ORM users collection.
    let users = await global.ORM.collections.users.find();

    // Pass user accounts to the admin view.
    res.render('admin.ejs', {
        data: users,
        dir: process.env.DIR || ''
    });
});

// Endpoint for update requests from admin panel.
router.post('/update_user', isAdmin, (req, res) => security.update_user(req, res));

// Endpoint for deleting user accounts from admin panel.
router.post('/delete_user', isAdmin, (req, res) => security.delete_user(req, res));

// Middleware funtion to check whether a user is logged in.
function isLoggedIn(req, res, next) {

    // return next() if LOGIN is not set in environment settings.
    if (!process.env.LOGIN) return next();

    if (req.isAuthenticated()) {

        if (req.user.approved && req.user.verified) {
            let o = {},
                params = req.originalUrl.substring(req.baseUrl.length + 2).split('&');

            if (params[0] !== '') {
                for (let i = 0; i < params.length; i++) {
                    let key_val = params[i].split('=');
                    o[key_val[0]] = key_val[1];
                }
            }

            if (req.session) req.session.hooks = Object.keys(o).length > 0 ?
                o : req.session.hooks ?
                    req.session.hooks : false;

            return next();
        }

    } else {
        let o = {},
            params = req.url.substring(2).split('&');

        if (params[0] !== '')
            params.forEach(p => {
                let key_val = p.split('=');
                o[key_val[0]] = key_val[1];
            });

        if (req.session) req.session.hooks = Object.keys(o).length > 0 ? o : false;

        res.redirect((process.env.DIR || '') + '/login');
    }
}

// Middleware funtion to check whether a user has administrator roles.
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.admin) return next();

    res.redirect((process.env.DIR || '') + '/login');
}

module.exports = router;