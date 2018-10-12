import _xyz from '../../../_xyz.mjs';

import filter_text from './filter_text.mjs';

import filter_numeric from './filter_numeric.mjs';

import filter_range from './filter_range.mjs';

import filter_date from './filter_date.mjs';

export default (layer, panel) => {

  // Add filter block to layer panel.
  let filters = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'section expandable'
    },
    appendTo: panel
  });

  // Filter control expander.
  _xyz.utils.createElement({
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
        _xyz.utils.toggleExpanderParent({
          expandable: filters,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
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

  function select_onchange(e) {

    let _val = this.value,
      _select = this;

    // disable selected option
    _select.options[_select.selectedIndex].disabled = true;

    // show run button only if aggregate layer enabled
    if (layer.aggregate_layer) filters.lastChild.style.display = 'block';

    // show clear all button
    _select.nextSibling.style.display = 'block';

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

      if (e.target.parentNode.parentNode.classList.contains('block')) e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);

      delete layer.filter[_val];
      enable_option(_select, _val);
      layer.get();

      // hide run button when last filter block is removed
      if (!_select.nextSibling.nextSibling.classList.contains('block')) {
        if (!filters.lastChild.classList.contains('block')) {
          filters.lastChild.style.display = 'none';
          clear_all.style.display = 'none';
        }
      }
    }

    function processInfoj(val, entry) {
      if (entry.filter && entry.field === val) {

        if (typeof (entry.filter) == 'object') {

          block = _xyz.utils.createElement({
            tag: 'div',
            options: {
              classList: 'block'
            }
          });

          let title_div = _xyz.utils.createElement({
            tag: 'div',
            options: {
              //innerHTML: entry.label + '<i class='material-icons'>clear</i>',
              classList: 'title',
              onclick: remove_filter_onclick
            },
            appendTo: block
          });

          _xyz.utils.createElement({
            tag: 'i',
            options: {
              classList: 'material-icons',
              textContent: 'clear'
            },
            appendTo: title_div
          });

          Object.values(entry.filter).forEach(_value => {
            for (let __value of _value) {

              _xyz.utils.checkbox({
                label: __value,
                appendTo: block,
                onChange: e => {
                        
                  if (!layer.filter[val]) layer.filter[val] = { ['in']: [] };
                        
                  if (e.target.checked) {
                    if (!layer.filter[val]['in']) layer.filter[val]['in'] = [];
                    layer.filter[val]['in'].push(__value);
                    layer.get();
                        
                  } else {
                    layer.filter[val]['in'].splice(layer.filter[val]['in'].indexOf(__value), 1);
                    layer.get();
                  }
                }
              });

            }
          });

          filters.insertBefore(block, filters.lastChild);

        } else {

          if (entry.filter === 'numeric') {

            block = _xyz.utils.createElement({
              tag: 'div',
              options: {
                classList: 'block'
              }
            });

            _xyz.utils.createElement({
              tag: 'div',
              options: {
                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                classList: 'title',
                onclick: remove_filter_onclick
              },
              appendTo: block
            });

            let options = {
              field: entry.field,
              label: entry.label,
              appendTo: block
            };
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
          }

          if (entry.filter === 'like' || entry.filter === 'match') {

            block = _xyz.utils.createElement({
              tag: 'div',
              options: {
                classList: 'block'
              }
            });

            _xyz.utils.createElement({
              tag: 'div',
              options: {
                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                classList: 'title',
                onclick: remove_filter_onclick
              },
              appendTo: block
            });

            let options = {
              field: entry.field,
              label: entry.label,
              appendTo: block
            };

            options.operator = entry.filter;

            filter_text(layer, options);
            filters.insertBefore(block, filters.lastChild);
          }
          if (entry.filter === 'date') {

            block = _xyz.utils.createElement({
              tag: 'div',
              options: {
                classList: 'block'
              }
            });

            title = _xyz.utils.createElement({
              tag: 'div',
              options: {
                classList: 'title',
                innerHTML: entry.label + '<i class="material-icons">clear</i>',
                onclick: remove_filter_onclick
              },
              appendTo: block
            });

            let options = {
              field: entry.field,
              label: entry.label,
              appendTo: block
            };

            // filter date function
            filter_date(layer, options);
            filters.insertBefore(block, filters.lastChild);
          }
        }
      }
    }

    // process filters from infoj
    Object.values(layer.infoj).map(item => {
      if (item.type === 'group') {
        Object.values(item.items).map(_item => {
          processInfoj(_val, _item);
        });
      } else {
        processInfoj(_val, item);
      }
    });

    this.selectedIndex = 0;
  }

  let select = _xyz.utils.createElement({
    tag: 'select',
    options: {
      onchange: select_onchange,
      innerHTML: '<option selected>Select filter from list.</option>'
    }
  });

  function createOptions(select, entry) {
    if (entry.filter) _xyz.utils.createElement({
      tag: 'option',
      options: {
        value: entry.field,
        textContent: entry.label
      },
      appendTo: select
    });
  }

  // add options to select
  Object.values(layer.infoj).forEach(entry => {
    if (entry.type === 'group') {
      Object.values(entry.items).map(item => {
        createOptions(select, item);
      });
    } else {
      createOptions(select, entry);
    }
  });

  let clear_all = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_small cursor noselect',
      textContent: 'Clear',
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
        this.style.display = 'none';

        // hide aggregate button if enabled 
        if (layer.aggregate_layer) this.parentNode.lastChild.style.display = 'none';
        layer.get();
      }
    }
  });

  filters.appendChild(select);
  filters.appendChild(clear_all);

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_wide cursor noselect',
      textContent: 'Run Output',
    },
    style: {
      display: 'none'
    },
    appendTo: filters,
    eventListener: {
      event: 'click',
      funct: () => {

        const xhr = new XMLHttpRequest();

        xhr.open('GET', _xyz.host + '/api/location/aggregate?' + _xyz.utils.paramString({
          locale: _xyz.locale,
          layer: layer.key,
          token: _xyz.token,
          filter: JSON.stringify(layer.filter) || ''
        }));

        xhr.onload = e => {
          if (e.target.status === 200) {
            let json = JSON.parse(e.target.response);

            _xyz.locations.select({
              layer: layer.aggregate_layer,
              table: _xyz.layers.list[layer.aggregate_layer].table,
              id: json.id,
              marker: [json.lng, json.lat],
              filter: JSON.stringify(layer.filter) || ''
            });
          }
        };

        xhr.send();
      }
    }
  });
};