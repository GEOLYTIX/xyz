import _xyz from '../_xyz.mjs';

import addImages from './images.mjs';

import {bar_chart} from './charts.mjs';

export default record => {

    // Create infojTable table to be returned from this function.
    let table = _xyz.utils.createElement({
        tag: 'table',
        options: {
            className: 'infojTable'
        },
        style: {
            cellPadding: '0',
            cellSpacing: '0',
            borderBottom: '1px solid ' + record.color
        }
    });

    // Adds info about layer and group to infoj
    record.location.infoj.unshift({
        'label': 'Layer',
        'value': _xyz.ws.locales[_xyz.locale].layers[record.location.layer].name,
        'type': 'text',
        'inline': true,
        'locked': true
    });

    if(_xyz.ws.locales[_xyz.locale].layers[record.location.layer].group) record.location.infoj.unshift({
        'label': 'Group',
        'value': _xyz.ws.locales[_xyz.locale].groups[_xyz.ws.locales[_xyz.locale].layers[record.location.layer].group].label,
        'type': 'text',
        'inline': true,
        'locked': true
    });

    // populate table with entries
    Object.values(record.location.infoj).forEach(entry => {
        //create tr
        let tr = _xyz.utils.createElement({
            tag: 'tr',
            options: {
                className: 'lv-' + (entry.level || 0)
            },
            appendTo: table
        });

        if(entry.type === 'group'){
            let group_td = _xyz.utils.createElement({
                tag: 'td',
                options: {
                    colSpan: '2'
                },
                appendTo: tr
            }),
                group_div = _xyz.utils.createElement({
                    tag: 'div',
                    options: {
                        classList: 'table-section expandable'
                    },
                    appendTo: group_td
                });
            
            let group_header = _xyz.utils.createElement({
                tag: 'div',
                options: {
                    className: 'btn_subtext cursor noselect'//,
                    //textContent: entry.label
                },
                style: {
                    textAlign: 'left',
                    fontStyle: 'italic'
                },
                appendTo: group_div,
                eventListener: {
                    event: 'click',
                    funct: e => {
                        e.stopPropagation();
                            _xyz.utils.toggleExpanderParent({
                                expandable: group_div,
                                accordeon: true,
                                scrolly: document.querySelector('.mod_container > .scrolly')
                            })
                        }
                    }
                });
            
            _xyz.utils.createElement({
                tag: 'span',
                options: {
                    textContent: entry.label
                },
                appendTo: group_header
            });
            
            // Add icon which allows to expand / collaps panel.
            _xyz.utils.createElement({
                tag: 'i',
                options: {
                    className: 'material-icons cursor noselect btn_header t-expander',
                    title: 'Show section'
                },
                appendTo: group_header,
                eventListener: {
                    event: 'click',
                    funct: e => {
                        e.stopPropagation();
                        _xyz.utils.toggleExpanderParent({
                            expandable: group_div,
                            scrolly: document.querySelector('.mod_container > .scrolly')
                        });
                    }
                }
            });
                
               let group_table = _xyz.utils.createElement({
                    tag: 'table',
                    style: {
                        cellPadding: '0',
                        cellSpacing: '0',
                        width: '95%'
                    },
                    appendTo: group_div
                });
        
            Object.values(entry.items).forEach(item => {
                let group_tr = _xyz.utils.createElement({
                    tag: 'tr',
                    options: {
                        className: 'lv-' + (entry.level || 0)
                    },
                    appendTo: group_table
                });
                populateTable(record, item,  group_tr, group_table);
            });

        } else {
            populateTable(record, entry, tr, table);

        }
    });
    hide_empty_sections(table);
    return table;
}

