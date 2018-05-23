const utils = require('./utils');

function mvt_style(layer){
    
    let style_section = utils.createElement('div', {
        classList: 'section expandable'
    });
    
    utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Style settings'
        },
        appendTo: style_section,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: style_section,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });
    
    
    let timeout;
    
    let opacity_slider_oninput = function(e){
        this.parentNode.previousSibling.textContent = parseInt(this.value) + "%";
        layer.style.default.opacity = (this.value/100).toFixed(2);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            layer.getLayer();
        }, 500);
    }
    
    let opacity_slider = utils.slider({
        title: "Stroke opacity: ",
        default: 100*layer.style.default.opacity + "%",
        min: 0,
        value: 100*layer.style.default.opacity,
        max: 100,
        appendTo: style_section,
        oninput: opacity_slider_oninput
    });
    
    let fill_opacity_slider_oninput = function(e){
        this.parentNode.previousSibling.textContent = parseInt(this.value) + "%";
        layer.style.default.fillOpacity = (this.value/100).toFixed(2);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            layer.getLayer();
        }, 500);
    }
    
    let fill_opacity_slider = utils.slider({
        title: "Fill opacity: ",
        default: 100*layer.style.default.fillOpacity + "%",
        min: 0,
        value: 100*layer.style.default.fillOpacity,
        max: 100,
        appendTo: style_section,
        oninput: fill_opacity_slider_oninput
    });
    
    
    return style_section;
}

module.exports = {
    mvt_style: mvt_style
}