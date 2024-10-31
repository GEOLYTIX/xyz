/**
@module /ui/locations/view
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_zoom: 'Zoom map to feature bounds',
    location_save: 'Save changes to cloud',
    location_remove: 'Remove feature from selection',
    location_delete: 'Delete location',
    location_save_changes: 'Save your changes to this location?',
    location_close_without_save: 'Close location without saving changes?'
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
  esp: {
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

/**
@function view

@description
The view method creates a location view element group.

@param {location} location A mapp location object.

@returns {HTMLElement} The location.view element.
*/
export default function view(location) {

  location.removeCallbacks?.push(function () {
    location.view.remove()
  })

  // Header with expander icon. 
  const header = [
    mapp.utils.html`<h2>${location.record.symbol}`,
    mapp.utils.html`<div class="mask-icon expander">`
  ]

  // Zoom to location bounds.
  if (location.infoj
    .filter(entry => new Set(['pin', 'geometry']).has(entry.type))
    .some(entry => !!entry.value)) {
    header.push(mapp.utils.html`<button
      title = ${mapp.dictionary.location_zoom}
      class = "mask-icon search"
      onclick = ${() => location.flyTo()}>`)
  }

  if (toggleLocationViewEdits(location)) {

    // Toggling locationViewEdits are enabled.
    header.push(location.editToggle)
  }

  // Update icon.
  header.push(mapp.utils.html`<button
    title = ${mapp.dictionary.location_save}
    class = "btn-save mask-icon done"
    style = "display: none;"
    onclick = ${() => {
      location.view.classList.add('disabled')
      location.update()
    }}>`);

  // The updateInfo event must be called after the editToggle callback.
  location.updateCallbacks?.push(function () {
    location.view.dispatchEvent(new Event('updateInfo'))
  })

  // Trash icon.
  if (location.layer?.edit?.delete || location.layer?.deleteLocation) {

    header.push(mapp.utils.html`<button
      title = ${mapp.dictionary.location_delete}
      class = "mask-icon trash"
      onclick = ${() => location.trash()}>`)
  }

  // Clear selection.
  header.push(mapp.utils.html`<button
    title= ${mapp.dictionary.location_remove}
    class= "mask-icon close no"
    onclick= ${location_remove}>`)

  /**
  @function location_remove

  @description
  The method checks whether a location.infoj has some unsaved changes. A confirm dialog will be shown to confirm the location.remove() without saving changes.
  */
  async function location_remove() {

    const changesUnsaved = location.infoj.some(entry => typeof entry.newValue !== 'undefined');

    if(changesUnsaved) {

      const confirm = await mapp.ui.elements.confirm({text: mapp.dictionary.location_close_without_save})

      if (!confirm) return;
    }

    location.remove()
  }

  location.view = mapp.ui.elements.drawer({
    class: 'location-view raised expanded',
    header: header
  })

  location.viewEntries = location.view.appendChild(mapp.ui.locations.infoj(location))

  // Assign location.record.colour as border to the location.view header.
  location.view.querySelector('.header').style.borderBottom = `3px solid ${location.record.colour}`

  // Add listener for custom valChange event.
  location.view.addEventListener('valChange', valChange)

  location.renderLocationView = renderLocationView

  location.view.addEventListener('render', () => location.renderLocationView())

  location.view.addEventListener('updateInfo', () => {

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

    location.renderLocationView()
  })
}

/**
@function toggleLocationViewEdits

@description
The toggleLocationViewEdits checks whether the location.layer has the toggleLocationViewEdits flag.

At least one entry of the location must be editable.

New locations must always be editable.

The location.editToggle button element for the location view header is created.

@param {location} location Mapp Location typedef

@return {Boolean} Returns true if toggleLocationViewEdits should be possible.
*/
function toggleLocationViewEdits(location) {

  if (!location.layer?.toggleLocationViewEdits) {

    // Toggle has not been set for layer.
    return false;
  }

  if (!location.infoj.some(entry => entry.edit)) {

    // The location has no editable entries.
    return false;
  }

  // Remove edits if location is not new.
  !location.new && location.removeEdits()

  // Create edit toggle button.
  location.editToggle = mapp.utils.html.node`<button
    title="Enable edits"
    class=${`mask-icon edit ${location.new && 'on' || ''}`}
    onclick=${onClickEditToggle}>`

  /**
  @function onClickEditToggle

  @description
  The location.editToggle onclick event method toggles location.view edits.

  A confirmation is required for entries with newValues.

  If cancelled the newValues will removed.

  A location.update() will be attempted on confirmation.

  An alert will be shown if the location.update() errs.

  The location.renderLocationView() will be called on successful update or cancellation.
  
  @param {Event} e The location.editToggle onclick event.
  */
  async function onClickEditToggle(e) {

    // Check for unsaved edits
    const unsavedChanges = location.infoj.some(entry => typeof entry.newValue !== 'undefined');

    if(unsavedChanges) {
      // There are edits to be saved.
      const confirm = await mapp.ui.elements.confirm({text: mapp.dictionary.location_save_changes})

      if(confirm) {

        const update = await location.update()
        
        // The update may err due to invalid entries.
        if (update instanceof Error) return;

      }
      

    } else if (e.target.classList.toggle('on')) {

      // Button is toggled on.
      location.restoreEdits()

    } else {

      // Button is toggled off.
      location.removeEdits()
      location.view.querySelector('.btn-save').style.display = 'none'

    }

    location.renderLocationView()
  }

  return true;
}

/**
@function valChange

@description
The valChange method is assigned to the valChange custom event listener of the location.view element.

An infoj-entry must be provided as detail when the valChange custom event is dispatched.

The valChange method will check whether an entry has a newValue which is different from the current value and assign a class to show the change on the input element.

The valChange event controls the display of the location.update button (.btn-save).

The update button will not be displayed if no entry has a newValue or if some entry is invalid.

@param {Event} e A custom event from the location.view eventlistener.
@property {infoj-entry} e.detail The detail passed to the valChange event must be an info-entry typedef.
*/
function valChange(e) {

  const entry = e.detail;

  // Get location from entry
  const location = entry.location;

  if (entry.valChangeMethod instanceof Function) {

    // Execute a custom valChangeMethod.
    entry.valChangeMethod(entry)
    return;
  }

  if (entry.value != entry.newValue) {

    // newValue is different from value.
    entry.node?.classList.add('val-changed')

  } else {

    // newValue is the same as value.
    delete entry.newValue
    entry.node?.classList.remove('val-changed')
  }

  if (location.infoj.some(entry => entry.invalid)) {

    // Hide save button if some location entry is invalid.
    location.view.querySelector('.btn-save').style.display = 'none';
    return;
  }

  // Hide upload button if no location entry has a newValue.
  location.view.querySelector('.btn-save').style
    .display = location.infoj
      .some(entry => typeof entry.newValue !== 'undefined')
      ? 'inline-block'
      : 'none';
}

/**
@function renderLocationView

@description
The renderLocationView method will remove all location.viewEntries and the `.disabled` class from the location.view before recreating the location.viewEntries and appending these to the location.view element.
*/
function renderLocationView() {

  const location = this

  // Remove location.viewEntries.
  location.viewEntries.remove()

  // Enables the location view node and child elements.
  location.view.classList.remove('disabled')

  // Recreate location.viewEntries.
  location.viewEntries = location.view.appendChild(mapp.ui.locations.infoj(location))
}