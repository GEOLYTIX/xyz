export default (async function () {

  if (!window.turf) {

    window.turf = {}
  }

  // Check whether turf.pointOnFeature already exists.
  if (!turf.kinks) {

    // Store imported module outside async import method.
    let mod;

    turf.kinks = async function () {

      // Assign mod from outside if exists or load mod from skypack.
      mod = mod || await import('https://cdn.skypack.dev/pin/@turf/kinks@v6.5.0-39Rc2thRTupJBj4qrdoO/mode=imports,min/optimized/@turf/kinks.js')

      // Return default module execution with arguments provided to the async load method.
      return mod.default(...arguments);
    }
  }

  const geoJSON = new ol.format.GeoJSON();

  mapp.ui.elements.contextMenu.modify = async function modify() {

    const menu = []

    const f = geoJSON.writeFeatureObject(this.interaction.Feature);

    // Point geometries are always valid.
    let validGeom = f.geometry.type === "Point"

    if (!validGeom) {

      // Check for kinks.
      let kinks = await turf.kinks(f.geometry)
      validGeom = !kinks.features?.length
    }

    // Check whether feature geometry is valid
    validGeom
      && menu.push(mapp.utils.html`
        <li
          onclick=${() => this.interaction.finish(this.interaction.getFeature())}>
          ${mapp.dictionary.save}`)

      || menu.push(mapp.utils.html`
      <li
        style="padding: 5px; opacity: 0.5;">
          ${mapp.dictionary.invalid_geometry}`)

    // Add cancel option to contextmenu.
    menu.push(mapp.utils.html`
      <li
        onclick=${() => this.interaction.finish()}>
        ${mapp.dictionary.cancel}`)

    // Set context menu popup on last vertex.
    this.popup({
      coords: this.interaction.vertices[this.interaction.vertices.length - 1],
      content: mapp.utils.html.node`<ul>${menu}`,
    })

  }

})()