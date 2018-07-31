const utils = require('./xyz_utilities/utils');

module.exports = () => {

    // Set locale default.
    if (!_xyz.locale) _xyz.locale = Object.keys(_xyz.locales)[0];
    _xyz.locale = _xyz.hooks.locale || _xyz.locale;

    // Set locale to hook, or set hook for locale.
    if (!_xyz.hooks.locale) _xyz.setHook('locale', _xyz.locale);

    setLocaleDefaults();

    if (Object.keys(_xyz.locales).length === 1) return

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
        _xyz.locale = e.target.value;
        _xyz.removeHooks();
        _xyz.setHook('locale', _xyz.locale);
        setLocaleDefaults();
        _xyz.setView(true);
        _xyz.gazetteer.init(true);
        _xyz.layers.init(true);
        _xyz.select.resetModule();
    };

    Object.keys(_xyz.locales).forEach(loc => {
        utils._createElement({
            tag: 'option',
            options: {
                textContent: _xyz.locales[loc].name || loc,
                value: loc
            },
            appendTo: selLocale
        })
    })

    // Set the select from either hook[query] or layer[query].
    selLocale.selectedIndex = utils.getSelectOptionsIndex(selLocale, _xyz.locale);
}

function setLocaleDefaults(){

    // Set min/max zoom defaults.
    _xyz.locales[_xyz.locale].minZoom = _xyz.locales[_xyz.locale].minZoom || 0;
    _xyz.locales[_xyz.locale].maxZoom = _xyz.locales[_xyz.locale].maxZoom || 20;
};