const utils = require('./utils');

function applyFilters(layer){
    let enabled = 0;
    
    if(layer.infoj){
        Object.keys(layer.infoj).map(function(key){

            if(layer.infoj[key].filter){
                enabled += 50;
                if(layer.infoj[key].filter === "like" || layer.infoj[key].filter === 'match'){
                    enabled += 80;
                }
                if(layer.infoj[key].filter === "numeric"){
                    enabled += 80;
                }
                if(typeof(layer.infoj[key].filter) === 'object'){
                    Object.keys(Object.keys(layer.infoj[key].filter)).map(function(__key){
                        enabled += 50*Object.keys(Object.keys(layer.infoj[key].filter)).length;
                    });
                }
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
            textContent: 'Filter'
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

    let numeric_div = utils.createElement('div', {
        classList: "filter ctrl"
    }),
        checkbox_div = utils.createElement('div', {
            classList: "filter ctrl"
        }),
        text_div = utils.createElement('div', {
            classList: "filter ctrl"
        });
    
    Object.keys(layer.infoj).map(function(key){
        
        if(typeof(layer.infoj[key].filter) === "object"){
            
            let _field = layer.infoj[key].field,
                _label = layer.infoj[key].label;
            
            let _title = utils.createElement('span', {
                textContent: _label,
                classList: "filter-title"
            });
                    
            checkbox_div.appendChild(_title);
            
            Object.keys(layer.infoj[key].filter).map(function(_key){
                
                for(let val of layer.infoj[key].filter[_key]){
                    
                    let index = layer.infoj[key].filter[_key].indexOf(val),
                        _content;
                    
                    let options = {
                        id: layer.table + '--' + _field + "--" + index,
                        table: layer.table,
                        field: _field,
                        label: _label,
                        operator: 'in',
                        value: val
                    }
                    
                    _content = filter_checkbox(options, layer);
                    _content.style.marginLeft = '30px';
                    checkbox_div.appendChild(_content);
                }

            });
            
        } else {
        
            let _content;
            
            let options = {
                table: layer.table,
                field: layer.infoj[key].field,
                label: layer.infoj[key].label
            }
            
            
            if(layer.infoj[key].filter === "numeric"){
                
                // numeric operators defined here
                options.operators = [{name: "less than", val: "lt"},
                                     {name: "greater than", val: "gt"}];
                
                _content = filter_numeric(layer, options); 
                
                numeric_div.appendChild(_content);
            }
            
            if(layer.infoj[key].filter === "like" || layer.infoj[key].filter ==="match"){
                
                options.operator = layer.infoj[key].filter;
                
                let _content = filter_text(layer, options);
                
                text_div.appendChild(_content);
            }
        }
        
    });
    
    filters.appendChild(numeric_div);
    filters.appendChild(checkbox_div);
    filters.appendChild(text_div);
    
    return filters;
}

// create text filter
function filter_text(layer, options){
    
    let div = utils.createElement('div', {
        classList: "ctrl"
    });
    
    let title = utils.createElement('span', {
        textContent: options.label,
        classList: "filter-title"
    });
    
    div.appendChild(title);
    
    let input = utils.createElement('input', {
        id: layer.table + "--" + options.field,
        placeholder: 'Search.'
    });
    
    function onkeyup(e){
        
        let val = this.value;
        
        // apply filter to the layer;
        layer.filter[options.field] = {};
        layer.filter[options.field][options.operator] = val;
    
        layer.getLayer();
    }
    
    input.addEventListener("keyup", onkeyup);
    
    input.style.width = "100%";
    
    div.appendChild(input);
    
    return div;
}


// create numeric filter 
function filter_numeric(layer, options){
    
    let div = utils.createElement('div', {
        classList: "ctrl"
    });
   
    let title = utils.createElement('span', {
        textContent: options.label,
        classList: "filter-title"
    });
    
    div.appendChild(title);
    
    let select = utils.createElement('select');
    
    Object.keys(options.operators).map(function(key){

        let operator = utils.createElement('option', {
            value: options.operators[key].val,
            textContent: options.operators[key].name
        }); 
        select.appendChild(operator);
    });
    
    select.selectedIndex = 0;
    
    select.style.width = "44%";
    select.style.display = "inline-block";
    select.style.marginRight = "10px";
    
    options.operator = select[select.selectedIndex].value;
    
    select.addEventListener('change', function(){
        let val = parseFloat(document.getElementById(options.table + "--" + options.field).value);
        options.operator = this[this.selectedIndex].value;
        
        layer.filter[options.field] = {};
        layer.filter[options.field][options.operator] = val;
   
        if(val) layer.getLayer();
    });
    
    div.appendChild(select);
    
    let input = utils.createElement('input', {
        id: options.table + "--" + options.field,
        placeholder: 'Set value.'
    });
    
    function onkeyup(e){
        let id = this.id;
        let params = id.split("--");
        let table = params[0], field = params[1];
        
        let val = parseFloat(this.value);
        
        if(!layer.filter[options.field]) 
            layer.filter[options.field] = {};
        layer.filter[options.field][options.operator] = val;
        
        // apply filter to the layer;
        if(val) layer.getLayer();
        //console.log(layer.filter);
    }
    
    input.style.width = "48%";
    input.style.display = "inline-block";
    
    input.addEventListener("keyup", onkeyup);
    
    div.append(input);
    
    return div;
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
    let checkbox = utils.checkbox(filter_checkbox_onchange, {label: options.value, id: options.id});
    
    return checkbox;
}

module.exports = {
    applyFilters: applyFilters,
    layerFilters: layerFilters
}