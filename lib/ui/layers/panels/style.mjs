mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_style_header: 'Style',
    layer_style_select_theme: 'Select thematic style',
    layer_style_display_labels: 'Display labels',
    layer_style_display_hover: 'Enable hover',
    layer_style_switch_caption: 'Click on labels to switch visibility or ',
    layer_style_switch_all: 'switch all',
    layer_grid_legend_ratio: 'Display colour as a ratio to the size',
    layer_style_cluster: 'Multiple locations',
  },
  de: {
    layer_style_header: 'Stil',
    layer_style_select_theme: 'Auswahl eines thematischen Stiles',
    layer_style_display_labels: 'Umschalten der Label Ansicht',
    layer_style_switch_caption: 'Auswahl der Label schaltet Ansicht um oder ',
    layer_style_switch_all: 'Alle auswählen',
    layer_grid_legend_ratio: 'Farbe im Verhältnis zur Größe',
    layer_style_cluster: 'Mehrere Lagen',
  },
  cn: {
    layer_style_header: '风格样式',
    layer_style_select_theme: '选择主题风格',
    layer_style_display_labels: '显示标签',
    layer_style_switch_caption: '单击图标以切换可见性 ',
    layer_style_switch_all: '全部切换',
    layer_grid_legend_ratio: '显示颜色与尺寸比例',
    layer_style_cluster: '多个地点',
  },
  pl: {
    layer_style_header: 'Styl',
    layer_style_select_theme: 'Wybierz styl tematyczny',
    layer_style_display_labels: 'Pokaż etykiety',
    layer_style_switch_caption: 'Kliknij etykiety aby zmienić widoczność albo ',
    layer_style_switch_all: 'zmień wszystkie',
    layer_grid_legend_ratio: 'Pokaż kolor w proporcji do rozmiaru',
    layer_style_cluster: 'Więcej miejsc',
  },
  ko: {
    layer_style_header: '스타일',
    layer_style_select_theme: '주제별 스타일 선택',
    layer_style_display_labels: '라벨 표시',
    layer_style_switch_caption: '가시성 변경을 위해 라벨 클릭 또는 ',
    layer_style_switch_all: '모두 변경',
    layer_grid_legend_ratio: '크기비율에 따른 색상 표시',
    layer_style_cluster: '복수 위치',
  },
  fr: {
    layer_style_header: 'Style',
    layer_style_select_theme: 'Choisir un thème dans la liste',
    layer_style_display_labels: 'Afficher les étiquettes',
    layer_style_switch_caption: 'Cliquer sur l\'etiquette pour changer la visiblité ou ',
    layer_style_switch_all: 'changer tout',
    layer_grid_legend_ratio: 'Rapport de coleur et de taille',
    layer_style_cluster: 'Plusieurs lieux',
  },
  ja: {
    layer_style_header: 'スタイル',
    layer_style_select_theme: 'テーマスタイルを選択',
    layer_style_display_labels: 'ラベルを表示',
    layer_style_switch_caption: '表示切替えには各ラベルをクリックするか ',
    layer_style_switch_all: '全表示或いは全非表示',
    layer_grid_legend_ratio: '色はサイズの比率で表示',
    layer_style_cluster: '多数のロケーション',
  }
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
      val: parseInt(layer.L.getOpacity()*100),
      callback: e => {
        layer.L.setOpacity(parseFloat(e.target.value/100))
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
          entries: Object.keys(layer.style.themes).map(key =>({
            title:  layer.style.themes[key].title || key,
            option: key
          })),
          callback: (e, entry) => {

            // Set theme from dropdown option.
            layer.style.theme = layer.style.themes[entry.option]

            // Clear the legend container.
            layer.style.legend.innerHTML = ''
            
            // Render legend into drawer.
            mapp.ui.layers.legends[layer.style.theme.type] && mapp.utils.render(
              layer.style.legend.parentElement,
              mapp.ui.layers.legends[layer.style.theme.type](layer))

            // Prepend the theme meta paragraph to the legend if configured.
            layer.style.theme?.meta && layer.style.legend.parentElement.prepend(mapp.utils.html.node`<p>${layer.style.theme.meta}`)

            layer.reload()
          }
        })}`)
  } else if (layer.style.theme?.title){

    // Add theme title before legend.
    content.push(mapp.utils.html`
      <h3>${layer.style.theme.title}`)

  }

  function modalButton(){
    return mapp.utils.html`
      <button
        style="height: 1.5em; width: 1.5em; float: right; margin-top: 5px;"
        class="mask-icon open-in-new"
        title="Open in Modal"
        onclick=${e=>{
          let btn = e.target

          btn.style.display = 'none'

          mapp.ui.elements.modal({
            target: layer.mapview.Map.getTargetElement(),
            content: layer.style.legend.parentElement,
            close: () => {
              layer.style.drawer.append(layer.style.legend.parentElement)
              btn.style.display = 'block'
            }
          })
          
        }}>`
  }

  mapp.ui.layers.legends[layer.style.theme?.type] && content.push(mapp.utils.html`
    ${layer.style.allowModal && modalButton() || undefined}
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