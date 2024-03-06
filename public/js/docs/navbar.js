document.addEventListener('DOMContentLoaded', function () {
    // Get the container element for the modules section
const sidebarModulesContainer = document.querySelector('#sidebar > div > div.sidebar-section-children-container');

// Get all elements within the modules section container
const moduleElements = sidebarModulesContainer.querySelectorAll('*');

// Create an object to store grouped elements
const groupedElements = {};

// Iterate over each module element
moduleElements.forEach(element => {
    // Check if the element's classes contain the desired substring
    if (element.classList.contains('/layer/')) {
        // Get the common substring
        const substring = '/layer/';

        // Check if a group for this substring exists, if not, create one
        if (!groupedElements[substring]) {
            groupedElements[substring] = [];
        }

        // Add the element to the appropriate group
        groupedElements[substring].push(element);
    }
});

// Now you have groupedElements object containing groups of elements based on the "/layer/" substring
console.log(groupedElements);


});