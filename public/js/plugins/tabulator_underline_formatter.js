document.dispatchEvent(new CustomEvent('tabulator_conditional_formatter', {
  detail: _xyz => {

    _xyz.dataviews.plugins.conditional_underline = (cell, formatterParams, onRendered) => {

      if(!cell.getValue()) return;

      console.log(cell)
  
      if(!formatterParams[`${cell.getValue()}`]) return cell.getValue();
  
      cell.getElement().style.backgroundColor = formatterParams[`${cell.getValue()}`];
    
    }

}}))