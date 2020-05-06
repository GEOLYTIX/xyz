export const TabulatorFormatter = {

  red: (cell, formatterParams, onRendered) => {

    cell.getElement().style.backgroundColor = 'red'
  },

  colour: (cell, formatterParams, onRendered) => {

    cell.getElement().style.backgroundColor = formatterParams.colour;
  },

  conditional: (cell, formatterParams, onRendered) => {

  	if(!cell.getValue()) return;

  	if(!formatterParams[`${cell.getValue()}`]) return cell.getValue();

  	cell.getElement().style.backgroundColor = formatterParams[`${cell.getValue()}`];
  
  }

}