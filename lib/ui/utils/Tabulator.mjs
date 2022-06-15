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
        import('https://cdn.skypack.dev/-/tabulator-tables@v5.2.7-uFL2B6RLQMMWIcn9QymG/dist=es2019,mode=imports/optimized/tabulator-tables.js')
      ])
      .then(imports => {
  
        Tabulator = imports[0].TabulatorFull

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load Chart.js library. Please reload the browser.')
      })
  
  })

  await promise

  return new Tabulator(...arguments);
}