function populateTable(record, entry, tr, table){

    if(entry.streetview){
        table.appendChild(insertStreetViewImage(record, tr));
        return;
    }

    if(entry.chart) {
        let chart = bar_chart(record.location.layer, entry.chart);
        if(chart) table.appendChild(chart);
    }

    // Create new table cell for label and append to table.
    if (entry.label){
        let label = _xyz.utils.createElement({
            tag: 'td',
            options: {
                className: 'label lv-' + (entry.level || 0),
                textContent: entry.label
            },
            appendTo: tr
        });   
        // add tooltip text
        if(entry.title) label.title = entry.title;

        // return from object.map function if field(label) has no type.
        if (!entry.type) return
    }

    // Remove row if not editable (or entry is locked) and entry has no value.
    if ((!record.location.editable || entry.locked) && !entry.value) {
        tr.remove();
        return
    }

    // Create new row for text cells and append to table.
    let val;
    if (entry.type && !entry.inline && !(entry.type === 'integer' || entry.type === 'numeric' || entry.type === 'date')) {
        tr = _xyz.utils.createElement({tag: 'tr', appendTo: table});
        val = _xyz.utils.createElement({tag: 'td', options: {className: 'val', colSpan: '2'}, appendTo: tr});
    } else {
        val = _xyz.utils.createElement({
            tag: 'td',
            options: {
                className: 'val num'
            },
            appendTo: tr
        });
    }

    // If input is images create image control and return from object.map function.
    if (entry.images) {
        val.style.position = 'relative';
        val.style.height = '180px';
        val.appendChild(addImages(record, entry.value.reverse() || []));
        return
    }

    // Set field value if layer is not editable (or entry is locked) and return from object.map function.
    if ((!record.location.editable || entry.locked || entry.layer) && entry.value) {
        
        //console.log(entry);
        
        val.textContent = entry.type === 'numeric' ? 
            parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: record.location.grid? 0: 2}) : entry.type === 'integer' ? 
            parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) : entry.type === 'date' ? 
            new Date(entry.value).toLocaleDateString('en-GB') : entry.value;
        return
    }

    // Create range input for range fields.
    if (entry.range) {
        val.textContent = entry.value || entry.value == 0 ? parseInt(entry.value): entry.range[0];
        tr = _xyz.utils.createElement({tag: 'tr', appendTo: table});

        let range = _xyz.utils.createElement({
            tag: 'td',
            options: {
                className: 'range',
                colSpan: '2'
            },
            appendTo: tr
        });

        let rangeInput = _xyz.utils.createElement({
            tag: 'input',
            options: {
                value: entry.value || entry.value == 0 ? parseInt(entry.value): entry.range[0],
                type: 'range',
                min: entry.range[0],
                max: entry.range[1]
            },
            style: {
                width: 'calc(100% - 10px)'
            },
            eventListener: {
                event: 'input',
                funct: e => {
                    val.classList.add('changed');
                    val.textContent = e.target.value;
                    record.upload.style.display = 'block';
                    entry.value = e.target.value;
                }
            },
            appendTo: range
        });
        return
    }
    
    // Create input text area for editable fields
    if (entry.text) {
        _xyz.utils.createElement({
            tag: 'textarea',
            options: {
                value: entry.value || '',
                rows: 5
            },
            appendTo: val,
            eventListener: {
                event: 'keyup',
                funct: e => {
                    e.target.classList.add('changed');
                    record.upload.style.display = 'block';
                    entry.value = e.target.value;
                }
            }
        });
        return
    }

    // Create select input for options.
    if (entry.options) {
        // Create select prime element.
        let select = _xyz.utils.createElement({
            tag: 'select',
            appendTo: val,
            eventListener: {
                event: 'change',
                funct: e => {
                    e.target.classList.add('changed');
                    record.upload.style.display = 'block';
                    entry.value = e.target.options[e.target.value].textContent;
                    entry.value = e.target[e.target.value].label;
                }
            }
        });

        // Add undefined/other to the options array.
        entry.options.unshift('undefined');
        entry.options.push('other');

        // Create options with dataset list of sub options and append to select prime.
        Object.keys(entry.options).map(function (i) {

            let opt = _xyz.utils.createElement({
                tag: 'option',
                options: {
                    textContent: String(entry.options[i]).split(';')[0],
                    value: i,
                    selected: (String(entry.options[i]).split(';')[0] == entry.value)
                },
                appendTo: select
            });

            opt.dataset.list = String(entry.options[i])
                .split(';')
                .slice(1)
                .join(';');
        });

        // Create select_input which holds the value of the select prime option.
        let select_input = _xyz.utils.createElement({
            tag: 'input',
            options: {
                value: entry.value,
                type: 'text'
            },
            style: {
                display: 'none' // This element should only be displayed when select prime is 'other'.
            },
            eventListener: {
                event: 'keyup',
                funct: e => {
                    e.target.classList.add('changed');
                    record.upload.style.display = 'block';
                    entry.value = e.target.value;
                }
            },
            appendTo: val
        });

        // Check whether value exists but not found in list.
        checkValueExists(select, select_input, entry);

        // Select sub condition on subfield exists.
        let subselect, subselect_input;
        
        if (entry.subfield) {
            // Create a new table row for select sub label
            tr = _xyz.utils.createElement({tag: 'tr', appendTo: table});

            // Add select sub label to new tabel row.
            let label = _xyz.utils.createElement({
                tag: 'td',
                options: {
                    className: 'label lv-' + (entry.level || 0),
                    textContent: entry.sublabel
                },
                appendTo: tr
            });

            // Create a new table row for select sub element.
            tr = _xyz.utils.createElement({tag: 'tr', appendTo: table});

            // Create new td with subselect element and add to current table row.
            let td = _xyz.utils.createElement({
                tag: 'td',
                options: {
                    className: 'val',
                    colSpan: '2'
                },
                appendTo: tr
            });
            
            subselect = _xyz.utils.createElement({
                tag: 'select',
                eventListener: {
                    event: 'change',
                    funct: e => {

                        // Show select input only for last select option (other).
                        toggleSelectVisible(e.target, subselect_input, entry, 'subvalue');
                        e.target.classList.add('changed');
                        record.upload.style.display = 'block';
                        entry.subvalue = subselect_input.value;
                    }
                },
                appendTo: td
            });
            
            // Create options for current data-list and append to subselect element.
            
            let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
            suboptions.unshift('undefined');
            
            // Remove last option if empty.
            if (suboptions[1] == '') suboptions.pop();
            suboptions.push('other');

            Object.keys(suboptions).map(function (i) {
                _xyz.utils.createElement({
                    tag: 'option',
                    options: {
                        textContent: suboptions[i],
                        value: i,
                        selected: (suboptions[i] == entry.subvalue)
                    },
                    appendTo: subselect
                });
            });

            // Create select_input which holds the value of the select prime option.
            subselect_input = _xyz.utils.createElement({
                tag: 'input',
                options: {
                    value: entry.subvalue,
                    type: 'text'
                },
                style: {
                    display: 'none' // This element should only be displayed when subselect is 'other'.
                },
                eventListener: {
                    event: 'keyup',
                    funct: e => {
                        e.target.classList.add('changed');
                        record.upload.style.display = 'block';
                        entry.subvalue = e.target.value;
                    }
                },
                eventListener: {
                    event: 'change',
                    funct: e => {
                        e.target.classList.add('changed');
                        record.upload.style.display = 'block';
                        entry.subvalue = e.target.options[e.target.value].textContent;
                        subselect_input.value = e.target.options[e.target.value].textContent;
                        
                        toggleSelectVisible(subselect, e.target, entry, 'subvalue');
                    }
                },
                appendTo: td
            });
            
            checkValueExists(subselect, subselect_input, entry, 'subvalue');
        }
        
        select.addEventListener('change', e => {
            toggleSelectVisible(select, select_input, entry);
            
            // Clear subselect and add suboptions from select option dataset list.
            let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
            suboptions.unshift('undefined');
        
            if (suboptions.length > 1 && subselect) {
                
                // Remove last option if empty.
                if (suboptions[1] == '') suboptions.pop();
                suboptions.push('other');
                subselect.innerHTML = '';
                
                Object.keys(suboptions).map(function (i) {
                    _xyz.utils.createElement({
                        tag: 'option',
                        options: {
                            textContent: suboptions[i],
                            value: i,
                            selected: (suboptions[i] == entry.subvalue)
                        },
                        appendTo: subselect
                    });
                });
                
                // Check whether value exists but not found in list.
                checkValueExists(select, select_input, entry, 'subvalue');
            }
            
            // Add changed class and make cloud save visible.
            e.target.classList.add('changed');
            record.upload.style.display = 'block';
            entry.value = e.target[e.target.value].label;
        });
        
        return
    }

    // Creat input for editable fields
    if(record.location.editable && !entry.locked && !entry.layer){
        _xyz.utils.createElement({
            tag: 'input',
            options: {
                value: entry.value || '',
                type: 'text'
            },
            appendTo: val,
            eventListener: {
                event: 'keyup',
                funct: e => {
                    e.target.classList.add('changed');
                    record.upload.style.display = 'block';
                    entry.value = e.target.value;
                }
            }
        });
    }
}

