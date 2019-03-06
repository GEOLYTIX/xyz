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

  entry.row = _xyz.utils.createElement({
    tag: 'tr',
    options: {
      className: 'lv-0'
    },
    appendTo: entry.location.view.node
  });

  // Create a table cell for image control.
  entry.ctrl.container = _xyz.utils.createElement({
    tag: 'td',
    options: {
      className: 'td_images',
      colSpan: '2'
    },
    appendTo: entry.row
  });

  if (entry.edit) entry.ctrl.add_image(entry);

  // add images if there are any
  for (let image of images) {

    const imageCell = _xyz.utils.createElement({
      tag: 'div',
      appendTo: entry.ctrl.container
    });

    const img = _xyz.utils.createElement({
      tag: 'img',
      options: {
        id: image.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
        src: image
      },
      appendTo: imageCell
    });

    // Add delete button if images entry is editable.
    if (entry.edit) _xyz.utils.createElement({
      tag: 'button',
      options: {
        title: 'Delete image',
        className: 'cursor',
        textContent: 'Delete'
      },
      appendTo: imageCell,
      eventListener: {
        event: 'click',
        funct: e => {
          e.target.remove();
          entry.ctrl.delete_image(entry, img);
        }
      }
    });

  }

};