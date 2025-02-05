export default function radiogroup(entry) {
  if (!entry.radiogroup?.name) return;

  entry.radiogroup ??= {};

  entry.radiogroup.title ??= '';

  entry.radiogroup.name ??= entry.field;

  const checked = entry.newValue !== undefined ? entry.newValue : entry.value;

  return mapp.ui.elements.radio({
    entry,
    checked,
    title: entry.radiogroup.title,
    name: entry.radiogroup.name,
    label: entry.label,
    onchange: (checked, params) => {
      // tick off other siblings of the radiogroup
      params.entry.location.infoj
        .filter((item) => item.radiogroup)
        .filter((item) => item.radiogroup.name == params.entry.radiogroup.name)
        .filter((item) => item.field != params.entry.field)
        .forEach((item) => (item.newValue = false));

      // set current radio
      params.entry.newValue = checked;
      // send change event
      params.entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: params.entry,
        }),
      );
    },
  });
}
