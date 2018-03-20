try {
    const puppeteer = require('puppeteer');
} catch (err) {
    console.error(err);
}

const jsr = require('jsrender');
const appSettings = JSON.parse(require('fs').readFileSync(require('path').join(process.env.SUBDIRECTORY, '../settings/' + process.env.APPSETTINGS), 'utf8'));
const reportpath = require('path').join(process.env.SUBDIRECTORY, '../reports/');
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
        view_mode: 'desktop',
        module_location: './public/tmpl/location.html',
        module_hxgrid: './public/tmpl/hxgrid.html',
        module_drivetime: './public/tmpl/drivetime.html',
        module_statistics: './public/tmpl/statistics.html',
        report_container: './public/tmpl/report.html',
        localhost: process.env.LOCALHOST,
        hooks: JSON.stringify(req.body.hooks),
        drivetime: drivetime_flag,
        mapbox_token: process.env.MAPBOX,
        settings: JSON.stringify(appSettings)
    }), { waitUntil: 'load' });

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