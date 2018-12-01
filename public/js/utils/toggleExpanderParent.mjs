import {scrolly} from './scrolly.mjs';

// Function which expands the parent container of an expander element.
export function toggleExpanderParent(params) {

  if (!params.expandedTag) params.expandedTag = 'expanded';
  if (!params.expandableTag) params.expandableTag = 'expandable';

  // Check whether parent is expanded.
  if (params.expandable.classList.contains(params.expandedTag)) {

    // Remove expanded class.
    params.expandable.classList.remove(params.expandedTag);

    // Actualize scrollbar of scrolly element.
    if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);

    return;
  }

  // Accordion: Collapse the parents siblings which are expanded.
  if (params.accordeon) {
    [...params.expandable.parentElement.children].forEach(expandable_sibling => {
      expandable_sibling.classList.remove(params.expandedTag);
      if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
    });
  }

  // Add expanded class to expandable element.
  if (params.expandable.classList.contains(params.expandableTag)) {
    params.expandable.classList.add(params.expandedTag);
    if (params.scrolly) setTimeout(() => scrolly(params.scrolly), 400);
  }

}