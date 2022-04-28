export default location => {

  Object.assign(location, {
    flyTo,
    Layers: [],
    remove,
    removeCallbacks: [],
    trash,
    update,
    updateCallbacks: [],
  })

  return location;
}

function remove() {

  // Checks may be performed after async oprations
  // whether a location has already been removed.
  delete this.remove

  this.layer.mapview.hooks && mapp.hooks.filter('locations', this.hook)

  delete this.layer.mapview.locations[this.hook]

  this.view instanceof HTMLElement && this.view.remove()

  this.Layers?.forEach(
    L => this.layer.mapview.Map.removeLayer(L))

  this.layer.mapview.interaction.type !== 'highlight'
    && this.layer.mapview.interactions.highlight()

  if (this.layer.format === 'mvt') {

    this.layer.L.changed()
  } else {

    this.layer.reload()
  } 

  this.removeCallbacks?.forEach(
    fn => typeof fn === 'function' && fn(this))
}

async function update() {

  const newValues = {}

  this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .forEach(entry => {

      if(entry.type === 'integer') entry
        .newValue = !isNaN(parseInt(entry.newValue)) ? entry.newValue : null;

      if(entry.type === 'numeric') entry
        .newValue = !isNaN(parseFloat(entry.newValue)) ? entry.newValue : null;
           
      Object.assign(newValues, { [entry.field] : entry.newValue })
    })

  if (!Object.keys(newValues).length) return;

  await mapp.utils.xhr({
    method: "POST",
    url:
      `${this.layer.mapview.host}/api/location/update?` +
      mapp.utils.paramString({
        locale: this.layer.mapview.locale.key,
        layer: this.layer.key,
        table: this.table,
        id: this.id,
      }),
    body: JSON.stringify(newValues),
  });
   
  let dependents = this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .filter(entry => entry.dependents && entry.dependents.length)
    .map(entry => entry.dependents)
    .flat()

  this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .forEach(entry => {

      entry.value = entry.newValue;
      delete entry.newValue;

    })

  if (dependents.length) {

    const response = await mapp.utils.xhr(
      `${this.layer.mapview.host}/api/location/get?` +
        mapp.utils.paramString({
          locale: this.layer.mapview.locale.key,
          layer: this.layer.key,
          table: this.table,
          id: this.id,
          fields: [...new Set(dependents)].join(),
        })
    );

    this.infoj
      .filter(entry => typeof response[entry.field] !== 'undefined')
      .forEach(entry => {
        entry.value = response[entry.field];
      })
  
  }

  // Reload layer.
  this.layer.reload()

  this.updateCallbacks?.forEach(
    fn => typeof fn === 'function' && fn(this))
}

function flyTo () {

  const sourceVector = new ol.source.Vector();

  this.Layers.forEach(layer => {

    const source = layer.getSource()

    typeof source.getFeatures === 'function'
      && sourceVector.addFeatures(source.getFeatures())
  })

  this.layer.mapview.fitView(sourceVector.getExtent());
}

async function trash() {

  if(!confirm(mapp.dictionary.confirm_delete)) return;

  await mapp.utils.xhr(`${this.layer.mapview.host}/api/location/delete?` +
    mapp.utils.paramString({
      locale: this.layer.mapview.locale.key,
      layer: this.layer.key,
      table: this.table,
      id: this.id
    }))

  this.layer.reload()

  this.remove()
}