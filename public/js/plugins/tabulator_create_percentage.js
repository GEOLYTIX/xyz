document.dispatchEvent(new CustomEvent('create_percentage', {
  detail: _xyz => {

    _xyz.dataviews.plugins.create_percentage = (cell, formatterParams, onRendered) => {

      const cellVal = cell.getValue()

      if(!cellVal) return

      return `${Math.round(cellVal * 1000) / 10}%`
    
    }

}}))