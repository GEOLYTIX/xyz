let promise, Tabulator = null

export default async function() {

  // Return Chart method if defined.
  if (Tabulator) return new Tabulator(...arguments);

  // Create promise to load Chart library.
  if (!promise) promise = new Promise(async resolve => {

    // Assign from window if Chart library is loaded from link
    if (window.Tabulator) {

      Tabulator = window.Tabulator

      resolve()
  
      return
    }

    // Import Chart and plugins.
    Promise
      .all([
        import('https://cdn.skypack.dev/pin/tabulator-tables@v5.3.0-3P9dSwNRL29tgc0Vmk59/mode=imports,min/optimized/tabulator-tables.js')
      ])
      .then(imports => {
  
        Tabulator = imports[0].TabulatorFull

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load Tabulator library. Please reload the browser.')
      })
  
  })

  await promise

  return new Tabulator(...arguments);
}