import _xyz from '../_xyz.mjs';

export default () => {
    
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    //move map up on document scroll
    document.addEventListener('scroll',
        () => document.getElementById('Map').style['marginTop'] = -parseInt(window.pageYOffset / 2) + 'px');

    let modules = document.querySelectorAll('.mod_container > .module'),
        tabs = document.querySelector('.tab_bar'),
        tabLayers = document.getElementById('tabLayers'),
        modLayers = document.getElementById('Layers'),
        tabLocations = document.getElementById('tabLocations'),
        modLocations = document.getElementById('Locations');

    modLayers.addEventListener('scroll', e => checkOverlap (e.target));
    modLocations.addEventListener('scroll', e => checkOverlap (e.target));

    function checkOverlap (mod) {
        if (mod.scrollTop > 0) {
            _xyz.utils.addClass(tabs, 'pane_shadow');
            return
        }
        _xyz.utils.removeClass(tabs, 'pane_shadow');
    }

    _xyz.activateLayersTab = () => activateTab(tabLayers, modLayers);
    _xyz.activateLocationsTab = () => {
        _xyz.utils.removeClass(tabLocations, 'hidden');
        activateTab(tabLocations, modLocations)
    };

    tabLayers.addEventListener('click',
        () => activateTab(tabLayers, modLayers));

    tabLocations.addEventListener('click',
        () => activateTab(tabLocations, modLocations));

    function activateTab(target, mod) {
        _xyz.utils.removeClass(target.parentNode.children, 'active');
        _xyz.utils.addClass(target, 'active');
        _xyz.utils.addClass(modules, 'hidden');
        _xyz.utils.removeClass(mod, 'hidden');
        checkOverlap (mod);

        let locations = document.querySelector('#Locations > .content');

        setTimeout(() => {
            if (locations.children.length === 0) _xyz.utils.addClass(tabLocations, 'hidden')
        }, 300);
    }
};
