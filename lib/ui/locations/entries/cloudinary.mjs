mapp.utils.merge(mapp.dictionaries, {
  en: {
    image_upload_failed: 'Image upload failed.',
    document_upload_failed: 'Document upload failed.',
    remove_item_confirm: 'Remove item?'
  },
  de: {
    image_upload_failed: 'Hochladen des Bildes gescheitert.',
    document_upload_failed: 'Hochladen des Dokumentes gescheitert.',
  },
  zh: {
    image_upload_failed: '图片上传失败。',
    document_upload_failed: '文档上传失败。',
  },
  zh_tw: {
    image_upload_failed: '圖片上傳失敗。',
    document_upload_failed: '文檔上傳失敗。',
  },
  pl: {
    image_upload_failed: 'Załadowanie obrazu nie powiodło się',
    document_upload_failed: 'Załadowanie dokumentu nie powiodło się',
  },
  fr: {
    image_upload_failed: 'Echec du chargement de l\'image.',
    document_upload_failed: 'Echec du chargement du document.',
  },
  ja: {
    image_upload_failed: '画像のアップロードに失敗しました',
    document_upload_failed: '書類のアップロードに失敗しました',
  },
  esp: {
    image_upload_failed: 'Error al cargar la imagen.',
    document_upload_failed: 'Error al cargar el documento.',
  },
  tr: {
    image_upload_failed: 'Gorsel yukleme basarisiz',
    document_upload_failed: 'Belge yukleme basarisiz',
  },
  it: {
    image_upload_failed: 'Errore nel caricare l\'immagine',
    document_upload_failed: 'Errore nel caricare il documento',
  },
  th: {
    image_upload_failed: 'การอัปโหลดรูปภาพล้มเหลว',
    document_upload_failed: 'การอัพโหลดเอกสารล้มเหลว',
  }
})

const types = {
  image,
  images,
  documents
}

export default entry => types[entry.type](entry)

const onload = {
  image: imageLoad,
  images: imageLoad,
  documents: docLoad
}

/**
@function image

@description
This image function takes an entry object and generates HTML elements based on the value property of the entry. Here's an explanation of its functionality.

@param {Object} entry 
@returns {HTML} image
*/
function image(entry) {

  let image

  if (entry.value) {

    // The trash button will only be created when entry is editable.
    const trashBtn = entry.edit && mapp.utils.html`
      <button 
        style="position: absolute; width: 2em; height: 2em; right: 0.5em; top: 0.5em;"
        class="mask-icon trash no"
        data-name=${entry.value.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
        data-src=${entry.value}
        onclick=${e => trash(e, entry)}>`

    image = mapp.utils.html.node`
      <div style="position: relative">
        <img
          style="width: 100%"
          src=${entry.value}
          onclick=${mapp.ui.utils.imagePreview}>
          ${trashBtn}`

  // Edit can only be available if no image is stored.
  } else if (entry.edit) {

    image = mapp.utils.html.node`
      <input 
        type=file class="flat bold wide primary-colour"
        accept="image/*"
        capture="camera"
        onchange=${e => upload(e, entry)}>`
  }

  if (typeof entry.drawer === 'string') {

    // Create a drawer with the entry.drawer value as header.
    return mapp.ui.elements.drawer({
      data_id: "upload-image-drawer",
      class: `raised ${entry.expanded? 'expanded' : ''}`,
      header: mapp.utils.html`
        <h3>${entry.drawer}</h3>
        <div class="mask-icon expander expanded raise"></div>`,
      content: image})

  } else {

    return image
  }
}

/**
@function images

@description
This images function takes an entry object and generates HTML elements based on the value property of the entry. Here's an explanation of its functionality.

@param {Object} entry 
@returns {HTML} imagesGrid
*/
function images(entry) {

  const images = entry.value?.map(image => {

    // The trash button will only be created when entry is editable.
    const trashBtn = entry.edit && mapp.utils.html`
      <button
        class="mask-icon trash no"
        data-name=${image.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
        data-src=${image}
        onclick=${e => trash(e, entry)}>`

    return mapp.utils.html`
      <div>
        <img 
          src=${image}
          onclick=${mapp.ui.utils.imagePreview}>
          ${trashBtn}`

  }) || []

  // Push upload input into images array.
  if (entry.edit) images.push(mapp.utils.html.node`
    <div class="mask-icon add-photo pos-center">
      <input
        type="file"
        accept="image/*"
        capture="camera"
        onchange=${e => upload(e, entry)}>`)

  if (!images.length) return;

  const imagesGrid = mapp.utils.html.node`
    <div class="images-grid">${images}`

  if (typeof entry.drawer === 'string') {

    return mapp.ui.elements.drawer({
      data_id: "upload-image-drawer",
      class: `raised ${entry.expanded? 'expanded' : ''}`,
      header: mapp.utils.html`
        <h3>${entry.drawer}</h3>
        <div class="mask-icon expander expanded raise"></div>`,
      content: imagesGrid
    })

  } else {

    return imagesGrid
  }
}

/**
@function documents

@description
This documents function takes an entry object and generates HTML elements based on the value property of the entry. Here's an explanation of its functionality.

@param {Object} entry 
@returns {HTML} docslist
 */
