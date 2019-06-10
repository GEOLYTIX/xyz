import {createElement} from './createElement.mjs';
import {dropdown} from './dropdown.mjs';

export function dropdownCustom(param){

	let entries = [{"placeholder": param.placeholder || "Select from list"}];

	param.entries.map(item => entries.push(item));

	let div = createElement({
		tag: 'div',
		options: {
			classList: 'xyz-custom-select'
		},
		appendTo: param.appendTo
	});

	let x = dropdown({
		appendTo: div,
	  	entries: entries,
	  	style: {
	  		display: 'none'
	  	}
	  });

    // create a new div that will act as the selected item
	let a = createElement({
		tag: 'div',
		options: {
			classList: 'select-selected',
			innerHTML: x.options[x.selectedIndex].innerHTML
		},
		eventListener: {
			event: 'click',
			funct: e => { //when the select box is clicked, close any other select boxes and open/close the current select box
				e.stopPropagation();
				closeAllSelect(e.target);
				e.target.nextSibling.classList.toggle('select-hide');
				e.target.classList.toggle('select-arrow-active');

				// Hide dropdown when clicked outside
				document.body.addEventListener('click', e => {
					let items = document.querySelectorAll('.xyz-custom-select .select-items');
					for (let i = 0; i < items.length; i++) {
						items[i].classList.add('select-hide');
					}
					e.stopPropagation();
					return false;
				});
			}
		},
		appendTo: div
	});

	a.dataset.field = param.field;

	// create a new div that will contain the option list d d d
	let b = createElement({
		tag: 'div',
		options: {
			classList: 'select-items select-hide'
		},
		style: {
			maxHeight: param.height ? `${param.height}px` : '300px',
			overflow: 'scroll'
		},
		appendTo: div
	});

	for(let j = 1; j < x.options.length; j++){
		let c = createElement({
			tag: 'div',
			options: {
				innerHTML: x.options[j].innerHTML
			},
			eventListener: {
				event: 'click',
				funct: e => {
					//when an item is clicked, update the original select box and the selected item
					let s = e.target.parentNode.parentNode.getElementsByTagName('select')[0],
					    h = e.target.parentNode.previousSibling;

					for (let i = 0; i < s.length; i++) {
						if (s.options[i].textContent == e.target.textContent) {
							s.selectedIndex = i;
							h.textContent = e.target.textContent;
							let y = e.target.parentNode.querySelectorAll('.same-as-selected');
							for (let k = 0; k < y.length; k++) {
								y[k].removeAttribute('class');
							}
							e.target.setAttribute('class', 'same-as-selected');
							break;
						}
					}
					h.click();
					if(typeof(param.callback) === 'function') param.callback(e);
			    }
		    },
		    appendTo: b
	    });

	    c.dataset.field = x.options[j].value;
	}
}

function closeAllSelect(el){
	//a function that will close all select boxes in the document except the current select box:
    let arrNo = [],
        i,
        x = document.querySelectorAll('.xyz-custom-select .select-items'),
        y = document.querySelectorAll('.xyz-custom-select .select-selected');
    
    for (i = 0; i < y.length; i++) {
    	if (el == y[i]) {
    		arrNo.push(i);
    	} else {
    		y[i].classList.remove('select-arrow-active');
    	}
    }

    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }
}




