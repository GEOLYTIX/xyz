export default _xyz => (entry) => {

  // Add table cell for image upload input.
  entry.ctrl.add_img_td = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'addImage'
    },
    appendTo: entry.ctrl.container
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
  entry.ctrl.add_img_input.addEventListener('change', () => {

    const newImage = document.createElement('div');

    const reader = new FileReader();

    reader.onload = function (readerOnload) {

      const img = new Image();

      img.onload = () => {

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
          }
        });

        entry.ctrl.upload_image(entry, _img, dataURL);

        newImage.appendChild(_img);
      };

      img.src = readerOnload.target.result;

    };

    reader.readAsDataURL(entry.ctrl.add_img_input.files[0]);

    // insert new image before last image
    entry.ctrl.container.insertBefore(newImage, entry.ctrl.container.childNodes[1]);
  });

};