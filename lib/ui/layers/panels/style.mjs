/**
### /ui/layers/panels/style

The style panel module exports the styleDrawer method for the `mapp.ui.layers.panels{}` library object.

@requires /ui/elements/style
@requires /ui/elements/drawer

@module /ui/layers/panels/style
*/

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
    layer_style_opacity: 'Change layer opacity:'
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
  esp: {
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

/**
@function stylePanel

@description
The stylePanel will shortcircuit with the layer.style.hidden flag.

A layer style panel element will be requested from mapp.utils.style.panel().

A default order for the elements that make up the style panel will be assigned as mapp.ui.elements.style.elements[] if not implicit in configuration.

A drawer element will be created with the style panel element as content.

@param {layer} layer A decorated mapp layer with a style object.

@property {layer-style} layer.style The layer style configuration.
@property {Boolean} style.hidden Do not create style drawer for layer.view.
@property {string} style.classList String of additional classes to add to the drawer element.

@returns {HTMLElement} The style drawer element for the layer.view.
*/
export default function stylePanel(layer) {

  // Do not create the panel.
  if (layer.style.hidden) return;

  layer.style.elements ??= [
    'labels',
    'label',
    'hovers',
    'hover',
    'themes',
    'theme',
    'icon_scaling',
  ]

  // Request style.panel element as content for drawer.
  const content = mapp.ui.elements.layerStyle.panel(layer)

  if (!content) return;

  layer.style.classList ??= ''

  // Create header for layer.view style drawer.
  const header = mapp.utils.html`
    <h3>${mapp.dictionary.layer_style_header}</h3>
    <div class="mask-icon expander">`

  // Create style drawer for layer.view
  layer.style.drawer = mapp.ui.elements.drawer({
    data_id: `style-drawer`,
    class: `raised ${layer.style.classList}`,
    header,
    content
  })

  return layer.style.drawer
}
