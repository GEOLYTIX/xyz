export default entry => {

  const images = entry.value.map(image => mapp.utils.html`
    <div>
      <img src=${image}
        onclick=${mapp.ui.utils.imagePreview}>
        ${(entry.edit) && mapp.utils.html.node`
          <button
            class="mask-icon trash no"
            data-name=${image.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}
            data-src=${image}
            onclick=${e => removeDocument(e)}>`
          }`)

  const upLoadBtn = mapp.utils.html.node`
    <div class="mask-icon add-photo pos-center">
      <input
        type="file"
        accept="image/*;capture=camera"
        onchange=${upload}>`

  entry.edit && images.push(upLoadBtn)

  if (!images.length) return;

  const images_grid = mapp.utils.html.node`
    <div
      class="images-grid">${images}`

  return images_grid;

  async function upload(e) {

    entry.location.view?.classList.add('disabled')

    const reader = new FileReader()
      
    const file = e.target.files[0]
  
    if (!file) return;

    reader.onload = readerOnload => {

      const img = new Image()
      
      img.onload = async () => {
        
        let
          canvas = mapp.utils.html.node`<canvas>`,
          max_size = 1024,
          width = img.width,
          height = img.height

        // resize
        if (width > height && width > max_size) {
          height *= max_size / width
          width = max_size

        } else if (height > max_size) {
          width *= max_size / height
          height = max_size
        }

        canvas.width = width
        canvas.height = height

        canvas.getContext('2d').drawImage(img, 0, 0, width, height)

        const dataURL = canvas.toDataURL('image/jpeg', 0.5)

        const response = await mapp.utils.xhr({
          method: 'POST',
          requestHeader: {
            'Content-Type': 'application/octet-stream'
          },
          url: `${entry.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({
            public_id: file.name.replace(/.*\//, '').replace(/\.([\w-]{3})/, ''),
            resource_type: 'image',
            folder: entry.cloudinary_folder
          })}`,
          body: mapp.utils.dataURLtoBlob(dataURL)
        })

        if (!response) {

          console.warn('Cloudinary image upload failed without response from XYZ host.')
          return;
        }

        await mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query?` +
          mapp.utils.paramString({
            template: 'set_field_array',
            locale: entry.location.layer.mapview.locale.key,
            layer: entry.location.layer.key,
            table: entry.location.table,
            qID: entry.location.layer.qID,
            id: entry.location.id,
            action: 'append',
            field: entry.field,
            value:  response.secure_url,
          }))

        const newImg = mapp.utils.html.node`
          <div>
            <img
              src=${response.secure_url}
              onclick=${mapp.ui.utils.imagePreview}>
              <button
                class="mask-icon trash no"
                data-name=${response.public_id}
                data-src=${response.secure_url}
                onclick=${e => removeDocument(e)}>`
  
        images_grid.insertBefore(newImg, upLoadBtn)

        entry.location.view?.classList.remove('disabled')
      }

      img.src = readerOnload.target.result
    }

    reader.readAsDataURL(file)

    e.target.value = ''
  }

  async function removeDocument(e) {

    if (!confirm('Remove image?')) return;

    const img = e.target;

    const response = mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({
      destroy: true,
      public_id: img.dataset.name,
      folder: entry.cloudinary_folder
    })}`)

    if (!response) {
      console.warn('Cloudinary destroy failed without response from XYZ host.')
      return;
    }

    await mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'set_field_array',
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        qID: entry.location.layer.qID,
        id: entry.location.id,
        action: 'remove',
        field: entry.field,
        value: img.dataset.src
      }))
      
    img.parentNode.remove()
  }
}