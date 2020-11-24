document.dispatchEvent(new CustomEvent('tabulator_underline_formatter', {
  detail: _xyz => {

    const colours = {
      "Red": "#ef5350",
      "Amber": "#ffa000",
      "Green": "#66bb6a"
    }

    _xyz.dataviews.plugins.conditional_underline = (cell, formatterParams, onRendered) => {

      const cellVal = cell.getValue()

      if(!cellVal) return

      console.log(cellVal)

      const val = cellVal.split('|')[0]

      const colour = cellVal.split('|')[1]

      if (colour && colours[colour]) {

        cell.getElement().style.borderBottom = `3px solid ${colours[colour]}`

      }

      return val
    
    }

}}))