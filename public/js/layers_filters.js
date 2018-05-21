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

function layerFilters(layer){
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
                utils.toggleExpanderParent({
                    expandable: filters,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });
    
    let block, title, content, remove_filter;
    
    function select_onchange(e){
        let _val = this.value, _select = this;
        
        _select.options[_select.selectedIndex].disabled = true;
        
        function enable_option(select, val){
            for(let opt of select.options){
                if(opt.value === val) opt.disabled = false;
            }
        }
        
        function remove_filter_onclick(e){
            e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
            delete layer.filter[_val];
            enable_option(_select, _val);
            layer.getLayer();
        }
        
        Object.keys(layer.infoj).map(function(key){
            if(layer.infoj[key].filter && layer.infoj[key].field === _val){
                
                if(typeof(layer.infoj[key].filter) === "object"){
                    
                    block = utils.createElement('div', {
                        classList: "block"
                    });
                
                    title = utils.createElement('div', {
                        innerHTML: layer.infoj[key].label + '<i class="material-icons">clear</i>',
                        classList: "title",
                        onclick: remove_filter_onclick
                    }, block);
                    
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
                    
                    if(layer.infoj[key].filter === "numeric"){
                        
                        block = utils.createElement('div', {
                            classList: "block"
                        });
                        
                        title = utils.createElement('div', {
                            //textContent: layer.infoj[key].label,
                            innerHTML: layer.infoj[key].label + '<i class="material-icons">clear</i>',
                            classList: "title",
                            onclick: remove_filter_onclick
                        }, block);
                        
                        let options = {
                            field: layer.infoj[key].field,
                            label: layer.infoj[key].label,
                            appendTo: block
                        }
                        
                        filter_numeric(layer, options); 
                        filters.appendChild(block);
                    }
                    
                    if(layer.infoj[key].filter === "like" || layer.infoj[key].filter ==="match"){
                        
                        block = utils.createElement('div', {
                            classList: "block"
                        });
                        
                        title = utils.createElement('div', {
                            //textContent: layer.infoj[key].label,
                            innerHTML: layer.infoj[key].label + '<i class="material-icons">clear</i>',
                            classList: "title",
                            onclick: remove_filter_onclick
                        }, block);
                        
                        let options = {
                            field: layer.infoj[key].field,
                            label: layer.infoj[key].label,
                            appendTo: block
                        }
                        
                        options.operator = layer.infoj[key].filter;
                        
                        filter_text(layer, options);
                        filters.appendChild(block);
                    }
                    
                    if(layer.infoj[key].filter === "date"){
                        block = utils.createElement('div', {
                            classList: "block"
                        });
                        
                        title = utils.createElement('div', {
                            //textContent: layer.infoj[key].label,
                            classList: "title",
                            innerHTML: layer.infoj[key].label + '<i class="material-icons">clear</i>',
                            onclick: remove_filter_onclick
                        }, block);
                        
                        let options = {
                            field: layer.infoj[key].field,
                            label: layer.infoj[key].label,
                            appendTo: block
                        }
                        
                        // filter date function
                        filter_date(layer, options);
                        filters.appendChild(block);
                    }
                }
            }
        });
        //this.value = null;
        this.selectedIndex = 0;
    }
    
    let select = utils.createElement('select', {
        onchange: select_onchange,
        innerHTML: "<option selected>Select filter from list.</option>"
    });
    
    Object.keys(layer.infoj).map(function(key){
        if(layer.infoj[key].filter){
            utils.createElement("option", {
                value: layer.infoj[key].field,
                textContent: layer.infoj[key].label
            }, select);
        }
    });
    
    
    function run_onclick(e){
        //console.log('apply filter to layer');
        layer.xhr.open('GET', host + 'q_aggregate?' + utils.paramString({
            dbs: layer.dbs,
            table_source: layer.table,
            table_target: _xyz.locales[_xyz.locale].layers[layer.aggregate_layer].table,
            filter: JSON.stringify(layer.filter),
            geom_target: undefined,
            geom_source: undefined
        }));
        
        layer.xhr.onload = function(){
            let json = JSON.parse(this.response);
            //console.log(json);
            if(this.status === 200){
                _xyz.select.selectLayerFromEndpoint({
                            layer: layer.aggregate_layer,
                            table: _xyz.locales[_xyz.locale].layers[layer.aggregate_layer].table,
                            id: json.id,
                            marker: [json.lng, json.lat],
                            filter: JSON.stringify(layer.filter)
                        });
            }
        };
        layer.xhr.send();
        
    }
    
    /*let reset_onclick = function(){
        console.log('reset all filters');
        /*let siblings = options.appendTo.children;
        for(let sibling of siblings){
            if(sibling.tagName === 'INPUT'){
                sibling.value = '';
            }
        }
        this.style.display = "none";
        layer.filter[options.field] = {};
        layer.getLayer();*/
    /*}
    
    let reset = utils.createElement('div', {
        classList: "btn_small cursor noselect",
        textContent: "Reset",
        onclick: reset_onclick
    }, filters);*/
    
    filters.appendChild(select);
    
    let run = utils.createElement('div', {
        classList: "btn_wide cursor noselect",
        onclick: run_onclick,
        textContent: "Run Output"
    });
    
    run.style.display = "block";
    //run.style.display = "none";
    filters.appendChild(run);
    
    return filters;
}

