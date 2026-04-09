export default (entry) => {
  entry.pills ??= entry.value || [];

  mapp.ui.elements.pills(entry);

  return entry.container;
};
