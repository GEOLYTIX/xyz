const req_res = (m) => { try { return require.resolve(m); } catch (e) { console.log('Cannot resolve ' + m); return false; } };
const puppeteer = req_res('puppeteer') ? require('puppeteer') : null;

const jsr = require('jsrender');
    
const reportpath = require('path').join(process.env.DIR || '', '../reports/');
const reports = {};

async function request(req, res) {

  if(req.body.drivetime){
    drivetime_flag = JSON.stringify(req.body.drivetime);
  }
    
  let report = Date.now();
  reports[report] = false;
  res.code(200).send(report);

  const browser = await puppeteer.launch({args: ['--no-sandbox'], headless: true});
  const page = await browser.newPage();
  await page.setContent(jsr.templates('./views/desktop.html').render({
    title: global.appSettings.title || 'GEOLYTIX | XYZ',
    module_layers: './public/tmpl/layers.html',
    module_select: global.appSettings.select ? './public/tmpl/select.html' : null,
    module_catchments: global.appSettings.catchments ? './public/tmpl/catchments.html' : null
  }), { waitUntil: 'domcontentloaded' });

  await page.addStyleTag({ path: './public/css/report.css' });
  await page.addScriptTag({ path: './public/js/build/xyz_bundle.js' });

  page.once('console', async (msg) => {
    if (msg.text === 'layers loaded') {
      await page.emulateMedia('print');
      await page.pdf({
        path: reportpath + report + '.pdf',
        width: '29.7cm',
        height: '21cm',
        scale: 1
      });
      reports[report] = true;
      browser.close();
    }
  });
}

function ping(req, res) {
  res.code(200).send(reports[req.query.report]);
}

module.exports = {
  request: request,
  ping: ping
};