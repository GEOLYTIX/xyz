// Evaluate view_mode.
if (view_mode === 'mobile') require('./mobile_interface')();

// Evaluate settings.
const svg_symbols = require('./svg_symbols');
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
require('./analyse')(settings);
if (view_mode === 'desktop') require('./report')(settings);
if (settings.grid) require('./grid')(settings);
if (settings.vector) require('./vector')(settings);
if (settings.catchments) require('./catchments')(settings);

document.querySelector('.module_container').style.display = 'block';
if (view_mode === 'desktop') require('./lscrolly')(document.querySelector('.module_container'));