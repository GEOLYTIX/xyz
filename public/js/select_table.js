const utils = require('./utils');
const images = require('./select_images');
const charts = require('./charts');

function addInfojToList(record) {

    // Create infojTable table to be returned from this function.
    let table = utils.createElement('table', {
        className: 'infojTable',
        cellPadding: '0',
        cellSpacing: '0',
        style: 'border-bottom: 1px solid ' + record.color
    });

    if (global._xyz.locales[global._xyz.locale].layers[record.location.layer].streetview) insertStreetViewImage(record, table);

    // Populate the table from the features infoj object.
    Object.values(record.location.infoj).forEach(entry => {
        // Create new table row at given level and append to table.
        let tr = utils.createElement('tr', {
            className: 'lv-' + (entry.level || 0)
        }, table);
        
        if(entry.chart) {
            let chart = charts.bar_chart(record.location.layer, entry.chart);
            if(chart) table.appendChild(chart);
            //table.appendChild(charts.bar_chart(record.location.layer, entry.chart));
            
        }
        //console.log(record.location.infoj[entry]);
        
        // Create new table cell for label and append to table.
        if (entry.label){
            let label = utils._createElement({
                tag: 'td',
                options: {
                    className: 'label lv-' + (entry.level || 0),
                    textContent: entry.label
                },
                appendTo: tr
            });

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
            tr = utils.createElement('tr', null, table);
            
            val = utils.createElement('td', {
                className: 'val',
                colSpan: '2'
            }, tr);
            
        } else {
            val = utils.createElement('td', {
                className: 'val num'
            }, tr);
        };

        // If input is images create image control and return from object.map function.
        if (entry.images) {
            val.style.position = 'relative';
            val.style.height = '180px';
            val.appendChild(images.addImages(record, entry.value.reverse() || []));
            return
        }

        // Set field value if layer is not editable (or entry is locked) and return from object.map function.
        if ((!record.location.editable || entry.locked || entry.layer) && entry.value) {
            val.textContent = entry.type === 'numeric' ?
                parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: record.location.grid? 0: 2}) :
                entry.type === 'integer' ?
                    parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 })  : 
                entry.type === 'date' ? new Date(entry.value).toLocaleDateString('en-GB') : entry.value;
            return
        }

        // Create range input for range fields.
        if (entry.range) {
            val.textContent = entry.value || entry.value == 0? parseInt(entry.value): entry.range[0];
            tr = utils.createElement('tr', null, table);

            let range = utils.createElement('td', {
                className: 'range'        
            }, tr);

            let rangeInput = utils.createElement('input', {
                type: 'range',
                value: entry.value || entry.value == 0? parseInt(entry.value): entry.range[0],
                min: entry.range[0],
                max: entry.range[1]
            }, range);

            rangeInput.addEventListener('input', function(){
                utils.addClass(val, 'changed');
                val.textContent = this.value;
                record.upload.style.display = 'block';
                entry.value = this.value;
            }, range);

            // click event on input.range
            // rangeInput.addEventListener('click', function (e) {
            //     this.value = parseInt(this.min + (e.offsetX / this.clientWidth * (this.max - this.min)));
            //     // utils.addClass(val, 'changed');
            //     // val.textContent = this.value;
            //     // record.upload.style.display = 'block';
            //     // entry.value = this.value;
            // });

            return
        }

        // Create select input for options.
        if (entry.options) {

            // Create select prime element.
            let select = utils._createElement({
                tag: 'select',
                appendTo: val,
                eventListener: {
                    event: 'change',
                    funct: e => {
                        utils.addClass(e.target, 'changed');
                        record.upload.style.display = 'block';
                        entry.value = e.target.options[e.target.value].textContent;
                        select_input.value = e.target.options[e.target.value].textContent;
                    }
                }
            });

            // Add undefined/other to the options array.
            entry.options.unshift("undefined");
            entry.options.push("other");
            
            // Create options with dataset list of sub options and append to select prime.
            Object.keys(entry.options).map(function (i) {
                let opt = utils.createElement('option', {
                    textContent: String(entry.options[i]).split(';')[0],
                    value: i,
                    selected: (String(entry.options[i]).split(';')[0] == entry.value)
                }, select);

                opt.dataset.list = String(entry.options[i])
                    .split(';')
                    .slice(1)
                    .join(';');
            });

            // Create select_input which holds the value of the select prime option.
            let select_input = utils.createElement('input', {
                value: entry.value,
                type: 'text'
            }, val);

            select_input.addEventListener('keyup', e => {
                utils.addClass(e.target, 'changed');
                record.upload.style.display = 'block';
                entry.value = e.target.value;
            });

            // This element should only be displayed when select prime is 'other'.
            select_input.style.display = 'none';

            // Check whether value exists but not found in list.
            if (select.selectedIndex == 0 && entry.value && entry.value != 'undefined') {
                select.selectedIndex = select.options.length - 1;
            }

            if (select.selectedIndex == select.options.length - 1) select_input.style.display = 'block';

            // Select sub condition on subfield exists.
            let subselect, subselect_input;
            if (entry.subfield) {

                // Create a new table row for select sub label
                tr = utils.createElement('tr', null, table);

                // Add select sub label to new tabel row.
                let label = utils.createElement('td', {
                    className: 'label lv-' + (entry.level || 0),
                    textContent: entry.sublabel
                }, tr);

                // Create a new table row for select sub element.
                tr = utils.createElement('tr', null, table);

                // Create new td with subselect element and add to current table row.
                let td = utils.createElement('td', {
                    className: 'val'
                }, tr);

                subselect = utils.createElement('select', null, td);

                // Create options for current data-list and append to subselect element.
                let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
                suboptions.unshift("undefined");

                // Remove last option if empty.
                if (suboptions[1] == '') suboptions.pop();
                suboptions.push('other');

                Object.keys(suboptions).map(function (i) {
                    utils.createElement('option', {
                        textContent: suboptions[i],
                        value: i,
                        selected: (suboptions[i] == entry.subvalue)
                    }, subselect);
                });

                // Create select_input which holds the value of the select prime option.
                subselect_input = utils.createElement('input', {
                    value: entry.subvalue,
                    type: 'text'
                }, td);

                subselect_input.addEventListener('keyup', function () {
                    utils.addClass(this, 'changed');
                    record.upload.style.display = 'block';
                    entry.subvalue = this.value;
                });

                subselect.addEventListener('change', function () {
                    utils.addClass(this, 'changed');
                    record.upload.style.display = 'block';
                    entry.subvalue = this.options[this.value].textContent;
                    subselect_input.value = this.options[this.value].textContent;
                });

                // This element should only be displayed when subselect is 'other'.
                subselect_input.style.display = 'none';

                // Check whether value exists but not found in list.
                if (subselect.selectedIndex == 0 && entry.subvalue && entry.subvalue != 'undefined')
                    subselect.selectedIndex = subselect.options.length - 1;

                if (subselect.selectedIndex == subselect.options.length - 1)
                    subselect_input.style.display = 'block';
                    
                              
            }
            
            select.addEventListener('change', function(e){

                // Show select input only for last select option (other).
                if (this.selectedIndex == this.options.length - 1) {
                    select_input.value = entry.value;
                    select_input.style.display = 'block';
                } else {
                    select_input.value = e.target[e.target.value].label;
                    select_input.style.display = 'none';
                }

                // Clear subselect and add suboptions from select option dataset list.
                let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
                
                if (suboptions.length > 1) {
                    suboptions.unshift("undefined");

                    // Remove last option if empty.
                    if (suboptions[1] == '') suboptions.pop();
                    suboptions.push('other');
                    subselect.innerHTML = '';

                    Object.keys(suboptions).map(function (i) {
                        subselect.appendChild(utils.createElement('option', {
                            textContent: suboptions[i],
                            value: i,
                            selected: (suboptions[i] == entry.subvalue)
                        }));
                    });
    
                    // Check whether value exists but not found in list.
                    if ((subselect.selectedIndex == subselect.options.length - 1)
                        || (subselect.selectedIndex == 0 && entry.subvalue)) {
                        subselect.selectedIndex = subselect.options.length - 1;
                        subselect_input.style.display = 'block';
                    }
                }

                // Add changed class and make cloud save visible.
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                entry.value = e.target[e.target.value].label;
            });

            // Subselect change event.
            if (subselect) subselect.addEventListener('change', function(e){

                // Show select input only for last select option (other).
                if (this.selectedIndex == this.options.length - 1) {
                    subselect_input.value = entry.subvalue;
                    subselect_input.style.display = 'block';
                } else {
                    subselect_input.value = e.target[e.target.value].label;
                    subselect_input.style.display = 'none';
                }

                // Add changed class and make cloud save visible.
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                entry.subvalue = subselect_input.value;
            });

            return
        }
        
        // Creat input text area for editable fields
        if (entry.text) {
            utils._createElement({
                tag: 'textarea',
                options: {
                    value: entry.value || '',
                    rows: 5
                },
                appendTo: val,
                eventListener: {
                    event: 'keyup',
                    funct: e => {
                        utils.addClass(e.target, 'changed');
                        record.upload.style.display = 'block';
                        entry.value = e.target.value;
                    }
                }
            });
            return
        }
        
        // Creat input for editable fields
        if (record.location.editable && !entry.locked && !entry.layer) {
            utils._createElement({
                tag: 'input',
                options: {
                    value: entry.value || '',
                    type: 'text'
                },
                appendTo: val,
                eventListener: {
                    event: 'keyup',
                    funct: e => {
                        utils.addClass(e.target, 'changed');
                        record.upload.style.display = 'block';
                        entry.value = e.target.value;
                    }
                }
            });
        }
    });
    
    // hides label rows which don't have data available
    function hide_empty_sections(element){
        let prev, next, len = element.children.length;
        for(let i = 1; i < len; i++){
            
            next = element.children[i];
            prev = element.children[i-1];
            
            if(next && next.children && next.children.length == 1){
                
                if(next.children[0].classList.contains("label") && prev.children[prev.children.length-1].classList.contains("label")){
                    
                    prev.children[prev.children.length-1].style.display = "none";
                    
                    if(i == len-1) next.children[0].style.display = "none";
                }
            }
        
        }
        return element;
    }
    
    hide_empty_sections(table);
    return table;
}

function insertStreetViewImage(record, table) {
    let tr = utils.createElement('tr', {
        className: 'tr_streetview'
    }, table);

    let td = utils.createElement('td', {
        className: 'td_streetview',
        colSpan: '2'
    }, tr);

    let div = utils.createElement('div', {
        className: 'div_streetview'
    }, td);

    let a = utils.createElement('a', {
        className: 'a_streetview',
        href: 'https://www.google.com/maps?cbll=' + record.location.marker[1] + ',' + record.location.marker[0] + '&layer=c',
        target: '_blank'
    }, td);

    let img = utils.createElement('img', {
        className: 'img_streetview',
        src: global._xyz.host + '/proxy/image?uri=https://maps.googleapis.com/maps/api/streetview?location=' + record.location.marker[1] + ',' + record.location.marker[0] + '&size=290x230&provider=GOOGLE'
    }, a);
}

module.exports = {
    addInfojToList: addInfojToList
}