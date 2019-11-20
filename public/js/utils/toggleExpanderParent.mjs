export function toggleExpanderParent(target, accordion) {

  const closestExpandable = target.closest('.expandable');

  if (!closestExpandable) return;

  // Set timeout to update the scrolly element after max-height transition;
  setTimeout(
    () => {
    const scrolly = closestExpandable.closest('.scrolly');
    scrolly && scrolly.dispatchEvent(new CustomEvent('scrolly'));
    }, 500);

  // If expanded? Remove expanded from closest expandable and return.
  if (closestExpandable.classList.contains('expanded')) {
    return closestExpandable.classList.remove('expanded');
  }

  // Accordion: Remove expanded from all siblings of closest expandable.
  if (accordion) {
    [...closestExpandable.parentElement.children].forEach(sibling => {
      sibling.classList.remove('expanded');
    });
  }

  // Add expanded class to closest expandable.
  closestExpandable.classList.add('expanded');

}