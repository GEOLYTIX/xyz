const utils = require('./utils');
const d3 = require('d3');

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
            classList: "block",
        });
        
        let title = utils.createElement('span', {
            textContent: options.label + ": "
        }, block);
        
        let span = utils.createElement('span', {
            classList: "bold",
            textContent: layer.style[options.style][options.property]
        }, block);
        
        /*function palette(options){
            
            let dim_x = 8, dim_y = 2;
            let a = 20;
            let c = 0;
           
            let colors = ['#69c242', '#64bbe3', '#ffcc00', '#ff7300', '#cf2030'];
            let color = d3.scaleOrdinal().range(colors);
            let width = (dim_x + 0.5)*a;
            let height = (dim_y + 0.5)*a;
            
            
            //let svg = options.appendTo.append('svg').attr('width', width).attr('height', height);
            let svg = d3.select(options.appendTo).append('svg').attr('width', width).attr('height', height);
            
            for(let i = 0; i < dim_x; i++){
                for(let j = 0; j < dim_y; j++){
                    
                    svg.append('rect')
                        .attr('width', a)
                        .attr('height', a)
                        .attr('x', i+i*a)
                        .attr('y', j + j*a)
                        .style('fill', color(c))
                        .on('click', function(){
                            console.log( this.style.fill);
                            options.appendTo.style.display = "none";
                    })
                        .style('cursor', 'pointer')
                        .append('title').text(color(c));
                    c++;
                }
            }
            //options.appendTo.style.display = "none";
        }*/
        
        function palette2(_options){
            let colors = ['#c62828', '#f50057', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b','#ffb300', '#fb8c00', '#f4511e', '#8d6e63', '#bdbdbd', '#78909c'];
            
            let color = d3.scaleOrdinal().range(colors);
            
            let _col_onclick = function(){
                
                _options.appendTo.style.display = "none";
                _options.appendTo.previousSibling.style.background = this.style.background;
                _options.appendTo.previousSibling.previousSibling.textContent = utils.rgbToHex(this.style.background);
                
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
                _col.style.background = color(i);
                _col.style.color = "transparent";
                _col.style.marginTop = '2px';
                _col.style.cursor = 'pointer';
                _col.style.borderRadius = '2px';
                _col.title = color(i);
                    
                _options.appendTo.appendChild(_col);
            }
        }
        
        let range_onclick = function(){
            this.nextSibling.style.display == 'none' ? this.nextSibling.style.display = "block" :  this.nextSibling.style.display = 'none';
        }
        
        let range = utils.createElement('div', {
            textContent: '&nbsp;',
            onclick: range_onclick
        });
        
        range.style.color = 'transparent';
        range.style.background = layer.style[options.style][options.property];
        range.style.cursor = 'pointer';
        range.style.borderRadius = '2px';
        
        block.appendChild(range);
        
        let color_pick = utils.createElement('div');
        
        //palette({appendTo: color_pick});
        palette2({appendTo: color_pick, style: options.style, property: options.property});
        
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
         label: "Highlight hue",
         style: "highlight",
         appendTo: style_section
     });
    
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

function color_picker(layer){
    
}

module.exports = {
    mvt_style: mvt_style
}