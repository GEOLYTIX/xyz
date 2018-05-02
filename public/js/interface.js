// Initialise utils.
const utils = require('./utils');

require('./scrolly')(document.querySelector('.mod_container'));

let expander = document.querySelectorAll('.expander');

expander.forEach(el => {

    // Set maxHeight of the parent to be 35px (collapsed).
    //el.parentElement.style.maxHeight =  '35px';

    // Make the parent an expandable element.
    utils.addClass(el.parentElement, 'expandable');

    // Add function to toggle the expander parent
    el.addEventListener('click', e => toggleExpanderParent(e.target));
});

function toggleExpanderParent(el){

    // Check whether parent is expanded.
    if (utils.hasClass(el.parentElement, 'expanded')) {
        // Remove expanded class.
        utils.removeClass(el.parentElement, 'expanded');
        return
    }

    // Accordion: Collapse the parents siblings which are expanded.
    [...el.parentElement.parentElement.children].forEach(parents_sibling => {
        utils.removeClass(parents_sibling,'expanded');
    });

    utils.addClass(el.parentElement, 'expanded');
}

// function getParents(el){
//     if(!el.parentElement) return
 
//     if (utils.hasClass(el.parentElement, 'expandable')) el.parentElement.style.maxHeight =  '1000px';
    
//     getParents(el.parentElement);
// }