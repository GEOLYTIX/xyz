mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_style_header: 'Style',
    layer_style_select_theme: 'Select thematic style',
    layer_style_display_labels: 'Display labels',
    layer_style_display_hover: 'Enable hover',
    layer_style_switch_caption: 'Click on labels to switch visibility or',
    layer_style_switch_all: 'switch all',
    layer_grid_legend_ratio: 'Display colour as a ratio to the size',
    layer_style_cluster: 'Multiple locations',
  },
  de: {
    layer_style_header: 'Stil',
    layer_style_select_theme: 'Auswahl eines thematischen Stiles',
    layer_style_display_labels: 'Umschalten der Label Ansicht',
    layer_style_display_hover: 'Hover Einschalten',
    layer_style_switch_caption: 'Auswahl der Label schaltet Ansicht um oder',
    layer_style_switch_all: 'Alle auswählen',
    layer_grid_legend_ratio: 'Farbe im Verhältnis zur Größe',
    layer_style_cluster: 'Mehrere Lagen',
  },
  zh: {
    layer_style_header: '风格',
    layer_style_select_theme: '选择主题风格',
    layer_style_display_labels: '显示标签',
    layer_style_display_hover: '启用悬停',
    layer_style_switch_caption: '单击标签切换可见性',
    layer_style_switch_all: '全部切换（开关）',
    layer_grid_legend_ratio: '颜色随图点大小呈比例变化',
    layer_style_cluster: '多个地点',
  },
  zh_tw: {
    layer_style_header: '風格',
    layer_style_select_theme: '選擇主題風格',
    layer_style_display_labels: '顯示標籤',
    layer_style_display_hover: '啟用懸停',
    layer_style_switch_caption: '按一下標籤切換可見性',
    layer_style_switch_all: '全部切換（開關）',
    layer_grid_legend_ratio: '顏色隨圖點大小呈比例變化',
    layer_style_cluster: '多個地點',
  },
  pl: {
    layer_style_header: 'Styl',
    layer_style_select_theme: 'Wybierz styl tematyczny',
    layer_style_display_labels: 'Wyświetl etykiety',
    layer_style_display_hover: 'Wyświetl etykiety pod kursorem',
    layer_style_switch_caption: 'Kliknij na etykietę aby włączyć widzialność lub',
    layer_style_switch_all: 'włącz wszystkie',
    layer_grid_legend_ratio: 'Wyświetlaj kolory jako stosunek do wielkości',
    layer_style_cluster: 'Lokalizacje wielkokrotne',
  },
  fr: {
    layer_style_header: 'Style',
    layer_style_select_theme: 'Sélectionner le style de thématique',
    layer_style_display_labels: 'Afficher les étiquettes',
    layer_style_display_hover: 'Afficher via le curseur',
    layer_style_switch_caption: 'Cliquez sur les étiquettes pour changer de visibilité ou',
    layer_style_switch_all: 'changer pour tous',
    layer_grid_legend_ratio: 'Afficher la couleur en fonction de la taille',
    layer_style_cluster: 'Emplacements multiples',
  },
  ja: {
    layer_style_header: 'スタイル',
    layer_style_select_theme: 'テーマスタイルを選択',
    layer_style_display_labels: 'ラベルを表示',
    layer_style_display_hover: 'ホバリングをを有効にする',
    layer_style_switch_caption: '表示切替えには各ラベルをクリックするか',
    layer_style_switch_all: '全てを変更',
    layer_grid_legend_ratio: 'サイズに対する色を比率で表示します',
    layer_style_cluster: '多数のロケーション',
  },
  es: {
    layer_style_header: 'Estilo',
    layer_style_select_theme: 'Seleccionar estilo temático',
    layer_style_display_labels: 'Mostrar etiquetas',
    layer_style_display_hover: 'Ver a través del curso',
    layer_style_switch_caption: 'Clic en las etiquetas para cambiar la visibilidad o',
    layer_style_switch_all: 'Cambiar todo',
    layer_grid_legend_ratio: 'Mostrar el color como una relación con el tamaño',
    layer_style_cluster: 'Múltiples localizaciones',
  },
  tr: {
    layer_style_header: 'Stil',
    layer_style_select_theme: 'Tematik stil sec',
    layer_style_display_labels: 'Etiketleri goster',
    layer_style_display_hover: 'Imlec uzerindeyken goster',
    layer_style_switch_caption: 'Gorunurlugu degistirmek icin etikete tiklayiniz veya',
    layer_style_switch_all: 'Hepsini degistir',
    layer_grid_legend_ratio: 'Rengi boyuta orantili goster',
    layer_style_cluster: 'Coklu konum',
  },
  it: {
    layer_style_header: 'Stile',
    layer_style_select_theme: 'Seleziona lo stile tematico',
    layer_style_display_labels: 'Mostrare etichette',
    layer_style_display_hover: 'Mostra tramite il cursore',
    layer_style_switch_caption: 'Clicca sull etichetta per cambiare viibilità o',
    layer_style_switch_all: 'Cambiare tutto',
    layer_grid_legend_ratio: 'Visualizza il colore proporzionale alla dimensione',
    layer_style_cluster: 'Località multiple',
  },
  th: {
    layer_style_header: 'สไตล์',
    layer_style_select_theme: 'เลือกสไตล์ใจความ',
    layer_style_display_labels: 'แสดงฉลาก',
    layer_style_display_hover: 'เปิดใช้งานโฮเวอร์',
    layer_style_switch_caption: 'คลิกที่ป้ายกำกับเพื่อสลับการมองเห็นหรือ',
    layer_style_switch_all: 'สลับทั้งหมด',
    layer_grid_legend_ratio: 'แสดงสีเป็นอัตราส่วนต่อขนาด',
    layer_style_cluster: 'หลายแห่ง',
  },
})

