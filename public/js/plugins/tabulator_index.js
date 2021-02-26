document.dispatchEvent(new CustomEvent('tabulator_index', {
  detail: _xyz => {

    _xyz.dataviews.plugins.tabulator_index = (cell, formatterParams, onRendered) => {

      const cellVal = cell.getValue()

      if(!cellVal) return

      let indexVal = cell.getRow().getData()[`${cell.getField()}_index`]

      indexVal = Number.parseFloat(indexVal) - 100

      cell.getElement().style.color = indexVal < 0 ? '#b71c1c' : '#33691e';

      return `${Number.parseFloat(cellVal).toFixed(2)} (${indexVal.toFixed(1)})`
    
    }

}}))