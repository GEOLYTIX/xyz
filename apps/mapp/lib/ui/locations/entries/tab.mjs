export default (entry) => {
  const tabview = document.querySelector(`[data-id=${entry.target}]`);

  // Assign border style based on the location view record (from list)
  entry.tab_style = `border-bottom: 3px solid ${entry.location.style.strokeColor}`;

  // Create tabview after dataview creation is complete.
  tabview.dispatchEvent(
    new CustomEvent('addTab', {
      detail: entry,
    }),
  );

  // Show the tab if display is true.
  entry.display && entry.show();

  return mapp.ui.elements.chkbox({
    checked: !!entry.display,
    label: entry.label,
    onchange: (checked) => {
      entry.display = checked;

      // Show or remove tab according to the checked/display value.
      entry.display ? entry.show() : entry.remove();
    },
  });
};
