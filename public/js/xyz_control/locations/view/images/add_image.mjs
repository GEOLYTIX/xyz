export default _xyz => (entry) => {

  // Add table cell for image upload input.
  entry.ctrl.add_img_td = _xyz.utils.createElement({
    tag: 'td',
    options: {
      className: 'addImageCell'
    },
    appendTo: entry.ctrl.row
  });

  // Add label for image upload icon.
  entry.ctrl.add_img_label = _xyz.utils.createElement({
    tag: 'label',
    appendTo: entry.ctrl.add_img_td
  });

  // Add image upload icon to label.
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect',
      textContent: 'add_a_photo'
    },
    appendTo: entry.ctrl.add_img_label
  });

  // Add image input.
  entry.ctrl.add_img_input = _xyz.utils.createElement({
    tag: 'input',
    options: {
      type: 'file',
      accept: 'image/*;capture=camera'
    },
    appendTo: entry.ctrl.add_img_label
  });

  // empty the file input value
  entry.ctrl.add_img_input.addEventListener('click', () => entry.ctrl.add_img_input.value);

  // add change event 
  entry.ctrl.add_img_input.addEventListener('change', function () {

    const newImage = document.createElement('td');

    const reader = new FileReader();

    reader.onload = function (readerOnload) {

      const img = new Image();

      img.onload = function () {

        let
          canvas = document.createElement('canvas'),
          max_size = 1024,
          width = img.width,
          height = img.height;

        // resize
        if (width > height && width > max_size) {
          height *= max_size / width;
          width = max_size;

        } else if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        const dataURL = canvas.toDataURL('image/jpeg', 0.5);

        const _img = _xyz.utils.createElement({
          tag: 'img',
          options: {
            src: dataURL
          },
          style: {
            border: '3px solid #090'
          }
        });

        // Add control to delete image which is not uploaded yet.
        const btn_del = _xyz.utils.createElement({
          tag: 'button',
          options: {
            title: 'Delete image',
            className: 'btn_del',
            innerHTML: '<i class="material-icons">delete_forever</i>'
          },
          appendTo: newImage,
          eventListener: {
            event: 'click',
            funct: () => {
              newImage.remove();
            }
          }
        });

        // Add control to upload image.
        const btn_save = _xyz.utils.createElement({
          tag: 'button',
          options: {
            title: 'Save image',
            className: 'btn_save',
            innerHTML: '<i class="material-icons">cloud_upload</i>'
          },
          appendTo: newImage,
          eventListener: {
            event: 'click',
            funct: () => {
              btn_del.remove();
              btn_save.remove();
              entry.ctrl.upload_image(entry, _img, dataURL);
            }
          }
        });

        newImage.appendChild(_img);
      };

      img.src = readerOnload.target.result;

    };

    reader.readAsDataURL(this.files[0]);

    // insert new image before last image
    entry.ctrl.row.insertBefore(newImage, entry.ctrl.row.childNodes[1]);
  });

};