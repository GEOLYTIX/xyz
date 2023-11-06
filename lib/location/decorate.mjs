export default location => {

  Object.assign(location, {
    flyTo,
    Layers: [],
    remove,
    removeCallbacks: [],
    trash,
    update,
    syncFields,
    mvt_cache,
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

  // Reload the layer if possible.
  this.layer.reload && this.layer.reload()

  this.removeCallbacks?.forEach(
    fn => typeof fn === 'function' && fn(this))
}

async function update() {

  // Map new values into newValues object.
  const newValues = Object.fromEntries(this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .map(entry => [entry.field, entry.newValue]))

  if (!Object.keys(newValues).length) return;

  await this.mvt_cache()

  await mapp.utils.xhr({
    method: 'POST',
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

  await this.mvt_cache()

  // Update entry.values with newValues.
  // Return dependents from updated entries.
  const dependents = this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .map(entry => {

      entry.value = entry.newValue;
      delete entry.newValue;

      return entry.dependents
    })
    .flat()
    .filter(dependents => dependents !== undefined)
  
  // sync dependent fields
  if (dependents.length) await this.syncFields([...new Set(dependents)])

  // Reload layer.
  this.layer.reload()

  this.updateCallbacks?.forEach(fn => typeof fn === 'function' && fn(this))
}

async function syncFields(fields) {

  const response = await mapp.utils.xhr(
    `${this.layer.mapview.host}/api/location/get?` +
      mapp.utils.paramString({
        locale: this.layer.mapview.locale.key,
        layer: this.layer.key,
        table: this.table,
        id: this.id,
        fields: fields.join(),
      })
  );

  this.infoj
    .filter(entry => typeof response[entry.field] !== 'undefined')
    .forEach(entry => {
      entry.value = response[entry.field];
    })
}

function flyTo (maxZoom) {

  const sourceVector = new ol.source.Vector();

  this.Layers.forEach(layer => {

    const source = layer.getSource()

    typeof source.getFeatures === 'function'
      && sourceVector.addFeatures(source.getFeatures())
  })

  this.layer.mapview.fitView(sourceVector.getExtent(),{
    maxZoom
  });
}

async function mvt_cache() {

  if (!this.layer?.mvt_cache) return;

  await mapp.utils.xhr(`${this.layer.mapview.host}/api/query?` +
    mapp.utils.paramString({
      template: 'mvt_cache_delete_intersects',
      locale: this.layer.mapview.locale.key,
      layer: this.layer.key,
      mvt_cache: this.layer.mvt_cache,
      table: this.table,
      qID: this.layer.qID,
      id: this.id,
      geom: this.layer.geom
    }))
}

async function trash() {

  if(!confirm(mapp.dictionary.confirm_delete)) return;

  // Must clear cache before removing location from source.
  await this.mvt_cache()

  await mapp.utils.xhr(`${this.layer.mapview.host}/api/location/delete?` +
    mapp.utils.paramString({
      locale: this.layer.mapview.locale.key,
      layer: this.layer.key,
      table: this.table,
      id: this.id
    }))

  this.remove()
}