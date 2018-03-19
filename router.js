const router = require('express').Router();
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const jsr = require('jsrender');
const Md = require('mobile-detect');
const appSettings = JSON.parse(require('fs').readFileSync(__dirname + '/settings/' + process.env.APPSETTINGS), 'utf8');

router.get('/', isLoggedIn, (req, res) => {

    let md = new Md(req.headers['user-agent']),
        tmpl = (md.mobile() === null || md.tablet() !== null) ?
            jsr.templates('./views/desktop.html') : jsr.templates('./views/mobile.html');

    res.send(
        tmpl.render({
            title: appSettings.title,
            module_layers: appSettings.layers ? './public/tmpl/layers.html' : null,
            module_select: appSettings.select ? './public/tmpl/select.html' : null,
            module_catchments: appSettings.catchments ? './public/tmpl/catchments.html' : null,
            bundle_js: "build/xyz_bundle.js",
            btnDocumentation: appSettings.documentation ? '' : 'style="display: none;"',
            hrefDocumentation: appSettings.documentation ? appSettings.documentation : '',
            btnReport: appSettings.report ? '' : 'style="display: none;"',
            btnLogout: req.user ? '' : 'style="display: none;"',
            btnAdmin: (req.user && req.user.admin) ? '' : 'style="display: none;"',
            btnSearch: appSettings.gazetteer ? '' : 'style="display: none;"',
            btnLocate: appSettings.locate ? '' : 'style="display: none;"',
            settings: `
            <script>
                const node_env = '${process.env.NODE_ENV}';
                const localhost = '';
                const hooks = ${req.session.hooks ? JSON.stringify(req.session.hooks) : false};
                const _xyz = ${JSON.stringify(appSettings)};
            </script>`
        }))
});

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

router.get('/readme', (req, res) => {
    require('fs').readFile('../' + process.env.SUBDIRECTORY + '/readme.md', function (err, md) {
        if (err) throw err;
        res.send(
            jsr.templates('./views/github.html').render({
                css: '<link rel="stylesheet" href="css/github_markdown.css"/>',
                highlight: '<link rel="stylesheet" href="css/github_highlight.css"/>',
                md: markdown.render(md.toString())
            }));
    })
});


router.get('/documentation', (req, res) => {
    require('fs').readFile('../' + process.env.SUBDIRECTORY + '/public/documentation.md', function (err, md) {
        if (err) throw err;

        res.send(
            jsr.templates('./views/github.html').render({
                css: '<link rel="stylesheet" href="css/github_markdown.css"/>',
                highlight: '<link rel="stylesheet" href="css/github_highlight.css"/>',
                md: markdown.render(md.toString())
            }));
    })
});

// Vector layers with PGSQL MVT
const mvt = require('./mod/mvt');
router.get('/mvt/:z/:x/:y', mvt.fetch_tiles);

// Proxy for 3rd party services
const request = require('request');
const KEYS = {};
Object.keys(process.env).map(key => {
    if (key.split('_')[0] === 'KEY') {
        KEYS[key.split('_')[1]] = process.env[key];
    }
});

router.get('/proxy_request', (req, res) => request(`${req.query.uri}${KEYS[req.query.provider]}`).pipe(res));

const grid = require('./mod/grid');
router.get('/q_grid', grid.grid);
router.post('/q_grid_info', isLoggedIn, grid.info);

const catchments = require('./mod/catchments');
router.get('/q_catchments', isLoggedIn, catchments.catchments);

const cluster = require('./mod/cluster');
router.get('/q_cluster', isLoggedIn, cluster.cluster);

const geojson = require('./mod/geojson');
router.get('/q_geojson', geojson.geojson);

const select = require('./mod/select');
router.post('/q_select', isLoggedIn, select.select);

const edit = require('./mod/edit');
router.post('/q_save', isLoggedIn, edit.newRecord);
router.post('/q_update', isLoggedIn, edit.updateRecord);
router.post('/q_delete', isLoggedIn, edit.deleteRecord);

const gazetteer = require('./mod/gazetteer');
router.get('/q_gazetteer', isLoggedIn, gazetteer.gazetteer);
//router.get('/q_gazetteer_places', gazetteer.gazetteer_places);
router.get('/q_gazetteer_googleplaces', gazetteer.gazetteer_googleplaces);

