document.dispatchEvent(new CustomEvent(document.currentScript.src.match(/[^\/]+$/)[0], {
  detail: _xyz => {

    _xyz.dataviews.plugins.conditional_formatter = (cell, formatterParams, onRendered) => {

      if(!cell.getValue()) return;
  
      if(!formatterParams[`${cell.getValue()}`]) return cell.getValue();
  
      cell.getElement().style.backgroundColor = formatterParams[`${cell.getValue()}`];
    
    }

}}))