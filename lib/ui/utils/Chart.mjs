let promise, Chart = null

export default async function(canvas, options) {

  // Return Chart method if defined.
  if (Chart) return new Chart(canvas, options);

  // Create promise to load Chart library.
  if (!promise) promise = new Promise(async resolve => {

    // Assign from window if Chart library is loaded from link
    if (window.Chart) {

      Chart = window.Chart

      resolve()
  
      return
    }

    // Import Chart and plugins.
    Promise
      .all([
        import('https://cdn.jsdelivr.net/npm/chart.js/+esm'),
        import('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels/+esm'),
        import('https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation/+esm')

      ])
      .then(imports => {

        // console.log(imports)

        // Register imports
        imports[0].Chart.register(...imports[0].registerables);
  
        imports[0].Chart.register(imports[1].default);

        imports[0].Chart.register(imports[2].default); 
  
        Chart = imports[0].Chart

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load Chart.js library. Please reload the browser.')
      })
  
  })

  await promise

  return new Chart(canvas, options);
}