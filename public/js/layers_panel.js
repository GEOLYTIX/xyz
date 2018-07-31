const utils = require('./xyz_utilities/utils');
const d3 = require('d3');

module.exports = layer => {

    // create panel element.
    let panel = utils._createElement({
            tag: 'div',
            options: {
                className: 'panel'
            }
        });

    // add meta info to panel.
    if (layer.meta) utils._createElement({
        tag: 'p',
        options: {
            className: 'meta',
            textContent: layer.meta
        },
        appendTo: panel
    });

    // add cluster control block.
    if (layer.format === 'cluster') require('./panel_cluster')(layer, panel);

    // add filters block.
    if (layer.infoj && layer.infoj.some( entry => entry.filter )) require('./layers_filters')(layer, panel);

    // add mvt style block.
    if (layer.format === 'mvt') require('./layers_style')(layer, panel);

    // applay themes control.
    if (layer.style.theme || layer.style.themes) require('./block_theme')(layer, panel);

    // add grid control block to panel.
    if (layer.format === 'grid') require('./layers_grid')(layer, panel);

    // add catchment block to panel.
    if (layer.catchments) require('./layers_catchments')(layer, panel);

    // Add panel control when panel contains children.
    if (panel.children.length > 0) {

        // set panel on layer object.
        layer.panel = panel;

        utils.addClass(layer.header, 'pane_shadow');
        utils.addClass(layer.drawer, 'expandable');

        // expander control layer header
        layer.header.addEventListener('click', () => {
            utils.toggleExpanderParent({
                expandable: layer.drawer,
                accordeon: true,
                scrolly: document.querySelector('.mod_container > .scrolly')
            });
        });

        layer.drawer.appendChild(layer.panel);

        // Add icon which allows to expand / collaps panel.
        utils._createElement({
            tag: 'i',
            options: {
                className: 'material-icons cursor noselect btn_header expander',
                title: 'Toggle layer panel'
            },
            appendTo: layer.header,
            eventListener: {
                event: 'click',
                funct: e => {
                    e.stopPropagation();
                    utils.toggleExpanderParent({
                        expandable: layer.drawer,
                        scrolly: document.querySelector('.mod_container > .scrolly')
                    });
                }
            }
        });
    }
}