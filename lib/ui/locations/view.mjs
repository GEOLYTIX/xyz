mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_zoom: 'Zoom map to feature bounds',
    location_save: 'Save changes to cloud',
    location_remove: 'Remove feature from selection',
    location_delete: 'Delete location',
    location_save_changes: 'Save your changes to this location?',
  },
  de: {
    location_zoom: 'Ansicht den Lagen Geometrien anpassen',
    location_save: 'Speichern der Datenänderungen',
    location_remove: 'Lagen Auswahl aufheben',
    location_delete: 'Löschen der Lage',
    location_save_changes: 'Ihre Änderungen an dieser Lage speichern?',
  },
  zh: {
    location_zoom: '地图缩放至要素边界',
    location_save: '保存更改并上传至云端',
    location_remove: '删除已选要素',
    location_delete: '删除位置点',
    location_save_changes: '保存对此位置的更改吗？',
  },
  zh_tw: {
    location_zoom: '地圖縮放至要素邊界',
    location_save: '保存更改並上傳至雲端',
    location_remove: '刪除已選要素',
    location_delete: '刪除位置點',
    location_save_changes: '保存對此位置的更改嗎？',
  },
  pl: {
    location_zoom: 'Przybliż do granic warstwy',
    location_save: 'Zapisz zmiany w chmurze',
    location_remove: 'Usuń funkcję z wyboru',
    location_delete: 'Usuń lokalizację',
    location_save_changes: 'Czy zapisac zmiany dla tej lokalizacji',
  },
  fr: {
    location_zoom: 'Zoomer sur les contours',
    location_save: 'Enregistrer les modifications',
    location_remove: 'Supprimer depuis la sélection',
    location_delete: 'Supprimer l\'emplacement',
    location_save_changes: 'Sauvegarder les modifications pour ce site ?',
  },
  ja: {
    location_zoom: 'フィーチャ範囲にはマップをズーム',
    location_save: 'クラウドに変更を保存',
    location_remove: '選択からフィーチャーを削除',
    location_delete: 'ロケーションを削除',
    location_save_changes: 'このロケーションの変更を保存',
  },
  es: {
    location_zoom: 'Ampliar los contornos del objeto.',
    location_save: 'Registrar modificaciones',
    location_remove: 'Eliminar de la selección',
    location_delete: 'Eliminar ubicación',
    location_save_changes: '¿Guardar los cambios en esta ubicación?',
  },
  tr: {
    location_zoom: 'Haritada sekil sinirlarina yaklas',
    location_save: 'Degisiklikleri buluta kaydet',
    location_remove: 'Sekli secilenlerden cikar',
    location_delete: 'Konumu sil',
    location_save_changes: 'Konum degisikliklerini kaydetmek ister misiniz?',
  },
  it: {
    location_zoom: 'Zoom sull\'elemento',
    location_save: 'Salva le modifiche',
    location_remove: 'Rimuovere elemento dalla selezione',
    location_delete: 'Elimina località',
    location_save_changes: 'Vuoi salvare le modifiche in questa località?',
  },
  th: {
    location_zoom: 'ซูมไปที่ขอบเขตเลเยอร์',
    location_save: 'บันทึกการเปลี่ยนแปลงไปยังระบบคลาวด์',
    location_remove: ' ลบคุณสมบัติออกจากการเลือก',
    location_delete: 'ลบตำแหน่ง',
    location_save_changes: 'บันทึกการเปลี่ยนแปลงของคุณในตำแหน่งนี้หรือไม่',
  },
})

