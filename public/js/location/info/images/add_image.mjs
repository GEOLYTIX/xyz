import upload_image from './upload_image.mjs';

export default (_xyz, imageControl, entry) => {

  // Add table cell for image upload input.
  imageControl.add_img_td = _xyz.utils.createElement({
    tag: 'td',
    options: {
      className: 'addImageCell'
    },
    appendTo: imageControl.row
  });

  // Add label for image upload icon.
  imageControl.add_img_label = _xyz.utils.createElement({
    tag: 'label',
    options: {
      htmlFor: 'addImage_' + imageControl.record.letter
    },
    appendTo: imageControl.add_img_td
  });

  // Add image upload icon to label.
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect',
      textContent: 'add_a_photo'
    },
    appendTo: imageControl.add_img_label
  });

  // Add image input.
  imageControl.add_img_input = _xyz.utils.createElement({
    tag: 'input',
    options: {
      id: 'addImage_' + imageControl.record.letter,
      type: 'file',
      accept: 'image/*;capture=camera'
    },
    appendTo: imageControl.add_img_td
  });

  // empty the file input value
  imageControl.add_img_input.addEventListener('click', () => imageControl.add_img_input.value);

  // add change event 
  imageControl.add_img_input.addEventListener('change', function () {

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
              upload_image(_xyz, imageControl.record, entry, _img, dataURL);
            }
          }
        });

        newImage.appendChild(_img);
      };

      img.src = readerOnload.target.result;

    };

    reader.readAsDataURL(this.files[0]);

    // insert new image before last image
    imageControl.row.insertBefore(newImage, imageControl.row.childNodes[1]);
  });

};