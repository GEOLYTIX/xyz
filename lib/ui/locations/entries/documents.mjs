export default entry => {

  const docs = entry.value.map(doc => mapp.utils.html`
		<div class="link-with-img">
      ${(entry.edit) && mapp.utils.html.node`
        <button
          class="mask-icon trash no"
          data-name=${doc.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}
          data-href=${doc}
          onclick=${e => removeDocument(e)}>
        </button>`}		
        <a target="_blank"
          href=${doc}>${doc.replace(/.*\//, '').replace(/\.([\w-]{3})/, '')}`)

  const upLoadBtn = mapp.utils.html.node`
    <div class="mask-icon cloud-upload">
      <input
        style="opacity: 0; width: 3em; height: 3em;"
        type="file"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
        onchange=${upload}>`

  entry.edit && docs.push(upLoadBtn)

  if (!docs.length) return;

  const docs_list = mapp.utils.html.node`<div>${docs}`

  return docs_list;

  async function upload(e) {

    entry.location.view?.classList.add('disabled')

    const reader = new FileReader()
      
    const file = e.target.files[0]
  
    if (!file) return;

    reader.onload = async readerOnload => {

      const response = await mapp.utils.xhr({
        method: 'POST',
        requestHeader: {
          'Content-Type': 'application/octet-stream'
        },
        url: `${entry.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({
          public_id: file.name,
          resource_type: 'raw'
        })}`,
        body: readerOnload.target.result
      })
      
      const secure_url = response.secure_url;
      const public_id = response.public_id.replace(/.*\//, '').replace(/\.([\w-]{3})/, '');

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
          value: secure_url,
        }))
      
      const newDoc = mapp.utils.html.node`
        <div class="link-with-img">
          <button
            class="mask-icon trash no"
            data-name=${public_id}
            data-href=${secure_url}
            onclick=${e => removeDocument(e)}>
          </button>
          <a target="_blank"
            href=${secure_url}>${public_id}`

      docs_list.insertBefore(newDoc, upLoadBtn)

      entry.location.view?.classList.remove('disabled')
    }

    reader.readAsDataURL(file)

    e.target.value = ''
  }

	async function removeDocument(e) {

		if (!confirm('Remove document link?')) return;

		const doc = e.target;

    mapp.utils.xhr(`${entry.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({
      destroy: true,
      public_id: doc.dataset.name
    })}`)

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
        value: doc.dataset.href
      }))    
    
    doc.parentNode.remove()
  } 
}