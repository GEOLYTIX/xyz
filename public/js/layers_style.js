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
    
    function color_picker(layer, options){
        
        let block = utils.createElement('div', {
            classList: "block"
        });
        
        let title = utils.createElement('span', {
            textContent: options.label + ": "
        }, block);
        
        let span = utils.createElement('span', {
            classList: "bold",
            textContent: _xyz.styles.default_palette[utils.get_index_by_value(_xyz.styles.default_palette, 'hex', layer.style[options.style][options.property])].name + " (" + 
            layer.style[options.style][options.property] + ")" || layer.style[options.style][options.property]
        }, block);
        
        function palette(_options){
            
            let colors = _xyz.styles.default_palette;
            
            let _col_onclick = function(){
                
                let _color = this.style.background;
                
                _options.appendTo.style.display = "none";
                _options.appendTo.previousSibling.style.background = _color;
               
                let idx = utils.get_index_by_value(colors, 'hex', utils.rgbToHex(_color));
               
                colors[idx].name ? _options.appendTo.previousSibling.previousSibling.textContent = colors[idx].name + " (" + colors[idx].hex + ")" : colors[idx].hex;
                
                layer.style[_options.style][_options.property] = utils.rgbToHex(this.style.background);
                
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    layer.getLayer();
                }, 500);
            }
            
            for(let i = 0; i < colors.length; i++){
                let _col = utils.createElement('div', {
                    textContent: '&nbsp;',
                    onclick: _col_onclick
                });
                _col.style.background = colors[i].hex;
                _col.style.color = "transparent";
                _col.style.marginTop = '2px';
                _col.style.cursor = 'pointer';
                _col.style.borderRadius = '2px';
                _col.title = colors[i].hex;
                
                colors[i].name ? _col.title = colors[i].name + " (" + colors[i].hex + ")" : _col.title = colors[i].hex;
                    
                _options.appendTo.appendChild(_col);
            }
        }
        
        let range = utils.createElement('div', {
            textContent: '&nbsp;',
            onclick: function(){
                this.nextSibling.style.display == 'none' ? this.nextSibling.style.display = "block" : this.nextSibling.style.display = 'none';
            },
            onmouseleave: function(e){
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    e.target.nextSibling.style.display = "none";
                }, 1.5*1000);
            }
        });    

        range.style.color = 'transparent';
        range.style.background = layer.style[options.style][options.property];
        range.style.cursor = 'pointer';
        range.style.borderRadius = '2px';
        range.style.boxShadow = "1px 1px 1px 1px rgba(0,0,0,0.3)";
        
        block.appendChild(range);
        
        let color_pick = utils.createElement('div', {
            onmouseleave: function(e){
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    e.target.style.display = "none";
                }, 1.5*1000);
            }
        });
        
        palette({appendTo: color_pick, style: options.style, property: options.property});
        
        color_pick.style.display = "none";
        block.appendChild(color_pick);
        
        options.appendTo.appendChild(block);

    }
    
     color_picker(layer, {
         property: "fillColor",
         label: "Fill",
         style: "default",
         appendTo: style_section
     });
    
    color_picker(layer, {
         property: "color",
         label: "Stroke",
         style: "default",
         appendTo: style_section
     });
    
    color_picker(layer, {
         property: "color",
         label: "Highlight",
         style: "highlight",
         appendTo: style_section
     });
    
    
    let opacity_slider = utils.slider({
        title: "Stroke opacity: ",
        default: 100*layer.style.default.opacity + "%",
        min: 0,
        value: 100*layer.style.default.opacity,
        max: 100,
        appendTo: style_section,
        oninput: function(e){
            this.parentNode.previousSibling.textContent = parseInt(this.value) + "%";
            layer.style.default.opacity = (this.value/100).toFixed(2);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                layer.getLayer();
            }, 500);
        }
    });
    
    
    let fill_opacity_slider = utils.slider({
        title: "Fill opacity: ",
        default: 100*layer.style.default.fillOpacity + "%",
        min: 0,
        value: 100*layer.style.default.fillOpacity,
        max: 100,
        appendTo: style_section,
        oninput: function(e){
            this.parentNode.previousSibling.textContent = parseInt(this.value) + "%";
            layer.style.default.fillOpacity = (this.value/100).toFixed(2);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                layer.getLayer();
            }, 500);
        }
    });
    
    return style_section;
}

module.exports = {
    mvt_style: mvt_style
}