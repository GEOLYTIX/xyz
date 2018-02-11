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


    // _xyz.location ?
    //     utils.addClass(document.querySelector('.tab_location'), 'active') :
    //     _xyz.grid ?
    //         utils.addClass(document.querySelector('.tab_grid'), 'active') :
    //         _xyz.drivetime ?
    //             utils.addClass(document.querySelector('.tab_drivetime'), 'active') :
    //             utils.addClass(document.querySelector('.tab_statistics'), 'active');


    // if (!settings.location) document.querySelector('.tab_location').remove();

    // if (!settings.grid) document.querySelector('.tab_grid').remove();

    // if (!settings.drivetime) document.querySelector('.tab_drivetime').remove();

    // if (!settings.vector) document.querySelector('.tab_statistics').remove();

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
