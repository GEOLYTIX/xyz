// Initialise utils.
const utils = require('./utils');

require('./scrolly')(document.querySelector('.mod_container'));

let expander_accordeon = document.querySelectorAll('.expander_accordeon');

expander_accordeon.forEach(el => {

    // Make the parent an expandable element.
    utils.addClass(el.parentElement, 'expandable');

    // Add function to toggle the expander parent
    el.addEventListener('click', e => toggleExpanderParent(e.target, e.target.parentElement, true));
});

let expander = document.querySelectorAll('.expander');

expander.forEach(el => {

    // Add function to toggle the expander parent
    el.addEventListener('click', e => toggleExpanderParent(e.target, e.target.parentElement.parentElement));
});

function toggleExpanderParent(el, expandable, accordeon){

    // Check whether parent is expanded.
    if (utils.hasClass(expandable, 'expanded')) {
        // Remove expanded class.
        utils.removeClass(expandable, 'expanded');
        return
    }

    // Accordion: Collapse the parents siblings which are expanded.
    if (accordeon){
        [...expandable.parentElement.children].forEach(expandable_sibling => {
            utils.removeClass(expandable_sibling,'expanded');
        });
    }

    // Add expanded class to expandable element.
    if (utils.hasClass(expandable, 'expandable')) utils.addClass(expandable, 'expanded');
}





// function getParents(el){
//     if(!el.parentElement) return
 
//     if (utils.hasClass(el.parentElement, 'expandable')) el.parentElement.style.maxHeight =  '1000px';
    
//     getParents(el.parentElement);
// }