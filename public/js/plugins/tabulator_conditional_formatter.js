console.log(document.currentScript.src.match(/[^\/]+$/)[0])

document.dispatchEvent(new CustomEvent('tabulator_conditional_formatter', {
  detail: _xyz => {

    _xyz.dataviews.plugins.conditional_formatter = (cell, formatterParams, onRendered) => {

      if(!cell.getValue()) return;
  
      if(!formatterParams[`${cell.getValue()}`]) return cell.getValue();
  
      cell.getElement().style.backgroundColor = formatterParams[`${cell.getValue()}`];
    
    }

}}))