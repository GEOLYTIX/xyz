const utils = require('./utils');

module.exports = function(){
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

//move map up on document scroll
    document.addEventListener('scroll', function () {
        document.getElementById('map').style['marginTop'] = -parseInt(window.pageYOffset / 2) + 'px';
    });

//add shadow to module header on content scroll
    const page_content = document.querySelectorAll('.page_content');
    for (let i = 0; i < page_content.length; i++) {
        page_content[i].addEventListener('scroll', function(){
            utils.addClass(this.previousElementSibling, 'shadow');
            if (this.scrollTop === 0) utils.removeClass(this.previousElementSibling, 'shadow');
        });
    }

//tab buttons
    const body = document.querySelector('html, body');
    const modules = document.querySelectorAll('.module');
    utils.addClass(modules, 'hidden');
    utils.removeClass(modules[0], 'hidden');

    if (!_xyz.catchments) document.querySelector('.tab_catchments').remove();

    _xyz.activateLayersTab = function (){
        let tab = document.querySelector('.tab_layers');
        utils.removeClass(tab.parentNode.children, 'active');
        utils.addClass(tab, 'active');
        utils.addClass(modules, 'hidden');
        utils.removeClass(document.getElementById('layers_module'), 'hidden');
    }

    _xyz.activateSelectTab = function (){
        let tab = document.querySelector('.tab_select');
        utils.removeClass(tab.parentNode.children, 'active');
        utils.addClass(tab, 'active');
        utils.addClass(modules, 'hidden');
        utils.removeClass(document.getElementById('select_module'), 'hidden');
    }

    let tab_buttons = document.querySelectorAll('.tab_bar .tab_btn');
    for (let i = 0; i < tab_buttons.length; i++) {
        tab_buttons[i].addEventListener('click', function(){
            utils.removeClass(this.parentNode.children, 'active');
            utils.addClass(this, 'active');
            utils.addClass(modules, 'hidden');
            utils.removeClass(modules[i], 'hidden');
        });
    }
};
