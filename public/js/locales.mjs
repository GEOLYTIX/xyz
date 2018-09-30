import _xyz from './_xyz.mjs';

export default () => {

    // Set locale from hook or set first locale from locales array.
    _xyz.locale = _xyz.hooks.locale || Object.keys(_xyz.ws.locales)[0];

    // Set hook for locale if it doesn't exist.
    if (!_xyz.hooks.locale) _xyz.utils.setHook('locale', _xyz.locale);

    setLocaleDefaults();

    // Return if length of locales array is 1.
    if (Object.keys(_xyz.ws.locales).length === 1) return


    // Create locales dropdown from locales array.
    let locale = _xyz.utils.createElement({
        tag: 'div',
        options: {
            classList: 'report-off',
            textContent: 'Show layers for the following locale:'
        },
        appendTo: document.getElementById('Layers')
    });
    
    let selLocale = _xyz.utils.createElement({
        tag: 'select',
        appendTo: locale
    });

    // Onchange event for locales dropdown.
    selLocale.onchange = e => {
        _xyz.locale = e.target.value;
        _xyz.utils.removeHooks();
        _xyz.utils.setHook('locale', _xyz.locale);
        setLocaleDefaults();
        _xyz.setView(true);
        _xyz.ws.gazetteer.init(true);
        _xyz.ws.layers.init(true);
        _xyz.ws.select.resetModule();
    };

    // Populate locales dropdown.
    Object.keys(_xyz.ws.locales).forEach(loc => {
        _xyz.utils.createElement({
            tag: 'option',
            options: {
                textContent: _xyz.ws.locales[loc].name || loc,
                value: loc
            },
            appendTo: selLocale
        })
    })

    // Set locales dropdown to locale.
    selLocale.selectedIndex = _xyz.utils.getSelectOptionsIndex(selLocale, _xyz.locale);
}

function setLocaleDefaults(){

    // Set min/max zoom defaults.
    _xyz.ws.locales[_xyz.locale].minZoom = _xyz.ws.locales[_xyz.locale].minZoom || 0;
    _xyz.ws.locales[_xyz.locale].maxZoom = _xyz.ws.locales[_xyz.locale].maxZoom || 20;
};