export default (params) => mapp.utils.html.node`
  <div 
    data-id=${params.data_id || 'drawer'}
    class=${`drawer expandable ${params.class || ''}`}
  >
    <div
      class="header"
      onclick=${(e) => {
     
        if (e.target.parentElement.classList.contains('empty')) return;
      
        // If expanded? Remove expanded from closest expandable and return.
        if (e.target.parentElement.classList.contains('expanded')) {
          return e.target.parentElement.classList.remove('expanded');
        }
      
        // Accordion: Remove expanded from all siblings of closest expandable.
        if (params.accordion) {
          [...e.target.parentElement.parentElement.children].forEach(sibling => {
            sibling.classList.remove('expanded');
          });
        }
      
        // Add expanded class to closest expandable.
        e.target.parentElement.classList.add('expanded');
      }}
    >
      ${params.header}
    </div>
    ${params.content}
  </div>
`;