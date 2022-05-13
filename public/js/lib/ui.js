mapp.utils.merge(mapp.dictionaries,{en:{layer_zoom_to_extent:"Zoom to filtered layer extent",layer_visibility:"Toggle visibility"},de:{layer_zoom_to_extent:"Zoom zum Ausma\xDF des gefilterten Datensatzes",layer_visibility:"Umschalten der Ansicht"},cn:{layer_zoom_to_extent:"\u7F29\u653E\u81F3\u76F8\u5E94\u7B5B\u9009\u8303\u56F4",layer_visibility:"\u5207\u6362\u53EF\u89C1\u6027"},pl:{layer_zoom_to_extent:"Poka\u017C zasi\u0119g warstwy",layer_visibility:"Widoczno\u015B\u0107"},ko:{layer_zoom_to_extent:"\uD544\uD130\uB41C \uB808\uC774\uC5B4\uD06C\uAE30\uC5D0 \uC90C(zoom)",layer_visibility:"\uD1A0\uAE00 \uAC00\uC2DC\uC131"},fr:{layer_zoom_to_extent:"Zoom sur l'\xE9tendue de la couche",layer_visibility:"Changer la visiblit\xE9"},ja:{layer_zoom_to_extent:"\u30D5\u30A3\u30EB\u30BF\u30FC\u3055\u308C\u305F\u30EC\u30A4\u30E4\u30FC\u7BC4\u56F2\u3092\u30BA\u30FC\u30E0\u306B",layer_visibility:"\u8868\u793A\u5207\u66FF"}});var w=e=>{let t=mapp.utils.html`
    <button
      title=${mapp.dictionary.layer_zoom_to_extent}
      class="mask-icon fullscreen"
      onclick=${o=>{e.zoomToExtent()}}>`,l=mapp.utils.html.node`
    <button
      data-id=display-toggle
      title=${mapp.dictionary.layer_visibility}
      class="${`mask-icon toggle ${e.display&&"on"||"off"}`}"
      onclick=${o=>{e.display?e.hide():e.show()}}>`,i=mapp.utils.html`
    <h2>${e.name||e.key}</h2>
    <div class="mask-icon expander"></div>
    ${t}
    ${l}`,a=Object.keys(e).map(o=>mapp.ui.layers.panels[o]&&mapp.ui.layers.panels[o](e)).filter(o=>typeof o<"u");if(e.meta){let o=mapp.utils.html.node`<p class="meta">`;o.innerHTML=e.meta,a.unshift(o)}e.view=mapp.ui.elements.drawer({data_id:"layer-drawer",class:"layer-view",header:i,content:a}),e.view.addEventListener("displayTrue",()=>{l.classList.add("on"),e.tabs?.forEach(o=>o.display&&o.show())}),e.view.addEventListener("displayFalse",()=>{l.classList.remove("on"),e.tabs?.forEach(o=>o.remove())}),e.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{if(!!e.tables){if(e.tableCurrent()===null)return e.view.classList.add("disabled");e.view.classList.remove("disabled")}}),e.view.children.length<=1&&e.view.classList.add("empty")};mapp.utils.merge(mapp.dictionaries,{en:{layer_group_hide_layers:"Toggle all layers in group"},de:{layer_group_hide_layers:"Umschalten aller Ebenen in Gruppe"},cn:{layer_group_hide_layers:"\u9690\u85CF\u56FE\u5C42"},pl:{layer_group_hide_layers:"Ukryj warstwy z tej grupy"},ko:{layer_group_hide_layers:"\uADF8\uB8F9\uC5D0\uC11C \uB808\uC774\uC5B4 \uC228\uAE30\uAE30"},fr:{layer_group_hide_layers:"Cacher les couches du groupe"},ja:{layer_group_hide_layers:"\u30B0\u30EB\u30FC\u30D7\u304B\u3089\u30EC\u30A4\u30E4\u30FC\u3092\u96A0\u3059"}});function j(e){if(!e.mapview||!e.target)return;let t={node:e.target,groups:{}};Object.values(e.mapview.layers).forEach(a=>l(a));function l(a){if(!a.hidden){if(w(a),!a.group){t.node.appendChild(a.view);return}t.groups[a.group]||i(a),t.groups[a.group].addLayer(a)}}function i(a){let o={list:[]};t.groups[a.group]=o;let n=mapp.utils.html.node`
      <button
        class="mask-icon toggle"
        title=${mapp.dictionary.layer_group_hide_layers}
        onclick=${s=>{if(s.target.classList.toggle("on"),s.target.classList.contains("on")){o.list.filter(p=>!p.display).forEach(p=>p.show());return}o.list.filter(p=>p.display).forEach(p=>p.hide())}}>`;o.meta=mapp.utils.html.node`<div class="meta">`,o.drawer=mapp.ui.elements.drawer({data_id:"layer-drawer",class:"layer-group",header:mapp.utils.html`
        <h2>${a.group}</h2>
        <div class="mask-icon expander"></div>
        ${n}`,content:o.meta}),t.node.appendChild(o.drawer),o.chkVisibleLayer=()=>{o.list.some(s=>s.display)?n.classList.add("on"):n.classList.remove("on")},o.addLayer=s=>{if(s.group=o,s.groupmeta){let p=o.meta.appendChild(mapp.utils.html.node`<div>`);p.innerHTML=s.groupmeta}o.list.push(s),o.drawer.appendChild(s.view),o.chkVisibleLayer(),s.view.addEventListener("displayTrue",()=>o.chkVisibleLayer()),s.view.addEventListener("displayFalse",()=>o.chkVisibleLayer())}}}var q={like:z,match:z,numeric:O,integer:O,in:Pe,date:D,datetime:D,boolean:Ie},k;function _(e,t){clearTimeout(k),k=setTimeout(()=>{k=null,e.reload(),e.mapview.Map.getTargetElement().dispatchEvent(new Event("changeEnd"))},500)}function z(e,t){return mapp.utils.html`
  <input
    type="text"
    onkeyup=${l=>{l.target.value.length?e.filter.current[t.filter.field]={[t.filter.type]:encodeURIComponent(l.target.value)}:delete e.filter.current[t.filter.field],_(e)}}>`}function Ie(e,t){return mapp.ui.elements.chkbox({label:t.label||t.title||"chkbox",onchange:l=>{e.filter.current[t.filter.field]={boolean:l},e.reload(),e.mapview.Map.getTargetElement().dispatchEvent(new Event("changeEnd"))}})}async function O(e,t){let l=await mapp.utils.xhr(`${e.mapview.host}/api/query?${mapp.utils.paramString({template:"field_stats",locale:e.mapview.locale.key,layer:e.key,table:e.tableCurrent(),field:t.field})}`);if(!l)return;let i=t.filter.type==="integer"?1:.01;return e.filter.current[t.field]=Object.assign({gte:Number(l.min),lte:Number(l.max)},e.filter.current[t.field]),_(e),mapp.ui.elements.slider_ab({min:l.min,max:l.max,step:i,label_a:"Greater than",val_a:l.min,callback_a:a=>{e.filter.current[t.field].gte=Number(a.target.value),_(e)},label_b:"Lesser than",val_b:l.max,callback_b:a=>{e.filter.current[t.field].lte=Number(a.target.value),_(e)}})}async function Pe(e,t){if(t.filter.distinct){let i=await mapp.utils.xhr(`${e.mapview.host}/api/query?`+mapp.utils.paramString({template:"distinct_values",dbs:e.dbs,table:e.tableCurrent(),field:t.field}));t.filter.in=i.map(a=>a[t.field]).filter(a=>a!==null)}let l=new Set(e.filter?.current[t.filter.field]?.in||[]);return t.filter.dropdown?mapp.ui.elements.dropdown_multi({placeholder:"Select Multiple",entries:t.filter.in.map(i=>({title:i,option:i})),callback:async(i,a)=>{Object.assign(e.filter.current,{[t.filter.field]:{in:a}}),e.reload(),e.mapview.Map.getTargetElement().dispatchEvent(new Event("changeEnd"))}}):t.filter.in.map(i=>mapp.ui.elements.chkbox({val:i,label:i,checked:l.has(i),onchange:(a,o)=>{if(a)e.filter.current[t.filter.field]||(e.filter.current[t.filter.field]={}),e.filter.current[t.filter.field].in||(e.filter.current[t.filter.field].in=[]),e.filter.current[t.filter.field].in.push(encodeURIComponent(o));else{let n=e.filter.current[t.filter.field].in.indexOf(encodeURIComponent(o));e.filter.current[t.filter.field].in.splice(n,1),e.filter.current[t.filter.field].in.length||delete e.filter.current[t.filter.field].in}e.reload(),e.mapview.Map.getTargetElement().dispatchEvent(new Event("changeEnd"))}}))}function D(e,t){let l=mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${a}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`,i=mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${a}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`;function a(o){o.target.dataset.id==="inputAfter"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{gt:new Date(o.target.value).getTime()/1e3})),o.target.dataset.id==="inputBefore"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{lt:new Date(o.target.value).getTime()/1e3})),e.reload(),e.mapview.Map.getTargetElement().dispatchEvent(new Event("changeEnd"))}return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${l}</label>
      <label>Date before
        ${i}</label>`}mapp.utils.merge(mapp.dictionaries,{en:{layer_add_new_location:"Add new locations"},de:{layer_add_new_location:"Erstelle neue Lage"},cn:{layer_add_new_location:"\u6570\u636E\u68C0\u89C6"},pl:{layer_add_new_location:"Dodaj nowe miejsca"},ko:{layer_add_new_location:"\uC0C8\uB85C\uC6B4 \uC704\uCE58 \uCD94\uAC00"},fr:{layer_add_new_location:"Ajouter des nouveaux lieux"},ja:{layer_add_new_location:"\u65B0\u3057\u3044\u30ED\u30B1\u30FC\u30B7\u30E7\u30F3\u3092\u8FFD\u52A0"}});var T=e=>{let t={layer:e,srid:e.srid,edit:e.edit,mapview:e.mapview},l=typeof e.edit=="object"&&Object.keys(e.edit).map(a=>mapp.ui.elements.drawing[a]&&mapp.ui.elements.drawing[a](t,Ae)).filter(a=>!!a);return l?mapp.ui.elements.drawer({data_id:"draw-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`
      ${l}`}):void 0};function Ae(e,t){let l=e.target;if(l.classList.contains("active")){l.classList.remove("active"),t.mapview.interactions.highlight();return}l.classList.add("active"),t.layer.show(),t.layer.view.querySelector(".header").classList.add("edited","active"),t.mapview.interactions.draw({type:t.type,geometryFunction:t.geometryFunction,tooltip:t.tooltip,srid:t.srid,callback:async i=>{if(i){let a={layer:t.layer};a.id=await mapp.utils.xhr({method:"POST",url:`${a.layer.mapview.host}/api/location/new?`+mapp.utils.paramString({locale:a.layer.mapview.locale.key,layer:a.layer.key,table:a.layer.tableCurrent()}),body:JSON.stringify({geometry:i.geometry})}),t.layer.reload(),mapp.location.get(a)}t.layer.view.querySelector(".header").classList.remove("edited","active"),l.classList.contains("active")&&(l.classList.remove("active"),t.mapview.interactions.highlight())}})}mapp.utils.merge(mapp.dictionaries,{en:{layer_filter_header:"Filter",layer_filter_select:"Select filter from list"},de:{layer_filter_header:"Filter",layer_filter_select:"Filter Auswahl"},cn:{layer_filter_header:"\u7B5B\u9009",layer_filter_select:"\u4ECE\u5217\u8868\u7B5B\u9009"},pl:{layer_filter_header:"Filtruj",layer_filter_select:"Wybierz filtr z listy"},ko:{layer_filter_header:"\uD544\uD130",layer_filter_select:"\uB9AC\uC2A4\uD2B8\uB85C \uBD80\uD130 \uD544\uD130 \uC120\uD0DD"},fr:{layer_filter_header:"Filtres",layer_filter_select:"Choisir un filtre dans la liste"},ja:{layer_filter_header:"\u30D5\u30A3\u30EB\u30BF\u30FC",layer_filter_select:"\u30EA\u30B9\u30C8\u304B\u3089\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u9078\u629E"}});var M=e=>{if(!e.infoj?.some(i=>i.filter))return;e.filter.list=e.infoj.filter(i=>i.filter);let t=mapp.ui.elements.dropdown({data_id:`${e.key}-filter-dropdown`,placeholder:mapp.dictionary.layer_filter_select,entries:e.filter.list,callback:async(i,a)=>{if(e.filter.view.querySelector("[data-id=clearall]").style.display="block",a.filter.card||(a.filter.field=a.filter.field||a.field,a.filter.remove=()=>{delete e.filter.current[a.filter.field],delete a.filter.card,e.reload(),e.filter.view.querySelector("[data-id=clearall]").style.display=e.filter.view.children.length===3?"none":"block"},!mapp.ui.layers.filters[a.filter.type]))return;a.filter.field=a.filter.field||a.field;let o=await mapp.ui.layers.filters[a.filter.type](e,a);a.filter.card=e.filter.view.appendChild(mapp.ui.elements.card({header:a.filter_title||a.title,close:a.filter.remove,content:o}))}}),l=mapp.utils.html`
    <button
      data-id=clearall
      class="primary-colour"
      style="display: none; margin-bottom: 5px;"
      onclick=${i=>{e.filter.list.filter(a=>a.filter.card).forEach(a=>{a.filter.card.querySelector("[data-id=close]").click()}),e.reload()}}>${mapp.dictionary.layer_filter_clear_all}`;return e.filter.view=mapp.ui.elements.drawer({data_id:"filter-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`
      ${t}
      ${l}`}),e.filter.view};mapp.utils.merge(mapp.dictionaries,{en:{layer_dataview_header:"Data Views"},de:{layer_dataview_header:"Datenansichten"},cn:{layer_dataview_header:"\u6570\u636E\u68C0\u89C6"},pl:{layer_dataview_header:"Widoki danych"},ko:{layer_dataview_header:"\uB370\uC774\uD130 \uBCF4\uAE30"},fr:{layer_dataview_header:"Vues des donn\xE9es"},ja:{layer_dataview_header:"\u30C7\u30FC\u30BF\u30D3\u30E5\u30FC"}});var F=e=>{let t=Object.entries(e.dataviews).map(i=>{let a=Object.assign(i[1],{key:i[0],layer:e,host:e.mapview.host}),o=document.querySelector(`[data-id=${a.target}]`);if(!!o)return mapp.ui.Dataview(a).then(n=>{e.display&&n.display&&n.show()}),o.dispatchEvent(new CustomEvent("addTab",{detail:a})),e.tabs?e.tabs.push(a):e.tabs=[a],mapp.ui.elements.chkbox({label:a.title||a.key,checked:!!a.display,onchange:n=>{a.display=n,a.display?a.show():a.remove()}})});return mapp.ui.elements.drawer({data_id:"dataviews-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`${t}`})};var I=e=>{let t=Object.keys(e.reports).map(i=>{let a=e.reports[i];a.key=i,a.host=e.mapview.host;let o=`${a.host}/view?${mapp.utils.paramString({template:a.template,lat:mapp.hooks.current?.lat,lng:mapp.hooks.current?.lng,z:mapp.hooks.current?.z})}`;return mapp.utils.html`
      <a
        class="link-with-img"
        target="_blank"
        href="${o}">
        <div class="mask-icon event-note"></div>
        <span>${a.title||a.key}`});return mapp.ui.elements.drawer({data_id:"reports-drawer",class:"lv-1",header:mapp.utils.html`
      <h4>Reports</h4>
      <div class="mask-icon expander"></div>`,content:mapp.utils.html`${t}`})};mapp.utils.merge(mapp.dictionaries,{en:{layer_style_header:"Style",layer_style_select_theme:"Select thematic style",layer_style_display_labels:"Display labels",layer_style_switch_caption:"Click on labels to switch visibility or ",layer_style_switch_all:"switch all",layer_grid_legend_ratio:"Display colour as a ratio to the size",layer_style_cluster:"Multiple locations"},de:{layer_style_header:"Stil",layer_style_select_theme:"Auswahl eines thematischen Stiles",layer_style_display_labels:"Umschalten der Label Ansicht",layer_style_switch_caption:"Auswahl der Label schaltet Ansicht um oder ",layer_style_switch_all:"Alle ausw\xE4hlen",layer_grid_legend_ratio:"Farbe im Verh\xE4ltnis zur Gr\xF6\xDFe",layer_style_cluster:"Mehrere Lagen"},cn:{layer_style_header:"\u98CE\u683C\u6837\u5F0F",layer_style_select_theme:"\u9009\u62E9\u4E3B\u9898\u98CE\u683C",layer_style_display_labels:"\u663E\u793A\u6807\u7B7E",layer_style_switch_caption:"\u5355\u51FB\u56FE\u6807\u4EE5\u5207\u6362\u53EF\u89C1\u6027 ",layer_style_switch_all:"\u5168\u90E8\u5207\u6362",layer_grid_legend_ratio:"\u663E\u793A\u989C\u8272\u4E0E\u5C3A\u5BF8\u6BD4\u4F8B",layer_style_cluster:"\u591A\u4E2A\u5730\u70B9"},pl:{layer_style_header:"Styl",layer_style_select_theme:"Wybierz styl tematyczny",layer_style_display_labels:"Poka\u017C etykiety",layer_style_switch_caption:"Kliknij etykiety aby zmieni\u0107 widoczno\u015B\u0107 albo ",layer_style_switch_all:"zmie\u0144 wszystkie",layer_grid_legend_ratio:"Poka\u017C kolor w proporcji do rozmiaru",layer_style_cluster:"Wi\u0119cej miejsc"},ko:{layer_style_header:"\uC2A4\uD0C0\uC77C",layer_style_select_theme:"\uC8FC\uC81C\uBCC4 \uC2A4\uD0C0\uC77C \uC120\uD0DD",layer_style_display_labels:"\uB77C\uBCA8 \uD45C\uC2DC",layer_style_switch_caption:"\uAC00\uC2DC\uC131 \uBCC0\uACBD\uC744 \uC704\uD574 \uB77C\uBCA8 \uD074\uB9AD \uB610\uB294 ",layer_style_switch_all:"\uBAA8\uB450 \uBCC0\uACBD",layer_grid_legend_ratio:"\uD06C\uAE30\uBE44\uC728\uC5D0 \uB530\uB978 \uC0C9\uC0C1 \uD45C\uC2DC",layer_style_cluster:"\uBCF5\uC218 \uC704\uCE58"},fr:{layer_style_header:"Style",layer_style_select_theme:"Choisir un th\xE8me dans la liste",layer_style_display_labels:"Afficher les \xE9tiquettes",layer_style_switch_caption:"Cliquer sur l'etiquette pour changer la visiblit\xE9 ou ",layer_style_switch_all:"changer tout",layer_grid_legend_ratio:"Rapport de coleur et de taille",layer_style_cluster:"Plusieurs lieux"},ja:{layer_style_header:"\u30B9\u30BF\u30A4\u30EB",layer_style_select_theme:"\u30C6\u30FC\u30DE\u30B9\u30BF\u30A4\u30EB\u3092\u9078\u629E",layer_style_display_labels:"\u30E9\u30D9\u30EB\u3092\u8868\u793A",layer_style_switch_caption:"\u8868\u793A\u5207\u66FF\u3048\u306B\u306F\u5404\u30E9\u30D9\u30EB\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u304B ",layer_style_switch_all:"\u5168\u8868\u793A\u6216\u3044\u306F\u5168\u975E\u8868\u793A",layer_grid_legend_ratio:"\u8272\u306F\u30B5\u30A4\u30BA\u306E\u6BD4\u7387\u3067\u8868\u793A",layer_style_cluster:"\u591A\u6570\u306E\u30ED\u30B1\u30FC\u30B7\u30E7\u30F3"}});var P=e=>{if(e.style.hidden)return;let t=[];if(e.style.label){let l=mapp.ui.elements.chkbox({data_id:"labelCheckbox",label:e.style.label.title||mapp.dictionary.layer_style_display_labels,checked:!!e.style.label.display,onchange:i=>{e.style.label.display=i,e.L.setStyle(e.L.getStyle())}});(e.style.label.minZoom||e.style.label.maxZoom)&&e.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{let i=e.mapview.Map.getView().getZoom(),a=e.view.querySelector("[data-id=labelCheckbox]");if(i<=e.style.label.minZoom||i>=e.style.label.maxZoom)return a.classList.add("disabled");a.classList.remove("disabled")}),t.push(l)}if(e.style.themes&&Object.keys(e.style.themes).length>1&&t.push(mapp.utils.html`
      <div>${mapp.dictionary.layer_style_select_theme}</div>
        ${mapp.ui.elements.dropdown({entries:Object.keys(e.style.themes).map(l=>({title:e.style.themes[l].title||l,option:l})),callback:(l,i)=>{e.style.theme=e.style.themes[i.option],mapp.utils.render(e.style.drawer.querySelector(".drawer > .legend"),mapp.ui.layers.styles[e.style.theme.type](e)),e.reload()}})}`),e.style.theme&&!e.style.themes&&t.push(mapp.utils.html`
      <h3>${e.style.theme.title}</h3>`),e.style.theme&&t.push(mapp.utils.html`
    <div class="legend">
      ${mapp.ui.layers.styles[e.style.theme.type]&&mapp.ui.layers.styles[e.style.theme.type](e)}`),!!t.length)return e.style.drawer=mapp.ui.elements.drawer({data_id:"style-drawer",class:"lv-1",header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_style_header}</h3>
      <div class="mask-icon expander"></div>`,content:t}),e.style.drawer};var A=e=>{let t=e.style.theme,l=[];if(l.push(mapp.utils.html`
    <div
      class="switch-all"
      style="grid-column: 1/3;">
      ${mapp.dictionary.layer_style_switch_caption}
      <button
        class="primary-colour bold"
        onclick=${i=>{i.target.closest(".legend").querySelectorAll(".switch").forEach(a=>a.click()),e.reload()}}>${mapp.dictionary.layer_style_switch_all}</button>.`),Object.entries(t.cat).forEach(i=>{let a=Object.assign({},e.style.default,i[1].style&&i[1].style.icon||i[1].style||i[1]),o=mapp.utils.html`
      <div
        style="height: 24px; width: 24px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},a))}`,n=mapp.utils.html`
      <div
        class=${`label switch ${e.filter.current[t.field]?.ni?.indexOf(i[0])===0?"disabled":""}`}
        onclick=${s=>{s.target.classList.toggle("disabled"),s.target.classList.contains("disabled")?(e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field].ni||(e.filter.current[t.field].ni=[]),e.filter.current[t.field].ni.push(i[1].keys||i[0]),e.filter.current[t.field].ni=e.filter.current[t.field].ni.flat()):(Array.isArray(i[1].keys)?i[1].keys.forEach(p=>{e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(p),1)}):e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(i[0]),1),e.filter.current[t.field].ni.length||delete e.filter.current[t.field]),e.reload()}}>${i[1].label||i[0]}`;l.push(mapp.utils.html`
    <div 
      data-id=${i[0]}
      class="contents">
      ${o}${n}`)}),e.style.cluster){let i=mapp.utils.html`
      <div
        style="height: 40px; width: 40px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:40,height:40},e.style.default,e.style.cluster))}`,a=mapp.utils.html`
      <div
        class="label">
        ${mapp.dictionary.layer_style_cluster}`;l.push(mapp.utils.html`
      <div 
        data-id="cluster"
        class="contents">
        ${i}${a}`)}return e.style.legend=mapp.utils.html.node`<div class="grid">${l}`,e.style.legend};var R=e=>{let t=e.style.theme,l=[];return t.cat_arr.forEach(i=>{let a=Object.assign({},e.style.default,i.style&&i.style.icon||i.style||i),o=mapp.utils.html`
      <div
        style="height: 24px; width: 24px;">
        ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},a))}`,n=mapp.utils.html`
      <div class="label">${i.label||i.value}`;l.push(mapp.utils.html`
      <div 
        data-id=${i.value}
        class="contents">
        ${o}${n}`)}),e.style.legend=mapp.utils.html.node`<div class="grid">${l}`,e.style.legend};var G=e=>{let t=[];t.push(mapp.ui.elements.dropdown({entries:Object.entries(e.grid_fields).map(o=>({title:o[0],options:o[1]})),callback:(o,n)=>{e.grid_size=n.options,e.reload()}}));let l=e.style.range.length,i=new XMLSerializer,a=mapp.utils.html`
  <div
    class="grid"
    style=${`grid-template-columns: repeat(${l}, 1fr); grid-template-rows: 20px 20px 20px 20px;`}>
    <div data-id="size-labels" class="contents">
      <span data-id="size-min" style="grid-row:1;grid-column:1;">min</span>
      <span data-id="size-avg" style=${`grid-row:1;grid-column:${Math.ceil(l/2)};text-align:center;`}>avg</span>
      <span data-id="size-max" style=${`grid-row:1;grid-column:${l};text-align:end;`}>max</span>
    </div>
    <div data-id="size-icons" class="contents">
      ${e.style.range.map((o,n)=>{let s=mapp.utils.svg.node`<svg height=50 width=50>
          <circle
            fill='#777'
            cx=27
            cy=27
            r='${23/l*(n+1)}'/>
          <circle
            fill='#999'
            cx=25
            cy=25
            r='${23/l*(n+1)}'/>`,p=`data:image/svg+xml,${encodeURIComponent(i.serializeToString(s))}`,r=`
          grid-row:2;
          grid-column:${n+1};
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
          width: 100%;
          height: 100%;
          background-image: url(${p});`;return mapp.utils.html`<div style=${r}>`})}
    </div>
    <div data-id="colour-icons" class="contents">
      ${e.style.range.map((o,n)=>mapp.utils.html`
        <div style=${`grid-row:3;grid-column:${n+1};background-color:${o};width:100%;height:100%;`}>
      `)}
    </div>
    <div data-id="colour-labels" class="contents">
      <span data-id="color-min" style="grid-row:4;grid-column:1;">min</span>
      <span data-id="color-avg" style=${`grid-row:4;grid-column:${Math.ceil(l/2)};text-align:center;`}>avg</span>
      <span data-id="color-max" style=${`grid-row:4;grid-column:${l};text-align:end;`}>max</span>
    </div>
  </div>`;return t.push(a),t.push(mapp.ui.elements.dropdown({entries:Object.entries(e.grid_fields).map(o=>({title:o[0],options:o[1]})),span:Object.keys(e.grid_fields)[1],callback:(o,n)=>{e.grid_color=n.options,e.reload()}})),t.push(mapp.ui.elements.chkbox({label:mapp.dictionary.layer_grid_legend_ratio,onchange:o=>{e.grid_ratio=o,e.reload()}})),e.style.legend=mapp.utils.html.node`
    <div class="legend">${t}`,e.style.legend.addEventListener("update",()=>{e.style.legend.querySelector("[data-id=size-min]").textContent=e.sizeMin.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=size-avg]").textContent=e.sizeAvg.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=size-max]").textContent=e.sizeMax.toLocaleString("en-GB",{maximumFractionDigits:0}),e.grid_ratio?(e.style.legend.querySelector("[data-id=color-min]").textContent=e.colorMin.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"}),e.style.legend.querySelector("[data-id=color-avg]").textContent=e.colorAvg.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"}),e.style.legend.querySelector("[data-id=color-max]").textContent=e.colorMax.toLocaleString("en-GB",{maximumFractionDigits:0,style:"percent"})):(e.style.legend.querySelector("[data-id=color-min]").textContent=e.colorMin.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=color-avg]").textContent=e.colorAvg.toLocaleString("en-GB",{maximumFractionDigits:0}),e.style.legend.querySelector("[data-id=color-max]").textContent=e.colorMax.toLocaleString("en-GB",{maximumFractionDigits:0}))}),e.style.legend};var V=e=>{let t=[],l=mapp.utils.html`
  <div
    style="height: 24px; width: 24px;">
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style.theme.style))}`;return t.push(mapp.utils.html`
    <div 
      class="contents">
      ${l}<div class="label">${e.style.theme.label}`),e.style.legend=mapp.utils.html.node`<div class="grid">${t}`,e.style.legend};var B={view:w,listview:j,filters:q,panels:{edit:T,style:P,filter:M,reports:I,dataviews:F},styles:{categorized:A,graduated:R,grid:G,basic:V}};mapp.utils.merge(mapp.dictionaries,{en:{location_zoom:"Zoom map to feature bounds",location_save:"Save changes to cloud",location_remove:"Remove feature from selection",location_delete:"Delete location"},de:{location_zoom:"Ansicht den Lagen Geometrien anpassen",location_save:"Speichern der Daten\xE4nderungen",location_remove:"Lagen Auswahl aufheben",location_delete:"L\xF6schen der Lage"},cn:{location_zoom:"\u7F29\u653E\u5730\u56FE\u81F3\u76EE\u6807\u8303\u56F4",location_save:"\u5C06\u66F4\u6539\u4FDD\u5B58\u81F3\u4E91",location_remove:"\u5220\u9664\u6240\u9009\u76EE\u6807\u8981\u7D20",location_delete:"\u5220\u9664\u5730\u70B9"},pl:{location_zoom:"Poka\u017C zasi\u0119g miejsca",location_save:"Zapisz zmiany",location_remove:"Odznacz miejsce",location_delete:"Usu\u0144 miejsce"},ko:{location_zoom:"\uD55C\uACC4\uB97C \uD3EC\uD568\uD55C \uC90C \uC9C0\uB3C4",location_save:"\uBCC0\uACBD\uC0AC\uD56D \uD06C\uB77C\uC6B0\uB4DC \uC800\uC7A5",location_remove:"\uC120\uD0DD\uC5D0\uC11C \uD2B9\uC9D5 \uC81C\uAC70",location_delete:"\uC704\uCE58 \uC0AD\uC81C"},fr:{location_zoom:"Zoom sur le lieu",location_save:"Enregistrer les modifications",location_remove:"Le d\xE9s\xE9lectionner",location_delete:"Supprimer le lieu"},ja:{location_zoom:"\u30D5\u30A3\u30FC\u30C1\u30E3\u7BC4\u56F2\u306B\u306F\u30DE\u30C3\u30D7\u3092\u30BA\u30FC\u30E0",location_save:"\u30AF\u30E9\u30A6\u30C9\u306B\u5909\u66F4\u3092\u4FDD\u5B58",location_remove:"\u9078\u629E\u304B\u3089\u30D5\u30A3\u30FC\u30C1\u30E3\u30FC\uFF08\u6A5F\u80FD\uFF09\u3092\u524A\u9664",location_delete:"\u30ED\u30B1\u30FC\u30B7\u30E7\u30F3\u3092\u524A\u9664"}});var N=e=>{e.removeCallbacks?.push(function(){e.view.remove()}),e.updateCallbacks?.push(function(){e.view.dispatchEvent(new Event("updateInfo"))});let t=[mapp.utils.html`<h2>${e.record.symbol}`,mapp.utils.html`<div class="mask-icon expander">`];e.infoj.some(i=>(i.type==="pin"||i.type==="geometry")&&i.value)&&t.push(mapp.utils.html`
    <button
      title = ${mapp.dictionary.location_zoom}
      class = "mask-icon search"
      onclick = ${i=>{e.flyTo()}}>`),e.layer.toggleLocationViewEdits&&(e.infoj.forEach(i=>{!i.edit||(i._edit=i.edit,delete i.edit)}),t.push(mapp.utils.html`
      <button
        title = "Enable edits"
        class = "mask-icon build"
        onclick = ${i=>{e.infoj.forEach(a=>{!a._edit||(a.edit=a._edit,delete a._edit)}),l.remove(),i.target.style.display="none",l=mapp.ui.locations.infoj(e),e.view.appendChild(l)}}>`)),t.push(mapp.utils.html`
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
      onclick = ${i=>{e.remove()}}>`),e.view=mapp.ui.elements.drawer({class:"location-view expanded",header:t});let l=e.view.appendChild(mapp.ui.locations.infoj(e));e.view.querySelector(".header").style.borderBottom=`3px solid ${e.record.colour}`,e.view.addEventListener("valChange",i=>{i.detail.value!=i.detail.newValue?i.detail.node.classList.add("val-changed"):(delete i.detail.newValue,i.detail.node.classList.remove("val-changed")),e.view.querySelector(".cloud-upload").style.display=e.infoj.some(a=>typeof a.newValue<"u")&&"inline-block"||"none"}),e.view.addEventListener("updateInfo",()=>{l.remove(),e.view.querySelector(".cloud-upload").style.display="none",e.view.classList.remove("disabled"),l=mapp.ui.locations.infoj(e),e.view.appendChild(l)})};mapp.utils.merge(mapp.dictionaries,{en:{location_clear_all:"Clear locations"},de:{location_clear_all:"Entferne Auswahl"},cn:{location_clear_all:"\uBAA8\uB4E0 \uC704\uCE58 \uC81C\uAC70"},pl:{location_clear_all:"Wyczy\u015B\u0107 selekcje"},ko:{location_clear_all:"\u6E05\u9664\u6240\u6709\u5730\u70B9"},fr:{location_clear_all:"Des\xE9lectionner tous les lieux."},ja:{location_clear_all:"\u5168\u30ED\u30B1\u30FC\u30B7\u30E7\u30F3\u3092\u30AF\u30EA\u30A2"}});var H=[{symbol:"A",colour:"#2E6F9E"},{symbol:"B",colour:"#EC602D"},{symbol:"C",colour:"#5B8C5A"},{symbol:"D",colour:"#B84444"},{symbol:"E",colour:"#514E7E"},{symbol:"F",colour:"#E7C547"},{symbol:"G",colour:"#368F8B"},{symbol:"H",colour:"#841C47"},{symbol:"I",colour:"#61A2D1"},{symbol:"J",colour:"#37327F"}],U=e=>{if(!e.mapview||!e.target)return;let t={node:e.target,mapview:e.mapview};return t.node.appendChild(mapp.utils.html.node`
    <button 
      class="tab-display bold primary-colour text-shadow"
      onclick=${l=>{Object.values(t.mapview.locations).forEach(i=>i.remove())}}>
      ${mapp.dictionary.location_clear_all}`),e.mapview.locations=new Proxy(e.mapview.locations,{set:function(l,i,a){let o=H.find(n=>!n.hook);return o.hook=a.hook,a.record=o,a.style={strokeColor:o.colour,fillColor:o.colour,fillOpacity:.2},a.Style=mapp.utils.style([{strokeColor:"#000",strokeOpacity:.1,strokeWidth:8},{strokeColor:"#000",strokeOpacity:.1,strokeWidth:6},{strokeColor:"#000",strokeOpacity:.1,strokeWidth:4},{strokeColor:a.style.strokeColor||"#000",strokeWidth:2,fillColor:a.style.fillColor||a.style.strokeColor||"#fff",fillOpacity:a.style.fillOpacity||.2}]),a.pinStyle=mapp.utils.style({icon:{type:"markerLetter",letter:o.symbol,color:a.style.strokeColor,scale:3,anchor:[.5,1]}}),Reflect.set(...arguments),mapp.ui.locations.view(a),Object.values(t.node.children).forEach(n=>n.classList.remove("expanded")),t.node.insertBefore(a.view,t.node.firstChild.nextSibling),a.view.dispatchEvent(new Event("addLocationView")),t.node.closest(".tab").style.display="block",t.node.closest(".tab").click(),!0},deleteProperty:function(l,i){Reflect.deleteProperty(...arguments);let a=H.find(o=>o.hook===i);return delete a.hook,setTimeout(()=>{if(t.node.children.length>1)return;let o=t.node.closest(".tab");o.style.display="none",o.previousElementSibling.click()},300),!0}}),t};var J=(e,t)=>{if(!e.infoj)return;let l=mapp.utils.html.node`<div class="location-view-grid">`,i={};for(let a of t||e.infoj){if(e.view&&e.view.classList.contains("disabled"))break;if(a.listview=l,a.type=a.type||"text",a.skipEntry||a.skipFalsyValue&&!a.value&&!a.edit||a.skipUndefinedValue&&typeof a.value>"u"&&!a.edit||a.skipNullValue&&a.value===null&&!a.edit)continue;a.nullValue&&a.value===null&&!a.defaults&&!a.edit&&(a.value=a.nullValue),a.group&&(i[a.group]||(i[a.group]=a.listview.appendChild(mapp.ui.elements.drawer({class:`lv-1 group ${a.expanded&&"expanded"||""}`,header:mapp.utils.html`
              <h3>${a.group}</h3>
              <div class="mask-icon expander"></div>`}))),a.listview=i[a.group]),a.node=a.listview.appendChild(mapp.utils.html.node`
      <div
        data-type=${a.type}
        class=${`contents ${a.type} ${a.class||""} ${a.inline&&"inline"||""}`}>`),a.title&&a.node.append(mapp.utils.html.node`
        <div
          class="label"
          style="${`${a.css_title||""}`}"
          title="${a.tooltip||null}">${a.title}`),(a.value===null||typeof a.value>"u")&&(a.value=a.default||a.value);let o=mapp.ui.locations.entries[a.type]&&mapp.ui.locations.entries[a.type](a);if(o==="break")break;o&&a.node.append(o)}return l};var W=e=>{let t=mapp.ui.elements.chkbox({label:e.label||e.title,checked:e.value,disabled:!e.edit,onchange:i=>{e.newValue=i,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}});return mapp.utils.html.node`${t}`};var Z=e=>{e.layer=e.location.layer,e.host=e.host||e.location.layer.mapview.host,e.dependents&&e.dependents.some(o=>e.location.infoj.some(n=>!n.value&&n.field===o))&&delete e.display;let t;if(typeof e.target=="string"&&document.getElementById(e.target)){e.target=document.getElementById(e.target),mapp.ui.Dataview(e).then(()=>e.update());return}let l=typeof e.target=="string"&&document.querySelector(`[data-id=${e.target}]`);l&&(delete e.target,mapp.ui.Dataview(e).then(()=>{e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,l.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.display&&e.show()})),typeof e.target=="string"&&(t=mapp.utils.html.node`
      <div
        class="${`location ${e.class}`}">`,e.target=t,e.display&&mapp.ui.Dataview(e).then(()=>e.update()));let i=e.label&&mapp.ui.elements.chkbox({label:e.label,checked:!!e.display,onchange:o=>{if(e.display=o,t){t.style.display=e.display?"block":"none",typeof e.update=="function"&&e.update()||mapp.ui.Dataview(e).then(()=>e.update());return}e.display?e.show():e.remove()}});return mapp.utils.html.node`${i}${t||""}`};var x=e=>{let t;return e.edit?t=mapp.utils.html.node`
      <input
        type=${e.type==="datetime"&&"datetime-local"||"date"}
        value=${e.value&&(e.type==="datetime"&&new Date(e.value*1e3).toISOString().split("Z")[0]||new Date(e.value*1e3).toISOString().split("T")[0])}
        onchange=${i=>{e.newValue=new Date(i.target.value).getTime()/1e3,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`:t=e.value&&new Date(e.value*1e3).toLocaleString(e.locale,e.options),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${t}`};var X=e=>{let t=e.value;return t||(t=e.defaults==="user"&&mapp.user?.email||e.nullValue,t&&mapp.utils.xhr({method:"POST",url:`${e.location.layer.mapview.host}/api/location/update?`+mapp.utils.paramString({locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.layer.table,id:e.location.id}),body:JSON.stringify({[e.field]:t})})),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${e.prefix}${t}${e.suffix}`};var K=e=>{let t=e.value.map(n=>mapp.utils.html`
		<div class="link-with-img">
      ${e.edit&&mapp.utils.html.node`
        <button
          class="mask-icon trash no"
          data-name=${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}
          data-href=${n}
          onclick=${s=>o(s)}>
        </button>`}		
        <a target="_blank"
          href=${n}>${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}`),l=mapp.utils.html.node`
    <div class="mask-icon cloud-upload">
      <input
        style="opacity: 0; width: 3em; height: 3em;"
        type="file"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
        onchange=${a}>`;if(e.edit&&t.push(l),!t.length)return;let i=mapp.utils.html.node`<div>${t}`;return i;async function a(n){e.location.view?.classList.add("disabled");let s=new FileReader,p=n.target.files[0];!p||(s.onload=async r=>{let d=await mapp.utils.xhr({method:"POST",requestHeader:{"Content-Type":"application/octet-stream"},url:`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({public_id:p.name,resource_type:"raw"})}`,body:r.target.result}),m=d.secure_url,c=d.public_id.replace(/.*\//,"").replace(/\.([\w-]{3})/,"");await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"append",field:e.field,value:m}));let h=mapp.utils.html.node`
        <div class="link-with-img">
          <button
            class="mask-icon trash no"
            data-name=${c}
            data-href=${m}
            onclick=${g=>o(g)}>
          </button>
          <a target="_blank"
            href=${m}>${c}`;i.insertBefore(h,l),e.location.view?.classList.remove("disabled")},s.readAsDataURL(p),n.target.value="")}async function o(n){if(!confirm("Remove document link?"))return;let s=n.target;mapp.utils.xhr(`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({destroy:!0,public_id:s.dataset.name})}`),await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"remove",field:e.field,value:s.dataset.href})),s.parentNode.remove()}};var Q=e=>{if(e.value=typeof e.value=="string"&&JSON.parse(e.value)||e.value,e.display=e.display&&e.value,!e.value&&!e.edit)return;e.Style=e.Style||typeof e.style=="object"&&mapp.utils.style(Object.assign({},e.location?.style||{},e.style))||e.location.Style,e.show=Re;let t=mapp.ui.elements.chkbox({label:e.label||"Geometry",data_id:`${e.field}-chkbox`,checked:!!e.display,disabled:!e.value,onchange:o=>{o?e.show():(e.display=!1,e.L&&e.location.layer.mapview.Map.removeLayer(e.L))}});e.display&&e.show();let l={entry:e,layer:e.location.layer,srid:e.srid||e.location.srid,edit:e.edit,mapview:e.location.layer.mapview},i=typeof e.edit=="object"&&Object.keys(e.edit).map(o=>mapp.ui.elements.drawing[o]&&mapp.ui.elements.drawing[o](l,Ge)).filter(o=>!!o);e.edit?.geometry&&i.push(mapp.utils.html`
    <button
      class="flat wide primary-colour"
      onclick=${o=>Ve(o,l)}>
      Modify Geometry`),e.value&&e.edit?.delete&&i.push(mapp.utils.html`
    <button
      class="flat wide no-colour"
      onclick=${()=>{if(e.display){o();return}e.show(),setTimeout(o,500);function o(){!confirm("Delete Geometry?")||(e.newValue=null,e.L&&(e.location.layer.mapview.Map.removeLayer(e.L),delete e.L),l.entry.location.update())}}}>Delete Geometry`);let a=e.style&&mapp.utils.html`
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style))}`;return i?mapp.ui.elements.drawer({class:"lv-2 flat",data_id:"draw-drawer",header:mapp.utils.html`
        ${t}
        <div class="mask-icon expander"></div>
        ${a}`,content:mapp.utils.html`
        ${i}`}):mapp.utils.html.node`<div class="flex-spacer">${t}${a}`};function Re(){this.display=!0;let e=this.location.view?.querySelector(`[data-id=${this.field}-chkbox] input`);e&&(e.checked=!0),this.L&&(this.location.layer.mapview.Map.removeLayer(this.L),delete this.L),this.L=this.location.layer.mapview.geoJSON({zIndex:this.zIndex,geometry:this.value,Style:this.Style,dataProjection:this.srid||this.location?.layer?.srid}),this.location.Layers.push(this.L)}function Ge(e,t){let l=e.target;if(l.classList.contains("active")){l.classList.remove("active"),t.mapview.interactions.highlight();return}l.classList.add("active"),!t.entry.display&&t.entry.show(),t.entry.L&&t.entry.location.layer.mapview.Map.removeLayer(t.entry.L),t.mapview.interactions.draw({type:t.type,geometryFunction:t.geometryFunction,tooltip:t.tooltip,srid:t.srid,callback:i=>{if(l.classList.remove("active"),t.mapview.interactions.highlight(),i){t.entry.newValue=i.geometry,t.entry.location.update();return}t.entry.L&&t.entry.location.layer.mapview.Map.addLayer(t.entry.L)}})}function Ve(e,t){let l=e.target;if(l.classList.contains("active")){l.classList.remove("active"),t.mapview.interactions.highlight();return}l.classList.add("active"),!t.entry.display&&t.entry.show(),t.entry.location.layer.mapview.Map.removeLayer(t.entry.L);let i=t.entry.L.getSource().getFeatures()[0];t.mapview.interactions.modify({Feature:i.clone(),callback:a=>{if(l.classList.remove("active"),t.mapview.interactions.highlight(),a){t.entry.newValue=a.geometry,t.entry.location.update();return}t.entry.location.layer.mapview.Map.addLayer(t.entry.L)}})}var Y=e=>{let t=e.value.map(n=>mapp.utils.html`
    <div>
      <img src=${n}
        onclick=${mapp.ui.utils.imagePreview}>
        ${e.edit&&mapp.utils.html.node`
          <button
            class="mask-icon trash no"
            data-name=${n.replace(/.*\//,"").replace(/\.([\w-]{3})/,"")}
            data-src=${n}
            onclick=${s=>o(s)}>`}`),l=mapp.utils.html.node`
    <div class="mask-icon add-photo pos-center">
      <input
        type="file"
        accept="image/*;capture=camera"
        onchange=${a}>`;if(e.edit&&t.push(l),!t.length)return;let i=mapp.utils.html.node`
    <div
      class="images-grid">${t}`;return i;async function a(n){e.location.view?.classList.add("disabled");let s=new FileReader,p=n.target.files[0];!p||(s.onload=r=>{let d=new Image;d.onload=async()=>{let m=mapp.utils.html.node`<canvas>`,c=1024,h=d.width,g=d.height;h>g&&h>c?(g*=c/h,h=c):g>c&&(h*=c/g,g=c),m.width=h,m.height=g,m.getContext("2d").drawImage(d,0,0,h,g);let Te=m.toDataURL("image/jpeg",.5),v=await mapp.utils.xhr({method:"POST",requestHeader:{"Content-Type":"application/octet-stream"},url:`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({public_id:p.name.replace(/.*\//,"").replace(/\.([\w-]{3})/,""),resource_type:"image"})}`,body:mapp.utils.dataURLtoBlob(Te)});await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"append",field:e.field,value:v.secure_url}));let Me=mapp.utils.html.node`
          <div>
            <img
              src=${v.secure_url}
              onclick=${mapp.ui.utils.imagePreview}>
              <button
                class="mask-icon trash no"
                data-name=${v.public_id}
                data-src=${v.secure_url}
                onclick=${Fe=>o(Fe)}>`;i.insertBefore(Me,l),e.location.view?.classList.remove("disabled")},d.src=r.target.result},s.readAsDataURL(p),n.target.value="")}async function o(n){if(!confirm("Remove image?"))return;let s=n.target;mapp.utils.xhr(`${e.location.layer.mapview.host}/api/provider/cloudinary?${mapp.utils.paramString({destroy:!0,public_id:s.dataset.name})}`),await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({template:"set_field_array",locale:e.location.layer.mapview.locale.key,layer:e.location.layer.key,table:e.location.table,qID:e.location.layer.qID,id:e.location.id,action:"remove",field:e.field,value:s.dataset.src})),s.parentNode.remove()}};var Be={isoline_here:Ue,isoline_mapbox:He},L=e=>{e.value=typeof e.value=="string"&&JSON.parse(e.value)||e.value,e.Style=e.Style||typeof e.style=="object"&&mapp.utils.style(e.style)||e.location.Style;let t=mapp.ui.elements.chkbox({label:e.label||"Isoline",checked:!!e.display,onchange:i=>{i?e.show():(e.display=!1,e.L&&e.location.layer.mapview.Map.removeLayer(e.L))}});if(e.show=Ne,e.display&&e.show())return"break";let l=e.style&&mapp.utils.html`
    ${mapp.ui.elements.legendIcon(Object.assign({width:24,height:24},e.style))}`;return mapp.utils.html.node`<div class="flex-spacer">${t}${l}`};function Ne(){if(this.display=!0,this.L){this.location.layer.mapview.Map.removeLayer(this.L),this.location.layer.mapview.Map.addLayer(this.L);return}if(this.value){this.L=this.location.layer.mapview.geoJSON({zIndex:this.zIndex,geometry:this.value,Style:this.Style,dataProjection:"4326"}),this.location.Layers.push(this.L);return}let e=this.location.infoj.find(t=>t.type==="pin");return this.params.latlng=ol.proj.transform(e.value,`EPSG:${e.srid||"3857"}`,"EPSG:4326"),this.location.view?.classList.add("disabled"),Be[this.type](this),!0}function He(e){let t=Object.assign({profile:"driving",minutes:10},e.params);mapp.utils.xhr(`https://api.mapbox.com/isochrone/v1/mapbox/${t.profile}/${t.latlng[0]},${t.latlng[1]}?${mapp.utils.paramString({contours_minutes:t.minutes,polygons:!0,access_token:t.access_token})}`).then(async l=>{!e.location.remove||!l.features||(e.newValue=l.features[0].geometry,e.location.update())})}function Ue(e){let t=Object.assign({"range[type]":"time",minutes:10,reverseDirection:!1,transportMode:"car",optimizeFor:"balanced"},e.params);t["range[values]"]=t.minutes*60,delete t.minutes,t.origin=`${t.latlng[1]},${t.latlng[0]}`,delete t.latlng,mapp.utils.xhr(`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://isoline.router.hereapi.com/v8/isolines?${mapp.utils.paramString(t)}&{HERE}`)}`).then(l=>{if(!e.location.remove)return;if(!l.isolines)return console.log(l),alert("Failed to process request");let i=mapp.utils.here.decodeIsoline(l.isolines[0].polygons[0].outer);i.polyline.forEach(a=>a.reverse()),i.polyline.push(i.polyline[0]),e.newValue={type:"Polygon",coordinates:[i.polyline]},e.location.update()})}var ee=e=>{let t=mapp.utils.html`
    <pre><code>${JSON.stringify(e.value,null,2)}`;return e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      onfocus=${i=>{i.target.style.height=i.target.scrollHeight+"px"}}
      onfocusout=${i=>{i.target.style.height="auto"}}
      oninput=${i=>{e.json=(()=>{try{return JSON.parse(i.target.value)}catch{return!1}})(),i.target.style.border=e.json?"none":"1px solid red"}}
      onkeyup=${i=>{e.newValue=typeof e.json!="object"?e.value:e.json,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}
      onkeydown=${i=>setTimeout(()=>{i.target.style.height="auto",i.target.style.height=i.target.scrollHeight+"px"},100)}>${JSON.stringify(e.value,null,2)}`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">${t}`};var E=e=>{let t=!isNaN(e.value)&&e.type==="integer"?parseInt(e.value).toLocaleString("en-GB",{maximumFractionDigits:0}):parseFloat(e.value).toLocaleString("en-GB",{maximumFractionDigits:2});return e.edit&&(e.edit.range?t=mapp.ui.elements.slider({min:e.edit.range.min,max:e.edit.range.max,val:e.value,callback:i=>{t.value=parseFloat(i.target.value),e.newValue=t.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}):t=mapp.utils.html.node`
      <input
        type="number"
        value="${e.value||""}"
        onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${e.prefix}${t}${e.suffix}`};var te=e=>{e.srid=e.srid||e.location.layer.srid,e.location.layer.mapview.Map.removeLayer(e.L),e.L=e.location.layer.mapview.geoJSON({zIndex:1/0,geometry:{type:"Point",coordinates:e.value},dataProjection:e.srid,Style:e.Style||e.location.pinStyle}),e.location.Layers.push(e.L);let t=mapp.ui.elements.chkbox({label:e.label||"Pin",checked:!0,onchange:i=>{e.display=i,i?e.location.layer.mapview.Map.addLayer(e.L):e.location.layer.mapview.Map.removeLayer(e.L)}});return mapp.utils.html.node`${t}`};var ae=e=>{if(!e.report.template)return;let t=`${e.location.layer.mapview.host}/view/${e.report.template}?${mapp.utils.paramString(Object.assign({id:e.location.id,layer:e.location.layer.key},e.params||{}))}`;return mapp.utils.html.node`
    <div class="link-with-img">
      <div
        class="mask-icon wysiwyg">
      </div>	
      <a
        target="_blank"
        href=${t}>${e.report.label||"Report"}`};var ie=e=>{let t=e.location.infoj.find(a=>a.type==="pin");if(!t||!t.value)return;let l=ol.proj.toLonLat(t.value,`EPSG:${t.srid||e.location.layer.mapview.srid}`,"EPSG:4326"),i=mapp.utils.html.node`
    <a
      target="_blank"
      href=${`https://www.google.com/maps?cbll=${l[1]},${l[0]}&layer=c`}>`;return mapp.utils.xhr(`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${l[1]},${l[0]}&source=outdoor&{GOOGLE}`)}`).then(a=>{if(a.status!=="OK")return;let o=`${e.location.layer.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/streetview?location=${l[1]},${l[0]}&source=outdoor&size=300x230&{GOOGLE}`)}`;i.append(mapp.utils.html.node`<img src=${o}>`)}),i};var le=e=>{let t=document.querySelector(`[data-id=${e.target}]`);e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,t.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.display&&e.show();let l=mapp.ui.elements.chkbox({label:e.label,checked:!!e.display,onchange:i=>{e.display=i,e.display?e.show():e.remove()}});return mapp.utils.html.node`${l}`};var oe=e=>{let t=e.value;return e.edit&&(e.edit.options?t=Je(e):t=mapp.utils.html`
      <input
        type="text"
        value="${e.value||""}"
        onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`),mapp.utils.html.node`
    <div
      class="val"
      style="${`${e.css_val||""}`}">
      ${e.prefix}${t}${e.suffix}`};function Je(e){let t=e.edit.options.find(a=>typeof a=="object"&&Object.values(a)[0]===e.value||a===e.value)||e.value;e.value=t&&typeof t=="object"&&Object.keys(t)[0]||t||e.value||" ";let l=e.edit.options.map(a=>({title:typeof a=="string"&&a||Object.keys(a)[0],option:typeof a=="string"&&a||Object.values(a)[0]}));return mapp.ui.elements.dropdown({span:e.value,entries:l,callback:(a,o)=>{e.newValue=o.option,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}})}var S=e=>{e.query&&mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query/${e.query}`).then(i=>{e.node.querySelector(".val").innerHTML=i[e.params.field]});let t=e.type!=="html"?e.value:"";e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      onfocus=${i=>{i.target.style.height=i.target.scrollHeight+"px"}}
      onfocusout=${i=>{i.target.style.height="auto"}}
      onkeyup=${i=>{e.newValue=i.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}
      onkeydown=${i=>setTimeout(()=>{i.target.style.height="auto",i.target.style.height=i.target.scrollHeight+"px"},100)}>
      ${e.value||""}`);let l=mapp.utils.html.node`
  <div
    class="val"
    style="${`${e.css_val||""}`}">${t}`;return!e.edit&&e.type==="html"&&(l.innerHTML=e.value||""),l};var ne={key:We,boolean:W,dataview:Z,date:x,datetime:x,defaults:X,documents:K,geometry:Q,html:S,images:Y,integer:E,isoline_here:L,isoline_mapbox:L,json:ee,numeric:E,pin:te,report:ae,streetview:ie,tab:le,text:oe,textarea:S};function We(e){return mapp.utils.html.node`
  <div class="layer-key">
    <span>
      ${e.location.layer.name}`}var re={view:N,listview:U,infoj:J,entries:ne};var se=async e=>{if(e.target=typeof e.target=="string"&&document.getElementById(e.target)||e.target,e.target=e.target instanceof HTMLElement&&e.target||mapp.utils.html.node`
      <div
        class="dataview-target"
        style="position: absolute; width: 100%; height: 100%">`,e.update=async()=>{if(!e.query)return;let t=e.viewport&&e.layer.mapview.getBounds();e.viewport&&(e.queryparams=Object.assign(e.queryparams||{},{layer:!0}));let l=e.queryparams?.center&&ol.proj.transform(e.layer.mapview.Map.getView().getCenter(),`EPSG:${_xyz.mapview.srid}`,"EPSG:4326"),i=mapp.utils.paramString(Object.assign({},e.queryparams||{},{template:encodeURIComponent(e.query),filter:e.queryparams?.filter&&e.layer?.filter?.current,layer:e.queryparams?.layer&&e.layer.key,locale:e.queryparams?.layer&&e.layer.mapview.locale.key,id:e.queryparams?.id&&e.location&&e.location.id,lat:l&&l[1],lng:l&&l[0],z:e.queryparams?.z&&e.layer.mapview.Map.getView().getZoom(),viewport:t&&[t.west,t.south,t.east,t.north,e.layer.mapview.srid]})),a=await mapp.utils.xhr(`${e.host||e.location.layer.mapview.host}/api/query?`+i);if(!(a instanceof Error)){if(typeof e.responseFunction=="function")return e.responseFunction(a);typeof e.setData=="function"&&e.setData(a)}},e.toolbar){e.target=mapp.utils.html.node`
      <div class="dataview-target">`;let t=Object.keys(e.toolbar).map(l=>mapp.ui.elements.toolbar_el[l](e));e.panel=mapp.utils.html.node`
      <div class="grid">
        <div class="btn-row">${t}</div>
        ${e.target}`}return e.chart&&await Ze(e),typeof e.columns<"u"&&(console.warn("Table dataviews should be configured inside a tables object"),e.table={columns:e.columns}),e.table&&await Xe(e),e.mapChange&&e.layer&&e.layer.mapview.Map.getTargetElement().addEventListener("changeEnd",()=>{e.layer&&!e.layer.display||e.tab&&!e.tab.classList.contains("active")||typeof e.mapChange=="function"&&e.mapChange()||e.update()}),e};async function Ze(e){let t=e.target.appendChild(mapp.utils.html.node`<canvas>`);e.ChartJS=await mapp.ui.utils.Chart(t,mapp.utils.merge({type:"bar",options:{plugins:{legend:{display:!1},datalabels:{display:!1}}}},e.chart)),e.setData=l=>{e.noDataMask&&!l?(e.target.style.display="none",e.mask=!e.mask&&e.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)):(e.mask&&e.mask.remove(),delete e.mask,e.target.style.display="block"),l||(l={datasets:[{data:[]}]}),l.datasets||(l={datasets:[{data:l}]}),e.data=l,e.chart.datasets?.length&&l.datasets.forEach((i,a)=>Object.assign(i,e.chart.datasets[a])),l.labels=l.labels||e.chart.labels,e.ChartJS.data=l,e.ChartJS.update()}}async function Xe(e){e.Tabulator=await mapp.ui.utils.Tabulator(e.target,e.table),e.table.selectable&&e.Tabulator.on("rowClick",(t,l)=>{if(typeof e.rowSelect=="function"){e.rowSelect(t,l);return}let i=l.getData();!e.layer||!i[e.layer.qID]||(mapp.location.get({layer:e.layer,id:i[e.layer.qID]}),l.deselect())}),e.setData=t=>{!t&&e.data||(e.noDataMask&&!t?(e.target.style.display="none",e.mask=!e.mask&&e.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataviewMask">No Data`)):(e.mask&&e.mask.remove(),delete e.mask,e.target.style.display="block"),t=!t&&[]||t.length&&t||[t],e.Tabulator.setData(t),e.data=t,typeof e.setDataCallback=="function"&&e.setDataCallback(e))}}var de=e=>{!e.node||(e.tabs=e.node.appendChild(mapp.utils.html.node`<div class="tabs">`),e.panel=e.node.appendChild(mapp.utils.html.node`<div class="panel">`),e.id&&e.node.setAttribute("data-id",e.id),e.addTab=Ke,e.node.addEventListener("addTab",t=>e.addTab(t.detail)))};function Ke(e){let t=this;e.tab=mapp.utils.html.node`
    <div class="tab">
      <div
        class="header"
        style="${e.tab_style||""}"
        onclick=${l}>
        ${e.label||e.title||e.key||"Tab"}`,e.panel=e.panel||e.target||mapp.utils.html.node`
    <div
      class="${`panel ${e.class||""}`}">`,e.panel.addEventListener("activate",()=>{e.update&&e.update()}),e.show=l,e.remove=i,e.location?.removeCallbacks.push(()=>e.remove());function l(){mapp.utils.render(t.panel,e.panel),t.tabs.childNodes.forEach(a=>a.classList.remove("active")),!e.tab.parentElement&&t.tabs.appendChild(e.tab),e.tab.classList.add("active"),t.timer&&window.clearTimeout(t.timer),t.timer=window.setTimeout(()=>{if(e.panel instanceof HTMLElement){e.panel.dispatchEvent(new CustomEvent("activate"));return}e.target instanceof HTMLElement&&e.target.dispatchEvent(new CustomEvent("activate"))},500),t.showTab&&t.showTab()}function i(){if(!e.tab.parentElement)return;let a=e.tab.nextElementSibling||e.tab.previousElementSibling;if(e.tab.remove(),a)return a.querySelector(".header").click();t.removeLastTab&&t.removeLastTab()}}var ce=e=>mapp.utils.html.node`
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
    ${e.content}`;var pe=e=>mapp.utils.html`
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
    <span>${e.label}`;var me={modify:Qe,draw:Ye};mapp.utils.merge(mapp.dictionaries,{en:{remove_last_vertex:"Remove last vertex"},de:{remove_last_vertex:"Remove last vertex"},cn:{remove_last_vertex:"\u5220\u9664\u6700\u540E\u4E00\u4E2A\u9876\u70B9"},pl:{remove_last_vertex:"Usu\u0144 ostatni wierzcho\u0142ek"},ko:{remove_last_vertex:"\uB9C8\uC9C0\uB9C9 \uC815\uC810(\uAF2D\uC9C0\uC810) \uC81C\uAC70"},fr:{remove_last_vertex:"Effacer le dernier point"},ja:{remove_last_vertex:"\u6700\u5F8C\u306E\u30D0\u30FC\u30C6\u30C3\u30AF\u30B9\u3092\u524A\u9664"}});function Qe(e){e&&e.preventDefault();let t=[];t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({coords:this.interaction.vertices[this.interaction.vertices.length-1],content:mapp.utils.html.node`<ul>${t}`})}function Ye(e){if(this.interaction.vertices.length===0)return;e&&e.preventDefault();let t=this.interaction.Layer.getSource().getFeatures(),l=[];t.length&&l.push(mapp.utils.html`
  <li
    onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),!t.length&&l.push(mapp.utils.html`
    <li
      onclick=${i=>{this.interaction.interaction.removeLastPoint(),this.interaction.vertices.pop(),this.popup(null)}}>${mapp.dictionary.remove_last_vertex}`),l.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({coords:this.interaction.vertices[this.interaction.vertices.length-1],content:mapp.utils.html.node`<ul>${l}`,autoPan:!0})}var ue=e=>mapp.utils.html.node`
  <div 
    data-id=${e.data_id||"drawer"}
    class=${`drawer expandable ${e.class||""}`}>
    <div
      class="header"
      onclick=${t=>{if(!t.target.parentElement.classList.contains("empty")){if(t.target.parentElement.classList.contains("expanded"))return t.target.parentElement.classList.remove("expanded");e.accordion&&[...t.target.parentElement.parentElement.children].forEach(l=>{l.classList.remove("expanded")}),t.target.parentElement.classList.add("expanded")}}}>
      ${e.header}
    </div>
    ${e.content}`;var he={point:et,polygon:it,circle:lt,line:tt,freehand:at,isoline_here:nt,isoline_mapbox:rt,rectangle:ot};mapp.utils.merge(mapp.dictionaries,{en:{draw_point:"Point",draw_polygon:"Polygon",draw_rectangle:"Rectangle",draw_circle:"Circle",draw_line:"Line",draw_freehand:"Freehand"},de:{draw_point:"Punkt",draw_polygon:"Polygon",draw_rectangle:"Rechteck",draw_circle:"Kreis",draw_line:"Linie",draw_freehand:"Freihand"},cn:{draw_point:"\u70B9",draw_polygon:"\u591A\u8FB9\u5F62",draw_rectangle:"\u957F\u65B9\u5F62",draw_circle:"\u5708",draw_line:"\u7EBF",draw_freehand:"\u4EFB\u610F\u56FE\u5F62"},pl:{draw_point:"Punkt",draw_polygon:"Poligon",draw_rectangle:"Prostok\u0105t",draw_circle:"Okrag",draw_line:"Linia",draw_freehand:"Odr\u0119cznie"},ko:{draw_point:"\uC810",draw_polygon:"\uB2E4\uAC01\uD615",draw_rectangle:"\uC9C1\uC0AC\uAC01\uD615",draw_circle:"\uC6D0",draw_line:"\uC120",draw_freehand:"\uC190\uC73C\uB85C \uADF8\uB9BC(\uC790\uC720 \uC7AC\uB7C9)"},fr:{draw_point:"Point",draw_polygon:"Polygone",draw_rectangle:"Rectangle",draw_circle:"Cercle",draw_line:"Ligne",draw_freehand:"\xC0 main lev\xE9e"},ja:{draw_point:"\u30DD\u30A4\u30F3\u30C8",draw_polygon:"\u30DD\u30EA\u30B4\u30F3",draw_rectangle:"\u9577\u65B9\u5F62",draw_circle:"\u4E38",draw_line:"\u7DDA",draw_freehand:"\u30D5\u30EA\u30FC\u30CF\u30F3\u30C9"}});function et(e,t){let l=Object.assign({},e,{type:"Point"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_point}`}function tt(e,t){let l=Object.assign({},e,{type:"LineString"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_line}`}function at(e,t){let l=Object.assign({},e,{type:"LineString",freehand:!0});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_freehand}`}function it(e,t){let l=Object.assign({},e,{type:"Polygon"});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_polygon}`}function lt(e,t){let l=Object.assign({},e,{type:"Circle",geometryFunction:ol.interaction.Draw.createRegularPolygon(33),tooltip:e.edit.circle.tooltip});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_circle}`}function ot(e,t){let l=Object.assign({},e,{type:"Circle",geometryFunction:ol.interaction.Draw.createBox(),tooltip:e.edit.rectangle.tooltip});return mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${i=>t(i,l)}>
      ${mapp.dictionary.draw_rectangle}`}function nt(e,t){let l=Object.assign({},e,{type:"Point",geometryFunction:n=>mapp.utils.here.geometryFunction(n,e.layer,a)});typeof l.edit.isoline_here!="object"&&(l.edit.isoline_here={});let i={"range[type]":"time",range:10,rangeMin:5,rangeMax:60,reverseDirection:!1,transportMode:"car",optimizeFor:"balanced"},a=Object.assign(l.edit.isoline_here,i),o=mapp.ui.elements.isoline_params_here(a);return o.append(mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${n=>t(n,l)}>
      Create Isoline`),o}function rt(e,t){let l=Object.assign({},e,{type:"Point",geometryFunction:n=>mapp.utils.mapboxGeometryFunction(n,e.layer,a)});typeof l.edit.isoline_mapbox!="object"&&(l.edit.isoline_mapbox={});let i={profile:"driving",minutes:10,minutesMin:5,minutesMax:60},a=Object.assign(l.edit.isoline_mapbox,i),o=mapp.ui.elements.isoline_params_mapbox(a);return o.append(mapp.utils.html.node`
    <button
      class="flat wide primary-colour"
      onclick=${n=>t(n,l)}>
      Create Isoline`),o}var ge=e=>mapp.utils.html`
  <button 
    data-id=${e.data_id||"dropdown"}
    class="dropdown">
    <div class="head"
      onclick=${t=>{if(t.target.parentElement.classList.contains("active")){t.target.parentElement.classList.remove("active");return}document.querySelectorAll("button.dropdown").forEach(l=>l.classList.remove("active")),t.target.parentElement.classList.add("active")}}>
      <span data-id=header-span>${e.span||e.placeholder||e.entries[0].title}</span>
      <div class="icon"></div>
    </div>
    <ul>${e.entries.map(t=>mapp.utils.html.node`
      <li onclick=${l=>{let i=l.target.closest("button.dropdown");i.classList.toggle("active"),i.querySelector("[data-id=header-span]").textContent=t.title,e.callback&&e.callback(l,t)}}>${t.title}`)}`;var fe=e=>{let t=new Set,l=new Set;return mapp.utils.html`
    <button 
      data-id=${e.data_id||"dropdown"}
      class="dropdown">
      <div class="head"
        onclick=${i=>{if(i.target.parentElement.classList.contains("active")){i.target.parentElement.classList.remove("active");return}document.querySelectorAll("button.dropdown").forEach(a=>a.classList.remove("active")),i.target.parentElement.classList.add("active")}}>
        <span data-id=header-span>${e.span||e.placeholder||e.entries[0].title}</span>
        <div class="icon"></div>
      </div>
      <ul>${e.entries.map(i=>mapp.utils.html.node`
        <li onclick=${a=>{let o=a.target.closest("button.dropdown");o.classList.toggle("active"),a.target.classList.toggle("selected"),a.target.classList.contains("selected")?(t.add(i.title),l.add(i.option)):(t.delete(i.title),l.delete(i.option)),o.querySelector("[data-id=header-span]").textContent=Array.from(t).join(", "),e.callback&&e.callback(a,Array.from(l))}}>${i.title}`)}`};mapp.utils.merge(mapp.dictionaries,{en:{here_mode:"Mode",here_mode_driving:"driving",here_mode_walking:"walking",here_range_minutes:"Travel time in minutes",here_datetime_arrive:"Arrive at",here_datetime_depart:"Depart at",here_optimize_for:"Optimize for",here_optimize_for_balanced:"balanced",here_optimize_for_quality:"quality",here_optimize_for_performance:"performance"},de:{here_mode:"Modus",here_mode_driving:"Kraftfahrzeug",here_mode_walking:"zu Fu\xDF",here_range_minutes:"Fahrzeit in Minuten",here_datetime_arrive:"Ankunft",here_datetime_depart:"Abfahrt",here_optimize_for:"Optimisierung",here_optimize_for_balanced:"Ausgeglichen",here_optimize_for_quality:"Qualit\xE4t",here_optimize_for_performance:"Leistung"},cn:{here_mode_driving:"\u673A\u52A8\u8F66\u884C",here_mode_walking:"\u6B65\u884C",here_range_minutes:"\u4EE5\u5206\u949F\u8BA1\u4EA4\u901A\u65F6\u95F4 "},pl:{here_mode:"\u015Arodek transportu",here_mode_driving:"samochodem",here_mode_walking:"piechot\u0105",here_range_minutes:"Czas podr\xF3\u017Cy w minutach",here_datetime_arrive:"Rozpocznij",here_datetime_depart:"Osi\u0105gnij cel",here_optimize_for:"Optymalizacja",here_optimize_for_balanced:"zr\xF3wnowa\u017Cona",here_optimize_for_quality:"jako\u015B\u0107",here_optimize_for_performance:"wydajno\u015B\u0107"},ko:{here_mode_driving:"\uC6B4\uC804",here_mode_walking:"\uB3C4\uBCF4",here_range_minutes:"\uC5EC\uD589\uC2DC\uAC04(\uBD84) "},fr:{here_mode:"Type de transport",here_mode_driving:"en voiture",here_mode_walking:"\xE0 pied",here_range_minutes:"Temps du trajet en minutes",here_datetime_depart:"Partir \xE0",here_datetime_arrive:"Arriver \xE0",here_optimize_for:"Optimiser",here_optimize_for_balanced:"l'\xE9quilibre",here_optimize_for_quality:"la qualit\xE9",here_optimize_for_performance:"les performances"},ja:{here_mode_driving:"\u30C9\u30E9\u30A4\u30D3\u30F3\u30B0",here_mode_walking:"\u30A6\u30A9\u30FC\u30AD\u30F3\u30B0",here_range_minutes:"\u79FB\u52D5\u6642\u9593 (\u5206) "}});var ve=e=>{let t=mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.here_mode_driving],option:"car"},{title:[mapp.dictionary.here_mode_walking],option:"pedestrian"}],callback:(r,d)=>{e.transportMode=d.option}})}`,l=mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.here_optimize_for}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.here_optimize_for_balanced],option:"balanced"},{title:[mapp.dictionary.here_optimize_for_quality],option:"quality"},{title:[mapp.dictionary.here_optimize_for_performance],option:"performance"}],callback:(r,d)=>{e.optimizeFor=d.option}})}`,i=mapp.utils.html.node`
    <span>${mapp.dictionary.here_datetime_depart}`,a=mapp.utils.html.node`
    <input
      type="datetime-local"
      onchange=${r=>{e.dateISO=new Date(r.target.value).toISOString()}}>`,o=mapp.utils.html.node`
    <div>
      ${i}
      ${a}`,n=mapp.ui.elements.slider({label:mapp.dictionary.here_range_minutes,min:e.rangeMin,max:e.rangeMax,val:10,callback:r=>{e.range=parseInt(r.target.value)}}),s=mapp.ui.elements.chkbox({label:"Reverse Direction Isoline",checked:!!e.reverseDirection,onchange:r=>{i.textContent=r&&mapp.dictionary.here_datetime_arrive||mapp.dictionary.here_datetime_depart,e.reverseDirection=r}});return mapp.ui.elements.drawer({header:mapp.utils.html`
      <h4>Here Isoline</h4>
      <div class="mask-icon expander"></div>`,class:"flat",content:mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${t}
        ${l}
        ${o}
        ${s}
        ${n}`})};mapp.utils.merge(mapp.dictionaries,{en:{mapbox_mode:"Mode",mapbox_driving:"Driving",mapbox_walking:"Walking",mapbox_cycling:"Cycling",mapbox_travel_time:"Travel time in minutes"},de:{mapbox_mode:"Mode",mapbox_driving:"Kraftfahrzeug",mapbox_walking:"zu Fu\xDF",mapbox_cycling:"Fahrrad",mapbox_travel_time:"Fahrzeit in Minuten"},cn:{mapbox_mode:"\u6A21\u5F0F",mapbox_driving:"\u673A\u52A8\u8F66\u884C",mapbox_walking:"\u6B65\u884C",mapbox_cycling:"\u9A91\u884C",mapbox_travel_time:"\u4EE5\u5206\u949F\u8BA1\u4EA4\u901A\u65F6\u95F4"},pl:{mapbox_mode:"Typ",mapbox_driving:"Samochodem",mapbox_walking:"Piechot\u0105",mapbox_cycling:"Rowerem",mapbox_travel_time:"Czas podr\xF3\u017Cy w minutach"},ko:{mapbox_mode:"\uBAA8\uB4DC",mapbox_driving:"\uC6B4\uC804",mapbox_walking:"\uB3C4\uBCF4",mapbox_cycling:"\uC0AC\uC774\uD074",mapbox_travel_time:"\uC5EC\uD589\uC2DC\uAC04(\uBD84)"},fr:{mapbox_mode:"Mode",mapbox_driving:"En voiture",mapbox_walking:"\xC0 pied",mapbox_cycling:"\xC0 velo",mapbox_travel_time:"Temps du trajet en minutes "},ja:{mapbox_mode:"\u30E2\u30FC\u30C9",mapbox_driving:"\u30C9\u30E9\u30A4\u30D3\u30F3\u30B0",mapbox_walking:"\u30A6\u30A9\u30FC\u30AD\u30F3\u30B0",mapbox_cycling:"\u30B5\u30A4\u30AF\u30EA\u30F3\u30B0",mapbox_travel_time:"\u79FB\u52D5\u6642\u9593 (\u5206)"}});var we=e=>{let t=mapp.utils.html.node`
    <div 
      style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.mapbox_mode}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({entries:[{title:[mapp.dictionary.mapbox_driving],option:"driving"},{title:[mapp.dictionary.mapbox_walking],option:"walking"},{title:[mapp.dictionary.mapbox_cycling],option:"cycling"}],callback:(a,o)=>{e.profile=o.option}})}`,l=mapp.ui.elements.slider({label:mapp.dictionary.mapbox_travel_time,min:e.minutesMin,max:e.minutesMax,val:e.minutes,callback:a=>{e.minutes=parseInt(a.target.value)}});return mapp.ui.elements.drawer({header:mapp.utils.html`
      <h2>Mapbox Isoline</h2>
      <div class="mask-icon expander"></div>`,class:"lv-3 flat",content:mapp.utils.html`<div class="panel">
      <div style="display: grid; grid-row-gap: 5px;">
        ${t}
        ${l}`})};var be=new XMLSerializer,_e=e=>{if(e.svg||e.type||e.layers){let t=e.layers&&Array.isArray(e.layers)&&e.layers.map(i=>`url(${i.svg})`).reverse().join(",")||`url(${e.svg||e.url||mapp.utils.svgSymbols[e.type](e)})`,l=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width+"px"||"100%"};
      height: ${e.height+"px"||"100%"};
      background-image:${t};`;return mapp.utils.html`<div style=${l}>`}if(!e.fillColor&&e.strokeColor){let t=`
      M 0,${e.height/2}
      L ${e.width/2},0
      ${e.width/2},${e.height}
      ${e.width},${e.height/2}`,l=mapp.utils.svg.node`
      <svg height=${e.height} width=${e.width}>
        <path d=${t}
          fill="none"
          stroke=${e.strokeColor}
          stroke-width=${e.strokeWidth||1}/>`,i=`data:image/svg+xml,${encodeURIComponent(be.serializeToString(l))}`,a=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width}px;
      height: ${e.height}px;
      background-image: url(${i});`;return mapp.utils.html`<div style=${a}>`}if(e.fillColor){let t=mapp.utils.svg.node`
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
          stroke-width=${e.strokeWidth||1}>`,l=`data:image/svg+xml,${encodeURIComponent(be.serializeToString(t))}`,i=`
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${e.width}px;
      height: ${e.height}px;
      background-image: url(${l});`;return mapp.utils.html`<div style=${i}>`}};var ye=e=>{return mapp.utils.html.node`
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
        oninput=${t}>`;function t(l){l.target.closest(".input-range").style.setProperty(`--${l.target.id}`,l.target.value),l.target.closest(".input-range").querySelectorAll("input").forEach(i=>{i.id==l.target.id&&i!=l.target&&(i.value=l.target.value)}),e.callback&&e.callback(l)}};var $e=e=>{let t=mapp.utils.html.node`
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
            min=${e.min}
            style="--c: var(--a)"
            oninput=${l}></input>
        </label>
        <label>${e.label_b||"B"}
          <input id="b" type="number"
            value=${e.val_b}
            style="--c: var(--b)"
            oninput=${l}></input>
        </label>
      </div>
      <div class="track-bg"></div>
      <input id="a" type="range"
        min=${e.min}
        max=${e.max}
        step=${e.step||1}
        value=${e.val_a}
        oninput=${l}/>
      <input id="b" type="range"
        min=${e.min}
        max=${e.max}
        step=${e.step||1}
        value=${e.val_b}
        oninput=${l}/>`;function l(i){t.style.setProperty(`--${i.target.id}`,i.target.value),t.querySelectorAll("input").forEach(a=>{a.id==i.target.id&&a!=i.target&&(a.value=i.target.value)}),i.target.id==="a"&&typeof e.callback_a=="function"&&e.callback_a(i),i.target.id==="b"&&typeof e.callback_b=="function"&&e.callback_a(b)}return t};var ke={viewport:st,download_json:dt,download_csv:ct};function st(e){return mapp.utils.html`
    <button
      class=${`flat ${e.viewport&&"active"||""}`}
      onclick=${t=>{t.target.classList.toggle("active"),e.viewport=!e.viewport,e.update()}}>Viewport`}function dt(e){return mapp.utils.html`
    <button
      class="flat"
      onclick=${()=>{e.Tabulator.download("json",`${e.title||"table"}.json`)}}>Export as JSON`}function ct(e){return mapp.utils.html`
    <button
      class="flat"
      onclick=${()=>{e.Tabulator.download("csv",`${e.title||"table"}.csv`)}}>Download as CSV`}var xe={card:ce,chkbox:pe,contextMenu:me,drawer:ue,drawing:he,dropdown:ge,dropdown_multi:fe,isoline_params_here:ve,isoline_params_mapbox:we,legendIcon:_e,slider:ye,slider_ab:$e,toolbar_el:ke};var y=null;async function pt(){if(window.Chart){y=window.Chart;return}let e=await import("https://cdn.skypack.dev/chart.js@3.7.0");e.Chart.register(...e.registerables);let t=await import("https://cdn.skypack.dev/chartjs-plugin-datalabels@2.0.0");e.Chart.register(t.default);let l=await import("https://cdn.skypack.dev/chartjs-plugin-annotation@1.3.0");e.Chart.register(l.default),y=e.Chart}async function Le(e,t){return y||await pt(),new y(e,t)}var $=null;async function mt(){if(window.Tabulator){$=window.Tabulator;return}$=(await import("https://cdn.skypack.dev/pin/tabulator-tables@v5.0.10-xDu7yyLVhsxCKJbN5vfH/mode=imports/optimized/tabulator-tables.js")).TabulatorFull}async function Ee(){return $||await mt(),new $(...arguments)}var u={idle:600},Ce=e=>{Object.assign(u,e),u.idle!==0&&(window.onload=f,window.onmousemove=f,window.onmousedown=f,window.ontouchstart=f,window.onclick=f,window.onkeypress=f,f(),C())};function f(){u.locked||(u.timeout&&clearTimeout(u.timeout),u.timeout=setTimeout(Se,u.idle*1e3))}function Se(){u.locked=!0,u.renew&&clearTimeout(u.renew);let e=new XMLHttpRequest;e.open("GET",`${u.host}/api/user/cookie?destroy=true`),e.send();let t=mapp.utils.html.node`
    <form
      class="login"
      action="${`${u.host}/api/user/login`}"
      method="post"
      autocomplete="off">
       
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
        
    </form>`;t.onsubmit=l=>{l.preventDefault();let i=new XMLHttpRequest;i.open("POST",`${u.host}/api/user/login`),i.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),i.onload=a=>{a.target.status===401&&(t.querySelector(".msg").textContent=a.target.response),a.target.status===200&&(delete u.locked,u.mask.remove(),f(),C())},i.send(`login=true&email=${t.querySelector("#auth_user_email").value}&password=${t.querySelector("#auth_user_password").value}`)},u.mask=document.body.appendChild(mapp.utils.html.node`
    <div class="interfaceMask">${t}`)}function C(){u.renew=setTimeout(e,(u.idle-20)*1e3);function e(){let t=new XMLHttpRequest;t.open("GET",`${u.host}/api/user/cookie?renew=true`),t.onload=l=>{if(l.target.status===401)return Se();C()},t.send()}}var je=e=>{document.body.append(mapp.utils.html.node`
    <div class="interfaceMask">
      <div class="bg-image" style=${`background-image:url(${e.target.src})`}>
      <button class="btn-close mask-icon close"
        onclick=${t=>t.target.parentElement.parentElement.remove()}>`)};var ze=e=>{e.target.addEventListener("mousedown",l=>{l.preventDefault(),document.body.style.cursor="grabbing",window.addEventListener("mousemove",e.resizeEvent),window.addEventListener("mouseup",t)}),e.target.addEventListener("touchstart",l=>{l.preventDefault(),window.addEventListener("touchmove",e.resizeEvent),window.addEventListener("touchend",t)},{passive:!0});function t(){document.body.style.cursor="auto",window.removeEventListener("mousemove",e.resizeEvent),window.removeEventListener("touchmove",e.resizeEvent),window.removeEventListener("mouseup",t),window.removeEventListener("touchend",t)}};var Oe={Chart:Le,Tabulator:Ee,idleMask:Ce,imagePreview:je,resizeHandler:ze};var De=e=>{let t=Object.assign({search:l,input:e.target.querySelector("input"),result:e.target.querySelector("ul"),sources:{glx:o,mapbox:n,google:s,opencage:p},select:a,createFeature:i,icon:{type:"markerColor",colorMarker:"#003D57",colorDot:"#939faa",anchor:[.5,1],scale:3}},e);t.input.placeholder=t.placeholder||"",t.input.addEventListener("keyup",r=>{!new Set([37,38,39,40,13]).has(r.keyCode||r.charCode)&&r.target.value.length>0&&t.search(r.target.value)}),t.input.addEventListener("keydown",r=>{let d=r.keyCode||r.charCode;if(d===46||d===8){t.xhr&&t.xhr.abort(),t.clear(),t.layer&&t.mapview.Map.removeLayer(t.layer);return}if(d===13){let m=r.target.value.split(",").map(parseFloat);m[1]>-90&&m[1]<90&&m[0]>-180&&m[0]<180&&(t.xhr&&t.xhr.abort(),t.clear(),t.createFeature({type:"Point",coordinates:[m[1],m[0]]})),t.result.querySelector("li").click()}}),t.input.addEventListener("focusout",()=>{t.xhr&&t.xhr.abort(),setTimeout(t.clear,400)}),t.clear=()=>{t.target.classList.remove("active"),t.result.innerHTML=""};function l(r,d={}){t.clear&&t.clear(),t.xhr&&t.xhr.abort(),t.xhr=new XMLHttpRequest,t.xhr.open("GET",t.mapview.host+"/api/gazetteer?"+mapp.utils.paramString({locale:t.mapview.locale.key,q:encodeURIComponent(r),source:d.source})),t.xhr.setRequestHeader("Content-Type","application/json"),t.xhr.responseType="json",t.xhr.onload=m=>{if(m.target.status===200){if(t.callback)return t.callback(m.target.response);if(m.target.response.length===0)return t.result.appendChild(mapp.utils.html.node`
          <li>${mapp.dictionary.no_results}`),t.target.classList.add("active");Object.values(m.target.response).forEach(c=>{t.result.appendChild(mapp.utils.html.node`
          <li
            onclick=${h=>{if(!c.source||!c.id){if(t.callback)return t.callback(c);c.marker&&t.createFeature({type:"Point",coordinates:c.marker.split(",")});return}t.select({label:c.label,id:c.id,source:c.source,layer:c.layer,table:c.table,marker:c.marker,callback:d.callback})}}>
        ${t.label?mapp.utils.html.node`
          <span class="primary-background"
            style="padding: 0 2px 0 2px; cursor: help; border-radius: 2px; font-size:0.8em;">
              ${t.mapview.layers[c.layer]&&t.mapview.layers[c.layer].name||c.layer||c.source}</span>`:""}
              <span>${c.label}</span>`),t.target.classList.add("active")})}},t.xhr.send()}function i(r){r=typeof r=="string"&&JSON.parse(r)||r,t.layer&&t.mapview.Map.removeLayer(t.layer),t.layer=t.mapview.geoJSON({geometry:r,dataProjection:"4326",Style:mapp.utils.style({icon:t.icon})});let d=t.mapview.Map.getView();d.animate({zoom:t.zoom||d.getMaxZoom()},{center:ol.proj.fromLonLat(r.coordinates)})}function a(r){t.clear&&t.clear(),t.input&&(t.input.value=r.label),t.sources[r.source](r)}function o(r){if(typeof t.callback=="function")return t.callback(r);mapp.location.get({layer:t.mapview.layers[r.layer],table:r.table,id:r.id}).then(d=>d.flyTo())}function n(r){t.createFeature({type:"Point",coordinates:r.marker}),r.callback&&r.callback()}function s(r){mapp.utils.xhr(`${t.mapview.host}/api/proxy?url=${encodeURIComponent(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${r.id}&{GOOGLE}`)}`).then(d=>{let m={type:"Point",coordinates:[d.result.geometry.location.lng,d.result.geometry.location.lat]};if(t.createFeature(m),t.callback)return t.callback(m);r.callback&&r.callback(m)})}function p(r){t.createFeature({type:"Point",coordinates:r.marker}),r.callback&&r.callback()}};var qe={layers:B,locations:re,elements:xe,utils:Oe,gazetteer:De,Dataview:se,Tabview:de};typeof window.mapp=="object"&&(window.mapp.ui=qe);var _i=qe;export{_i as default};
//# sourceMappingURL=ui.js.map
