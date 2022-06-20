export default (function(){

  mapp.ui.locations.entries.table_plugin = entry => {

    Object.assign(entry, {
      events: {
        rowClick: (e, row) => {
          console.log(e);
          console.log(row)
        }
      }
    })

    return mapp.ui.locations.entries.dataview(entry)
  }

})()
