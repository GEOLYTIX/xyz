const utils = require('./utils');

module.exports = () => {

    if (Object.keys(_xyz.locales).length === 1) return

    let locale = utils._createElement({
        tag: 'div',
        options: {
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