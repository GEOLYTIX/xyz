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
        
        function get_colour(hex){
            let index;
            hex ? index = utils.get_index_by_value(_xyz.styles.default_palette, 'hex', hex) : index = utils.get_index_by_value(_xyz.styles.default_palette, 'hex', layer.style[options.style][options.property]);
            return index == -1 ? layer.style[options.style][options.property] : _xyz.styles.default_palette[index].name ? _xyz.styles.default_palette[index].name + " (" + 
            layer.style[options.style][options.property] + ")" : layer.style[options.style][options.property];
        }
        
        let span = utils.createElement('span', {
            classList: "bold",
            textContent: get_colour() || 'default',
        }, block);
        
        function palette(_options){
            
            let colours = _xyz.styles.default_palette;
            
            let _col_onclick = function(){
                
                let _colour = this.style.background, _hex = utils.rgbToHex(_colour);
                
                _options.appendTo.style.display = "none";
                _options.appendTo.previousSibling.style.background = _colour;
                _options.appendTo.previousSibling.previousSibling.textContent = get_colour(_hex) || _hex;
                
                layer.style[_options.style][_options.property] = _hex;
                
                layer.getLayer();
            }
            
            for(let i = 0; i < colours.length; i++){
                let _col = utils.createElement('div', {
                    textContent: '&nbsp;',
                    onclick: _col_onclick
                });
                _col.style.background = colours[i].hex;
                _col.style.color = "transparent";
                _col.style.marginTop = '2px';
                _col.style.cursor = 'pointer';
                _col.style.borderRadius = '2px';
                
                colours[i].name ? _col.title = colours[i].name + " (" + colours[i].hex + ")" : colours[i].hex; 
                    
                _options.appendTo.appendChild(_col);
            }
        }
        
        let range = utils.createElement('div', {
            textContent: '&nbsp;',
            onclick: function(){
                this.nextSibling.style.display == 'none' ? this.nextSibling.style.display = "block" : this.nextSibling.style.display = 'none';
            },
            onmouseleave: function(e){
                e.stopPropagation();
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
                e.stopPropagation();
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
    
    // if default palette is enabled on this layer
    if(layer.style.palette) {
        
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
    
    }
    
    
    let opacity_slider = utils.slider({
        title: "Stroke opacity: ",
        default: (!isNaN(layer.style.default.opacity) ? 100*layer.style.default.opacity : 100) + "%",
        min: 0,
        value: (!isNaN(layer.style.default.opacity) ? 100*layer.style.default.opacity : 100),
        max: 100,
        appendTo: style_section,
        oninput: function(e){
            let opacity = this.value;
            this.parentNode.previousSibling.textContent = parseInt(opacity) + "%";
            layer.style.default.opacity = (opacity/100).toFixed(2);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                layer.getLayer();
            }, 500);
        }
    });
    
    
    let fill_opacity_slider = utils.slider({
        title: "Fill opacity: ",
        default: (!isNaN(layer.style.default.fillOpacity) ? 100*layer.style.default.fillOpacity : 100) + "%",
        min: 0,
        value: (!isNaN(layer.style.default.fillOpacity) ? 100*layer.style.default.fillOpacity : 100),
        max: 100,
        appendTo: style_section,
        oninput: function(e){
            let fill_opacity = this.value;
            this.parentNode.previousSibling.textContent = parseInt(fill_opacity) + "%";
            layer.style.default.fillOpacity = (fill_opacity/100).toFixed(2);
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