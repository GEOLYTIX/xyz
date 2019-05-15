_xyz({
  host: document.head.dataset.dir || new String(''),
  //hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: 51.52,
        lng: -0.1,
        z: 6,
      },
      btn: {
        Locate: document.getElementById('btnLocate'),
      }
    });

    _xyz.locations.select = location => gla_select(_xyz, location);

    //_xyz.layers.list['Advice Center'].show();
    //console.log(_xyz.layers.list['Advice Center']);
    let layer = _xyz.layers.list['Advice Center'];
    layer.filter.current = {};

    var tableShow = () => _xyz.tableview.layerTable({
      layer: layer,
      target: document.getElementById('List'),
      key: 'gla',
      visible: ['organisation_short'],
      groupBy: 'borough',
      initialSort: [
        {
          column: 'organisation_short', dir: 'asc'
        },
        {
          column: 'borough', dir: 'asc'
        }
      ],
      groupStartOpen: false,
      groupToggleElement: 'header',
      rowClick: (e, row) => {
        const rowData = row.getData();

        if (!rowData.qid) return;

        _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          id: rowData.qid,
        });
      }
    });

    tableShow();

    customDropdown(_xyz, layer, tableShow);

    searchPostcode(_xyz);
  }
});

function customDropdown(_xyz, layer, callback) {
  
  var x, i, j, selElmnt, a, b, c, d;

  /*look for any elements with the class "custom-select":*/
  x = document.getElementsByClassName('custom-select');

  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName('select')[0];
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement('DIV');
    a.setAttribute('class', 'select-selected');
    //a.classList.add(selElmnt.classList);
    a.dataset.field = selElmnt.dataset.field;
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);

    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement('DIV');
    b.setAttribute('class', 'select-items select-hide');
    for (j = 1; j < selElmnt.length; j++) {
      /*for each option in the original select element, create a new DIV that will act as an option item:*/

      c = document.createElement('DIV');
      c.innerHTML = selElmnt.options[j].innerHTML;
      //console.log(selElmnt);
      c.dataset.col = selElmnt.options[j].value;
      c.addEventListener('click', e => {
        /*when an item is clicked, update the original select box,
                and the selected item:*/
        var y, i, k, s, h;
        s = e.target.parentNode.parentNode.getElementsByTagName('select')[0];
        h = e.target.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == e.target.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = e.target.innerHTML;
            y = e.target.parentNode.getElementsByClassName('same-as-selected');
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute('class');
            }
            e.target.setAttribute('class', 'same-as-selected');
            break;
          }
        }
        h.click();
      });
      b.appendChild(c);
    }

    x[i].appendChild(b);

    a.addEventListener('click', e => {
      /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
      e.stopPropagation();
            
      closeAllSelect(e.target);
      e.target.nextSibling.classList.toggle('select-hide');
      e.target.classList.toggle('select-arrow-active');

    });
  }

  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
        except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName('select-items');
    y = document.getElementsByClassName('select-selected');
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove('select-arrow-active');
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }

  }

  /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/

  document.addEventListener('click', e => {
    e.stopPropagation();

    if(!e.target.parentNode.previousSibling.dataset) return;

    if(e.target.parentNode.previousSibling.dataset.field === 'borough'){
      if(e.target.textContent === 'Show all boroughs') {
        layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
        toLayerExtent(_xyz, layer);
        if(typeof(callback) === 'function') callback();
        return;
      }
      layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
      layer.filter.current[e.target.parentNode.previousSibling.dataset.field].match = e.target.textContent;
      toLayerExtent(_xyz, layer);
      if(typeof(callback) === 'function') callback();
    }

    if(e.target.parentNode.previousSibling.dataset.field === 'advice'){

      // Reset previous boolean filters
      Object.keys(layer.filter.current).map(key => {
        if(layer.filter.current[key].boolean){
          delete layer.filter.current[key];
          toLayerExtent(_xyz, layer);
          if(typeof(callback) === 'function') callback();
        }
      });

      if(e.target.textContent === 'Show all'){
        layer.filter.current[e.target.dataset.col] = {};
        toLayerExtent(_xyz, layer);
        if(typeof(callback) === 'function') callback();
        return;
      }
      layer.filter.current[e.target.dataset.col] = {};
      layer.filter.current[e.target.dataset.col]['boolean'] = true;
      toLayerExtent(_xyz, layer);
      if(typeof(callback) === 'function') callback();
    }

    closeAllSelect(e);
  });
}

function searchPostcode(_xyz){

  let input = document.querySelector('#postcode-search input'),
    find = document.querySelector('#postcode-find');
  
  input.addEventListener('focus', e => {
    document.getElementById('postcode-find').classList.remove('darkish');
    document.getElementById('postcode-find').classList.add('pink-bg');
    e.target.parentNode.classList.add('pink-br');
  });

  input.addEventListener('blur', e => {
    document.getElementById('postcode-find').classList.add('darkish');
    document.getElementById('postcode-find').classList.remove('pink-bg');
    e.target.parentNode.classList.remove('pink-br');
  });

  find.addEventListener('click', () => search());

  input.addEventListener('keydown', e => {
    let key = e.keyCode || e.charCode;
    if(key === 13) search();
  });

  function search(){
    // Create abortable xhr.
    _xyz.gazetteer.xhr = new XMLHttpRequest();
    if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();

    // Send gazetteer query to backend.
    _xyz.gazetteer.xhr.open('GET', _xyz.host + '/api/gazetteer/autocomplete?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      q: encodeURIComponent(input.value),
      token: _xyz.token
    }));

    _xyz.gazetteer.xhr.setRequestHeader('Content-Type', 'application/json');
    _xyz.gazetteer.xhr.responseType = 'json';

    _xyz.gazetteer.xhr.onload = e => {
      // List results or show that no results were found
      if (e.target.status !== 200) return;

      // Parse the response as JSON and check for results length.
      const json = e.target.response;

      if (json.length === 0) {
        alert('No results for this search.');
        return;
      }

      const xhr = new XMLHttpRequest();

      xhr.open('GET', _xyz.host + `/api/gazetteer/googleplaces?id=${json[0].id}&token=${_xyz.token}`);
      xhr.responseType = 'json';

      xhr.onload = e => {
        if (e.target.status === 200) _xyz.gazetteer.createFeature(e.target.response);
      };
      xhr.send();
    };

    _xyz.gazetteer.xhr.send();
  }
}

function toLayerExtent(_xyz, layer){

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    filter: JSON.stringify(layer.filter.current),
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    // Show the layer on map.
    layer.show();

    // Split the bounds from response.
    const bounds = e.target.responseText.split(',');

    const fGroup = [_xyz.L.polygon([
      [bounds[1], bounds[0]],
      [bounds[1], bounds[2]],
      [bounds[3], bounds[2]],
      [bounds[3], bounds[0]],
    ])];

    //if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) fGroup.push(_xyz.mapview.locate.L);

    // Fly to the bounds.
    _xyz.map.flyToBounds(_xyz.L.featureGroup(fGroup).getBounds(),{
      padding: [25, 25]
    });
    
  };

  xhr.send();
}