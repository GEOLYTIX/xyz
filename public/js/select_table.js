const utils = require('./utils');
const images = require('./select_images');

function addInfojToList(record) {

    // Create infojTable table to be returned from this function.
    let table = utils.createElement('table', {
        className: 'infojTable',
        cellPadding: '0',
        cellSpacing: '0',
        style: 'border-bottom: 1px solid ' + record.color
    });
            
    // Populate the table from the features infoj object.
    Object.keys(record.layer.infoj).map(function (key) {

        // Create new table row at given level and append to table.
        let tr = utils.createElement('tr', {
            className: 'lv-' + (record.layer.infoj[key].level || 0)
        });
        table.appendChild(tr);

        // Remove row if not editable and no value
        if (!record.layer.editable && !record.layer.infoj[key].value) return

        // Create new table cell for label and append to table.
        if (record.layer.infoj[key].label){
            let label = utils.createElement('td', {
                className: 'label lv-' + (record.layer.infoj[key].level || 0),
                textContent: record.layer.infoj[key].label,
                colSpan: (!record.layer.infoj[key].type || record.layer.infoj[key].type === 'text' ? '2' : '1')
            });
            tr.appendChild(label);

            // return from object.map function if field(label) has no type.
            if (!record.layer.infoj[key].type) return
        }

        // Create new row for text cells and append to table.
        if (record.layer.infoj[key].type
            && (record.layer.infoj[key].type === 'text' || record.layer.infoj[key].type === 'text[]')
        ) {
            tr = document.createElement('tr');
            table.appendChild(tr);
        }

        // Create new table cell for values and append to tr.
        let val = utils.createElement('td', {
            className: 'val',
            colSpan: '2'
        });
        tr.appendChild(val);

        // If input is images create image control and return from object.map function.
        if (record.layer.infoj[key].images) {
            val.style.position = 'relative';
            val.style.height = '180px';
            val.appendChild(images.addImages(record, record.layer.infoj[key].value.reverse() || []));
            return
        }

        // Set field value if layer is not editable and return from object.map function.
        if (!record.layer.editable && record.layer.infoj[key].value) {
            val.textContent = record.layer.infoj[key].type === 'numeric' ?
                record.layer.infoj[key].value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
                record.layer.infoj[key].type === 'integer' ?
                    record.layer.infoj[key].value.toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
                    record.layer.infoj[key].value;
            return
        }

        // Create range input for range fields.
        if (record.layer.infoj[key].range) {
            val.textContent = record.layer.infoj[key].value || record.layer.infoj[key].range[0];
            tr = document.createElement('tr');
            table.appendChild(tr);
            let range = utils.createElement('td', {
                colSpan: '2',
                className: 'range'        
            })
            tr.appendChild(range);
            let rangeInput = utils.createElement('input', {
                type: 'range',
                value: record.layer.infoj[key].value || record.layer.infoj[key].range[0],
                min: record.layer.infoj[key].range[0],
                max: record.layer.infoj[key].range[1]
            })
            rangeInput.addEventListener('input', function(){
                utils.addClass(val, 'changed');
                val.textContent = this.value;
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = this.value;
            });
            rangeInput.addEventListener('click', function (e) {
                this.value = e.offsetX / this.clientWidth * this.max;
                utils.addClass(val, 'changed');
                val.textContent = this.value;
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = this.value;
            });
            range.appendChild(rangeInput);
            return
        }

        // Create select input for options.
        if (record.layer.infoj[key].options) {

            // Create select prime element.
            let select = document.createElement('select');

            // Add undefined/other to the options array.
            record.layer.infoj[key].options.unshift("undefined");
            record.layer.infoj[key].options.push("other");
            
            // Create options with dataset list of sub options and append to select prime.
            Object.keys(record.layer.infoj[key].options).map(function (i) {
                let opt = utils.createElement('option', {
                    textContent: String(record.layer.infoj[key].options[i]).split(';')[0],
                    value: i,
                    selected: (String(record.layer.infoj[key].options[i]).split(';')[0] === record.layer.infoj[key].value)
                });
                opt.dataset.list = String(record.layer.infoj[key].options[i])
                    .split(';')
                    .slice(1)
                    .join(';');
                select.appendChild(opt);
            });
            
            val.appendChild(select);

            // Create select_input which holds the value of the select prime option.
            let select_input = utils.createElement('input', {
                value: record.layer.infoj[key].value,
                type: 'text'
            });

            select_input.addEventListener('keyup', function () {
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = this.value;
            });

            // This element should only be displayed when select prime is 'other'.
            select_input.style.display = 'none';
            val.appendChild(select_input);

            // Check whether value exists but not found in list.
            if (select.selectedIndex === 0 && record.layer.infoj[key].value) {
                select.selectedIndex = select.options.length - 1;
                select_input.style.display = 'block';
            }

            // Select sub condition on subfield exists.
            let subselect, subselect_input;
            if (record.layer.infoj[key].subfield) {

                // Create a new table row for select sub label
                tr = document.createElement('tr');
                table.appendChild(tr);

                // Add select sub label to new tabel row.
                let label = utils.createElement('td', {
                    className: 'label lv-' + (record.layer.infoj[key].level || 0),
                    textContent: record.layer.infoj[key].sublabel,
                    colSpan: '2'
                });
                tr.appendChild(label);

                // Create a new table row for select sub element.
                tr = document.createElement('tr');
                table.appendChild(tr);

                // Create new td with subselect element and add to current table row.
                let td = utils.createElement('td', {
                    className: 'val',
                    colSpan: '2'
                });
                tr.appendChild(td);
                subselect = document.createElement('select');
                td.appendChild(subselect);

                // Create options for current data-list and append to subselect element.
                let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
                suboptions.unshift("undefined");

                // Remove last option if empty.
                if (suboptions[1] === '') suboptions.pop();
                suboptions.push('other');
                Object.keys(suboptions).map(function (i) {
                    subselect.appendChild(utils.createElement('option', {
                        textContent: suboptions[i],
                        value: i,
                        selected: (suboptions[i] === record.layer.infoj[key].subvalue)
                    }));
                });

                // Create select_input which holds the value of the select prime option.
                subselect_input = utils.createElement('input', {
                    value: record.layer.infoj[key].subvalue,
                    type: 'text'
                });

                subselect_input.addEventListener('keyup', function () {
                    utils.addClass(this, 'changed');
                    record.upload.style.display = 'block';
                    record.layer.infoj[key].subvalue = this.value;
                });

                // This element should only be displayed when subselect is 'other'.
                subselect_input.style.display = 'none';
                td.appendChild(subselect_input);

                // Check whether value exists but not found in list.
                if (subselect.selectedIndex === 0 && record.layer.infoj[key].subvalue) {
                    subselect.selectedIndex = subselect.options.length - 1;
                    subselect_input.style.display = 'block';
                }
                              
            }
            
            select.addEventListener('change', function(e){

                // Show select input only for last select option (other).
                if (this.selectedIndex === this.options.length - 1) {
                    select_input.value = record.layer.infoj[key].value;
                    select_input.style.display = 'block';
                } else {
                    select_input.value = e.target[e.target.value].label;
                    select_input.style.display = 'none';
                }

                // Clear subselect and add suboptions from select option dataset list.
                let suboptions = String(select.options[select.selectedIndex].dataset.list).split(';');
                suboptions.unshift("undefined");

                // Remove last option if empty.
                if (suboptions[1] === '') suboptions.pop();
                suboptions.push('other');
                subselect.innerHTML = '';
                Object.keys(suboptions).map(function (i) {
                    subselect.appendChild(utils.createElement('option', {
                        textContent: suboptions[i],
                        value: i,
                        selected: (suboptions[i] === record.layer.infoj[key].subvalue)
                    }));
                });

                // Check whether value exists but not found in list.
                if ((subselect.selectedIndex === subselect.options.length - 1)
                    || (subselect.selectedIndex === 0 && record.layer.infoj[key].subvalue)) {
                    subselect.selectedIndex = subselect.options.length - 1;
                    subselect_input.style.display = 'block';
                }

                // Add changed class and make cloud save visible.
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = e.target[e.target.value].label;
            });

            // Subselect change event.
            if (subselect) subselect.addEventListener('change', function(e){

                // Show select input only for last select option (other).
                if (this.selectedIndex === this.options.length - 1) {
                    subselect_input.value = record.layer.infoj[key].subvalue;
                    subselect_input.style.display = 'block';
                } else {
                    subselect_input.value = e.target[e.target.value].label;
                    subselect_input.style.display = 'none';
                }

                // Add changed class and make cloud save visible.
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                record.layer.infoj[key].subvalue = subselect_input.value;
            });

            return
        }
        
        // Creat input text area for editable fields
        if (record.layer.infoj[key].text) {
            let textArea = utils.createElement('textarea', {
                rows: 5,
                value: record.layer.infoj[key].value || ''
            });
            val.appendChild(textArea);
            textArea.addEventListener('keyup', function () {
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = this.value;
            });
            return
        }

        // Creat input for editable fields
        if (record.layer.editable) {
            let input = utils.createElement('input', {
                value: record.layer.infoj[key].value || '',
                type: 'text'
            });
            val.appendChild(input);
            input.addEventListener('keyup', function () {
                utils.addClass(this, 'changed');
                record.upload.style.display = 'block';
                record.layer.infoj[key].value = this.value;
            });
        }

    });

    return table;
}

module.exports = {
    addInfojToList: addInfojToList
}
