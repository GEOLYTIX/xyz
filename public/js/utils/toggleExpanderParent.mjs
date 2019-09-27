// Function which expands the parent container of an expander element.
export function toggleExpanderParent(params) {

  if (!params.expandedTag) params.expandedTag = 'expanded';
  if (!params.expandableTag) params.expandableTag = 'expandable';

  // Check whether parent is expanded.
  if (params.expandable.classList.contains(params.expandedTag)) {

    // Remove expanded class.
    params.expandable.classList.remove(params.expandedTag);
    return;
  }

  // Accordion: Collapse the parents siblings which are expanded.
  if (params.accordeon) {
    [...params.expandable.parentElement.children].forEach(expandable_sibling => {
      expandable_sibling.classList.remove(params.expandedTag);
    });
  }

  // Add expanded class to expandable element.
  if (params.expandable.classList.contains(params.expandableTag)) {
    params.expandable.classList.add(params.expandedTag);
  }

}