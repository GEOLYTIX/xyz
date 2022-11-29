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

    // Append the tabulator css to the document head.
    document.getElementsByTagName('HEAD')[0].append(mapp.utils.html.node`
    <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@5.4.2/dist/css/tabulator.min.css"/>`);

    // Import Chart and plugins.
    Promise
      .all([
        import('https://cdn.skypack.dev/pin/tabulator-tables@v5.4.2-4Kc6XrzXUsfkNcGniHXt/mode=imports,min/optimized/tabulator-tables.js')
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