// hides label rows which don't have data available
function hide_empty_sections(element) {
    let prev, next, len = element.children.length;
    for(let i = 1; i < len; i++){
        next = element.children[i];
        prev = element.children[i-1];

        if(next && next.children && next.children.length == 1){
            if(next.children[0].classList.contains('label') && prev.children[prev.children.length-1].classList.contains('label')){
                prev.children[prev.children.length-1].style.display = 'none';
                if(i == len-1) next.children[0].style.display = 'none';
            }
        }
    }
    return element;
}

// Check whether value exists but not found in list.
function checkValueExists(sel, inp, entry, prop){
    if(!sel || !inp) return;
    if(!prop) prop = 'value';
    if (sel.selectedIndex == 0 && entry[prop] && entry[prop] != 'undefined') {
        sel.selectedIndex = sel.options.length - 1;
    }
    if (sel.selectedIndex == sel.options.length - 1) inp.style.display = 'block';
}

// Show select input only for last select option (other).
function toggleSelectVisible(sel, inp, entry, prop){
    if(!sel || !inp) return;
    if(!prop) prop = 'value';

    if (sel.selectedIndex == sel.options.length - 1) {
        inp.value = entry[prop];
        inp.style.display = 'block';
    } else {
        inp.value = sel[sel.value].label;
        inp.style.display = 'none';
    }

}

// insert streetview gadget
function insertStreetViewImage(record, tr) {

    tr.classList += ' tr_streetview';

    let td = _xyz.utils.createElement({
        tag: 'td',
        options: {
            className: 'td_streetview',
            colSpan: '2'
        },
        appendTo: tr
    });

    _xyz.utils.createElement({
        tag: 'div',
        options: {
            className: 'div_streetview'
        },
        appendTo: td
    });

    let a = _xyz.utils.createElement({
        tag: 'a',
        options: {
            href: 'https://www.google.com/maps?cbll=' + record.location.marker[1] + ',' + record.location.marker[0] + '&layer=c',
            target: '_blank'
        },
        appendTo: td
    });

    _xyz.utils.createElement({
        tag: 'img',
        options: {
            className: 'img_streetview',
            src: _xyz.host + '/proxy/image?uri=https://maps.googleapis.com/maps/api/streetview?location=' + record.location.marker[1] + ',' + record.location.marker[0] + '&size=290x230&provider=GOOGLE&token=' + _xyz.token
        },
        appendTo: a
    });

    return tr;
}