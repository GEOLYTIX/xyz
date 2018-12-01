import _xyz from '../../../_xyz.mjs';

import add_image from './add_image.mjs';

import delete_image from './delete_image.mjs';

export default (record, entry) => {

  const images = entry.value.reverse() || [];

  if (!images.length && !entry.edit) return entry.row.remove();

  if (entry.label) entry.row = _xyz.utils.createElement({
    tag: 'tr',
    options: {
      className: 'lv-0'
    },
    appendTo: record.table
  });

  // Create a table cell for image control.
  entry.val = _xyz.utils.createElement({
    tag: 'td',
    options: {
      className: 'val',
      colSpan: '2'
    },
    style: {
      position: 'relative',
      height: '180px'
    },
    appendTo: entry.row
  });

  const imageControl = {};

  imageControl.record = record;

  // Create a container for image control.
  imageControl.container = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'img-container'
    },
    appendTo: entry.val
  });

  // Create a table row to hold image array.
  imageControl.row = _xyz.utils.createElement({
    tag: 'tr',
    appendTo: imageControl.container
  });

  if (entry.edit) add_image(imageControl, entry);

  // add images if there are any
  for (let image of images) {

    const imageCell = _xyz.utils.createElement({
      tag: 'td',
      appendTo: imageControl.row
    });

    const img = _xyz.utils.createElement({
      tag: 'img',
      options: {
        id: image.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
        src: image
      },
      style: {
        border: '3px solid #EEE'
      },
      appendTo: imageCell
    });

    // Add delete button if images entry is editable.
    if (entry.edit) _xyz.utils.createElement({
      tag: 'button',
      options: {
        title: 'Delete image',
        className: 'btn_del',
        innerHTML: '<i class="material-icons">delete_forever</i>'
      },
      appendTo: imageCell,
      eventListener: {
        event: 'click',
        funct: e => {
          e.target.remove();
          delete_image(record, entry, img);
        }
      }
    });

  }

};