function documents(entry) {

  const docs = entry.value?.map(doc => {

    const trashBtn = entry.edit && mapp.utils.html`
      <button
        class="mask-icon trash no"
        data-name=${doc.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
        data-href=${doc}
        onclick=${e => trash(e, entry)}>`

    return mapp.utils.html`
      <div class="link-with-img">
        ${trashBtn}<a
          target="_blank"
          href=${doc}>${doc.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}`

  }) || []

  entry.edit && docs.unshift(mapp.utils.html`<input 
    type=file class="flat bold wide primary-colour"
    accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
    onchange=${e => upload(e, entry)}>`)

  if (!docs.length) return;

  const docsList = mapp.utils.html.node`<div>${docs}`

  if (typeof entry.drawer === 'string') {
    return mapp.ui.elements.drawer({
      data_id: "upload-document-drawer",
      class: `raised ${entry.expanded? 'expanded' : ''}`,
      header: mapp.utils.html`
        <h3>${entry.drawer}</h3>
        <div class="mask-icon expander expanded raise"></div>`,
      content: docsList
    })
  } else {

    return docsList
  }
}

/**
@function upload

@description
Function used to upload image/doc.

@param {event} e 
@param {Object} entry  
*/
async function upload(e, entry) {

  // Location view must disabled while uploading resource.
  entry.location.view?.classList.add('disabled')

  const reader = new FileReader()

  if (!e.target.files[0]) return;

  entry.file = e.target.files[0]

  reader.onload = e => onload[entry.type](e, entry)

  reader.readAsDataURL(entry.file)
}

/**
@function imageLoad

@description
The imageLoad function handles the loading and processing of an image file.

@param {event} e 
@param {Object} entry 
*/
function imageLoad(e, entry) {

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
    const public_id = entry.file.name.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '') + entry.suffix_date ? `@${Date.now()}` : '';

    const signedUrl = await getSignedUrl(entry, public_id)

    const data = new FormData()
    data.append('file', dataURL)

    const response = await fetch(signedUrl, {
      method: 'post',
      body: data
    })

    if (!response || response.error) {
      const errorDetail = response?.error?.message? `Error: ${response.error.message}` : '';
      const errorMessage = `Cloudinary Image upload failed! ${errorDetail}`;
      alert(errorMessage);
      return;
    }

    const responseJson = await response.json()

    if (entry.type === 'image') {

      // Only a single image is supported by the entry.type.
      entry.value = responseJson.secure_url

    } else {

      // Add the secure_url to the entry values array and update the location.
      entry.value = Array.isArray(entry.value) ? entry.value.concat([responseJson.secure_url]) : [responseJson.secure_url]
    }

    postUpdate(entry)
  }

  img.src = e.target.result
}

/**
@function docLoad

@description
The docLoad function handles the loading and processing of an image file.

@param {event} e 
@param {Object} entry 
*/
async function docLoad(e, entry) {

  const date = new Date();
  const stamp = `${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}`
  const file_type = entry.file.name.substring(entry.file.name.lastIndexOf('.'))
  const public_id = `${entry.file.name.replace(file_type, '')}-${stamp}${file_type}`;

  const signedUrl = await getSignedUrl(entry, public_id)

  console.log(signedUrl)

  const data = new FormData()
  
  data.append('file', e.target.result.toString())

  const response = await fetch(signedUrl, {
    method: 'post',
    body: data
  })

  if (!response || response.error) {
    const errorDetail = response?.error?.message ? ` Error: ${response.error.message}` : '';
    const errorMessage = `Cloudinary document upload failed!${errorDetail}`;
    alert(errorMessage);
    return;
  }

  // Add the secure_url to the entry values array and update the location.
  const responseJson = await response.json()
  entry.value = Array.isArray(entry.value) ? entry.value.concat([responseJson.secure_url]) : [responseJson.secure_url]

  postUpdate(entry)
}

/**
@function trash

@description
The trash function handles the deletion an image file.

@param {event} e 
@param {Object} entry 
*/
async function trash(e, entry) {

  if (!confirm('Remove item?')) return;
  const public_id = decodeURIComponent(e.target.dataset.name);
  const signedUrl = await getSignedUrl(entry, public_id, e)

  // Send request to cloudinary to destroy resource.
  await fetch(signedUrl, { method: 'post' })

  // Remove the resource link from the entry values array and update the location.
  const valueSet = new Set(entry.value)

  valueSet.delete(e.target.dataset.src || e.target.dataset.href)

  if (entry.type === 'image') {
    entry.value = null

  } else {
    entry.value = valueSet.size ? Array.from(valueSet) : null;
  }

  postUpdate(entry)
}

/**
@function postUpdate 

@description
The postUpdate function handles updating a location with the new image/doc.

@param {Object} entry
*/
async function postUpdate(entry) {

  entry.location.view?.classList.add('disabled')

  // Update the geometry field value.
  const updateBody = { [entry.field]: entry.value }
  
  await mapp.utils.xhr({
    method: 'POST',
    url:
      `${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'location_update',
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        id: entry.location.id,
      }),
    body: JSON.stringify(updateBody),
  })

  //Keep the drawer open after upload or delete
  if(entry.drawer){
    entry.expanded = true
  }
  const content = mapp.ui.locations.entries[entry.type](entry)

  mapp.utils.render(entry.node, content)

  entry.location.view?.classList.remove('disabled')
}

/**
@function getSignedUrl

@description
Function to generate a signed URL for the CRUD of an Image/Doc.

@param {Object} entry 
@param {String} public_id 
@param {event} e 
@returns {String} signedURL
*/
async function getSignedUrl(entry, public_id, e) {

  public_id = e ? decodeURIComponent(e.target.dataset.name) : public_id;

  const paramString = mapp.utils.paramString({
    destroy: e ? true : false,
    public_id: public_id,
    folder: entry.cloudinary_folder
  })

  const signedUrl = await mapp.utils.xhr({
    url: `${entry.location.layer.mapview.host}/api/sign/cloudinary?${paramString}`,
    responseType: 'text'
  });

  console.log(signedUrl)

  return signedUrl
}