export default location => {

  location.removeCallbacks?.push(function () {
    location.view.remove()
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

  // Edits must be toggled.
  if (location.layer?.toggleLocationViewEdits

    // Check whether there is anything to edit in the first place.
    && location.infoj.some(entry => typeof entry.edit !== 'undefined')) {

    // Remove edit from infoj entries
    location.removeEdits = () => {

      // Iterate through the location.infoj entries.
      location.infoj

        // Filter entries which have an edit key.
        .filter(entry => typeof entry.edit !== 'undefined')
        .forEach(entry => {

          // Remove newValue
          // Unsaved edits will be lost.
          delete entry.newValue

          // Change edit key to _edit
          entry._edit = entry.edit
          delete entry.edit
        })
    }

    // New locations should be editable.
    !location.new && location.removeEdits()

    // Create edit toggle button.
    location.editToggle = mapp.utils.html.node`
      <button
        title = "Enable edits"
        class = ${`mask-icon edit ${location.new && 'on' || ''}`}
        onclick = ${async e => {

        // Edits are on
        if (e.target.classList.contains('on')) {

          // Remove on class from button.
          e.target.classList.remove('on')

          // If there are unsaved edits.
          if (location.infoj.some(entry => typeof entry.newValue !== 'undefined')) {

            // Ask user whether to save edits.
            if (confirm(`Save your changes to this location?`)) {

              // Save edits.
              await location.update()

              // If user does not want to save edits.
            } else {

              // Remove edits from infoj entries.
              location.removeEdits()
            }
          }
          // If there's nothing to save.
          else {
            // Just remove edits from infoj entries.
            location.removeEdits()
          }

        } else {

          // Add on class to button.
          e.target.classList.add('on')

          // Restore edit in infoj entries
          location.infoj.forEach(entry => {

            if (!entry._edit) return;

            entry.edit = entry._edit
            delete entry._edit
          })

        }

        // Remove location.viewEntries
        location.viewEntries.remove()

        // Recreate location.viewEntries
        location.viewEntries = location.view.appendChild(mapp.ui.locations.infoj(location))

      }}>`

    header.push(location.editToggle)
  }

  // Update icon.
  header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_save}
      class = "btn-save mask-icon done"
      style = "display: none;"
      onclick = ${e => {
      location.view.classList.add('disabled')
      location.update()
    }}>`);

  // The updateInfo event must be called after the editToggle callback.
  location.updateCallbacks?.push(function () {
    location.view.dispatchEvent(new Event('updateInfo'))
  })

  // Trash icon.
  if (location.layer?.edit?.delete || location.layer?.deleteLocation) {

    header.push(mapp.utils.html`
      <button
        title = ${mapp.dictionary.location_delete}
        class = "mask-icon trash"
        onclick = ${e => {
        location.trash()
      }}>`)
  }

  // Clear selection.
  header.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_remove}
      class = "mask-icon close no"
      onclick = ${async e => {

      if (location.infoj.some(entry => typeof entry.newValue !== 'undefined')) {

        if (confirm(`${mappe.dictionary.location_save_changes}`)) {

          await location.update()

        } else {

          // The location will not be closed.
          return;
        }
      }

      location.remove()
    }}>`)

  location.view = mapp.ui.elements.drawer({
    class: 'location-view raised expanded',
    header: header
  })

  location.viewEntries = location.view.appendChild(mapp.ui.locations.infoj(location))

  location.view.querySelector('.header').style.borderBottom = `3px solid ${location.record.colour}`

  // Add listener for custom valChange event.
  location.view.addEventListener('valChange', e => {

    if (e.detail.valChangeMethod instanceof Function) {

      e.detail.valChangeMethod(e.detail)
      return;
    }

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
    location.view.querySelector('.btn-save').style.display =
      location.infoj.some(entry => typeof entry.newValue !== 'undefined')
        ? 'inline-block'
        : 'none';

  })

  location.view.addEventListener('updateInfo', () => {

    // Remove location.viewEntries.
    location.viewEntries.remove()

    // Hides the upload icon.
    location.view.querySelector('.btn-save').style.display = 'none'

    // Location has toggle editing.
    if (location.editToggle) {

      location.editToggle.classList.remove('on')

      // Remove edits from infoj entries.
      location.removeEdits()
    }

    // Refresh dataviews
    if (location.layer?.dataviews) {
      Object.values(location.layer.dataviews).forEach(dv => {
        if (dv.display === true) {
          dv.update();
        }
      });
    }

    // Enables the location view node and child elements.
    location.view.classList.remove('disabled')

    // Recreate location.viewEntries.
    location.viewEntries = location.view.appendChild(mapp.ui.locations.infoj(location))
  })
}