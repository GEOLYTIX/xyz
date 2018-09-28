import _xyz from '../../_xyz.mjs';

import cluster from './cluster.mjs';

import filters from './filters.mjs';

import style from './style.mjs';

import themes from './themes.mjs';

import grid from './grid.mjs';

import catchments from './catchments.mjs';

export default layer => {

    // create panel element.
    let panel = _xyz.utils._createElement({
            tag: 'div',
            options: {
                className: 'panel'
            }
        });

    // add meta info to panel.
    if (layer.meta) _xyz.utils._createElement({
        tag: 'p',
        options: {
            className: 'meta',
            textContent: layer.meta
        },
        appendTo: panel
    });

    // add cluster control block.
    if (layer.format === 'cluster') cluster(layer, panel);

    // add filters block.
    if (layer.infoj && layer.infoj.some( entry => entry.filter )) filters(layer, panel);

    // add mvt style block.
    if (layer.format === 'mvt') style(layer, panel);

    // applay themes control.
    if (layer.style.theme || layer.style.themes) themes(layer, panel);

    // add grid control block to panel.
    if (layer.format === 'grid') grid(layer, panel);

    // add catchment block to panel.
    if (layer.catchments) catchments(layer, panel);

    // Add panel control when panel contains children.
    if (panel.children.length > 0) {

        // set panel on layer object.
        layer.panel = panel;

        _xyz.utils.addClass(layer.header, 'pane_shadow');
        _xyz.utils.addClass(layer.drawer, 'expandable');

        // expander control layer header
        layer.header.addEventListener('click', () => {
            _xyz.utils.toggleExpanderParent({
                expandable: layer.drawer,
                accordeon: true,
                scrolly: document.querySelector('.mod_container > .scrolly')
            });
        });

        layer.drawer.appendChild(layer.panel);

        // Add icon which allows to expand / collaps panel.
        _xyz.utils._createElement({
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
                    _xyz.utils.toggleExpanderParent({
                        expandable: layer.drawer,
                        scrolly: document.querySelector('.mod_container > .scrolly')
                    });
                }
            }
        });
    }
}