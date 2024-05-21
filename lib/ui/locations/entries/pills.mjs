export default entry => {

    entry.pills ??= entry.value || []
 
    mapp.ui.elements.pillComponent(entry)
  
    return entry.container
  }