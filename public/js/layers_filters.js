const utils = require('./utils');

function applyFilters(layer){
    let enabled = false;
    
    if(layer.infoj){
        Object.keys(layer.infoj).map(function(key){

            if(layer.infoj[key].filter){
                enabled = true;
            }
        });
        return enabled;
        
    } else {
        return false;
    }
}

function layerFilters(layer, height){
    
    let filters = utils.createElement('div', {
        classList: 'section expandable'
    });

    utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Filtering'
        },
        appendTo: filters,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent(e.target, filters, true)
            }
        }
    });
    
    let block, title, content;
    
    Object.keys(layer.infoj).map(function(key){
        
        if(typeof(layer.infoj[key].filter) === "object"){
            
            block = utils.createElement('div', {
                classList: "block"
            });
            
            title = utils.createElement('div', {
                textContent: layer.infoj[key].label,
                classList: "title"
            });
                    
            block.appendChild(title);
            
            Object.keys(layer.infoj[key].filter).map(function(_key){
                
                for(let val of layer.infoj[key].filter[_key]){
                    
                    let index = layer.infoj[key].filter[_key].indexOf(val);
                    
                    let options = {
                        field: layer.infoj[key].field,
                        operator: 'in',
                        value: val
                    }
                    
                    content = filter_checkbox(options, layer);
                    block.appendChild(content);
                }

            });
            filters.appendChild(block);
            
        } else {
            
            block = utils.createElement('div', {
                classList: "block"
            });
            
            title = utils.createElement('div', {
                textContent: layer.infoj[key].label,
                classList: "title"
            });
            
            block.appendChild(title);
            
            let options = {
                field: layer.infoj[key].field,
                label: layer.infoj[key].label,
                appendTo: block
            }
            
            
            if(layer.infoj[key].filter === "numeric"){
                
                filter_numeric(layer, options); 
                filters.appendChild(block);
            }
            
            if(layer.infoj[key].filter === "like" || layer.infoj[key].filter ==="match"){
                
                options.operator = layer.infoj[key].filter;

                filter_text(layer, options);
                filters.appendChild(block);

            }
        }
        
    });

    return filters;
}

// create text filter
function filter_text(layer, options){
    
    function onkeyup(e){
        let val = this.value;
        layer.filter[options.field] = {};
        layer.filter[options.field][this.name] = val;
        layer.getLayer();
    }
    
    let input = utils.createElement('input', {
        placeholder: 'Search.',
        onkeyup: onkeyup,
        name: options.operator
    }, options.appendTo);
    
}

// create numeric filter 
function filter_numeric(layer, options){
    
    function onkeyup(e){
        
        let val = parseFloat(this.value);
        
        if(!layer.filter[options.field]) layer.filter[options.field] = {};
        
        if(val) {
            layer.filter[options.field][this.name] = val;
        }
        layer.getLayer();
    }
    
    let gt_label = utils.createElement('div', {
        classList: "label half",
        textContent: "> greater than"
    }, options.appendTo);
    
    let lt_label = utils.createElement('div', {
        classList: "label half right",
        textContent: "< less than"
    }, options.appendTo);
    
    let gt_input = utils.createElement('input', {
        classList: "label half",
        placeholder: 'Set value.',
        name: "gt",
        onkeyup: onkeyup
    }, options.appendTo);
    
    let lt_input = utils.createElement('input', {
        classList: "label half right",
        placeholder: 'Set value.',
        onkeyup: onkeyup,
        name: "lt"
    }, options.appendTo);
}

// create checkbox filter
function filter_checkbox(options, layer){
    
    function filter_checkbox_onchange(e){
        
        if(!layer.filter[options.field]) 
            layer.filter[options.field] = {
                [options.operator]: []
            };
        
        if(this.checked){
            layer.filter[options.field][options.operator].push(options.value);
            layer.getLayer();
        } else {
            layer.filter[options.field][options.operator].splice(layer.filter[options.field][options.operator].indexOf(options.value), 1);
            layer.getLayer();
        }
    }
    let checkbox = utils.checkbox(filter_checkbox_onchange, {label: options.value});
    
    return checkbox;
}

module.exports = {
    applyFilters: applyFilters,
    layerFilters: layerFilters
}