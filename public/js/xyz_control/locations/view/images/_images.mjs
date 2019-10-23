import add_image from './add_image.mjs';

import delete_image from './delete_image.mjs';

import upload_image from './upload_image.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    add_image: add_image(_xyz),

    delete_image: delete_image(_xyz),

    upload_image: upload_image(_xyz),

  };

  const images = entry.value.reverse() || [];

  if (!images.length && !entry.edit) return entry.row.remove();

  if (entry.label_td) {
    entry.label_td.colSpan = '2';
  } else {
    entry.row.remove();
  }

  entry.row = _xyz.utils.wire()`<tr class="lv-0">`;
  entry.location.view.node.appendChild(entry.row);

  // Create a table cell for image control.
  entry.ctrl.container = _xyz.utils.wire()`<td class="td_images" colSpan=2>`;
  entry.row.appendChild(entry.ctrl.container);

  if (entry.edit) entry.ctrl.add_image(entry);

  // add images if there are any
  for (let image of images) {

    const imageCell = _xyz.utils.wire()`<div>`;
    entry.ctrl.container.appendChild(imageCell);

    const img = _xyz.utils.wire()`<img>`;
    img.id = image.replace(/.*\//, '').replace(/\.([\w-]{3})/, '');
    img.src = image;
    imageCell.appendChild(img);

    // Add delete button if images entry is editable.
    if(entry.edit) imageCell.appendChild(_xyz.utils.wire()`
      <button title="Delete image" class="cursor" style="font-size: 14px;"
      onclick=${
        e => {
          e.target.remove();
          entry.ctrl.delete_image(entry, img);
        }
      }
      >Delete`);

  }

};