export default layer => {

  // Do not create the panel.
  if (layer.style.hidden) return;

  const content = []

  if (layer.style.opacitySlider) {

    content.push(mapp.ui.elements.slider({
      label: 'Change layer opacity:',
      min: 0,
      max: 100,
      val: parseInt(layer.L.getOpacity() * 100),
      callback: e => {
        layer.L.setOpacity(parseFloat(e.target.value / 100))
      }
    }))
  }

  if (layer.style.scaleSlider) {

    content.push(mapp.ui.elements.slider({
      label: 'Change icon scale:',
      min: layer.style.scaleSlider.min,
      max: layer.style.scaleSlider.max,
      step: layer.style.scaleSlider.step,
      val: layer.style.default.icon.scale,
      callback: e => {
        layer.style.default.icon.scale = e.target.value
        layer.L.changed()
      }
    }))
  }

  if (layer.style.hover) {

    // Add checkbox to toggle label display.
    layer.style.hoverCheckbox = mapp.ui.elements.chkbox({
      data_id: 'hoverCheckbox',
      label: layer.style.hovers && mapp.dictionary.layer_style_display_hover
        || layer.style.hover.title || mapp.dictionary.layer_style_display_hover,
      checked: !!layer.style.hover.display,
      onchange: (checked) => {
        layer.style.hover.display = checked
      }
    })

    content.push(layer.style.hoverCheckbox)

    if (Object.keys(layer.style.hovers || 0).length > 1) {

      // Add dropdown to switch label.
      content.push(mapp.ui.elements.dropdown({
        placeholder: layer.style.hover.title,
        entries: Object.keys(layer.style.hovers).map(key => ({
          title: layer.style.hovers[key].title || key,
          option: key
        })),
        callback: (e, entry) => {

          const display = layer.style.hover.display

          // Set hover from dropdown option.
          layer.style.hover = layer.style.hovers[entry.option]

          // Assign default featureHover method if non is provided.
          layer.style.hover.method ??= mapp.layer.featureHover;

          layer.style.hover.display = display
        }
      }))
    }
  }

  if (layer.style.label) {

    // Add checkbox to toggle label display.
    layer.style.labelCheckbox = mapp.ui.elements.chkbox({
      data_id: 'labelCheckbox',
      label: layer.style.labels && mapp.dictionary.layer_style_display_labels
        || layer.style.label.title || mapp.dictionary.layer_style_display_labels,
      checked: !!layer.style.label.display,
      onchange: (checked) => {
        layer.style.label.display = checked
        layer.reload()
      }
    })

    content.push(layer.style.labelCheckbox)

    if (Object.keys(layer.style.labels || 0).length > 1) {

      // Add dropdown to switch label.
      content.push(mapp.ui.elements.dropdown({
        placeholder: layer.style.label.title,
        entries: Object.keys(layer.style.labels).map(key => ({
          title: layer.style.labels[key].title || key,
          option: key
        })),
        callback: (e, entry) => {

          const display = layer.style.label.display

          // Set label from dropdown option.
          layer.style.label = layer.style.labels[entry.option]

          layer.style.label.display = display

          layer.reload()
        }
      }))
    }
  }

  // Add zoom level check for label display
  layer.style.label && layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {
    const z = layer.mapview.Map.getView().getZoom();

    if (z <= layer.style.label.minZoom || z >= layer.style.label.maxZoom) {
      layer.style.labelCheckbox.classList.add('disabled');
    } else {
      layer.style.labelCheckbox.classList.remove('disabled');
    }
  });

  // Add theme control
  if (Object.keys(layer.style.themes || 0).length > 1) {

    content.push(mapp.utils.html`
      <div>${mapp.dictionary.layer_style_select_theme}</div>
        ${mapp.ui.elements.dropdown({
      placeholder: layer.style.theme.title,
      entries: Object.keys(layer.style.themes).map(key => ({
        title: layer.style.themes[key].title || key,
        option: key
      })),
      callback: (e, entry) => {

        // Set theme from dropdown option.
        layer.style.theme = layer.style.themes[entry.option]

        if (layer.style.theme.setLabel && layer.style.labels) {

          layer.style.label = layer.style.labels[layer.style.theme.setLabel]
        }

        if (layer.style.theme.setHover && layer.style.hovers) {

          layer.style.hover = layer.style.hovers[layer.style.theme.setHover]
        }

        // Replace the children of the style panel.
        layer.view.querySelector('[data-id=style-drawer]')
          .replaceChildren(...mapp.ui.layers.panels.style(layer).children)

        layer.reload()
      }
    })}`)
  } else if (layer.style.theme?.title) {

    // Add theme title before legend.
    content.push(mapp.utils.html`
      <h3>${layer.style.theme.title}`)

  }

  mapp.ui.layers.legends[layer.style.theme?.type] && content.push(mapp.utils.html`
    <div class="legend">
      ${layer.style.theme?.meta && mapp.utils.html`<p>${layer.style.theme.meta}`}
      ${mapp.ui.layers.legends[layer.style.theme.type](layer)}`)

  // There are no elements for the style panel.
  if (!content.length) return;

  // Create a drawer for multiple panel elements on content array.
  layer.style.drawer = mapp.ui.elements.drawer({
    data_id: `style-drawer`,
    class: `raised ${layer.style.classList || ''}`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_style_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: content
  })

  return layer.style.drawer
}