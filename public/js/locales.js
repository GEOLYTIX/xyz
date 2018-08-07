const utils = require('./utils');

module.exports = () => {

    // Set locale default.
    if (!global._xyz.locale) global._xyz.locale = Object.keys(global._xyz.locales)[0];
    global._xyz.locale = global._xyz.hooks.locale || global._xyz.locale;

    // Set locale to hook, or set hook for locale.
    if (!global._xyz.hooks.locale) global._xyz.setHook('locale', global._xyz.locale);

    setLocaleDefaults();

    if (Object.keys(global._xyz.locales).length === 1) return

    let locale = utils._createElement({
        tag: 'div',
        options: {
            classList: 'report-off',
            textContent: 'Show layers for the following locale:'
        },
        appendTo: document.getElementById('Layers')
    });
    
    let selLocale = utils._createElement({
        tag: 'select',
        appendTo: locale
    });

    selLocale.onchange = e => {
        global._xyz.locale = e.target.value;
        global._xyz.removeHooks();
        global._xyz.setHook('locale', global._xyz.locale);
        setLocaleDefaults();
        global._xyz.setView(true);
        global._xyz.gazetteer.init(true);
        global._xyz.layers.init(true);
        global._xyz.select.resetModule();
    };

    Object.keys(global._xyz.locales).forEach(loc => {
        utils._createElement({
            tag: 'option',
            options: {
                textContent: global._xyz.locales[loc].name || loc,
                value: loc
            },
            appendTo: selLocale
        })
    })

    // Set the select from either hook[query] or layer[query].
    selLocale.selectedIndex = utils.getSelectOptionsIndex(selLocale, global._xyz.locale);
}

function setLocaleDefaults(){

    // Set min/max zoom defaults.
    global._xyz.locales[global._xyz.locale].minZoom = global._xyz.locales[global._xyz.locale].minZoom || 0;
    global._xyz.locales[global._xyz.locale].maxZoom = global._xyz.locales[global._xyz.locale].maxZoom || 20;
};