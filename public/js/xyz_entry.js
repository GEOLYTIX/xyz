// Evaluate view_mode.
if (view_mode === 'mobile') require('./mobile_interface')();

// Evaluate settings.
//const svg_builder = require('./svg_builder');
const svg_marker = require('./svg_marker');
//const svg_dot = require('./svg_dot');
function objectEval(settings) {
    Object.keys(settings).map(function (key) {
        if (typeof settings[key] === 'string' && key != 'color') {
            try {settings[key] = eval(settings[key])}
            catch(me){}
        }
        if (settings[key] && typeof settings[key] === 'object') objectEval(settings[key]);
    })
}
objectEval(settings);

// Initiate modules.
require('./url_hooks')(settings);
require('./locale')(settings);
require('./gazetteer')(settings);
require('./comparison')(settings);
if (view_mode === 'desktop') require('./report')(settings);
if (settings.grid) require('./grid')(settings);
if (settings.location) require('./location')(settings);
if (settings.vector) require('./vector')(settings);
//if(settings.vector) require('./vector_geojson')(settings);
if (settings.drivetime) require('./drivetime')(settings);

document.querySelector('.module_container').style.display = 'block';
if (view_mode === 'desktop') require('./lscrolly')(document.querySelector('.module_container'));