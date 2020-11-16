export const TabulatorFormatter = {

  conditional: (cell, formatterParams, onRendered) => {

  	if(!cell.getValue()) return;

  	if(!formatterParams[`${cell.getValue()}`]) return cell.getValue();

  	cell.getElement().style.backgroundColor = formatterParams[`${cell.getValue()}`];
  
  }

}