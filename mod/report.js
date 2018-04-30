const req_res = (m) => { try { return require.resolve(m) } catch (e) { console.log('Cannot resolve ' + m); return false } }
const puppeteer = req_res('puppeteer') ? require('puppeteer') : null;

const jsr = require('jsrender');
    
const reportpath = require('path').join(process.env.DIR || '', '../reports/');
const reports = {};

async function request(req, res) {
    let drivetime_flag = false;
    if(req.body.drivetime){
        drivetime_flag = JSON.stringify(req.body.drivetime);
    }
    
    let report = Date.now();
    reports[report] = false;
    res.status(200).json(report);

    const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: true});
    const page = await browser.newPage();
    await page.setContent(jsr.templates('./views/desktop.html').render({
        title: global.appSettings.title || 'GEOLYTIX | XYZ',
        module_layers: './public/tmpl/layers.html',
        module_select: global.appSettings.select ? './public/tmpl/select.html' : null,
        module_catchments: global.appSettings.catchments ? './public/tmpl/catchments.html' : null,
        //btnDocumentation: global.appSettings.documentation ? '' : 'style="display: none;"',
        //hrefDocumentation: global.appSettings.documentation ? appSettings.documentation : '',
        btnReport: global.appSettings.report ? '' : 'style="display: none;"',
        btnLogout: req.user ? '' : 'style="display: none;"',
        btnAdmin: (req.user && req.user.admin) ? '' : 'style="display: none;"',
        btnSearch: global.appSettings.gazetteer ? '' : 'style="display: none;"',
        btnLocate: global.appSettings.locate ? '' : 'style="display: none;"',
        settings: `
        <script>
            const node_env = '${process.env.NODE_ENV}';
            const host = '';
            const hooks = ${req.session && req.session.hooks ? JSON.stringify(req.session.hooks) : false};
            const _xyz = ${JSON.stringify(global.appSettings)};
        </script>`
        /*view_mode: 'desktop',
        module_location: './public/tmpl/location.html',
        module_hxgrid: './public/tmpl/hxgrid.html',
        module_drivetime: './public/tmpl/drivetime.html',
        module_statistics: './public/tmpl/statistics.html',
        report_container: './public/tmpl/report.html',
        localhost: process.env.LOCALHOST || '//localhost:3000',
        hooks: JSON.stringify(req.body.hooks),
        drivetime: drivetime_flag,
        mapbox_token: process.env.MAPBOX,
        settings: JSON.stringify(global.appSettings)*/
    }), { waitUntil: 'domcontentloaded' });

    await page.addStyleTag({ path: './public/css/report.css' });
    await page.addScriptTag({ path: './public/js/build/xyz_bundle.js' });

    page.once("console", async (msg) => {
        if (msg.text === "layers loaded") {
            await page.emulateMedia('print');
            await page.pdf({
                path: reportpath + report + '.pdf',
                width: "29.7cm",
                height: "21cm",
                scale: 1
            });
            reports[report] = true;
            browser.close();
        }
    });
}

function ping(req, res) {
        res.status(200).send(reports[req.query.report]);
}

module.exports = {
    request: request,
    ping: ping
};