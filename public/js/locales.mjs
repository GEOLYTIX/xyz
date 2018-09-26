import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

export default () => {

    // Set locale default.
    if (!_xyz.ws.locale) _xyz.ws.locale = Object.keys(_xyz.ws.locales)[0];
    _xyz.ws.locale = _xyz.ws.hooks.locale || _xyz.ws.locale;

    // Set locale to hook, or set hook for locale.
    if (!_xyz.ws.hooks.locale) _xyz.ws.setHook('locale', _xyz.ws.locale);

    setLocaleDefaults();

    if (Object.keys(_xyz.ws.locales).length === 1) return

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
        _xyz.ws.locale = e.target.value;
        _xyz.ws.removeHooks();
        _xyz.ws.setHook('locale', _xyz.ws.locale);
        setLocaleDefaults();
        _xyz.ws.setView(true);
        _xyz.ws.gazetteer.init(true);
        _xyz.ws.layers.init(true);
        _xyz.ws.select.resetModule();
    };

    Object.keys(_xyz.ws.locales).forEach(loc => {
        utils._createElement({
            tag: 'option',
            options: {
                textContent: _xyz.ws.locales[loc].name || loc,
                value: loc
            },
            appendTo: selLocale
        })
    })

    // Set the select from either hook[query] or layer[query].
    selLocale.selectedIndex = utils.getSelectOptionsIndex(selLocale, _xyz.ws.locale);
}

function setLocaleDefaults(){

    // Set min/max zoom defaults.
    _xyz.ws.locales[_xyz.ws.locale].minZoom = _xyz.ws.locales[_xyz.ws.locale].minZoom || 0;
    _xyz.ws.locales[_xyz.ws.locale].maxZoom = _xyz.ws.locales[_xyz.ws.locale].maxZoom || 20;
};