/*function layerFilters2(layer){
    
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
                utils.toggleExpanderParent({
                    expandable: filters,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
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
            }, block);
            
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

            if(layer.infoj[key].filter === "numeric"){
                
                block = utils.createElement('div', {
                    classList: "block"
                });
                
                title = utils.createElement('div', {
                    textContent: layer.infoj[key].label,
                    classList: "title"
                }, block);
                
                let options = {
                    field: layer.infoj[key].field,
                    label: layer.infoj[key].label,
                    appendTo: block
                }
                
                filter_numeric(layer, options); 
                filters.appendChild(block);
            }
            
            if(layer.infoj[key].filter === "like" || layer.infoj[key].filter ==="match"){
                
                block = utils.createElement('div', {
                    classList: "block"
                });
                
                title = utils.createElement('div', {
                    textContent: layer.infoj[key].label,
                    classList: "title"
                }, block);
                
                let options = {
                    field: layer.infoj[key].field,
                    label: layer.infoj[key].label,
                    appendTo: block
                }
                
                options.operator = layer.infoj[key].filter;

                filter_text(layer, options);
                filters.appendChild(block);

            }
            
            if(layer.infoj[key].filter === "date"){
                block = utils.createElement('div', {
                    classList: "block"
                });
                
                title = utils.createElement('div', {
                    textContent: layer.infoj[key].label,
                    classList: "title"
                }, block);
                
                let options = {
                    field: layer.infoj[key].field,
                    label: layer.infoj[key].label,
                    appendTo: block
                }
                
                // filter date function
                filter_date(layer, options);
                filters.appendChild(block);
            }
        }
        
    });
    
    function run_onclick(e){
        //console.log('apply filter to layer');
        layer.xhr.open('GET', host + 'q_aggregate?' + utils.paramString({
            dbs: layer.dbs,
            table_source: layer.table,
            table_target: _xyz.locales[_xyz.locale].layers[layer.aggregate_layer].table,
            filter: JSON.stringify(layer.filter),
            geom_target: undefined,
            geom_source: undefined
        }));
        
        layer.xhr.onload = function(){
            let json = JSON.parse(this.response);
            //console.log(json);
            if(this.status === 200){
                _xyz.select.selectLayerFromEndpoint({
                            layer: layer.aggregate_layer,
                            table: _xyz.locales[_xyz.locale].layers[layer.aggregate_layer].table,
                            id: json.id,
                            marker: [json.lng, json.lat],
                            filter: JSON.stringify(layer.filter)
                        });
            }
        };
        layer.xhr.send();
        
    }
    
    let run = utils.createElement('div', {
        classList: "btn_wide cursor noselect",
        onclick: run_onclick,
        textContent: "Run Output"
    });
    
    run.style.display = "block";
    filters.appendChild(run);

    return filters;
}*/

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
        
        if(typeof(val) == "number") {
            layer.filter[options.field][this.name] = val;
        } else {
            layer.filter[options.field][this.name] = null;
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

function filter_date(layer, options){
    
    // default date strings
    let def_dd = "01", def_mm = "01",
        date_format = [];
    
    date_format[1] = def_mm;
    date_format[2] = def_dd;
    
    function date_to_string(arr){
        return "'" + arr.join("-") + "'";
    }
    
    function show_reset(){
        let siblings = options.appendTo.children;
        for(let sibling of siblings){
            if(sibling.tagName === 'DIV' && sibling.classList.contains("btn_small")){
                sibling.style.display = "block";
            }
        }
    }
    
    // sql and keyups
    function yy_onkeyup(){
        let yyyy = parseInt(this.value);
        if(this.value) show_reset();
        if(!layer.filter[options.field]) layer.filter[options.field] = {};
        if(yyyy && yyyy > 99) {
            date_format[0] = yyyy;
            layer.filter[options.field][this.name] = date_to_string(date_format);
        } else {
            date_format[0] = null;
            layer.filter[options.field] = {};
        }
        layer.getLayer();
    }
    
    function mm_onkeyup(){
        let mm = parseInt(this.value);
        if(this.value) show_reset();
        if(mm && mm > 0 && mm < 13){
            if(mm < 10)  mm = '0' + String(mm);
            date_format[1] = mm;
            if(date_format[0]) layer.filter[options.field][this.name] = date_to_string(date_format);
        } else {
            date_format[1] = def_mm;
        }
        layer.getLayer();
    }
    
    function dd_onkeyup(){
        let dd = parseInt(this.value);
        if(this.value) show_reset();
        if(dd && dd > 0 && dd < 32){
            if(dd < 10) dd = '0' + String(dd);
            date_format[2] = dd;
            if(date_format[0]) layer.filter[options.field][this.name] = date_to_string(date_format);
        } else {
            date_format[2] = def_dd;
        }
        layer.getLayer();
    }
    
   // labels
    let gte_label = utils.createElement('div', {
        classList: "label half",
        textContent: "later than"
    }, options.appendTo);
    
    let lte_label = utils.createElement('div', {
        classList: "label half right",
        textContent: "earlier than"
    }, options.appendTo);
    
     // later or equal
    let gte_input_yy = utils.createElement('input', {
        classList: "label third",
        placeholder: 'yyyy',
        onkeyup: yy_onkeyup,
        name: "gte"
    }, options.appendTo);
    
    let gte_input_mm = utils.createElement('input', {
        classList: "label third",
        placeholder: 'mm',
        onkeyup: mm_onkeyup
    }, options.appendTo);
    
    let gte_input_dd = utils.createElement('input', {
        classList: "label third",
        placeholder: 'dd',
        onkeyup: dd_onkeyup
    }, options.appendTo);
    
    // earlier or equal 
    let lte_input_dd = utils.createElement('input', {
        classList: "label third right",
        placeholder: 'dd',
        onkeyup: dd_onkeyup
    }, options.appendTo);
        
    let lte_input_mm = utils.createElement('input', {
        classList: "label third right",
        placeholder: 'mm',
        onkeyup: mm_onkeyup
    }, options.appendTo);
    
    let lte_input_yy = utils.createElement('input', {
        classList: "label third right",
        placeholder: 'yyyy',
        onkeyup: yy_onkeyup,
        name: "lte"
    }, options.appendTo);
    
    let reset_onclick = function(){
        let siblings = options.appendTo.children;
        for(let sibling of siblings){
            if(sibling.tagName === 'INPUT'){
                sibling.value = '';
            }
        }
        this.style.display = "none";
        layer.filter[options.field] = {};
        layer.getLayer();
    }
    
    let reset = utils.createElement('div', {
        classList: "btn_small cursor noselect",
        textContent: "Reset",
        onclick: reset_onclick
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