if (typeof Chart === 'undefined') {

  // import('https://cdn.jsdelivr.net/npm/chart.js@3.1.1/dist/chart.esm.js')
  //   .then(module => {
  //     console.log(module)
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });


  window.Chart = import('https://cdn.jsdelivr.net/npm/chart.js@3.1.1/dist/chart.esm.js')
  
}