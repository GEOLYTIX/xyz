export default (_xyz, record) => {

  record.upload = _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'cloud_upload',
      className: 'material-icons cursor noselect btn_header',
      title: 'Save changes to cloud'
    },
    style: {
      display: 'none',
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        record.location.update(()=>{
          record.location.showUpload();
        });

      }
    }
  });

  record.location.showUpload = () => {

    // Hide upload button if no other field in the infoj has a newValue.
    if (!record.location.infoj.some(field => field.newValue)) {
      return record.upload.style.display = 'none';
    }

    record.upload.style.display = 'block';

  };
  
};