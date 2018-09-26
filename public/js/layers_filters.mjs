import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

export default (layer, panel) => {

    // Add filter block to layer panel.
    let filters = utils._createElement({
        tag: 'div',
        options: {
            classList: 'section expandable'
        },
        appendTo: panel
    });

    // Filter control expander.
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

    // disable the list if everything is selected
    function toggle_select(select, title) {
        let _array = Array.from(select.options);
        if (!title) _array.shift();
        _array = _array.map((item) => item.disabled);
        select.disabled = _array.reduce((acc, curr) => acc + curr) == _array.length ? true : false;
    }

    // add aggregate layer button
    function add_run_button() {

        let run = utils.createElement('div', {
            classList: "btn_wide cursor noselect",
            textContent: "Run Output",
            onclick: () => {


                
                layer.xhr.open('GET', _xyz.ws.host + '/api/location/aggregate?' + utils.paramString({
                    locale: _xyz.ws.locale,
                    layer: layer.layer,
                    token: _xyz.ws.token,
                    filter: JSON.stringify(layer.filter) || ''
                }));

                layer.xhr.onload = e => {
                    if (e.target.status === 200) {
                        let json = JSON.parse(e.target.response);
                    
                        _xyz.ws.select.selectLayerFromEndpoint({
                            layer: layer.aggregate_layer,
                            table: _xyz.ws.locales[_xyz.ws.locale].layers[layer.aggregate_layer].table,
                            id: json.id,
                            marker: [json.lng, json.lat],
                            filter: JSON.stringify(layer.filter) || ''
                        });
                    }
                };
                layer.xhr.send();
            }
        });
        run.style.display = "none";
        filters.appendChild(run);
    }

    function select_onchange(e) {

        let _val = this.value,
            _select = this;

        // disable selected option
        _select.options[_select.selectedIndex].disabled = true;

        // show run button only if aggregate layer enabled
        if (layer.aggregate_layer) filters.lastChild.style.display = "block";

        // show clear all button
        _select.nextSibling.style.display = "block";

        // enable option back
        function enable_option(select, val) {
            for (let opt of select.options) {
                if (opt.value === val) opt.disabled = false;
            }
            toggle_select(select);
        }

        // check if list should be still active
        toggle_select(_select);

        // remove unwanted filter
        function remove_filter_onclick(e) {

            if (e.target.parentNode.parentNode.classList.contains("block")) e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);

            delete layer.filter[_val];
            enable_option(_select, _val);
            layer.getLayer();

            // hide run button when last filter block is removed
            if (!_select.nextSibling.nextSibling.classList.contains('block')) {
                if (!filters.lastChild.classList.contains("block")) {
                    filters.lastChild.style.display = "none";
                    clear_all.style.display = "none";
                }
            };
        }
        
        function processInfoj(val, entry){
            if(entry.filter && entry.field === val){
                
                if(typeof(entry.filter) == "object"){
                    
                    block = utils._createElement({
                        tag: "div",
                        options: {
                            classList: "block"
                        }
                    });
                    
                    let title_div = utils._createElement({
                        tag: "div",
                        options: {
                            //innerHTML: entry.label + '<i class="material-icons">clear</i>',
                            classList: "title",
                            onclick: remove_filter_onclick
                        }, 
                        appendTo: block
                    });

                    utils._createElement({
                        tag: "i",
                        options: {
                            classList: "material-icons",
                            textContent: "clear"
                        },
                        appendTo: title_div
                    });
                    
                    Object.values(entry.filter).forEach(_value => {
                        for(let __value of _value){
                            let index = _value.indexOf(__value);
                            let options = {
                                field: val,
                                operator: 'in',
                                value: __value
                            }
                            content = filter_checkbox(options, layer);
                            block.appendChild(content);
                        }
                    });
                    
                    filters.insertBefore(block, filters.lastChild);
                    
                } else {
                    if(entry.filter === "numeric") {
                        
                        block = utils._createElement({
                            tag: "div",
                            options: {
                                classList: "block"
                            }
                        });
                        
                        utils._createElement({
                            tag: "div",
                            options: {
                                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                                classList: "title",
                                onclick: remove_filter_onclick
                            },
                            appendTo: block
                        });

                        let options = {
                            field: entry.field,
                            label: entry.label,
                            appendTo: block
                        }
                        //console.log(layer);

                        let _options = {
                                field: entry.field,
                                max: layer.idx[entry.field].max,
                                min: layer.idx[entry.field].min,
                                value: [layer.idx[entry.field].min, layer.idx[entry.field].max],
                                appendTo: block
                            };

                            //console.log(_options);
                        //filter_numeric(layer, options);
                        filter_range(layer, _options);
                        filters.insertBefore(block, filters.lastChild);
                    };
                    if(entry.filter === "like" || entry.filter === "match") {
                        
                        block = utils._createElement({
                            tag: "div", 
                            options: {
                                classList: "block"
                            }
                        });

                        utils._createElement({
                            tag: "div", 
                            options: {
                                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                                classList: "title",
                                onclick: remove_filter_onclick
                            }, 
                            appendTo: block
                        });

                        let options = {
                            field: entry.field,
                            label: entry.label,
                            appendTo: block
                        }

                        options.operator = entry.filter;

                        filter_text(layer, options);
                        filters.insertBefore(block, filters.lastChild);
                    };
                    if(entry.filter === "date") {
                        
                        block = utils._createElement({
                            tag: "div",
                            options: {
                                classList: "block"
                            }
                        });

                        title = utils._createElement({
                            tag: "div",
                            options: {
                                classList: "title",
                                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                                onclick: remove_filter_onclick
                            },
                            appendTo: block
                        });

                        let options = {
                            field: entry.field,
                            label: entry.label,
                            appendTo: block
                        }

                        // filter date function
                        filter_date(layer, options);
                        filters.insertBefore(block, filters.lastChild);
                    }
                }
            }
        }
        
        // process filters from infoj
        Object.values(layer.infoj).map(item => {
            if(item.type === "group"){
                Object.values(item.items).map(_item => {
                    processInfoj(_val, _item);
                });
            } else {
                processInfoj(_val, item);
            }
        });

        this.selectedIndex = 0;
    }

    let select = utils._createElement({
        tag: 'select', 
        options: {
            onchange: select_onchange,
            innerHTML: "<option selected>Select filter from list.</option>"
        }
    });
    
    function createOptions(select, entry){
        if (entry.filter) {
            utils.createElement("option", {
                value: entry.field,
                textContent: entry.label
            }, select);
        }
    }
    
    // add options to select
    Object.values(layer.infoj).forEach(entry => {
        if(entry.type === "group"){
            Object.values(entry.items).map(item => {
                createOptions(select, item)
            });
        } else {
            createOptions(select, entry);
        }
    });


    let clear_all = utils._createElement({
        tag: "div", 
        options: {
            classList: "btn_small cursor noselect",
            textContent: "Clear",
            onclick: function (e) {
                let siblings = this.parentNode.children;
                
                // enable select options
                for (let sibling of siblings) {
                    if (sibling.tagName == 'SELECT') {
                        for (let opt of sibling.options) {
                            opt.disabled = false;
                        }
                        toggle_select(sibling);
                    }
                }
                
                while (this.nextSibling !== this.parentNode.lastChild) {
                    this.parentNode.removeChild(this.nextSibling);
                }
                
                // remove applied filters
                Object.keys(layer.filter).map(key => {
                    delete layer.filter[key];
                });
                
                // hide filtering buttons, reload layer.
                this.style.display = "none";
                
                // hide aggregate button if enabled 
                if (layer.aggregate_layer) this.parentNode.lastChild.style.display = "none";
                layer.getLayer();
            }
        }
    });

    filters.appendChild(select);
    filters.appendChild(clear_all);

    add_run_button();
}

