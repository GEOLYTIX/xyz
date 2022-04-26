mapp.utils.merge(mapp.dictionaries,{en:{layer_zoom_to_extent:"Zoom to filtered layer extent",layer_visibility:"Toggle visibility"},de:{layer_zoom_to_extent:"Zoom zum Ausmaß des gefilterten Datensatzes",layer_visibility:"Umschalten der Ansicht"},cn:{layer_zoom_to_extent:"缩放至相应筛选范围",layer_visibility:"切换可见性"},pl:{layer_zoom_to_extent:"Pokaż zasięg warstwy",layer_visibility:"Widoczność"},ko:{layer_zoom_to_extent:"필터된 레이어크기에 줌(zoom)",layer_visibility:"토글 가시성"},fr:{layer_zoom_to_extent:"Zoom sur l'étendue de la couche",layer_visibility:"Changer la visiblité"},ja:{layer_zoom_to_extent:"フィルターされたレイヤー範囲をズームに",layer_visibility:"表示切替"}});var w=e=>{let t=mapp.utils.html`
    <button
      title=${mapp.dictionary.layer_zoom_to_extent}
      class="mask-icon fullscreen"
      onclick=${o=>{e.zoomToExtent()}}>`,a=mapp.utils.html.node`
    <button
      data-id=display-toggle
      title=${mapp.dictionary.layer_visibility}
      class="${`mask-icon toggle ${e.display&&"on"||"off"}`}"
      onclick=${o=>{e.display?e.hide():e.show()}}>`,i=mapp.utils.html`
    <h2>${e.name||e.key}</h2>
    <div class="mask-icon expander"></div>
    ${t}
    ${a}`,l=Object.keys(e).map(o=>mapp.ui.layers.panels[o]&&mapp.ui.layers.panels[o](e)).filter(o=>typeof o!="undefined");if(e.meta){let o=mapp.utils.html.node`<p class="meta">`;o.innerHTML=e.meta,l.unshift(o)}e.view=mapp.ui.elements.drawer({data_id:"layer-drawer",class:"layer-view",header:i,content:l}),e.view.addEventListener("displayTrue",()=>{a.classList.add("on"),e.tabs?.forEach(o=>o.display&&o.show())}),e.view.addEventListener("displayFalse",()=>{a.classList.remove("on"),e.tabs?.forEach(o=>o.remove())}),e.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{if(!!e.tables){if(e.tableCurrent()===null)return e.view.classList.add("disabled");e.view.classList.remove("disabled")}}),e.view.children.length<=1&&e.view.classList.add("empty")};mapp.utils.merge(mapp.dictionaries,{en:{layer_group_hide_layers:"Toggle all layers in group"},de:{layer_group_hide_layers:"Umschalten aller Ebenen in Gruppe"},cn:{layer_group_hide_layers:"隐藏图层"},pl:{layer_group_hide_layers:"Ukryj warstwy z tej grupy"},ko:{layer_group_hide_layers:"그룹에서 레이어 숨기기"},fr:{layer_group_hide_layers:"Cacher les couches du groupe"},ja:{layer_group_hide_layers:"グループからレイヤーを隠す"}});function C(e){if(!e.mapview||!e.target)return;let t={node:e.target,groups:{}};Object.values(e.mapview.layers).forEach(l=>a(l));function a(l){if(!l.hidden){if(w(l),!l.group){t.node.appendChild(l.view);return}t.groups[l.group]||i(l),t.groups[l.group].addLayer(l)}}function i(l){let o={list:[]};t.groups[l.group]=o;let n=mapp.utils.html.node`
      <button
        class="mask-icon toggle"
        title=${mapp.dictionary.layer_group_hide_layers}
        onclick=${s=>{if(s.target.classList.toggle("on"),s.target.classList.contains("on")){o.list.filter(m=>!m.display).forEach(m=>m.show());return}o.list.filter(m=>m.display).forEach(m=>m.hide())}}>`;o.meta=mapp.utils.html.node`<div class="meta">`,o.drawer=mapp.ui.elements.drawer({data_id:"layer-drawer",class:"layer-group",header:mapp.utils.html`
        <h2>${l.group}</h2>
        <div class="mask-icon expander"></div>
        ${n}`,content:o.meta}),t.node.appendChild(o.drawer),o.chkVisibleLayer=()=>{o.list.some(s=>s.display)?n.classList.add("on"):n.classList.remove("on")},o.addLayer=s=>{if(s.group=o,s.groupmeta){let m=o.meta.appendChild(mapp.utils.html.node`<div>`);m.innerHTML=s.groupmeta}o.list.push(s),o.drawer.appendChild(s.view),o.chkVisibleLayer(),s.view.addEventListener("displayTrue",()=>o.chkVisibleLayer()),s.view.addEventListener("displayFalse",()=>o.chkVisibleLayer())}}}var O={like:E,match:E,numeric:z,integer:z,in:Pe,date:D,datetime:D,boolean:Fe},$;function _(e,t){clearTimeout($),$=setTimeout(()=>{$=null,e.reload()},500)}function E(e,t){return mapp.utils.html`
  <input
    type="text"
    onkeyup=${a=>{a.target.value.length?e.filter.current[t.filter.field]={[t.filter.type]:encodeURIComponent(a.target.value)}:delete e.filter.current[t.filter.field],_(e)}}>`}function Fe(e,t){return mapp.ui.elements.chkbox({label:t.label||t.title||"chkbox",onchange:a=>{e.filter.current[t.filter.field]={boolean:a},e.reload()}})}async function z(e,t){let a=await mapp.utils.xhr(`${e.mapview.host}/api/query?${mapp.utils.paramString({template:"field_stats",locale:e.mapview.locale.key,layer:e.key,table:e.tableCurrent(),field:t.field})}`);if(!a)return;let i=t.filter.type==="integer"?1:.01;return e.filter.current[t.field]=Object.assign({gte:Number(a.min),lte:Number(a.max)},e.filter.current[t.field]),_(e),mapp.ui.elements.slider_ab({min:a.min,max:a.max,step:i,label_a:"Greater than",val_a:a.min,callback_a:l=>{e.filter.current[t.field].gte=Number(l.target.value),_(e)},label_b:"Lesser than",val_b:a.max,callback_b:l=>{e.filter.current[t.field].lte=Number(l.target.value),_(e)}})}async function Pe(e,t){if(t.filter.distinct){let i=await mapp.utils.xhr(`${e.mapview.host}/api/query?`+mapp.utils.paramString({template:"distinct_values",dbs:e.dbs,table:e.tableCurrent(),field:t.field}));t.filter.in=i.map(l=>l[t.field]).filter(l=>l!==null)}let a=new Set(e.filter?.current[t.filter.field]?.in||[]);return t.filter.dropdown?mapp.ui.elements.dropdown_multi({placeholder:"Select Multiple",entries:t.filter.in.map(i=>({title:i,option:i})),callback:async(i,l)=>{Object.assign(e.filter.current,{[t.filter.field]:{in:l}}),e.reload()}}):t.filter.in.map(i=>mapp.ui.elements.chkbox({val:i,label:i,checked:a.has(i),onchange:(l,o)=>{if(l)e.filter.current[t.filter.field]||(e.filter.current[t.filter.field]={}),e.filter.current[t.filter.field].in||(e.filter.current[t.filter.field].in=[]),e.filter.current[t.filter.field].in.push(encodeURIComponent(o));else{let n=e.filter.current[t.filter.field].in.indexOf(encodeURIComponent(o));e.filter.current[t.filter.field].in.splice(n,1),e.filter.current[t.filter.field].in.length||delete e.filter.current[t.filter.field].in}e.reload()}}))}function D(e,t){let a=mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${l}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`,i=mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${l}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`;function l(o){o.target.dataset.id==="inputAfter"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{gt:new Date(o.target.value).getTime()/1e3})),o.target.dataset.id==="inputBefore"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{lt:new Date(o.target.value).getTime()/1e3})),e.reload()}return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${a}</label>
      <label>Date before
        ${i}</label>`}mapp.utils.merge(mapp.dictionaries,{en:{layer_add_new_location:"Add new locations"},de:{layer_add_new_location:"Erstelle neue Lage"},cn:{layer_add_new_location:"数据检视"},pl:{layer_add_new_location:"Dodaj nowe miejsca"},ko:{layer_add_new_location:"새로운 위치 추가"},fr:{layer_add_new_location:"Ajouter des nouveaux lieux"},ja:{layer_add_new_location:"新しいロケーションを追加"}});var q=e=>{let t={layer:e,srid:e.srid,edit:e.edit,mapview:e.mapview},a=typeof e.edit=="object"&&Object.keys(e.edit).map(l=>mapp.ui.elements.drawing[l]&&mapp.ui.elements.drawing[l](t,Re)).filter(l=>!!l);return a?mapp.ui.elements.drawer({data_id:"draw-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`
      ${a}`}):void 0};function Re(e,t){let a=e.target;if(a.classList.contains("active")){a.classList.remove("active"),t.mapview.interactions.highlight();return}a.classList.add("active"),t.layer.show(),t.layer.view.querySelector(".header").classList.add("edited","active"),t.mapview.interactions.draw({type:t.type,geometryFunction:t.geometryFunction,tooltip:t.tooltip,srid:t.srid,callback:async i=>{if(i){let l=await mapp.location.create({layer:t.layer,geometry:i.geometry});t.layer.reload(),mapp.location.get(l)}t.layer.view.querySelector(".header").classList.remove("edited","active"),a.classList.contains("active")&&(a.classList.remove("active"),t.mapview.interactions.highlight())}})}mapp.utils.merge(mapp.dictionaries,{en:{layer_filter_header:"Filter",layer_filter_select:"Select filter from list"},de:{layer_filter_header:"Filter",layer_filter_select:"Filter Auswahl"},cn:{layer_filter_header:"筛选",layer_filter_select:"从列表筛选"},pl:{layer_filter_header:"Filtruj",layer_filter_select:"Wybierz filtr z listy"},ko:{layer_filter_header:"필터",layer_filter_select:"리스트로 부터 필터 선택"},fr:{layer_filter_header:"Filtres",layer_filter_select:"Choisir un filtre dans la liste"},ja:{layer_filter_header:"フィルター",layer_filter_select:"リストからフィルターを選択"}});var T=e=>{if(!e.infoj?.some(i=>i.filter))return;e.filter.list=e.infoj.filter(i=>i.filter);let t=mapp.ui.elements.dropdown({data_id:`${e.key}-filter-dropdown`,placeholder:mapp.dictionary.layer_filter_select,entries:e.filter.list,callback:async(i,l)=>{if(e.filter.view.querySelector("[data-id=clearall]").style.display="block",l.filter.card||(l.filter.field=l.filter.field||l.field,l.filter.remove=()=>{delete e.filter.current[l.filter.field],delete l.filter.card,e.reload(),e.filter.view.querySelector("[data-id=clearall]").style.display=e.filter.view.children.length===3?"none":"block"},!mapp.ui.layers.filters[l.filter.type]))return;l.filter.field=l.filter.field||l.field;let o=await mapp.ui.layers.filters[l.filter.type](e,l);l.filter.card=e.filter.view.appendChild(mapp.ui.elements.card({header:l.filter_title||l.title,close:l.filter.remove,content:o}))}}),a=mapp.utils.html`
    <button
      data-id=clearall
      class="primary-colour"
      style="display: none; margin-bottom: 5px;"
      onclick=${i=>{e.filter.list.filter(l=>l.filter.card).forEach(l=>{l.filter.card.querySelector("[data-id=close]").click()}),e.reload()}}>${mapp.dictionary.layer_filter_clear_all}`;return e.filter.view=mapp.ui.elements.drawer({data_id:"filter-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`
      ${t}
      ${a}`}),e.filter.view};mapp.utils.merge(mapp.dictionaries,{en:{layer_dataview_header:"Data Views"},de:{layer_dataview_header:"Datenansichten"},cn:{layer_dataview_header:"数据检视"},pl:{layer_dataview_header:"Widoki danych"},ko:{layer_dataview_header:"데이터 보기"},fr:{layer_dataview_header:"Vues des données"},ja:{layer_dataview_header:"データビュー"}});var M=e=>{let t=Object.entries(e.dataviews).map(i=>{let l=Object.assign(i[1],{key:i[0],layer:e,host:e.mapview.host}),o=document.querySelector(`[data-id=${l.target}]`);if(!!o)return mapp.ui.Dataview(l),o.dispatchEvent(new CustomEvent("addTab",{detail:l})),e.tabs?e.tabs.push(l):e.tabs=[l],e.display&&l.display&&l.show(),mapp.ui.elements.chkbox({label:l.title||l.key,checked:!!l.display,onchange:n=>{l.display=n,l.display?l.show():l.remove()}})});return mapp.ui.elements.drawer({data_id:"dataviews-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`${t}`})};var I=e=>{let t=Object.keys(e.reports).map(i=>{let l=e.reports[i];l.key=i,l.host=e.mapview.host;let o=`${l.host}/view?${mapp.utils.paramString({template:l.template,lat:mapp.hooks.current?.lat,lng:mapp.hooks.current?.lng,z:mapp.hooks.current?.z})}`;return mapp.utils.html`
      <a
        class="link-with-img"
        target="_blank"
        href="${o}">
        <div class="mask-icon event-note"></div>
        <span>${l.title||l.key}`});return mapp.ui.elements.drawer({data_id:"reports-drawer",class:"lv-1",header:mapp.utils.html`
      <h4>Reports</h4>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`${t}`})};mapp.utils.merge(mapp.dictionaries,{en:{layer_style_header:"Style",layer_style_select_theme:"Select thematic style",layer_style_display_labels:"Display labels",layer_style_switch_caption:"Click on labels to switch visibility or ",layer_style_switch_all:"switch all",layer_grid_legend_ratio:"Display colour as a ratio to the size",layer_style_cluster:"Multiple locations"},de:{layer_style_header:"Stil",layer_style_select_theme:"Auswahl eines thematischen Stiles",layer_style_display_labels:"Umschalten der Label Ansicht",layer_style_switch_caption:"Auswahl der Label schaltet Ansicht um oder ",layer_style_switch_all:"Alle auswählen",layer_grid_legend_ratio:"Farbe im Verhältnis zur Größe",layer_style_cluster:"Mehrere Lagen"},cn:{layer_style_header:"风格样式",layer_style_select_theme:"选择主题风格",layer_style_display_labels:"显示标签",layer_style_switch_caption:"单击图标以切换可见性 ",layer_style_switch_all:"全部切换",layer_grid_legend_ratio:"显示颜色与尺寸比例",layer_style_cluster:"多个地点"},pl:{layer_style_header:"Styl",layer_style_select_theme:"Wybierz styl tematyczny",layer_style_display_labels:"Pokaż etykiety",layer_style_switch_caption:"Kliknij etykiety aby zmienić widoczność albo ",layer_style_switch_all:"zmień wszystkie",layer_grid_legend_ratio:"Pokaż kolor w proporcji do rozmiaru",layer_style_cluster:"Więcej miejsc"},ko:{layer_style_header:"스타일",layer_style_select_theme:"주제별 스타일 선택",layer_style_display_labels:"라벨 표시",layer_style_switch_caption:"가시성 변경을 위해 라벨 클릭 또는 ",layer_style_switch_all:"모두 변경",layer_grid_legend_ratio:"크기비율에 따른 색상 표시",layer_style_cluster:"복수 위치"},fr:{layer_style_header:"Style",layer_style_select_theme:"Choisir un thème dans la liste",layer_style_display_labels:"Afficher les étiquettes",layer_style_switch_caption:"Cliquer sur l'etiquette pour changer la visiblité ou ",layer_style_switch_all:"changer tout",layer_grid_legend_ratio:"Rapport de coleur et de taille",layer_style_cluster:"Plusieurs lieux"},ja:{layer_style_header:"スタイル",layer_style_select_theme:"テーマスタイルを選択",layer_style_display_labels:"ラベルを表示",layer_style_switch_caption:"表示切替えには各ラベルをクリックするか ",layer_style_switch_all:"全表示或いは全非表示",layer_grid_legend_ratio:"色はサイズの比率で表示",layer_style_cluster:"多数のロケーション"}});var F=e=>{if(e.style.hidden)return;let t=[];if(e.style.label){let a=mapp.ui.elements.chkbox({data_id:"labelCheckbox",label:e.style.label.title||mapp.dictionary.layer_style_display_labels,checked:!!e.style.label.display,onchange:i=>{e.style.label.display=i,e.L.setStyle(e.L.getStyle())}});(e.style.label.minZoom||e.style.label.maxZoom)&&e.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{let i=e.mapview.Map.getView().getZoom(),l=e.view.querySelector("[data-id=labelCheckbox]");if(i<=e.style.label.minZoom||i>=e.style.label.maxZoom)return l.classList.add("disabled");l.classList.remove("disabled")}),t.push(a)}if(e.style.themes&&Object.keys(e.style.themes).length>1&&t.push(mapp.utils.html`
      <div>${mapp.dictionary.layer_style_select_theme}</div>
        ${mapp.ui.elements.dropdown({entries:Object.keys(e.style.themes).map(a=>({title:e.style.themes[a].title||a,option:a})),callback:(a,i)=>{e.style.theme=e.style.themes[i.option],mapp.utils.render(e.style.drawer.querySelector(".drawer > .legend"),mapp.ui.layers.styles[e.style.theme.type](e)),e.reload()}})}`),e.style.theme&&!e.style.themes&&t.push(mapp.utils.html`
      <h3>${e.style.theme.title}</h3>`),e.style.theme&&t.push(mapp.utils.html`
    <div class="legend">
      ${mapp.ui.layers.styles[e.style.theme.type]&&mapp.ui.layers.styles[e.style.theme.type](e)}`),!!t.length)return e.style.drawer=mapp.ui.elements.drawer({data_id:"style-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_style_header}</h3>
      <div class="mask-icon expander"></div>`,content:t}),e.style.drawer};var P=e=>{let t=e.style.theme,a=[];if(a.push(mapp.utils.html`
    <div
      class="switch-all"
      style="grid-column: 1/3;">
      ${mapp.dictionary.layer_style_switch_caption}
      <button
        class="primary-colour bold"
        onclick=${i=>{i.target.closest(".legend").querySelectorAll(".switch").forEach(l=>l.click()),e.reload()}}>${mapp.dictionary.layer_style_switch_all}</button>.`),Object.entries(t.cat).forEach(i=>{let l=Object.assign({},e.style.default,i[1].style&&i[1].style.icon||i[1].style||i[1]),o=mapp.utils.html`
      <div
        style="height: 24px; width: 24px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},l))}`,n=mapp.utils.html`
      <div
        class=${`label switch ${e.filter.current[t.field]?.ni?.indexOf(i[0])===0?"disabled":""}`}
        onclick=${s=>{s.target.classList.toggle("disabled"),s.target.classList.contains("disabled")?(e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field].ni||(e.filter.current[t.field].ni=[]),e.filter.current[t.field].ni.push(i[0])):(e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(i[0]),1),e.filter.current[t.field].ni.length||delete e.filter.current[t.field]),e.reload()}}>${i[1].label||i[0]}`;a.push(mapp.utils.html`
    <div 
      data-id=${i[0]}
      class="contents">
      ${o}${n}`)}),e.style.cluster){let i=mapp.utils.html`
      <div
        style="height: 40px; width: 40px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:40,height:40},e.style.default,e.style.cluster))}`,l=mapp.utils.html`
      <div
        class="label">
        ${mapp.dictionary.layer_style_cluster}`;a.push(mapp.utils.html`
      <div 
        data-id="cluster"
        class="contents">
        ${i}${l}`)}return e.style.legend=mapp.utils.html.node`<div class="grid">${a}`,e.style.legend};var R=e=>{let t=e.style.theme,a=[];return t.cat_arr.forEach(i=>{let l=Object.assign({},e.style.default,i.style&&i.style.icon||i.style||i),o=mapp.utils.html`
      <div
        style="height: 24px; width: 24px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},l))}`,n=mapp.utils.html`
      <div class="label">${i.label||i.value}`;a.push(mapp.utils.html`
      <div 
        data-id=${i.value}
        class="contents">
        ${o}${n}`)}),e.style.legend=mapp.utils.html.node`<div class="grid">${a}`,e.style.legend};var A=e=>{let t=[];t.push(mapp.ui.elements.dropdown({entries:Object.entries(e.grid_fields).map(o=>({title:o[0],options:o[1]})),callback:(o,n)=>{e.grid_size=n.options,e.reload()}}));let a=e.style.range.length,i=new XMLSerializer,l=mapp.utils.html`
  <div
    class="grid"
    style=${`grid-template-columns: repeat(${a}, 1fr); grid-template-rows: 20px 20px 20px 20px;`}>
    <div data-id="size-labels" class="contents">
      <span data-id="size-min" style="grid-row:1;grid-column:1;">min</span>
      <span data-id="size-avg" style=${`grid-row:1;grid-column:${Math.ceil(a/2)};text-align:center;`}>avg</span>
      <span data-id="size-max" style=${`grid-row:1;grid-column:${a};text-align:end;`}>max</span>
    </div>
    <div data-id="size-icons" class="contents">
      ${e.style.range.map((o,n)=>{let s=mapp.utils.svg.node`<svg height=50 width=50>
          <circle
            fill='#777'
            cx=27
            cy=27
            r='${23/a*(n+1)}'/>
          <circle
            fill='#999'
            cx=25
            cy=25
            r='${23/a*(n+1)}'/>`,m=`data:image/svg+xml,${encodeURIComponent(i.serializeToString(s))}`,r=`
          grid-row:2;
          grid-column:${n+1};
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          width: 100%;
          height: 100%;
          background-image: url(${m});`;return mapp.utils.html`<div style=${r}>`})}
    </div>
    <div data-id="colour-icons" class="contents">
      ${e.style.range.map((o,n)=>mapp.utils.html`
        <div style=${`grid-row:3;grid-column:${n+1};background-color:${o};width:100%;height:100%;`}>
      `)}
    </div>
    <div data-id="colour-labels" class="contents">
      <span data-id="color-min" style="grid-row:4;grid-column:1;">min</span>
      <span data-id="color-avg" style=${`grid-row:4;grid-column:${Math.ceil(a/2)};text-align:center;`}>avg</span>
      <span data-id="color-max" style=${`grid-row:4;grid-column:${a};text-align:end;`}>max</span>
    </div>
  </div>`;return t.push(l),t.push(mapp.ui.elements.dropdown({entries:Object.entries(e.grid_fields).map(o=>({title:o[0],options:o[1]})),span:Object.keys(e.grid_fields)[1],callback:(o,n)=>{e.grid_color=n.options,e.reload()}})),t.push(mapp.ui.elements.chkbox({label:mapp.dictionary.layer_grid_legend_ratio,onchange:o=>{e.grid_ratio=o,e.reload()}})),e.style.legend=mapp.utils.html.node`
    <div class="legend">${t}`,e.style.legend.addEventListener("update",()=>{e.style.legend.querySelector("[data-id=size-min]").textContent=e.sizeMin.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=size-avg]").textContent=e.sizeAvg.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=size-max]").textContent=e.sizeMax.toLocaleString("en-GB",{maximumFractionDigits:0}),e.grid_ratio?(e.style.legend.querySelector("[data-id=color-min]").textContent=e.colorMin.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"}),e.style.legend.querySelector("[data-id=color-avg]").textContent=e.colorAvg.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"}),e.style.legend.querySelector("[data-id=color-max]").textContent=e.colorMax.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"})):(e.style.legend.querySelector("[data-id=color-min]").textContent=e.colorMin.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=color-avg]").textContent=e.colorAvg.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=color-max]").textContent=e.colorMax.toLocaleString("en-GB",{maximumFractionDigits:0}))}),e.style.legend};var V=e=>{let t=[],a=mapp.utils.html`
  <div
    style="height: 24px; width: 24px;">
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style.theme.style))}`;return t.push(mapp.utils.html`
    <div 
      class="contents">
      ${a}<div class="label">${e.style.theme.label}`),e.style.legend=mapp.utils.html.node`<div class="grid">${t}`,e.style.legend};var G={view:w,listview:C,filters:O,panels:{edit:q,style:F,filter:T,reports:I,dataviews:M},styles:{categorized:P,graduated:R,grid:A,basic:V}};mapp.utils.merge(mapp.dictionaries,{en:{location_zoom:"Zoom map to feature bounds",location_save:"Save changes to cloud",location_remove:"Remove feature from selection",location_delete:"Delete location"},de:{location_zoom:"Ansicht den Lagen Geometrien anpassen",location_save:"Speichern der Datenänderungen",location_remove:"Lagen Auswahl aufheben",location_delete:"Löschen der Lage"},cn:{location_zoom:"缩放地图至目标范围",location_save:"将更改保存至云",location_remove:"删除所选目标要素",location_delete:"删除地点"},pl:{location_zoom:"Pokaż zasięg miejsca",location_save:"Zapisz zmiany",location_remove:"Odznacz miejsce",location_delete:"Usuń miejsce"},ko:{location_zoom:"한계를 포함한 줌 지도",location_save:"변경사항 크라우드 저장",location_remove:"선택에서 특징 제거",location_delete:"위치 삭제"},fr:{location_zoom:"Zoom sur le lieu",location_save:"Enregistrer les modifications",location_remove:"Le désélectionner",location_delete:"Supprimer le lieu"},ja:{location_zoom:"フィーチャ範囲にはマップをズーム",location_save:"クラウドに変更を保存",location_remove:"選択からフィーチャー（機能）を削除",location_delete:"ロケーションを削除"}});var B=e=>{e.removeCallbacks?.push(function(){e.view.remove()}),e.updateCallbacks?.push(function(){e.view.dispatchEvent(new Event("updateInfo"))});let t=[mapp.utils.html`<h2>${e.record.symbol}`,mapp.utils.html`<div class="mask-icon expander">`];e.infoj.some(i=>(i.type==="pin"||i.type==="geometry")&&i.value)&&t.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_zoom}
      class = "mask-icon search"
      onclick = ${i=>{e.flyTo()}}>`),e.layer.toggleLocationViewEdits&&(e.infoj.forEach(i=>{!i.edit||(i._edit=i.edit,delete i.edit)}),t.push(mapp.utils.html`
      <button
        title = "Enable edits"
        class = "mask-icon build"
        onclick = ${i=>{e.infoj.forEach(l=>{!l._edit||(l.edit=l._edit,delete l._edit)}),a.remove(),i.target.style.display="none",a=mapp.ui.locations.infoj(e),e.view.appendChild(a)}}>`)),t.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_save}
      class = "mask-icon cloud-upload"
      style = "display: none;"
      onclick = ${i=>{e.view.classList.add("disabled"),e.update()}}>`),e.layer.edit&&e.layer.edit.delete&&t.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_delete}
      class = "mask-icon trash"
      onclick = ${i=>{e.trash()}}>`),t.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_remove}
      class = "mask-icon close no"
      onclick = ${i=>{e.remove()}}>`),e.view=mapp.ui.elements.drawer({class:"location-view expanded",header:t});let a=e.view.appendChild(mapp.ui.locations.infoj(e));e.view.querySelector(".header").style.borderBottom=`3px solid ${e.record.colour}`,e.view.addEventListener("valChange",i=>{i.detail.value!=i.detail.newValue?i.detail.node.classList.add("val-changed"):(delete i.detail.newValue,i.detail.node.classList.remove("val-changed")),e.view.querySelector(".cloud-upload").style.display=e.infoj.some(l=>typeof l.newValue!="undefined")&&"inline-block"||"none"}),e.view.addEventListener("updateInfo",()=>{a.remove(),e.view.querySelector(".cloud-upload").style.display="none",e.view.classList.remove("disabled"),a=mapp.ui.locations.infoj(e),e.view.appendChild(a)})};mapp.utils.merge(mapp.dictionaries,{en:{location_clear_all:"Clear locations"},de:{location_clear_all:"Entferne Auswahl"},cn:{location_clear_all:"모든 위치 제거"},pl:{location_clear_all:"Wyczyść selekcje"},ko:{location_clear_all:"清除所有地点"},fr:{location_clear_all:"Desélectionner tous les lieux."},ja:{location_clear_all:"全ロケーションをクリア"}});var H=[{symbol:"A",colour:"#2E6F9E"},{symbol:"B",colour:"#EC602D"},{symbol:"C",colour:"#5B8C5A"},{symbol:"D",colour:"#B84444"},{symbol:"E",colour:"#514E7E"},{symbol:"F",colour:"#E7C547"},{symbol:"G",colour:"#368F8B"},{symbol:"H",colour:"#841C47"},{symbol:"I",colour:"#61A2D1"},{symbol:"J",colour:"#37327F"}],N=e=>{if(!e.mapview||!e.target)return;let t={node:e.target,mapview:e.mapview};return t.node.appendChild(mapp.utils.html.node`
    <button 
      class="tab-display bold primary-colour text-shadow"
      onclick=${a=>{Object.values(t.mapview.locations).forEach(i=>i.remove())}}>
      ${mapp.dictionary.location_clear_all}`),e.mapview.locations=new Proxy(e.mapview.locations,{set:function(a,i,l){let o=H.find(n=>!n.hook);return o.hook=l.hook,l.record=o,l.style={strokeColor:o.colour,fillColor:o.colour,fillOpacity:.2},l.Style=mapp.utils.style([{strokeColor:"#000",strokeOpacity:.1,strokeWidth:8},{strokeColor:"#000",strokeOpacity:.1,strokeWidth:6},{strokeColor:"#000",strokeOpacity:.1,strokeWidth:4},{strokeColor:l.style.strokeColor||"#000",strokeWidth:2,fillColor:l.style.fillColor||l.style.strokeColor||"#fff",fillOpacity:l.style.fillOpacity||.2}]),l.pinStyle=mapp.utils.style({icon:{type:"markerLetter",letter:o.symbol,color:l.style.strokeColor,scale:3,anchor:[.5,1]}}),Reflect.set(...arguments),mapp.ui.locations.view(l),Object.values(t.node.children).forEach(n=>n.classList.remove("expanded")),t.node.insertBefore(l.view,t.node.firstChild.nextSibling),l.view.dispatchEvent(new Event("addLocationView")),t.node.closest(".tab").style.display="block",t.node.closest(".tab").click(),!0},deleteProperty:function(a,i){Reflect.deleteProperty(...arguments);let l=H.find(o=>o.hook===i);return delete l.hook,setTimeout(()=>{if(t.node.children.length>1)return;let o=t.node.closest(".tab");o.style.display="none",o.previousElementSibling.click()},300),!0}}),t};var U=(e,t)=>{if(!e.infoj)return;let a=mapp.utils.html.node`<div class="location-view-grid">`,i={};for(let l of t||e.infoj){if(e.view&&e.view.classList.contains("disabled"))break;if(l.listview=a,l.type=l.type||"text",l.skipEntry||l.skipFalsyValue&&!l.value&&!l.edit||l.skipUndefinedValue&&typeof l.value=="undefined"&&!l.edit||l.skipNullValue&&l.value===null&&!l.edit)continue;l.nullValue&&l.value===null&&!l.edit&&(l.value=l.nullValue),l.group&&(i[l.group]||(i[l.group]=l.listview.appendChild(mapp.ui.elements.drawer({class:`lv-1 group ${l.expanded&&"expanded"||""}`,header:mapp.utils.html`
              <h3>${l.group}</h3>
              <div class="mask-icon expander"></div>`}))),l.listview=i[l.group]),l.node=l.listview.appendChild(mapp.utils.html.node`
      <div
        data-type=${l.type}
        class=${`contents ${l.type} ${l.class||""} ${l.inline&&"inline"||""}`}>`),l.title&&l.node.append(mapp.utils.html.node`
        <div
          class="label"
          style="${`${l.css_title||""}`}"
          title="${l.tooltip||null}">${l.title}`),(l.value===null||typeof l.value=="undefined")&&(l.value=l.default||l.value);let o=mapp.ui.locations.entries[l.type]&&mapp.ui.locations.entries[l.type](l);if(o==="break")break;o&&l.node.append(o)}return a};var W=e=>{let t=mapp.ui.elements.chkbox({label:e.label||e.title,checked:e.value,disabled:!e.edit,onchange:i=>{e.newValue=i,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}});return mapp.utils.html.node`${t}`};var J=e=>{e.layer=e.location.layer,e.host=e.host||e.location.layer.mapview.host,e.dependents&&e.dependents.some(o=>e.location.infoj.some(n=>!n.value&&n.field===o))&&delete e.display;let t;if(typeof e.target=="string"&&document.getElementById(e.target)){e.target=document.getElementById(e.target),mapp.ui.Dataview(e).then(()=>e.update());return}let a=typeof e.target=="string"&&document.querySelector(`[data-id=${e.target}]`);a&&(delete e.target,mapp.ui.Dataview(e).then(()=>{e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,a.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.display&&e.show()})),typeof e.target=="string"&&(t=mapp.utils.html.node`
      <div
        class="${`location ${e.class}`}">`,e.target=t,e.display&&mapp.ui.Dataview(e).then(()=>e.update()));let i=e.label&&mapp.ui.elements.chkbox({label:e.label,checked:!!e.display,onchange:o=>{if(e.display=o,t){t.style.display=e.display?"block":"none",typeof e.update=="function"&&e.update()||mapp.ui.Dataview(e).then(()=>e.update());return}e.display?e.show():e.remove()}});return mapp.utils.html.node`${i}${t||""}`};var k=e=>{let t;return e.edit?t=mapp.utils.html.node`
      <input
        type=${e.type==="datetime"&&"datetime-local"||"date"}
        value=${e.value&&(e.type==="datetime"&&new Date(e.value*1e3).toISOString().split("Z")[0]||new Date(e.value*1e3).toISOString().split("T")[0])}
        onchange=${i=>{e.newValue=new Date(i.target.value).getTime()/1e3,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`:t=e.value&&new Date(e.value*1e3).toLocaleString(e.locale,e.options),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${t}`};var Z=e=>{let t=e.value.map(n=>mapp.utils.html`
		<div class="link-with-img">
      ${e.edit&&mapp.utils.html.node`
        <button
          class="mask-icon trash no"
          data-name=${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}
          data-href=${n}
          onclick=${s=>o(s)}>
        </button>`}		
        <a target="_blank"
          href=${n}>${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}`),a=mapp.utils.html.node`
    <div class="mask-icon cloud-upload">
      <input
        style="opacity: 0; width: 3em; height: 3em;"
        type="file"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
        onchange=${l}>`;if(e.edit&&t.push(a),!t.length)return;let i=mapp.utils.html.node`<div>${t}`;return i;async function l(n){e.location.view?.classList.add("disabled");let s=new FileReader,m=n.target.files[0];!m||(s.onload=async r=>{let d=await mapp.utils.xhr({method:"POST",requestHeader:{"Content-Type":"application/octet-stream"},url:`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({public_id:m.name,resource_type:"raw"})}`,body:r.target.result}),p=d.secure_url,c=d.public_id.replace(/.*\//,"").replace(/\.([\w-]{3})/,"");await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"append",field:e.field,value:p}));let h=mapp.utils.html.node`
        <div class="link-with-img">
          <button
            class="mask-icon trash no"
            data-name=${c}
            data-href=${p}
            onclick=${g=>o(g)}>
          </button>
          <a target="_blank"
            href=${p}>${c}`;i.insertBefore(h,a),e.location.view?.classList.remove("disabled")},s.readAsDataURL(m),n.target.value="")}async function o(n){if(!confirm("Remove document link?"))return;let s=n.target;mapp.utils.xhr(`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({destroy:!0,public_id:s.dataset.name})}`),await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"remove",field:e.field,value:s.dataset.href})),s.parentNode.remove()}};var K=e=>{if(e.value=typeof e.value=="string"&&JSON.parse(e.value)||e.value,e.display=e.display&&e.value,!e.value&&!e.edit)return;e.Style=e.Style||typeof e.style=="object"&&mapp.utils.style(e.style)||e.location.Style,e.show=Ae;let t=mapp.ui.elements.chkbox({label:e.label||"Geometry",data_id:`${e.field}-chkbox`,checked:!!e.display,disabled:!e.value,onchange:o=>{o?e.show():(e.display=!1,e.L&&e.location.layer.mapview.Map.removeLayer(e.L))}});e.display&&e.show();let a={entry:e,layer:e.location.layer,srid:e.srid||e.location.srid,edit:e.edit,mapview:e.location.layer.mapview},i=typeof e.edit=="object"&&Object.keys(e.edit).map(o=>mapp.ui.elements.drawing[o]&&mapp.ui.elements.drawing[o](a,Ve)).filter(o=>!!o);e.edit?.geometry&&i.push(mapp.utils.html`
    <button
      class="flat wide primary-colour"
      onclick=${o=>Ge(o,a)}>
      Modify Geometry`),e.value&&e.edit?.delete&&i.push(mapp.utils.html`
    <button
      class="flat wide no-colour"
      onclick=${()=>{if(e.display){o();return}e.show(),setTimeout(o,500);function o(){!confirm("Delete Geometry?")||(e.newValue=null,e.L&&(e.location.layer.mapview.Map.removeLayer(e.L),delete e.L),a.entry.location.update())}}}>Delete Geometry`);let l=e.style&&mapp.utils.html`
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style))}`;return i?mapp.ui.elements.drawer({class:"lv-2 flat",data_id:"draw-drawer",header:mapp.utils.html`
        ${t}
        <div class="mask-icon expander"></div>
        ${l}`,content:mapp.utils.html`
        ${i}`}):mapp.utils.html.node`<div class="flex-spacer">${t}${l}`};function Ae(){this.display=!0;let e=this.location.view?.querySelector(`[data-id=${this.field}-chkbox] input`);e&&(e.checked=!0),this.L&&(this.location.layer.mapview.Map.removeLayer(this.L),delete this.L),this.L=this.location.layer.mapview.geoJSON({zIndex:this.zIndex,geometry:this.value,Style:this.Style}),this.location.Layers.push(this.L)}function Ve(e,t){let a=e.target;if(a.classList.contains("active")){a.classList.remove("active"),t.mapview.interactions.highlight();return}a.classList.add("active"),!t.entry.display&&t.entry.show(),t.entry.L&&t.entry.location.layer.mapview.Map.removeLayer(t.entry.L),t.mapview.interactions.draw({type:t.type,geometryFunction:t.geometryFunction,tooltip:t.tooltip,srid:t.srid,callback:i=>{if(a.classList.remove("active"),t.mapview.interactions.highlight(),i){t.entry.newValue=i.geometry,t.entry.location.update();return}t.entry.L&&t.entry.location.layer.mapview.Map.addLayer(t.entry.L)}})}function Ge(e,t){let a=e.target;if(a.classList.contains("active")){a.classList.remove("active"),t.mapview.interactions.highlight();return}a.classList.add("active"),!t.entry.display&&t.entry.show(),t.entry.location.layer.mapview.Map.removeLayer(t.entry.L);let i=t.entry.L.getSource().getFeatures()[0];t.mapview.interactions.modify({Feature:i.clone(),callback:l=>{if(a.classList.remove("active"),t.mapview.interactions.highlight(),l){t.entry.newValue=l.geometry,t.entry.location.update();return}t.entry.location.layer.mapview.Map.addLayer(t.entry.L)}})}var X=e=>{let t=e.value.map(n=>mapp.utils.html`
    <div>
      <img src=${n}
        onclick=${mapp.ui.utils.imagePreview}>
        ${e.edit&&mapp.utils.html.node`
          <button
            class="mask-icon trash no"
            data-name=${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}
            data-src=${n}
            onclick=${s=>o(s)}>`}`),a=mapp.utils.html.node`
    <div class="mask-icon add-photo pos-center">
      <input
        type="file"
        accept="image/*;capture=camera"
        onchange=${l}>`;if(e.edit&&t.push(a),!t.length)return;let i=mapp.utils.html.node`
    <div
      class="images-grid">${t}`;return i;async function l(n){e.location.view?.classList.add("disabled");let s=new FileReader,m=n.target.files[0];!m||(s.onload=r=>{let d=new Image;d.onload=async()=>{let p=mapp.utils.html.node`<canvas>`,c=1024,h=d.width,g=d.height;h>g&&h>c?(g*=c/h,h=c):g>c&&(h*=c/g,g=c),p.width=h,p.height=g,p.getContext("2d").drawImage(d,0,0,h,g);let Te=p.toDataURL("image/jpeg",.5),v=await mapp.utils.xhr({method:"POST",requestHeader:{"Content-Type":"application/octet-stream"},url:`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({public_id:m.name.replace(/.*\//,"").replace(/\.([\w-]{3})/,""),resource_type:"image"})}`,body:mapp.utils.dataURLtoBlob(Te)});await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"append",field:e.field,value:v.secure_url}));let Me=mapp.utils.html.node`
          <div>
            <img
              src=${v.secure_url}
              onclick=${mapp.ui.utils.imagePreview}>
              <button
                class="mask-icon trash no"
                data-name=${v.public_id}
                data-src=${v.secure_url}
                onclick=${Ie=>o(Ie)}>`;i.insertBefore(Me,a),e.location.view?.classList.remove("disabled")},d.src=r.target.result},s.readAsDataURL(m),n.target.value="")}async function o(n){if(!confirm("Remove image?"))return;let s=n.target;mapp.utils.xhr(`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({destroy:!0,public_id:s.dataset.name})}`),await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"remove",field:e.field,value:s.dataset.src})),s.parentNode.remove()}};var Ne={isoline_here:He,isoline_mapbox:Be},x=e=>{e.value=typeof e.value=="string"&&JSON.parse(e.value)||e.value,e.Style=e.Style||typeof e.style=="object"&&mapp.utils.style(e.style)||e.location.Style;let t=mapp.ui.elements.chkbox({label:e.label||"Isoline",checked:!!e.display,onchange:i=>{i?e.show():(e.display=!1,e.L&&e.location.layer.mapview.Map.removeLayer(e.L))}});if(e.show=Ue,e.display&&e.show())return"break";let a=e.style&&mapp.utils.html`
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style))}`;return mapp.utils.html.node`<div class="flex-spacer">${t}${a}`};function Ue(){if(this.display=!0,this.L){this.location.layer.mapview.Map.removeLayer(this.L),this.location.layer.mapview.Map.addLayer(this.L);return}if(this.value){this.L=this.location.layer.mapview.geoJSON({zIndex:this.zIndex,geometry:this.value,Style:this.Style,dataProjection:"4326"}),this.location.Layers.push(this.L);return}let e=this.location.infoj.find(t=>t.type==="pin");return this.params.latlng=ol.proj.transform(e.value,`EPSG:${e.srid||"3857"}`,"EPSG:4326"),this.location.view?.classList.add("disabled"),Ne[this.type](this),!0}function Be(e){let t=Object.assign({profile:"driving",minutes:10},e.params);mapp.utils.xhr(`https://api.mapbox.com/isochrone/v1/mapbox/${t.profile}/${t.latlng[0]},${t.latlng[1]}?${mapp.utils.paramString({contours_minutes:t.minutes,polygons:!0,access_token:t.access_token})}`).then(async a=>{!e.location.remove||!a.features||(e.newValue=a.features[0].geometry,e.location.update())})}function He(e){let t=Object.assign({"range[type]":"time",minutes:10,reverseDirection:!1,transportMode:"car",optimizeFor:"balanced"},e.params);t["range[values]"]=t.minutes*60,delete t.minutes,t.origin=`${t.latlng[1]},${t.latlng[0]}`,delete t.latlng,mapp.utils.xhr(`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://isoline.router.hereapi.com/v8/isolines?${mapp.utils.paramString(t)}&{HERE}`)}`).then(a=>{if(!e.location.remove)return;if(!a.isolines)return console.log(a),alert("Failed to process request");let i=mapp.utils.here.decodeIsoline(a.isolines[0].polygons[0].outer);i.polyline.forEach(l=>l.reverse()),i.polyline.push(i.polyline[0]),e.newValue={type:"Polygon",coordinates:[i.polyline]},e.location.update()})}var Y=e=>{let t=mapp.utils.html`
    <pre><code>${JSON.stringify(e.value,null,2)}`;return e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      onfocus=${i=>{i.target.style.height=i.target.scrollHeight+"px"}}
      onfocusout=${i=>{i.target.style.height="auto"}}
      oninput=${i=>{e.json=(()=>{try{return JSON.parse(i.target.value)}catch(l){return!1}})(),i.target.style.border=e.json?"none":"1px solid red"}}
      onkeyup=${i=>{e.newValue=typeof e.json!="object"?e.value:e.json,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}
      onkeydown=${i=>setTimeout(()=>{i.target.style.height="auto",i.target.style.height=i.target.scrollHeight+"px"},100)}>${JSON.stringify(e.value,null,2)}`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">${t}`};var L=e=>{let t=!isNaN(e.value)&&e.type==="integer"?parseInt(e.value).toLocaleString("en-GB",{maximumFractionDigits:0}):parseFloat(e.value).toLocaleString("en-GB",{maximumFractionDigits:2});return e.edit&&(e.edit.range?t=mapp.ui.elements.slider({min:e.edit.range.min,max:e.edit.range.max,val:e.value,callback:i=>{t.value=parseFloat(i.target.value),e.newValue=t.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}):t=mapp.utils.html.node`
      <input
        type="number"
        value="${e.value||""}"
        onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${e.prefix}${t}${e.suffix}`};var Q=e=>{e.srid=e.srid||e.location.layer.srid,e.location.layer.mapview.Map.removeLayer(e.L),e.L=e.location.layer.mapview.geoJSON({zIndex:Infinity,geometry:{type:"Point",coordinates:e.value},dataProjection:e.srid,Style:e.Style||e.location.pinStyle}),e.location.Layers.push(e.L);let t=mapp.ui.elements.chkbox({label:e.label||"Pin",checked:!0,onchange:i=>{e.display=i,i?e.location.layer.mapview.Map.addLayer(e.L):e.location.layer.mapview.Map.removeLayer(e.L)}});return mapp.utils.html.node`${t}`};var ee=e=>{if(!e.report.template)return;let t=`${e.location.layer.mapview.host}/view/${e.report.template}?${mapp.utils.paramString({id:e.location.id})}`;return mapp.utils.html.node`
    <div class="link-with-img">
      <div
        class="mask-icon wysiwyg">
      </div>	
      <a
        target="_blank"
        href=${t}>${e.report.label||"Report"}`};var te=e=>{let t=e.location.infoj.find(l=>l.type==="pin");if(!t||!t.value)return;let a=ol.proj.toLonLat(t.value,`EPSG:${t.srid||e.location.layer.mapview.srid}`,"EPSG:4326"),i=mapp.utils.html.node`
    <a
      target="_blank"
      href=${`https://www.google.com/maps?cbll=${a[1]},${a[0]}&layer=c`}>`;return mapp.utils.xhr(`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${a[1]},${a[0]}&source=outdoor&{GOOGLE}`)}`).then(l=>{if(l.status!=="OK")return;let o=`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/streetview?location=${a[1]},${a[0]}&source=outdoor&size=300x230&{GOOGLE}`)}`;i.append(mapp.utils.html.node`<img src=${o}>`)}),i};var ae=e=>{let t=document.querySelector(`[data-id=${e.target}]`);e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,t.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.display&&e.show();let a=mapp.ui.elements.chkbox({label:e.label,checked:!!e.display,onchange:i=>{e.display=i,e.display?e.show():e.remove()}});return mapp.utils.html.node`${a}`};var ie=e=>{let t=e.value;return e.edit&&(e.edit.options?t=We(e):t=mapp.utils.html`
      <input
        type="text"
        value="${e.value||""}"
        onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${e.prefix}${t}${e.suffix}`};function We(e){let t=e.edit.options.find(l=>typeof l=="object"&&Object.values(l)[0]===e.value||l===e.value)||e.value;e.value=t&&typeof t=="object"&&Object.keys(t)[0]||t||e.value||" ";let a=e.edit.options.map(l=>({title:typeof l=="string"&&l||Object.keys(l)[0],option:typeof l=="string"&&l||Object.values(l)[0]}));return mapp.ui.elements.dropdown({span:e.value,entries:a,callback:(l,o)=>{e.newValue=o.option,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}})}var j=e=>{e.query&&mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query/${e.query}`).then(i=>{e.node.querySelector(".val").innerHTML=i[e.params.field]});let t=e.type!=="html"?e.value:"";e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      onfocus=${i=>{i.target.style.height=i.target.scrollHeight+"px"}}
      onfocusout=${i=>{i.target.style.height="auto"}}
      onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}
      onkeydown=${i=>setTimeout(()=>{i.target.style.height="auto",i.target.style.height=i.target.scrollHeight+"px"},100)}>
      ${e.value||""}`);let a=mapp.utils.html.node`
  <div
    class="val"
    style="${`${e.css_val||""}`}">${t}`;return!e.edit&&e.type==="html"&&(a.innerHTML=e.value||""),a};var le={key:Je,boolean:W,dataview:J,date:k,datetime:k,documents:Z,geometry:K,html:j,images:X,integer:L,isoline_here:x,isoline_mapbox:x,json:Y,numeric:L,pin:Q,report:ee,streetview:te,tab:ae,text:ie,textarea:j};function Je(e){return mapp.utils.html.node`
  <div class="layer-key">
    <span>
      ${e.location.layer.name}`}var oe={view:B,listview:N,infoj:U,entries:le};var ne=async e=>{e.Tabulator=await mapp.ui.utils.Tabulator(e.target,e.table),e.table.selectable&&e.Tabulator.on("rowClick",(t,a)=>{if(typeof e.rowSelect=="function"){e.rowSelect(t,a);return}let i=a.getData();!e.layer||!i[e.layer.qID]||(mapp.location.get({layer:e.layer,id:i[e.layer.qID]}),a.deselect())}),e.setData=t=>{!t&&e.data||(e.noDataMask&&!t?(e.target.style.display="none",e.mask=!e.mask&&e.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)):(e.mask&&e.mask.remove(),delete e.mask,e.target.style.display="block"),t=!t&&[]||t.length&&t||[t],e.Tabulator.setData(t),e.data=t,typeof e.setDataCallback=="function"&&e.setDataCallback(e))}};var re=async e=>{let t=e.target.appendChild(mapp.utils.html.node`<canvas>`);e.ChartJS=await mapp.ui.utils.Chart(t,mapp.utils.merge({type:"bar",options:{plugins:{legend:{display:!1},datalabels:{display:!1}}}},e.chart)),e.setData=a=>{e.noDataMask&&!a?(e.target.style.display="none",e.mask=!e.mask&&e.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)):(e.mask&&e.mask.remove(),delete e.mask,e.target.style.display="block"),a||(a={datasets:[{data:[]}]}),a.datasets||(a={datasets:[{data:a}]}),e.data=a,e.chart.datasets?.length&&a.datasets.forEach((i,l)=>Object.assign(i,e.chart.datasets[l])),a.labels=a.labels||e.chart.labels,e.ChartJS.data=a,e.ChartJS.update()}};var Ye={viewport:Ze,download_json:Ke,download_csv:Xe},se=e=>{let t=Object.keys(e.toolbar).map(a=>Ye[a](e));e.panel=mapp.utils.html.node`
    <div class="grid">
      <div class="btn-row">
        ${t}`,e.target=e.panel.appendChild(mapp.utils.html.node`
    <div class="dataview-target">`)};function Ze(e){return mapp.utils.html`
    <button
      class=${`flat ${e.viewport&&"active"||""}`}
      onclick=${t=>{t.target.classList.toggle("active"),e.viewport=!e.viewport,e.update()}}>Viewport`}function Ke(e){return mapp.utils.html`
    <button
      class="flat"
      onclick=${()=>{e.Tabulator.download("json",`${e.title||"table"}.json`)}}>JSON`}function Xe(e){return mapp.utils.html`
    <button
      class="flat"
      onclick=${()=>{e.Tabulator.download("csv",`${e.title||"table"}.csv`)}}>CSV`}var de=async e=>(e.target=typeof e.target=="string"&&document.getElementById(e.target)||e.target,e.target=e.target instanceof HTMLElement&&e.target||mapp.utils.html.node`
      <div
        class="dataview-target"
        style="position: absolute; width: 100%; height: 100%">`,e.update=async()=>{if(!e.query)return;let t=e.viewport&&e.layer.mapview.getBounds();e.viewport&&(e.queryparams=Object.assign(e.queryparams||{},{layer:!0}));let a=e.queryparams?.center&&ol.proj.transform(e.layer.mapview.Map.getView().getCenter(),`EPSG:${_xyz.mapview.srid}`,"EPSG:4326"),i=mapp.utils.paramString(Object.assign({},e.queryparams||{},{template:encodeURIComponent(e.query),filter:e.queryparams?.filter&&e.layer?.filter?.current,layer:e.queryparams?.layer&&e.layer.key,locale:e.queryparams?.layer&&e.layer.mapview.locale.key,id:e.queryparams?.id&&e.location&&e.location.id,lat:a&&a[1],lng:a&&a[0],z:e.queryparams?.z&&e.layer.mapview.Map.getView().getZoom(),viewport:t&&[t.west,t.south,t.east,t.north,e.layer.mapview.srid]})),l=await mapp.utils.xhr(`${e.host||e.location.layer.mapview.host}/api/query?`+i);if(!(l instanceof Error)){if(typeof e.responseFunction=="function")return e.responseFunction(l);typeof e.setData=="function"&&e.setData(l)}},e.toolbar&&se(e),e.chart&&await re(e),typeof e.columns!="undefined"&&(console.warn("Table dataviews should be configured inside a tables object"),e.table=Object.assign(e.table||{},{columns:e.columns})),e.table&&await ne(e),e.mapChange&&e.layer&&e.layer.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{e.layer&&!e.layer.display||e.tab&&!e.tab.classList.contains("active")||typeof e.mapChange=="function"&&e.mapChange()||e.update()}),e);var ce=e=>{!e.node||(e.tabs=e.node.appendChild(mapp.utils.html.node`<div class="tabs">`),e.panel=e.node.appendChild(mapp.utils.html.node`<div class="panel">`),e.id&&e.node.setAttribute("data-id",e.id),e.addTab=Qe,e.node.addEventListener("addTab",t=>e.addTab(t.detail)))};function Qe(e){let t=this;e.tab=mapp.utils.html.node`
    <div class="tab">
      <div
        class="header"
        style="${e.tab_style||""}"
        onclick=${a}>
        ${e.label||e.title||e.key||"Tab"}`,e.panel=e.panel||e.target||mapp.utils.html.node`
    <div
      class="${`panel ${e.class||""}`}">`,e.panel.addEventListener("activate",()=>{e.update&&e.update()}),e.show=a,e.remove=i,e.location?.removeCallbacks.push(()=>e.remove());function a(){mapp.utils.render(t.panel,e.panel),t.tabs.childNodes.forEach(l=>l.classList.remove("active")),!e.tab.parentElement&&t.tabs.appendChild(e.tab),e.tab.classList.add("active"),t.timer&&window.clearTimeout(t.timer),t.timer=window.setTimeout(()=>{if(e.panel instanceof HTMLElement){e.panel.dispatchEvent(new CustomEvent("activate"));return}e.target instanceof HTMLElement&&e.target.dispatchEvent(new CustomEvent("activate"))},500),t.showTab&&t.showTab()}function i(){if(!e.tab.parentElement)return;let l=e.tab.nextElementSibling||e.tab.previousElementSibling;if(e.tab.remove(),l)return l.querySelector(".header").click();t.removeLastTab&&t.removeLastTab()}}var pe=e=>mapp.utils.html.node`
  <div 
    data-id=${e.data_id||"card"}
    class="drawer">
    <div class="header bold">
      <span>${e.header}</span>
      <button
        data-id=close
        class="mask-icon close"
        onclick=${t=>{t.target.closest(".drawer").remove(),e.close&&e.close(t)}}}>
    </div>
    ${e.content}`;var me=e=>mapp.utils.html`
  <label 
    data-id=${e.data_id||"chkbox"}
    class="checkbox">
    <input
      type="checkbox"
      .disabled=${!!e.disabled}
      .checked=${!!e.checked}
      onchange=${t=>{e.onchange&&e.onchange(t.target.checked,e.val)}}>
    </input>
    <div></div>
    <span>${e.label}`;var ue={modify:et,draw:tt};mapp.utils.merge(mapp.dictionaries,{en:{remove_last_vertex:"Remove last vertex"},de:{remove_last_vertex:"Remove last vertex"},cn:{remove_last_vertex:"删除最后一个顶点"},pl:{remove_last_vertex:"Usuń ostatni wierzchołek"},ko:{remove_last_vertex:"마지막 정점(꼭지점) 제거"},fr:{remove_last_vertex:"Effacer le dernier point"},ja:{remove_last_vertex:"最後のバーテックスを削除"}});function et(e){e&&e.preventDefault();let t=[];t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({coords:this.interaction.vertices[this.interaction.vertices.length-1],content:mapp.utils.html.node`<ul>${t}`})}function tt(e){if(this.interaction.vertices.length===0)return;e&&e.preventDefault();let t=this.interaction.Layer.getSource().getFeatures(),a=[];t.length&&a.push(mapp.utils.html`
  <li
    onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),!t.length&&a.push(mapp.utils.html`
    <li
      onclick=${i=>{this.interaction.interaction.removeLastPoint(),this.interaction.vertices.pop(),this.popup(null)}}>${mapp.dictionary.remove_last_vertex}`),a.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({coords:this.interaction.vertices[this.interaction.vertices.length-1],content:mapp.utils.html.node`<ul>${a}`,autoPan:!0})}var he=e=>mapp.utils.html.node`
  <div 
    data-id=${e.data_id||"drawer"}
    class=${`drawer expandable ${e.class||""}`}>
    <div
      class="header"
      onclick=${t=>{if(!t.target.parentElement.classList.contains("empty")){if(t.target.parentElement.classList.contains("expanded"))return t.target.parentElement.classList.remove("expanded");e.accordion&&[...t.target.parentElement.parentElement.children].forEach(a=>{a.classList.remove("expanded")}),t.target.parentElement.classList.add("expanded")}}}>
      ${e.header}
    </div>
    ${e.content}`;var ge={point:at,polygon:ot,circle:nt,line:it,freehand:lt,isoline_here:st,isoline_mapbox:dt,rectangle:rt};mapp.utils.merge(mapp.dictionaries,{en:{draw_point:"Point",draw_polygon:"Polygon",draw_rectangle:"Rectangle",draw_circle:"Circle",draw_line:"Line",draw_freehand:"Freehand"},de:{draw_point:"Punkt",draw_polygon:"Polygon",draw_rectangle:"Rechteck",draw_circle:"Kreis",draw_line:"Linie",draw_freehand:"Freihand"},cn:{draw_point:"点",draw_polygon:"多边形",draw_rectangle:"长方形",draw_circle:"圈",draw_line:"线",draw_freehand:"任意图形"},pl:{draw_point:"Punkt",draw_polygon:"Poligon",draw_rectangle:"Prostokąt",draw_circle:"Okrag",draw_line:"Linia",draw_freehand:"Odręcznie"},ko:{draw_point:"점",draw_polygon:"다각형",draw_rectangle:"직사각형",draw_circle:"원",draw_line:"선",draw_freehand:"손으로 그림(자유 재량)"},fr:{draw_point:"Point",draw_polygon:"Polygone",draw_rectangle:"Rectangle",draw_circle:"Cercle",draw_line:"Ligne",draw_freehand:"À main levée"},ja:{draw_point:"ポイント",draw_polygon:"ポリゴン",draw_rectangle:"長方形",draw_circle:"丸",draw_line:"線",draw_freehand:"フリーハンド"}});function at(e,t){let a=Object.assign({},e,{type:"Point"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_point}`}function it(e,t){let a=Object.assign({},e,{type:"LineString"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_line}`}function lt(e,t){let a=Object.assign({},e,{type:"LineString",freehand:!0});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_freehand}`}function ot(e,t){let a=Object.assign({},e,{type:"Polygon"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_polygon}`}function nt(e,t){let a=Object.assign({},e,{type:"Circle",geometryFunction:ol.interaction.Draw.createRegularPolygon(33),tooltip:e.edit.circle.tooltip});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_circle}`}function rt(e,t){let a=Object.assign({},e,{type:"Circle",geometryFunction:ol.interaction.Draw.createBox(),tooltip:e.edit.rectangle.tooltip});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,a)}>
      ${mapp.dictionary.draw_rectangle}`}function st(e,t){let a=Object.assign({},e,{type:"Point",geometryFunction:n=>mapp.utils.here.geometryFunction(n,e.layer,l)});typeof a.edit.isoline_here!="object"&&(a.edit.isoline_here={});let i={"range[type]":"time",range:10,rangeMin:5,rangeMax:60,reverseDirection:!1,transportMode:"car",optimizeFor:"balanced"},l=Object.assign(a.edit.isoline_here,i),o=mapp.ui.elements.isoline_params_here(l);return o.append(mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${n=>t(n,a)}>
      Create Isoline`),o}function dt(e,t){let a=Object.assign({},e,{type:"Point",geometryFunction:n=>mapp.utils.mapboxGeometryFunction(n,e.layer,l)});typeof a.edit.isoline_mapbox!="object"&&(a.edit.isoline_mapbox={});let i={profile:"driving",minutes:10,minutesMin:5,minutesMax:60},l=Object.assign(a.edit.isoline_mapbox,i),o=mapp.ui.elements.isoline_params_mapbox(l);return o.append(mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${n=>t(n,a)}>
      Create Isoline`),o}var fe=e=>mapp.utils.html`
  <button 
    data-id=${e.data_id||"dropdown"}
    class="dropdown">
    <div class="head"
      onclick=${t=>{if(t.target.parentElement.classList.contains("active")){t.target.parentElement.classList.remove("active");return}document.querySelectorAll("button.dropdown").forEach(a=>a.classList.remove("active")),t.target.parentElement.classList.add("active")}}>
      <span data-id=header-span>${e.span||e.placeholder||e.entries[0].title}</span>
      <div class="icon"></div>
    </div>
    <ul>${e.entries.map(t=>mapp.utils.html.node`
      <li onclick=${a=>{let i=a.target.closest("button.dropdown");i.classList.toggle("active"),i.querySelector("[data-id=header-span]").textContent=t.title,e.callback&&e.callback(a,t)}}>${t.title}`)}`;var ve=e=>{let t=new Set,a=new Set;return mapp.utils.html`
    <button 
      data-id=${e.data_id||"dropdown"}
      class="dropdown">
      <div class="head"
        onclick=${i=>{if(i.target.parentElement.classList.contains("active")){i.target.parentElement.classList.remove("active");return}document.querySelectorAll("button.dropdown").forEach(l=>l.classList.remove("active")),i.target.parentElement.classList.add("active")}}>
        <span data-id=header-span>${e.span||e.placeholder||e.entries[0].title}</span>
        <div class="icon"></div>
      </div>
      <ul>${e.entries.map(i=>mapp.utils.html.node`
        <li onclick=${l=>{let o=l.target.closest("button.dropdown");o.classList.toggle("active"),l.target.classList.toggle("selected"),l.target.classList.contains("selected")?(t.add(i.title),a.add(i.option)):(t.delete(i.title),a.delete(i.option)),o.querySelector("[data-id=header-span]").textContent=Array.from(t).join(", "),e.callback&&e.callback(l,Array.from(a))}}>${i.title}`)}`};mapp.utils.merge(mapp.dictionaries,{en:{here_mode:"Mode",here_mode_driving:"driving",here_mode_walking:"walking",here_range_minutes:"Travel time in minutes",here_datetime_arrive:"Arrive at",here_datetime_depart:"Depart at",here_optimize_for:"Optimize for",here_optimize_for_balanced:"balanced",here_optimize_for_quality:"quality",here_optimize_for_performance:"performance"},de:{here_mode:"Modus",here_mode_driving:"Kraftfahrzeug",here_mode_walking:"zu Fuß",here_range_minutes:"Fahrzeit in Minuten",here_datetime_arrive:"Ankunft",here_datetime_depart:"Abfahrt",here_optimize_for:"Optimisierung",here_optimize_for_balanced:"Ausgeglichen",here_optimize_for_quality:"Qualität",here_optimize_for_performance:"Leistung"},cn:{here_mode_driving:"机动车行",here_mode_walking:"步行",here_range_minutes:"以分钟计交通时间 "},pl:{here_mode:"Środek transportu",here_mode_driving:"samochodem",here_mode_walking:"piechotą",here_range_minutes:"Czas podróży w minutach",here_datetime_arrive:"Rozpocznij",here_datetime_depart:"Osiągnij cel",here_optimize_for:"Optymalizacja",here_optimize_for_balanced:"zrównoważona",here_optimize_for_quality:"jakość",here_optimize_for_performance:"wydajność"},ko:{here_mode_driving:"운전",here_mode_walking:"도보",here_range_minutes:"여행시간(분) "},fr:{here_mode:"Type de transport",here_mode_driving:"en voiture",here_mode_walking:"à pied",here_range_minutes:"Temps du trajet en minutes",here_datetime_depart:"Partir à",here_datetime_arrive:"Arriver à",here_optimize_for:"Optimiser",here_optimize_for_balanced:"l'équilibre",here_optimize_for_quality:"la qualité",here_optimize_for_performance:"les performances"},ja:{here_mode_driving:"ドライビング",here_mode_walking:"ウォーキング",here_range_minutes:"移動時間 (分) "}});var we=e=>{let t=mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.here_mode_driving],option:"car"},{title:[mapp.dictionary.here_mode_walking],option:"pedestrian"}],callback:(r,d)=>{e.transportMode=d.option}})}`,a=mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_optimize_for}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.here_optimize_for_balanced],option:"balanced"},{title:[mapp.dictionary.here_optimize_for_quality],option:"quality"},{title:[mapp.dictionary.here_optimize_for_performance],option:"performance"}],callback:(r,d)=>{e.optimizeFor=d.option}})}`,i=mapp.utils.html.node`
    <span>${mapp.dictionary.here_datetime_depart}`,l=mapp.utils.html.node`
    <input
      type="datetime-local"
      onchange=${r=>{e.dateISO=new Date(r.target.value).toISOString()}}>`,o=mapp.utils.html.node`
    <div>
      ${i}
      ${l}`,n=mapp.ui.elements.slider({label:mapp.dictionary.here_range_minutes,min:e.rangeMin,max:e.rangeMax,val:10,callback:r=>{e.range=parseInt(r.target.value)}}),s=mapp.ui.elements.chkbox({label:"Reverse Direction Isoline",checked:!!e.reverseDirection,onchange:r=>{i.textContent=r&&mapp.dictionary.here_datetime_arrive||mapp.dictionary.here_datetime_depart,e.reverseDirection=r}});return mapp.ui.elements.drawer({header:mapp.utils.html`
      <h4>Here Isoline</h4>
      <div class="mask-icon expander"></div>`,class:"flat",content:mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${t}
        ${a}
        ${o}
        ${s}
        ${n}`})};mapp.utils.merge(mapp.dictionaries,{en:{mapbox_mode:"Mode",mapbox_driving:"Driving",mapbox_walking:"Walking",mapbox_cycling:"Cycling",mapbox_travel_time:"Travel time in minutes"},de:{mapbox_mode:"Mode",mapbox_driving:"Kraftfahrzeug",mapbox_walking:"zu Fuß",mapbox_cycling:"Fahrrad",mapbox_travel_time:"Fahrzeit in Minuten"},cn:{mapbox_mode:"模式",mapbox_driving:"机动车行",mapbox_walking:"步行",mapbox_cycling:"骑行",mapbox_travel_time:"以分钟计交通时间"},pl:{mapbox_mode:"Typ",mapbox_driving:"Samochodem",mapbox_walking:"Piechotą",mapbox_cycling:"Rowerem",mapbox_travel_time:"Czas podróży w minutach"},ko:{mapbox_mode:"모드",mapbox_driving:"운전",mapbox_walking:"도보",mapbox_cycling:"사이클",mapbox_travel_time:"여행시간(분)"},fr:{mapbox_mode:"Mode",mapbox_driving:"En voiture",mapbox_walking:"À pied",mapbox_cycling:"À velo",mapbox_travel_time:"Temps du trajet en minutes "},ja:{mapbox_mode:"モード",mapbox_driving:"ドライビング",mapbox_walking:"ウォーキング",mapbox_cycling:"サイクリング",mapbox_travel_time:"移動時間 (分)"}});var _e=e=>{let t=mapp.utils.html.node`
    <div 
      style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.mapbox_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.mapbox_driving],option:"driving"},{title:[mapp.dictionary.mapbox_walking],option:"walking"},{title:[mapp.dictionary.mapbox_cycling],option:"cycling"}],callback:(l,o)=>{e.profile=o.option}})}`,a=mapp.ui.elements.slider({label:mapp.dictionary.mapbox_travel_time,min:e.minutesMin,max:e.minutesMax,val:e.minutes,callback:l=>{e.minutes=parseInt(l.target.value)}});return mapp.ui.elements.drawer({header:mapp.utils.html`
      <h2>Mapbox Isoline</h2>
      <div class="mask-icon expander"></div>`,class:"lv-3 flat",content:mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${t}
        ${a}`})};var be=new XMLSerializer,ye=e=>{if(e.svg||e.type||e.layers){let t=e.layers&&Array.isArray(e.layers)&&e.layers.map(i=>`url(${i.svg})`).reverse().join(",")||`url(${e.svg||e.url||mapp.utils.svgSymbols[e.type](e)})`,a=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width+"px"||"100%"};
      height: ${e.height+"px"||"100%"};
      background-image:${t};`;return mapp.utils.html`<div style=${a}>`}if(!e.fillColor&&e.strokeColor){let t=`
      M 0,${e.height/2}
      L ${e.width/2},0
      ${e.width/2},${e.height}
      ${e.width},${e.height/2}`,a=mapp.utils.svg.node`
      <svg height=${e.height} width=${e.width}>
        <path d=${t}
          fill="none"
          stroke=${e.strokeColor}
          stroke-width=${e.strokeWidth||1}/>`,i=`data:image/svg+xml,${encodeURIComponent(be.serializeToString(a))}`,l=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width}px;
      height: ${e.height}px;
      background-image: url(${i});`;return mapp.utils.html`<div style=${l}>`}if(e.fillColor){let t=mapp.utils.svg.node`
      <svg height=${e.height} width=${e.width}>
        <rect
          x=${e.strokeWidth||1}
          y=${e.strokeWidth||1}
          rx="4px"
          ry="4px"
          stroke-linejoin="round"
          width=${e.width-2*(e.strokeWidth||1)}
          height=${e.height-2*(e.strokeWidth||1)}
          fill=${e.fillColor}
          fill-opacity=${e.fillOpacity||1}
          stroke=${e.strokeColor}
          stroke-width=${e.strokeWidth||1}>`,a=`data:image/svg+xml,${encodeURIComponent(be.serializeToString(t))}`,i=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width}px;
      height: ${e.height}px;
      background-image: url(${a});`;return mapp.utils.html`<div style=${i}>`}};var $e=e=>{return mapp.utils.html.node`
    <div
      role="group"
      data-id=${e.data_id||"slider"}
      title=${e.title||""}
      class="input-range single"
      style=${`--min: ${e.min}; --max: ${e.max}; --a: ${e.val}; ${e.style||""}`}>
      <div class="label-row">
        <label>${e.label}</label>
        <input id="a"
          type="number"
          min=${e.min}
          max=${e.max}
          value=${e.val}
          oninput=${t}></input>
      </div>
      <div class="track-bg"></div>
      <input id="a"
        type="range"
        min=${e.min}
        max=${e.max}
        value=${e.val}
        step=${e.step||1}
        oninput=${t}>`;function t(a){a.target.closest(".input-range").style.setProperty(`--${a.target.id}`,a.target.value),a.target.closest(".input-range").querySelectorAll("input").forEach(i=>{i.id==a.target.id&&i!=a.target&&(i.value=a.target.value)}),e.callback&&e.callback(a)}};var ke=e=>mapp.utils.html.node`
    <div
      role="group"
      class="input-range multi"
      style=${`
        --min: ${e.min};
        --max: ${e.max};
        --a: ${e.val_a};
        --b: ${e.val_b};`}>
      <div 
        class="label-row">
        <label>${e.label_a||"A"}
          <input id="a" type="number"
            value=${e.val_a}
            style="--c: var(--a)"></input>
        </label>
        <label>${e.label_b||"B"}
          <input id="b" type="number"
            value=${e.val_b}
            style="--c: var(--b)"></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input id="a" type="range"
        min=${e.min}
        max=${e.max}
        step=${e.step||1}
        value=${e.val_a}
        oninput=${a=>{a.target.parentNode.style.setProperty(`--${a.target.id}`,a.target.value),a.target.parentNode.querySelectorAll("input").forEach(i=>{i.id==a.target.id&&i!=a.target&&(i.value=a.target.value)}),e.callback_a&&e.callback_a(a)}}/>
      <input id="b" type="range"
        min=${e.min}
        max=${e.max}
        step=${e.step||1}
        value=${e.val_b}
        oninput=${a=>{a.target.parentNode.style.setProperty(`--${a.target.id}`,a.target.value),a.target.parentNode.querySelectorAll("input").forEach(i=>{i.id==a.target.id&&i!=a.target&&(i.value=a.target.value)}),e.callback_b&&e.callback_b(a)}}/>`;var xe={card:pe,chkbox:me,contextMenu:ue,drawer:he,drawing:ge,dropdown:fe,dropdown_multi:ve,isoline_params_here:we,isoline_params_mapbox:_e,legendIcon:ye,slider:$e,slider_ab:ke};var b=null;async function ct(){if(window.Chart){b=window.Chart;return}let e=await import("https://cdn.skypack.dev/chart.js@3.7.0");e.Chart.register(...e.registerables);let t=await import("https://cdn.skypack.dev/chartjs-plugin-datalabels@2.0.0");e.Chart.register(t.default);let a=await import("https://cdn.skypack.dev/chartjs-plugin-annotation@1.3.0");e.Chart.register(a.default),b=e.Chart}async function Le(e,t){return b||await ct(),new b(e,t)}var y=null;async function pt(){if(window.Tabulator){y=window.Tabulator;return}y=(await import("https://cdn.skypack.dev/pin/tabulator-tables@v5.0.10-xDu7yyLVhsxCKJbN5vfH/mode=imports/optimized/tabulator-tables.js")).TabulatorFull}async function je(){return y||await pt(),new y(...arguments)}var u={idle:600},Se=e=>{Object.assign(u,e),u.idle!==0&&(window.onload=f,window.onmousemove=f,window.onmousedown=f,window.ontouchstart=f,window.onclick=f,window.onkeypress=f,f(),S())};function f(){u.locked||(u.timeout&&clearTimeout(u.timeout),u.timeout=setTimeout(Ce,u.idle*1e3))}function Ce(){u.locked=!0,u.renew&&clearTimeout(u.renew);let e=new XMLHttpRequest;e.open("GET",`${u.host}/api/user/cookie?destroy=true`),e.send();let t=mapp.utils.html.node`
    <form
      class="login"
      action="${`${u.host}/api/user/login`}"
      method="post"
      autocomplete="off">
     
      <input
        name="login"
        class="display-none"
        value=true>
  
      <input
        name="language"
        class="display-none"
        value="en"
        required>
  
      <div class="input-group">
        <input
          id="auth_user_email"
          name="email"
          type="email"
          required maxlength="50">
        <span class="bar"></span>
        <label style="color: #fff" for="auth_user_email">E-mail</label>
      </div>
  
      <div class="input-group">
        <input
          id="auth_user_password"
          name="password"
          type="password"
          required minlength="8">
        <span class="bar"></span>
        <label style="color: #fff" for="auth_user_password">Password</label>
      </div>
     
      <button id="btnLogin" type="submit">Log In</button>

      <div class="msg"></div>
        
    </form>`;t.onsubmit=a=>{a.preventDefault();let i=new XMLHttpRequest;i.open("POST",`${u.host}/api/user/login`),i.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),i.onload=l=>{l.target.status===401&&(t.querySelector(".msg").textContent=l.target.response),l.target.status===200&&(delete u.locked,u.mask.remove(),f(),S())},i.send(`login=true&email=${t.querySelector("#auth_user_email").value}&password=${t.querySelector("#auth_user_password").value}`)},u.mask=document.body.appendChild(mapp.utils.html.node`
    <div class="interfaceMask">${t}`)}function S(){u.renew=setTimeout(e,(u.idle-20)*1e3);function e(){let t=new XMLHttpRequest;t.open("GET",`${u.host}/api/user/cookie?renew=true`),t.onload=a=>{if(a.target.status===401)return Ce();S()},t.send()}}var Ee=e=>{document.body.append(mapp.utils.html.node`
    <div class="interfaceMask">
      <div class="bg-image" style=${`background-image:url(${e.target.src})`}>
      <button class="btn-close mask-icon close"
        onclick=${t=>t.target.parentElement.parentElement.remove()}>`)};var ze=e=>{e.target.addEventListener("mousedown",a=>{a.preventDefault(),document.body.style.cursor="grabbing",window.addEventListener("mousemove",e.resizeEvent),window.addEventListener("mouseup",t)}),e.target.addEventListener("touchstart",a=>{a.preventDefault(),window.addEventListener("touchmove",e.resizeEvent),window.addEventListener("touchend",t)},{passive:!0});function t(){document.body.style.cursor="auto",window.removeEventListener("mousemove",e.resizeEvent),window.removeEventListener("touchmove",e.resizeEvent),window.removeEventListener("mouseup",t),window.removeEventListener("touchend",t)}};var De={Chart:Le,Tabulator:je,idleMask:Se,imagePreview:Ee,resizeHandler:ze};var Oe=e=>{let t=Object.assign({search:a,input:e.target.querySelector("input"),result:e.target.querySelector("ul"),sources:{glx:o,mapbox:n,google:s,opencage:m},select:l,createFeature:i,icon:{type:"markerColor",colorMarker:"#003D57",colorDot:"#939faa",anchor:[.5,1],scale:3}},e);t.input.placeholder=t.placeholder||"",t.input.addEventListener("keyup",r=>{!new Set([37,38,39,40,13]).has(r.keyCode||r.charCode)&&r.target.value.length>0&&t.search(r.target.value)}),t.input.addEventListener("keydown",r=>{let d=r.keyCode||r.charCode;if(d===46||d===8){t.xhr&&t.xhr.abort(),t.clear(),t.layer&&t.mapview.Map.removeLayer(t.layer);return}if(d===13){let p=r.target.value.split(",").map(parseFloat);p[1]>-90&&p[1]<90&&p[0]>-180&&p[0]<180&&(t.xhr&&t.xhr.abort(),t.clear(),t.createFeature({type:"Point",coordinates:[p[1],p[0]]})),t.result.querySelector("li").click()}}),t.input.addEventListener("focusout",()=>{t.xhr&&t.xhr.abort(),setTimeout(t.clear,400)}),t.clear=()=>{t.target.classList.remove("active"),t.result.innerHTML=""};function a(r,d={}){t.clear&&t.clear(),t.xhr&&t.xhr.abort(),t.xhr=new XMLHttpRequest,t.xhr.open("GET",t.mapview.host+"/api/gazetteer?"+mapp.utils.paramString({locale:t.mapview.locale.key,q:encodeURIComponent(r),source:d.source})),t.xhr.setRequestHeader("Content-Type","application/json"),t.xhr.responseType="json",t.xhr.onload=p=>{if(p.target.status===200){if(t.callback)return t.callback(p.target.response);if(p.target.response.length===0)return t.result.appendChild(mapp.utils.html.node`
          <li>${mapp.dictionary.no_results}`),t.target.classList.add("active");Object.values(p.target.response).forEach(c=>{t.result.appendChild(mapp.utils.html.node`
          <li
            onclick=${h=>{if(!c.source||!c.id){if(t.callback)return t.callback(c);c.marker&&t.createFeature({type:"Point",coordinates:c.marker.split(",")});return}t.select({label:c.label,id:c.id,source:c.source,layer:c.layer,table:c.table,marker:c.marker,callback:d.callback})}}>
        ${t.label?mapp.utils.html.node`
          <span
            style="padding: 0 2px; cursor: help; border-radius: 2px;">
              ${t.mapview.layers[c.layer]&&t.mapview.layers[c.layer].name||c.layer||c.source}</span>`:""}
              <span>${c.label}</span>`),t.target.classList.add("active")})}},t.xhr.send()}function i(r){r=typeof r=="string"&&JSON.parse(r)||r,t.layer&&t.mapview.Map.removeLayer(t.layer),t.layer=t.mapview.geoJSON({geometry:r,dataProjection:"4326",Style:mapp.utils.style({icon:t.icon})});let d=t.mapview.Map.getView();d.animate({zoom:t.zoom||d.getMaxZoom()},{center:ol.proj.fromLonLat(r.coordinates)})}function l(r){t.clear&&t.clear(),t.input&&(t.input.value=r.label),t.sources[r.source](r)}function o(r){if(typeof t.callback=="function")return t.callback(r);mapp.location.get({layer:t.mapview.layers[r.layer],table:r.table,id:r.id}).then(d=>d.flyTo())}function n(r){t.createFeature({type:"Point",coordinates:r.marker}),r.callback&&r.callback()}function s(r){mapp.utils.xhr(`${t.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${r.id}&{GOOGLE}`)}`).then(d=>{let p={type:"Point",coordinates:[d.result.geometry.location.lng,d.result.geometry.location.lat]};if(t.createFeature(p),t.callback)return t.callback(p);r.callback&&r.callback(p)})}function m(r){t.createFeature({type:"Point",coordinates:r.marker}),r.callback&&r.callback()}};var qe={layers:G,locations:oe,elements:xe,utils:De,gazetteer:Oe,Dataview:de,Tabview:ce};typeof window.mapp=="object"&&(window.mapp.ui=qe);var mt=qe;export{mt as default};
//# sourceMappingURL=ui.js.map