const report = require('./mod/report');
router.post('/q_report_request', isLoggedIn, report.request);
router.get('/q_report_ping', isLoggedIn, report.ping);

const reportpath = require('path').join(__dirname, '/reports/');
router.get('/q_pdf_open', isLoggedIn, (req, res) => {
    res.sendFile(reportpath + req.query.report + '.pdf');
});
router.get('/q_pdf_download', isLoggedIn, (req, res) => {
    res.download(reportpath + req.query.report + '.pdf');
});

const images = require('./mod/images');
router.post('/q_save_image', isLoggedIn, images.save);
router.get('/q_remove_image', isLoggedIn, images.remove);
router.get('/q_get_image', isLoggedIn, (req, res) => {
    res.sendFile(process.env.IMAGES + req.query.image.replace(/ /g, '+'));
});

// ACCESS CONTROLL
router.get('/login', (req, res) => {
    res.render('login.ejs', {
        user: req.user,
        session_messages: req.session.messages || [],
        subdirectory: process.env.SUBDIRECTORY
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/' + process.env.SUBDIRECTORY + '/login');
});

router.post('/login',
    require('./mod/passport').authenticate('localLogin', {
        failureRedirect: '/' + process.env.SUBDIRECTORY + '/login',
        successRedirect: '/' + process.env.SUBDIRECTORY + '/',
        failureMessage: 'Invalid username or password'
    })
);

router.post('/register',
    require('./mod/passport').authenticate('localRegister', {
        failureRedirect: '/' + process.env.SUBDIRECTORY + '/login',
        successMessage: 'A verification email has been sent to the account email.',
        successRedirect: '/' + process.env.SUBDIRECTORY + '/login',
        failureMessage: 'Registration failure'
    })
);

//const user = require('./mod/user');
router.get('/verify/:token', (req, res) => {
    user.findOne({
        verificationToken: req.params.token,
        verificationTokenExpires: {$gt: Date.now()}
    }, function (err, _user) {
        if (!_user) {
            return res.send('The verification has failed.');
        }
        _user.verified = true;
        _user.save();
        user.find({admin: true}, (err, admin) => {
            if (err) throw err;
            let adminmail = admin.map(a => {
                return a.email;
            });
            require('./mod/mailer').mail({
                to: adminmail,
                subject: 'A new account has been verified',
                text: 'Please log into the admin panel to approve ' + _user.email
            });
        });
        req.session.messages = ['An email has been sent to the site administrator'];
        res.send('The account has been verified and is awaiting approval.');
    });
});

router.get('/admin', isAdmin, (req, res) => {
    user.find({}, (err, _user) => {
        if (err) {
            throw err;
        }
        res.render('admin.ejs', {
            data: _user,
            subdirectory: process.env.SUBDIRECTORY
        });
    });
});

router.post('/update_user', isAdmin, (req, res) => {
    user.findOne({email: req.body.email}, (err, _user) => {
        if (!_user) {
            return res.json({update: false});
        }
        _user[req.body.role] = req.body.chk;
        _user.save();
        if (req.body.role === 'approved' && req.body.chk) {
            require('./mod/mailer').mail({
                to: _user.email,
                subject: 'Your account has been approved',
                text: 'Your account has been approved by a site administrator. You can now log into the application.'
            });
        }
        res.json({update: true});
    });
});

router.post('/delete_user', isAdmin, (req, res) => {
    user.findOne({email: req.body.email}, (err, _user) => {
        if (!_user) {
            return res.json({delete: false});
        }
        _user.remove();
        res.json({delete: true});
    });
});

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

            req.session.hooks = Object.keys(o).length > 0 ?
                o : req.session.hooks ?
                    req.session.hooks : false;
            
            return next();
        }
    } else {
        let o = {},
            params = req.url.substring(2).split('&');
        if (params[0] !== '') {
            for (let i = 0; i < params.length; i++) {
                let key_val = params[i].split('=');
                o[key_val[0]] = key_val[1];
            }
        }

        req.session.hooks = Object.keys(o).length > 0 ? o : false;
        res.redirect('/' + process.env.SUBDIRECTORY + '/login');
    }
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.admin) {
            return next();
        }
    }
    res.redirect('/' + process.env.SUBDIRECTORY + '/login');
}

module.exports = router;