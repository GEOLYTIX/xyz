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
    
    // Add a filters div
    let filters = utils.createElement('div', {
        classList: 'settings filters'
    });
    
    filters.style.maxHeight = '30px';

    // Create control to toggle layer visibility.
    let div = utils.createElement('div', {
        textContent: 'Filtering',
        className: 'cursor noselect'
    });
    
    div.style.color = '#090';

    div.addEventListener('click', function () {
        if (filters.style.maxHeight === '30px') {
           
            filters.style.maxHeight = height.toString() + 'px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + height) + 'px';
            div.style.color = '#333';
        } else {
            filters.style.maxHeight = '30px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + 40) + 'px';
            div.style.color = '#090';
        }
    });
    filters.appendChild(div);
    
    let numeric_div = utils.createElement('div', {
        className: "filter--numeric"
    }),
        checkbox_div = utils.createElement('div', {
            className: "filter--checkbox"
        }),
        text_div = utils.createElement('div', {
            className: "filter--text"
        });
    
    numeric_div.style.marginLeft = "10px";
    checkbox_div.style.marginLeft = "10px";
    text_div.style.marginLeft = "10px";

    filters.style.color = '#090';
    
    Object.keys(layer.infoj).map(function(key){
        
        if(typeof(layer.infoj[key].filter) === "object"){
            
            let _field = layer.infoj[key].field,
                _label = layer.infoj[key].label;
            
            let _title = utils.createElement('h4', {
                textContent: _label
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
            
            let _field = layer.infoj[key].field,
                _label = layer.infoj[key].label,
                _table = layer.table,
                _content;
            
            
            if(layer.infoj[key].filter === "numeric"){
                
                _content = filter_numeric(layer, _field, _label, _table); 
                
                _content.style.marginLeft = '10px';
                
                numeric_div.appendChild(_content);
            }
            
            if(layer.infoj[key].filter === "like" || layer.infoj[key].filter ==="match"){
                
                let _content = filter_text(layer, layer.infoj[key].filter, _field, _label, _table); 

                _content.style.marginLeft = '10px';
                
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
function filter_text(layer, mode, field, label, table){
    let div = utils.createElement('div');
    
    let title = utils.createElement('h4', {
        textContent: label
    });
    
    div.appendChild(title);
    
    let input = utils.createElement('input', {
        id: table + "--" + field,
        placeholder: 'Search.'
    });
    
    function onkeyup(e){
        let id = this.id;
        let params = id.split("--");
        
        let table = params[0],
            field = params[1];
        
        let val = this.value;
        
        // apply filter function
        
        if(!layer.filter[field]) layer.filter[field] = {};
        layer.filter[field][mode] = val;
        
        //console.log(layer.filter);
        
        // apply filter to the layer;
        layer.getLayer();
        
    }
    
    input.addEventListener("keyup", onkeyup);
    
    input.style.width = "100%";
    
    div.appendChild(input);
    
    return div;
}


// create numeric filter 
function filter_numeric(layer, field, label, table){
    let div = utils.createElement('div');
   
    let title = utils.createElement('h4', {
        textContent: label
    });
    
    div.appendChild(title);
    
    let operators = [{name: "less than", val: "lt"}, {name: "greater than", val: "gt"}];
    
    let select = utils.createElement('select', {
        id: table + "--" + field + "--select",
    });
    
    Object.keys(operators).map(function(key){

        let operator = utils.createElement('option', {
            value: operators[key].val,
            textContent: operators[key].name
        }); 
        select.appendChild(operator);
    });
    
    select.selectedIndex = 0;
    
    select.addEventListener('change', function(){
        document.getElementById(table + "--" + field).value = null;
        layer.filter[field] = {};
        layer.getLayer();
    });
    
    div.appendChild(select);
    
    let input = utils.createElement('input', {
        id: table + "--" + field,
        placeholder: 'Set value.'
    });
    
    function onkeyup(e){
        let id = this.id;
        let params = id.split("--");
        let table = params[0], field = params[1];
        
        let operator = document.querySelector('.filters .filter--numeric select#' + id + "--select").value;
        
        let val = parseFloat(this.value);
        
        if(!layer.filter[field]) layer.filter[field] = {};
        layer.filter[field][operator] = val;
        
        // apply filter to the layer;
        if(val) layer.getLayer();

    }
    
    input.style.width = "100%";
    
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