mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_zoom: "Zoom map to feature bounds",
    location_save: "Save changes to cloud",
    location_remove: "Remove feature from selection",
    location_delete: "Delete location",
  },
  de: {
    location_zoom: "Ansicht den Lagen Geometrien anpassen",
    location_save: "Speichern der Datenänderungen",
    location_remove: "Lagen Auswahl aufheben",
    location_delete: "Löschen der Lage",
  },
  cn: {
    location_zoom: "缩放地图至目标范围",
    location_save: "将更改保存至云",
    location_remove: "删除所选目标要素",
    location_delete: "删除地点",
  },
  pl: {
    location_zoom: "Pokaż zasięg miejsca",
    location_save: "Zapisz zmiany",
    location_remove: "Odznacz miejsce",
    location_delete: "Usuń miejsce",
  },
  ko: {
    location_zoom: "한계를 포함한 줌 지도",
    location_save: "변경사항 크라우드 저장",
    location_remove: "선택에서 특징 제거",
    location_delete: "위치 삭제",
  },
  fr: {
    location_zoom: "Zoom sur le lieu",
    location_save: "Enregistrer les modifications",
    location_remove: "Le désélectionner",
    location_delete: "Supprimer le lieu",
  },
  ja: {
    location_zoom: "フィーチャ範囲にはマップをズーム",
    location_save: "クラウドに変更を保存",
    location_remove: "選択からフィーチャー（機能）を削除",
    location_delete: "ロケーションを削除",
  }
})

export default location => {

  location.removeCallbacks?.push(function(){
    location.view.remove()
  })

  location.updateCallbacks?.push(function(){
    location.view.dispatchEvent(new Event('updateInfo'))
  })

  // Header with expander icon. 
  const header = [
    mapp.utils.html`<h2>${location.record.symbol}`,
    mapp.utils.html`<div class="mask-icon expander">`
  ]

  // Zoom to location bounds.
  location.infoj.some(
    entry => (entry.type === 'pin' || entry.type === 'geometry')
      && entry.value) && header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_zoom}
      class = "mask-icon search"
      onclick = ${e => {
        location.flyTo()
      }}>`)

  // Edit icon.
  if (location.layer.toggleLocationViewEdits) {

    // Remove edit from infoj entries
    location.infoj.forEach(entry => {

      if (!entry.edit) return;

      entry._edit = entry.edit
      delete entry.edit
    })

    header.push(mapp.utils.html`
      <button
        title = "Enable edits"
        class = "mask-icon build"
        onclick = ${e => {

          // Restore edit in infoj entries
          location.infoj.forEach(entry => {

            if (!entry._edit) return;

            entry.edit = entry._edit
            delete entry._edit
          })

          infoj.remove()

          e.target.style.display = 'none'
        
          infoj = mapp.ui.locations.infoj(location)
      
          location.view.appendChild(infoj)
        }}>`)
  }   

  // Update icon.
  header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_save}
      class = "mask-icon cloud-upload"
      style = "display: none;"
      onclick = ${e => {
        location.view.classList.add('disabled')
        location.update()
      }}>`)

  // Trash icon.
  location.layer.edit && location.layer.edit.delete && 
  header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_delete}
      class = "mask-icon trash"
      onclick = ${e => {
        location.trash()
      }}>`)

  // Clear selection.
  header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_remove}
      class = "mask-icon close no"
      onclick = ${e => {
        location.remove()
        // location.layer.mapview.Map.updateSize()
      }}>`)

  location.view = mapp.ui.elements.drawer({
    class: 'location-view expanded',
    header: header
  })

  let infoj = location.view.appendChild(mapp.ui.locations.infoj(location))

  //location.view.dispatchEvent(new CustomEvent('appendInfoj'))

  location.view.querySelector('.header').style.borderBottom = `3px solid ${location.record.colour}`

  // Add listener for custom valChange event.
  location.view.addEventListener('valChange', e => {

    // entry object is provided as event detail.
    if (e.detail.value != e.detail.newValue) {

      // New value is different from current value.
      e.detail.node.classList.add('val-changed')
      
    } else {

      // New value is the same as current value.
      delete e.detail.newValue
      e.detail.node.classList.remove('val-changed')      
    }

    // Hide upload button if no other field in the infoj has a newValue.
    location.view.querySelector('.cloud-upload')
      .style.display = location.infoj
        .some(entry => typeof entry.newValue !== 'undefined')
          && 'inline-block' || 'none';

  })

  location.view.addEventListener('updateInfo', ()=>{

    infoj.remove()

    location.view.querySelector('.cloud-upload').style.display = 'none'

    location.view.classList.remove('disabled')

    infoj = mapp.ui.locations.infoj(location)

    location.view.appendChild(infoj)
  })
}