// create text filter
function filter_text(layer, _options) {

    function onkeyup(e) {
        let val = this.value;
        if (!layer.filter[_options.field]) layer.filter[_options.field] = {};
        layer.filter[_options.field][this.name] = val;
        layer.getLayer();
    }

    /*let input = utils.createElement('input', {
        placeholder: 'Search.',
        onkeyup: onkeyup,
        name: _options.operator
    }, _options.appendTo);*/
    
    utils._createElement({
        tag: "input",
        options: {
            placeholder: 'Search.',
            onkeyup: onkeyup,
            name: _options.operator
        },
        appendTo: _options.appendTo
    });
}

// create numeric filter 
function filter_numeric(layer, options) {

    function onkeyup(e) {
        let val = parseFloat(this.value);
        if (!layer.filter[options.field]) layer.filter[options.field] = {};
        if (typeof (val) == "number") {
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

 // create range filter
function filter_range(layer, options){

    function oninput(e) {
        let val = parseFloat(e.target.value);
        if (!layer.filter[options.field]) layer.filter[options.field] = {};
        if (typeof(val) == "number") {
            layer.filter[options.field][e.target.name] = val;
        } else {
            layer.filter[options.field][e.target.name] = null;
        }
        //console.log(layer.filter);
        //layer.getLayer();
    }

    function onchange(e){
        //console.log(layer.filter);
        layer.getLayer();
    }

    let tl = utils._createElement({
        tag: "div",
        options: {
            classList: "range-tooltip _min",
            textContent: "Min " + options.min,
            name: "gt"
        },
        appendTo: options.appendTo
    });


    let range_div = utils._createElement({
        tag: 'div', 
        options: {
            className: "range"
        },
        appendTo: options.appendTo
    });

    let range = utils._createElement({
        tag: "input",
        options: {
            type: 'range',
            min: options.min,
            max: options.max,
            value: options.min,
            name: "gt",
            oninput: e => {
                tl.textContent = "Min " + e.target.value;
                oninput(e);
            },
            onchange: e => onchange(e)
        },
        appendTo: range_div
    });

    let tl2 = utils._createElement({
        tag: "div",
        options: {
            classList: "range-tooltip _max",
            textContent: "Max " + options.max
        },
        /*style: {
            float: "right",
            margin-bottom: "5px"
        },*/
        appendTo: options.appendTo
    });


    let range_div2 = utils._createElement({
        tag: 'div', 
        options: {
            className: "range"
        },
        appendTo: options.appendTo
    });

    let range2 = utils._createElement({
        tag: "input",
        options: {
            type: 'range',
            min: options.min,
            max: options.max,
            value: options.max,
            name: "lt",
            oninput: e => {
                tl2.textContent = "Max " + e.target.value;
                oninput(e);
            },
            onchange: e => onchange(e)
        },
        appendTo: range_div2
    });

}

// create date filter
function filter_date(layer, options) {

    // default date strings
    let def = {
        dd: "01",
        mm: "01",
        df: []
    }
    
    def.df[1] = def.mm;
    def.df[2] = def.dd;

    function date_to_string(arr) {
        return "'" + arr.join("-") + "'";
    }

    function show_reset() {
        let siblings = options.appendTo.children;
        for (let sibling of siblings) {
            if (sibling.tagName === 'DIV' && sibling.classList.contains('btn_small')) {
                sibling.style.display = 'block';
            }
        }
    }

    // sql and keyups
    
    function onkeyup(e, format){
        let val = parseInt(e.target.value);
        if (e.target.value) show_reset();
        
        switch(format){
            case "dd": 
                if (val && val > 0 && val < 32) {
                if (val < 10) val = '0' + String(val);
                def.df[2] = val;
                if (def.df[0]) layer.filter[options.field][e.target.name] = date_to_string(def.df);
            } else {
                def.df[2] = def[format];
            }; break;
            
            case "mm": 
                if (val && val > 0 && val < 13) {
                    if (val < 10) val = '0' + String(val);
                    def.df[1] = val;
                    if (def.df[0]) layer.filter[options.field][e.target.name] = date_to_string(def.df);
                } else {
                    def.df[1] = def[format];
                }; break;
            
            case "yyyy": 
                if (!layer.filter[options.field]) layer.filter[options.field] = {};
                if (val && val > 99) {
                    def.df[0] = val;
                    layer.filter[options.field][e.target.name] = date_to_string(def.df);
                } else {
                    def.df[0] = null;
                    layer.filter[options.field] = {};
                }; break;
        }
        layer.getLayer();
    }

    // labels
    // later than label
    utils._createElement({
        tag: "div", 
        options: {
            classList: "label half",
            textContent: "later than"
        }, 
        appendTo: options.appendTo
    });

    // earlier than label
    utils._createElement({
        tag: "div", 
        options: {
            classList: "label half right",
            textContent: "earlier than"
        }, 
        appendTo: options.appendTo
    });

    // later than year input
    utils._createElement({
        tag: 'input', 
        options: {
            classList: "label third",
            placeholder: 'yyyy',
            name: "gte"
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "yyyy")
        },
        appendTo: options.appendTo
    });

    // later than month input
    utils._createElement({
        tag: 'input',
        options: {
            classList: "label third",
            placeholder: 'mm'
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "mm")
        },
        appendTo: options.appendTo
    });
    
    // later than day input
    utils._createElement({
        tag: 'input', 
        options: {
            classList: "label third",
            placeholder: 'dd'
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "dd")
        },
        appendTo: options.appendTo
    });

    // earlier than day input
    utils._createElement({
        tag: 'input', 
        options: {
            classList: "label third right",
            placeholder: 'dd'
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "dd")
        },
        appendTo: options.appendTo
    });
    
    // earlier than month input
    utils._createElement({
        tag: 'input', 
        options: {
            classList: "label third right",
            placeholder: 'mm'
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "mm")
        },
        appendTo: options.appendTo
    });

    // earlier than year input
    utils._createElement({
        tag: 'input',
        options: {
            classList: "label third right",
            placeholder: 'yyyy',
            name: "lte"
        }, 
        eventListener: {
            event: "keyup",
            funct: e => onkeyup(e, "yyyy")
        },
        appendTo: options.appendTo
    });

    utils._createElement({
        tag: 'div', 
        options: {
            classList: "btn_small cursor noselect",
            textContent: "Reset"
        }, 
        eventListener: {
            event: "click",
            funct: e => {
                let siblings = options.appendTo.children;
                for (let sibling of siblings) {
                    if (sibling.tagName === 'INPUT') sibling.value = '';
                }
                e.target.style.display = "none";
                layer.filter[options.field] = {};
                layer.getLayer();
            }
        },
        appendTo: options.appendTo
    });
}

// create checkbox filter
function filter_checkbox(options, layer) {

    function filter_checkbox_onchange(e) {

        if (!layer.filter[options.field])
            layer.filter[options.field] = {
                [options.operator]: []
            };

        if (this.checked) {
            if (!layer.filter[options.field][options.operator]) layer.filter[options.field][options.operator] = [];
            layer.filter[options.field][options.operator].push(options.value);
            layer.getLayer();

        } else {
            layer.filter[options.field][options.operator].splice(layer.filter[options.field][options.operator].indexOf(options.value), 1);
            layer.getLayer();
        }
    }

    let checkbox = utils.checkbox(filter_checkbox_onchange, { label: options.value });

    return checkbox;
}