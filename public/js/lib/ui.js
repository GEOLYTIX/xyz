var Bt=Object.defineProperty;var Nt=(e,t)=>{for(var i in t)Bt(e,i,{get:t[i],enumerable:!0})};async function F(e){if(!(!e.dynamic&&e.create instanceof Function)){if(e.create instanceof Function){e.create();return}if(typeof e.target=="string"&&(e.target=document.getElementById(e.target)),!(e.target instanceof HTMLElement)){console.warn("Dataviews require a HTMLHtmlElement target");return}return Pt(e)instanceof Error?e.err:(typeof e.label=="string"&&(e.chkbox=mapp.ui.elements.chkbox({checked:!!e.display,data_id:e.key,disabled:e.disabled,label:e.label,onchange:t=>{e.display=t,e.display?e.show():e.hide()}})),e.update??=Ht,e.show??=Mt,e.hide??=Vt,mapp.ui.utils.dataview.Toolbar(e),mapp.ui.utils.dataview.mapChange(e),e)}}async function Mt(){this.display=!0,this.create===void 0?(this.create=()=>{mapp.ui.utils[this.dataview].create(this)},this.create(),typeof this.update=="function"&&this.update()):this.dynamic?(typeof this.create=="function"&&await this.create(),typeof this.update=="function"&&this.update()):this.reload&&typeof this.update=="function"&&this.update(),this.btnRow?.style.setProperty("display","flex"),this.target.style.display="block"}function Vt(){this.display=!1,this.target.style.display="none",this.btnRow?.style.setProperty("display","none")}function Pt(e){if(e.key??=e.query||e.title||e.label,e.dataview||(e.chart&&(e.dataview="chartjs"),typeof e.columns<"u"&&(console.warn("Table dataviews should be configured inside a tables object"),e.table={columns:e.columns},e.dataview="tabulator"),e.table&&(e.dataview="tabulator")),!Object.hasOwn(mapp.ui.utils,e.dataview))return e.err=new Error(`mapp.ui.utils.${e.dataview} doesnt exist`),console.error(e.err),e.update=()=>console.warn(`Unable to update ${e.key} dataview.`),e.err;if(typeof mapp.ui.utils[e.dataview].create!="function")return e.err=new Error(`mapp.ui.utils.${e.dataview}.create() method doesn't exist`),console.error(e.err),e.err}async function Ht(){if(this.create===void 0&&(this.create=function(){mapp.ui.utils[this.dataview].create(this)},this.create()),!this.query)return;let e=mapp.utils.queryParams(this),t=mapp.utils.paramString(e);this.host??=this.layer?.mapview?.host;let i=await mapp.utils.xhr(`${this.host||mapp.host}/api/query?${t}`);if(!(i instanceof Error)){if(typeof this.responseFunction=="function"){this.responseFunction(i);return}typeof this.setData=="function"&&this.setData(i)}}function I(e){typeof e=="string"&&(e={text:e}),e.title??=mapp.dictionary.information,e.icon??="info",e.data_id??="alert",e.class??="alert-confirm box-shadow no-select";let t=e.icon===""?"":mapp.utils.html`<span class="material-symbols-outlined notranslate">${e.icon}</span>`;return e.header=mapp.utils.html`${t}${e.title}`,e.innerContent??=mapp.utils.html`<p>${e.text}</p>`,e.content=mapp.utils.html`
    ${e.innerContent}
    <div class="buttons">
      <button 
        class="action outlined bold"
        onclick=${i=>{i.target.closest("dialog").close()}}>${mapp.dictionary.ok}`,mapp.ui.elements.dialog(e)}var Ze=e=>mapp.utils.html.node`
    <button 
        data-id=${e.data_id||"btnPanel"}
        class=${`btn-panel ${e.class||""}`}
        style=${e.style||""}
        onclick=${t=>{t.target.classList.toggle("active"),e.callback(t)}}>
        <div class="header">
            <h3>${e.label}</h3>
            <div class="notranslate material-symbols-outlined">${e.icon_name}</div>
        </div>
        ${e.panel&&mapp.utils.html`
            <div class="panel">${e.panel}`}`;function z(e){return e.data_id??="card",mapp.utils.html.node`
  <div 
    data-id=${e.data_id}
    class="drawer">
    <header class="header bold">
      <span>${e.header}</span>
      <button
        class="notranslate material-symbols-outlined color-font-mid"
        onclick=${i=>{i.target.closest(".drawer").remove(),typeof e.close=="function"&&e.close(i)}}>close</button>
    </header>
    ${e.content}`}function D(e){return e.data_id??="chkbox",e.name??="mapp-ui-chkbox-element",mapp.utils.html.node`<label 
    data-id=${e.data_id}
    class="checkbox">
    <input
      name=${e.name}
      type="checkbox"
      .disabled=${!!e.disabled}
      .checked=${!!e.checked}
      onchange=${i=>{e.onchange?.(i.target.checked,e.val)}}/>
    <span class="notranslate material-symbols-outlined"/>
    <span>${e.label}`}function A(e){typeof e=="string"&&(e={text:e}),e.title??=mapp.dictionary.confirm,e.data_id??="confirm",e.icon??="warning";let t=e.icon===""?"":mapp.utils.html`<span class="material-symbols-outlined notranslate">${e.icon}</span>`;e.header=mapp.utils.html`${t}${e.title}`,delete e.minimizeBtn,delete e.closeBtn;let i=mapp.utils.html.node`<button 
      class="action outlined bold">
      ${mapp.dictionary.ok}`,o=mapp.utils.html.node`<button
      class="action outlined bold">
      ${mapp.dictionary.cancel}`;return e.innerContent??=mapp.utils.html`<p>${e.text}</p>`,e.content=mapp.utils.html`
      ${e.innerContent}
      <div class="buttons">
        ${i}  
        ${o}`,e.class??="alert-confirm box-shadow no-select",mapp.ui.elements.dialog(e),new Promise(l=>{i.addEventListener("click",()=>{l(!0),e.close()}),o.addEventListener("click",()=>{l(!1),e.close()})})}var Ye={draw:Ut,modify:Rt};function Rt(e){e?.preventDefault?.();let t=[];t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({content:mapp.utils.html.node`<ul>${t}`,coords:this.interaction.vertices[this.interaction.vertices.length-1]})}function Ut(e){if(this.interaction.vertices.length===0)return;let t=[];t.push(mapp.utils.html`
  <li
    onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),setTimeout(()=>this.popup({autoPan:!0,content:mapp.utils.html.node`<ul>${t}`,coords:this.interaction.vertices[this.interaction.vertices.length-1]}),100)}function B(e){if(e.target)return e.target.classList.add("mapp-control"),e.tabs=mapp.utils.html.node`<nav class="tabs hover">`,e.target.append(e.tabs),e.panels=mapp.utils.html.node`<div class="panels">`,e.target.append(e.panels),e.add=Wt,e}function Wt(e){e.parent=this,e.minWidth??=0,e.icon??=e.key,e.classList??="notranslate material-symbols-outlined",e.onClick??=Jt,e.title??=mapp.dictionary[e.key]||e.key,e.panel??=mapp.utils.html.node`<div>`,this.tabs.children.length||(e.classList+=" active"),e.tab=mapp.utils.html.node`<div
    data-id=${e.key}
    title=${e.title}
    onclick=${t=>e.onClick(t,e)}
    class=${e.classList}>
    ${e.icon}`,this.tabs.append(e.tab),this.panels.append(e.panel)}function Jt(e,t){for(let i of Array.from(t.parent.tabs.children))i.classList.remove("active");t.tab.classList.add("active");for(let i of Array.from(t.parent.panels.children))i.classList.remove("active");t.panel.classList.add("active"),t.focus&&(t.focus=t.focus instanceof HTMLElement?t.focus:document.querySelector(`[name=${t.focus}]`),t.focus.focus())}function N(e){if(!e.new&&typeof e.show=="function"){e.show();return}if(e.show=Xe,!e.target)e.modal=!0;else if(e.target instanceof HTMLElement)e.show=Xe;else return;document.querySelector("dialog.modal")?.close(),e.minimizeBtn&&=mapp.utils.html`<button
    data-id="minimize"
    class="minimize-btn notranslate material-symbols-outlined"
    onclick=${a=>{a.target.closest("dialog").classList.toggle("minimized")}}>`;function t(a){e.onClose instanceof Function&&e.onClose(a),e.node.remove()}e.close=t,e.closeBtn&&=mapp.utils.html`<button
    data-id=close
    class="notranslate material-symbols-outlined close"
    onclick=${t}>`,e.header=e.header instanceof HTMLElement?e.header:mapp.utils.html`<h2>${e.header}`,e.headerHtml=mapp.utils.html`<header
    class=${e.headerDrag?"headerDrag":""}>
    ${e.header}${e.minimizeBtn}${e.closeBtn}`,e.data_id??="dialog",e.class??="box-shadow",e.class+=e.modal?" modal":" dialog",e.node=mapp.utils.html.node`<dialog 
    onclose=${t}
    style=${e.css_style}
    data-id=${e.data_id}
    class=${e.class}>
    ${e.headerHtml}
    <div class="content">${e.content}`,e.modal?(document.body.append(e.node),e.node.showModal()):(e.target.appendChild(e.node),e.node.show(),e.right&&(e.left=e.target.offsetWidth-e.node.offsetWidth-parseInt(e.right)),e.node.style.top=`${e.top||0}`,e.node.style.left=`${e.left||0}`,e.node.addEventListener("mousedown",i),e.node.addEventListener("touchstart",i),new ResizeObserver(o).observe(e.target));function i(a){if(e.headerDrag&&!a.target.closest("header")||a.which===3)return;e.node.style.cursor="grabbing";let s={mousedown:{end:"mouseup",move:"mousemove"},touchstart:{end:"touchend",move:"touchmove"}},{move:d,end:c}=s[a.type];e.target.addEventListener(d,n),window.addEventListener(c,l)}function o(){let{offsetWidth:a,offsetHeight:s}=e.target,{offsetWidth:d,offsetHeight:c}=e.node,u=a-d<0?0:a-d,b=s-c<0?0:s-c;e.node.style.left=`${Math.min(Math.max(e.node.offsetLeft,0),u)}px`,e.node.style.top=`${Math.min(Math.max(e.node.offsetTop,0),b)}px`}function l(){delete e.x,delete e.y,e.node.style.cursor=e.headerDrag?"auto":"grab",e.target.removeEventListener("mousemove",n),e.target.removeEventListener("touchmove",n),e.target.removeEventListener("mouseup",l),e.target.removeEventListener("touchend",l)}function n(a){e.x??=a.x;let s=a.x-e.x;e.x=a.x,e.y??=a.y;let d=a.y-e.y;if(e.y=a.y,e.contained&&!e.modal){Gt(e,s,d);return}if(e.containedCentre&&!e.modal){Zt(e,s,d);return}e.node.style.left=`${e.node.offsetLeft+s}px`,e.node.style.top=`${e.node.offsetTop+d}px`}return e.dialog=e,e}function Gt(e,t,i){e.node.offsetLeft+t<0?e.node.style.left=0:t<0?e.node.style.left=`${e.node.offsetLeft+t}px`:e.target.offsetWidth-e.node.offsetWidth-e.node.offsetLeft>0&&(e.node.style.left=`${e.node.offsetLeft+t}px`),e.node.offsetTop+i<0?e.node.style.top=0:i<0?e.node.style.top=`${e.node.offsetTop+i}px`:e.target.offsetHeight-e.node.offsetHeight-e.node.offsetTop>0&&(e.node.style.top=`${e.node.offsetTop+i}px`)}function Zt(e,t,i){e.node.offsetLeft+parseInt(e.node.offsetWidth/2)+t<0||(t<0?e.node.style.left=`${e.node.offsetLeft+t}px`:e.target.offsetWidth-parseInt(e.node.offsetWidth/2)-e.node.offsetLeft>0&&(e.node.style.left=`${e.node.offsetLeft+t}px`),!(e.node.offsetTop+parseInt(e.node.offsetHeight/2)+i<0)&&(i<0?e.node.style.top=`${e.node.offsetTop+i}px`:e.target.offsetHeight-parseInt(e.node.offsetHeight/2)-e.node.offsetTop>0&&(e.node.style.top=`${e.node.offsetTop+i}px`)))}function Xe(){this.node&&this.target instanceof HTMLElement&&this.target.append(this.node)}function Qe(e){if(e.data_id??="drawer",e.dialog)return M(e);if(e.drawer===!1)return e.drawer=mapp.utils.html.node`<div
      class="${"drawer "+(e.class||"")}"
      data-id=${e.data_id}>
      <div class="header">${e.header}</div>
      <div class="content">${e.content}`,e.drawer;if(e.drawer===null)return e.drawer=mapp.utils.html.node`<div
    data-id=${e.data_id}
    class="${e.class||""}">
    <div class="content">${e.content}`,e.drawer;e.class=`drawer expandable ${e.class||""}`;let i=(e.header?.template||e.header)?.find?.(l=>(l=l?.template?.[0]||l,l?.includes?.("caret")||l?.classList?.contains?.("caret")))?"":mapp.utils.html`
      <div class="notranslate material-symbols-outlined caret">`;if(e.drawer=mapp.utils.html.node`
  <div
    data-id=${e.data_id}
    class=${e.class}>
    <div
      class="header"
      onclick=${o}>
      ${e.header}
      ${i}
    </div>
    <div class="content">
      ${e.content}
    </div>`,e.popout){if(e.popout={},e.originalTarget=e.drawer.querySelector(".content"),e.popoutBtn=e.drawer.querySelector(".header").querySelector("[data-id=popout-btn]"),!e.popoutBtn){e.popoutBtn=mapp.utils.html.node`<button
      data-id="popout-btn"
      class="notranslate material-symbols-outlined">
      open_in_new`;let l=e.drawer.querySelector(".header").querySelector(".caret");e.drawer.querySelector(".header").insertBefore(e.popoutBtn,l)}e.popoutBtn.onclick=()=>{e.drawer.style.display="none",e.view=e.drawer.parentElement,Yt(e),e.view&&(e.viewChildren=Array.from(e.view.children||[]).filter(l=>l.checkVisibility())),e.viewChildren&&!e.viewChildren.length&&(e.view.previousElementSibling.dispatchEvent(new Event("click")),e.view.parentElement.classList.add("empty"),e.view.previousElementSibling.querySelector(".caret").style.setProperty("display","none"))}}return e.drawer;function o(l){l.target.parentElement.classList.contains("empty")||l.target.parentElement.classList.toggle("expanded")}}function Yt(e){if(e.popout?.dialog)return e.popout.node.querySelector(".content").appendChild(mapp.utils.html.node`${Array.from(e.drawer.querySelector(".content").children)}`),e.popout.node.querySelector("header").replaceChildren(mapp.utils.html.node`${Array.from(e.drawer.querySelector(".header").children)}${e.popout.minimizeBtn}${e.popout.closeBtn}`),e.popout.show();e.popout={data_id:`${e.data_id}-popout`,target:document.getElementById("Map"),height:"auto",left:"5%",top:"0.5em",class:"box-shadow popout",css_style:"width: 300px; height 300px",containedCentre:!0,contained:!0,headerDrag:!0,closeBtn:!0,minimizeBtn:!0,onClose:()=>{e.viewChildren&&!e.viewChildren.length&&(e.view.parentElement.classList.remove("empty"),e.view.previousElementSibling.dispatchEvent(new Event("click")),e.view.previousElementSibling.querySelector(".caret").style.removeProperty("display")),e.drawer.style.removeProperty("display"),e.drawer.querySelector(".header").replaceChildren(mapp.utils.html.node`${Array.from(e.popout.node.querySelector("header").children).filter(t=>!["close","minimize"].includes(t.dataset.id))}`),e.originalTarget.appendChild(mapp.utils.html.node`${Array.from(e.popout.node.querySelector(".content").children)}`)},...e.popout},mapp.ui.elements.dialog(e.popout),e.popout.node.querySelector("header").replaceChildren(mapp.utils.html.node`${Array.from(e.drawer.querySelector(".header").children)}${e.popout.minimizeBtn}${e.popout.closeBtn}`),e.popout.node.querySelector(".content").appendChild(mapp.utils.html.node`${Array.from(e.drawer.querySelector(".content").children)}`),e.popout.view=e.popout.node.querySelector(".content")}function M(e){e.dialog===!0&&(e.dialog={}),e.dialog.btn_label??="Open dialog",e.dialog.btn_title??=e.dialog.btn_label;let t=e.dialog.icon_name||e.dialog.btnIcon||e.dialog.icon;return e.dialog.btn=mapp.utils.html.node`<button
    class="wide flat action multi_hover"
    data-id=${e.data_id}
    title=${e.dialog.btn_title}
    onclick=${()=>{e.dialog.btn.classList.toggle("active")?Xt(e):e.dialog.close()}}>
    <span class="material-symbols-outlined notranslate">${t}</span>
    ${e.dialog.btn_label}`,e.layer?.hideCallbacks?.push(()=>{e.dialog.close?.()}),e.dialog.showOnLayerDisplay&&e.layer?.showCallbacks.push(()=>{e.dialog.show?.()}),e.dialog.btn}function Xt(e){if(e.layer?.show(),e.dialog.show)return e.dialog.show();e.dialog.data_id??=`${e.data_id}-dialog`,e.dialog.title??="Dialog",e.dialog.header??=mapp.utils.html`<h1>${e.dialog.title}`,e.dialog={target:document.getElementById("Map"),content:e.content,height:"auto",left:"5em",top:"0.5em",class:"box-shadow",css_style:"min-width: 300px; width: 350px",containedCentre:!0,contained:!0,headerDrag:!0,minimizeBtn:!0,closeBtn:!0,onClose:()=>{e.dialog.btn.classList.remove("active")},...e.dialog},mapp.ui.elements.dialog(e.dialog)}var et={circle:oi,circle_2pt:ii,drawOnclick:h,line:Kt,locator:li,point:Qt,polygon:ei,rectangle:ti};async function h(e,t,i){if(t.location){let n=function(){t.location.renderLocationView()},l=await t.location.confirmUpdate(n);if(l===null)return;if(l===!0){h(e,t,i);return}}let o=i.btn||e.target;if(i.callback??=l=>{mapp.location.create(l,i,t),o.classList.remove("active"),delete t.mapview.interaction,mapp.ui.elements.helpDialog(),setTimeout(()=>{!t.mapview.interaction&&t.mapview.interactions.highlight()},400)},!o.classList.toggle("active")){t.mapview.interactions.highlight();return}!t.display&&t.show(),t.mapview.interactions.draw(i),!(t.draw.hideHelp||i.hideHelp)&&(i.helpDialog.header=mapp.utils.html`<h3 style="line-height: 2em; margin-right: 1em">${mapp.dictionary.draw_dialog_title}</h3>`,i.helpDialog.data_id="dialog_drawing",mapp.ui.elements.helpDialog(i.helpDialog))}function Qt(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.point={helpDialog:t,label:mapp.dictionary.draw_point,layer:e,type:"Point",...e.draw.point},e.draw.point.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${i=>h(i,e,e.draw.point)}>
      <span class="notranslate material-symbols-outlined">add_location_alt</span>
      ${e.draw.point.label}`,e.draw.point.btn}function Kt(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.line={helpDialog:t,label:mapp.dictionary.draw_line,layer:e,type:"LineString",...e.draw.line},e.draw.line.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${i=>h(i,e,e.draw.line)}>
      <span class="notranslate material-symbols-outlined">polyline</span>
      ${e.draw.line.label}`,e.draw.line.btn}function ei(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_cancel_drawing}
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save}</ul>`};return e.draw.polygon={helpDialog:t,label:mapp.dictionary.draw_polygon,layer:e,type:"Polygon",...e.draw.polygon},e.draw.polygon.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${i=>h(i,e,e.draw.polygon)}>
      <span class="notranslate material-symbols-outlined">activity_zone</span>
      ${e.draw.polygon.label}`,e.draw.polygon.btn}function ti(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.rectangle={geometryFunction:ol.interaction.Draw.createBox(),helpDialog:t,label:mapp.dictionary.draw_rectangle,layer:e,type:"Circle",...e.draw.rectangle},e.draw.rectangle.btn=mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${i=>h(i,e,e.draw.rectangle)}>
    <span class="notranslate material-symbols-outlined">rectangle</span>
    ${e.draw.rectangle.label}`,e.draw.rectangle.btn}function ii(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.circle_2pt={geometryFunction:ol.interaction.Draw.createRegularPolygon(33),helpDialog:t,label:mapp.dictionary.draw_circle_2pt,layer:e,type:"Circle",...e.draw.circle_2pt},e.draw.circle_2pt.btn=mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${i=>h(i,e,e.draw.circle_2pt)}>
    <span class="notranslate material-symbols-outlined">outbound</span>
    ${e.draw.circle_2pt.label}`,e.draw.circle_2pt.btn}function oi(e){let i={helpDialog:{content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`},label:mapp.dictionary.draw_circle,layer:e,type:"Point",units:"meter",unitsConfig:{meter:{max:1e3,min:1,title:"Meter"},km:{max:10,min:1,title:"KM"},miles:{max:10,min:1,title:"Miles"},meter2:{max:1e3,min:1,title:"Meter\xB2"},km2:{max:10,min:1,title:"KM\xB2"}},unitConversion:{km:l=>l*1e3,km2:l=>Math.sqrt(l*1e6/Math.PI),meter:l=>l,meter2:l=>Math.sqrt(l/Math.PI),miles:l=>l*1609.34},...e.draw.circle};e.draw.circle=i,i.unitsOptions??=Object.keys(i.unitsConfig),i.unitsOptions=i.unitsOptions.filter(l=>Object.hasOwn(i.unitsConfig,l)?(i.unitsConfig[l].option=l,i.unitsConfig[l].title??=l,!0):(console.warn(`Unknown circle drawing unit ${l}`),!1)),i.unitsOptions.length&&Object.keys(i.unitsConfig).forEach(l=>{i.unitsOptions.includes(l)||delete i.unitsConfig[l]}),Object.hasOwn(i.unitsConfig,i.units)||(i.units=Object.keys(i.unitsConfig)[0]),i.geometryFunction??=l=>new ol.geom.Polygon.circular(ol.proj.toLonLat(l),e.draw.circle.unitConversion[e.draw.circle.units](e.draw.circle.radius),64).transform("EPSG:4326","EPSG:3857"),i.unitsDropDown=mapp.utils.html.node`<div
    style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({callback:(l,n)=>Ke(i,n.option),entries:Object.values(i.unitsConfig),placeholder:i.unitsConfig[i.units].title})}`,i.rangeSlider=mapp.utils.html.node`<div>`,Ke(i,i.units),i.btn=mapp.utils.html.node`<button
    class="action wide"
    onclick=${l=>h(l,e,i)}>
      <span class="notranslate material-symbols-outlined">add_circle</span>
      ${i.label}`;let o=mapp.utils.html.node`
    <div class="panel flex-col">
      ${i.unitsDropDown}
      ${i.rangeSlider}
      ${i.btn}`;return i.hidePanel?i.btn:(i.dialog&&(i.dialog={btn_label:mapp.dictionary.draw_circle_dialog,title:mapp.dictionary.draw_settings,...i.dialog}),i.drawer=mapp.ui.elements.drawer({data_id:`draw-circle-${e.key}`,drawer:i.drawer,layer:e,header:mapp.utils.html`
    <h3>${mapp.dictionary.circle_config}</h3>`,content:o,popout:i.popout,dialog:i.dialog}),i.drawer)}function Ke(e,t){let i=e.unitsConfig[t];e.units=i.option,e.radius??=i.min,e.radius=e.radius>i.max?i.max:e.radius,mapp.utils.render(e.rangeSlider,mapp.ui.elements.slider({callback:o=>{e.radius=parseFloat(o)},max:i.max,min:i.min,val:e.radius}))}function li(e){return e.draw.locator={label:mapp.dictionary.draw_position,layer:e,type:"Point",...e.draw.locator},e.draw.locator.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${t=>{mapp.utils.getCurrentPosition(async i=>{let o={layer:e,new:!0,table:e.tableCurrent()},l=ol.proj.transform([parseFloat(i.coords.longitude),parseFloat(i.coords.latitude)],"EPSG:4326",`EPSG:${e.srid}`);o.id=await mapp.utils.xhr({body:JSON.stringify({[e.geom]:{coordinates:l,type:"Point"}}),method:"POST",url:`${e.mapview.host}/api/query?`+mapp.utils.paramString({layer:e.key,locale:e.mapview.locale.key,table:o.table,template:"location_new"})}),mapp.location.get(o)})}}>
      <span class="notranslate material-symbols-outlined">my_location</span>
      ${e.draw.locator.label}`,e.draw.locator.btn}function V(e){e.selectedTitles=new Set,e.selectedOptions=new Set,e.placeholder??=e.span||"",e.entries=e.entries?.filter?.(o=>o.option!==""),ai(e),si(e),e.onChange??=it,e.options=ni(e);let t=e.selectedTitles.size?Array.from(e.selectedTitles).join(", "):e.placeholder,i=e.keepPlaceholder?e.placeholder:t;return e.placeHolderOption=mapp.utils.html.node`
    <option style="display: none;" value="" disabled selected>${i}`,e.options.unshift(e.placeHolderOption),e.data_id??="dropdown",e.select=mapp.utils.html.node`<select
    class="select-dropdown"
    data-id=${e.data_id}
    onfocus=${tt}
    onblur=${tt}
    onchange=${o=>it(o,e)}>
    ${e.options}`,e.multiple&&(e.select.multiple=!0),e.node=mapp.utils.html.node`
    ${e.pills?.container}
    ${e.search||e.select}`,e.node}function tt(e){e.target.selectedIndex=0}function it(e,t){let i=e.target.selectedIndex;e.target.selectedIndex=0;let o=t.entries[i-1];if(o.selected=!o.selected,t.multi){if(t.options[i].classList.toggle("selected")?(t.selectedTitles.add(o.title),t.selectedOptions.add(o.option),t.pills?.add(o.title)):(t.selectedTitles.delete(o.title),t.selectedOptions.delete(o.option),t.pills?.remove(o.title)),!t.pills&&!t.keepPlaceholder){let n=t.selectedTitles?.size&&Array.from(t.selectedTitles).join(", ");t.placeHolderOption.textContent=n||t.placeholder}t.callback?.(e,[...t.selectedOptions],o);return}t.options.forEach(l=>{l.classList.remove("selected"),l.style.backgroundColor="var(--color-base-secondary)"}),t.options[i].classList.add("selected"),t.options[i].style.removeProperty("background-color"),t.keepPlaceholder||(t.placeHolderOption.textContent=o.title),t.callback?.(e,o)}function ni(e){return e.entries.map(i=>(i.li=mapp.utils.html.node`<option
        value=${i.option}>
        ${i.title||i.label||i.field}`,i.selected&&(i.li.classList.add("selected"),e.selectedTitles.add(i.title),e.selectedOptions.add(i.option),e.pills?.add(i.title)),i.li))}function ai(e){e.pills&&(e.pills=mapp.ui.elements.pills({addCallback:(t,i)=>{e.callback?.(null,[...i])},pills:[...e.selectedTitles],removeCallback:(t,i)=>{let o=e.entries.findIndex(n=>n.option===t),l=e.entries.findIndex(n=>n.option===t)+1;e.entries.find(n=>n.option===t).selected=!1,e.options[l].classList.remove("selected"),e.selectedTitles.delete(o.title),e.selectedOptions.delete(o.option),e.callback?.(null,[...i])}}))}function si(e){if(!e.search)return;let t=`${e.field}-search-options`,i=e.placeholder||"Enter search term...",o=mapp.utils.html.node`<input
    placeholder=${i}
    type="search" list=${t}
    onInput=${n=>di(n,e)}
    onfocus="this.placeholder=''"
    onblur=${n=>n.target.placeholder=i}>`;e.searchOptions=[];for(let n of e.entries){let a=mapp.utils.html.node`
      <option value=${n.option} data-title=${n.title}>${n.title}`;e.searchOptions.push(a)}let l=mapp.utils.html.node`<datalist id=${t}>${e.searchOptions}`;return e.search=mapp.utils.html.node`${o}${l}`,e.search}function di(e,t){t.entries.forEach(i=>{i.title===e.target.value&&(i.selected=!i.selected,i.selected?(t.selectedTitles.add(i.title),t.selectedOptions.add(i.option),t.pills?.add(i.title)):(t.selectedTitles.delete(i.title),t.selectedOptions.delete(i.option),t.pills?.remove(i.title)),e.target.value="",e.target.dispatchEvent(new Event("blur")),t.pills||t.callback?.(e,[...t.selectedOptions]))})}var P;function H(e){P?.node.remove(),e&&(mapp.user?.hideHelp||(P={closeBtn:!0,contained:!0,css_style:"padding: 0.5em;",headerDrag:!0,height:"auto",left:"6em",minimizeBtn:!0,target:document.getElementById("Map"),top:"3em",...e},mapp.ui.elements.dialog(P)))}async function R(e){let t=await mapp.utils.esmImport("vanilla-jsoneditor@3.3.1");return e.content??={json:{}},typeof e.data=="object"&&(e.content.json=e.data),t.createJSONEditor({props:{content:e.content,...e.props},target:e.target})}var U={hover:ri,hovers:ui,icon_scaling:vi,label:pi,labels:fi,opacitySlider:hi,panel:ci,theme:gi,themes:bi},ot=U;function ci(e){if(!e.style)return;e.style.elements??=Object.keys(e.style);let t=e.style.elements.filter(i=>Object.hasOwn(e.style,i)).filter(i=>Object.hasOwn(U,i)).map(i=>U[i](e)).flat().filter(i=>!!i);if(t.length)return e.style.view=mapp.utils.html.node`<div>${t}`,e.style.view}function ri(e){if(e.style.hover&&!e.style.hover.hidden)return mapp.ui.elements.chkbox({checked:!!e.style.hover.display,data_id:`hoverCheckbox-${e.key}`,label:e.style.hovers&&mapp.dictionary.layer_style_display_hover||e.style.hover.title||mapp.dictionary.layer_style_display_hover,onchange:t=>{e.style.hover.display=t}})}function ui(e){if(!e.style.hover||e.style.hover.hidden||!e.style.hovers||Object.keys(e.style.hovers).length<2)return;let t=Object.keys(e.style.hovers).filter(i=>!e.style.hovers[i].hidden).map(i=>({option:i,title:e.style.hovers[i].title||i}));return mapp.ui.elements.dropdown({callback:(i,o)=>{let l=e.style.hover.display;e.style.hover=e.style.hovers[o.option],e.style.hover.method??=mapp.layer.featureHover,e.style.hover.display=l},data_id:`hoversDropdown-${e.key}`,entries:t,placeholder:e.style.hover.title})}function pi(e){if(e.style.label&&!e.style.label.hidden)return e.style.labelCheckbox=mapp.ui.elements.chkbox({checked:!!e.style.label.display,data_id:`labelCheckbox-${e.key}`,label:e.style.labels&&mapp.dictionary.layer_style_display_labels||e.style.label.title||mapp.dictionary.layer_style_display_labels,onchange:t=>{e.style.label.display=t,e.reload()}}),e.changeEndCallbacks.push(mi),e.style.labelCheckbox}function mi(e){if(e.style.label.minZoom||e.style.label.maxZoom){let t=e.mapview.Map.getView().getZoom();t<=e.style.label.minZoom||t>=e.style.label.maxZoom?e.style.labelCheckbox?.classList.add("disabled"):e.style.labelCheckbox?.classList.remove("disabled")}}function fi(e){if(!e.style.label||e.style.label.hidden||!e.style.labels||Object.keys(e.style.labels).length<2)return;let t=Object.keys(e.style.labels).filter(o=>!e.style.labels[o].hidden).map(o=>({option:o,title:e.style.labels[o].title||o}));function i(o,l){let n=e.style.label.display;e.style.label=e.style.labels[l.option],e.style.label.display=n,e.reload()}return mapp.utils.html`<div>${mapp.dictionary.layer_style_select_label}</div>${mapp.ui.elements.dropdown({callback:i,data_id:"labelsDropdown",entries:t,placeholder:e.style.label.title})}`}function hi(e){return mapp.ui.elements.slider({callback:t=>{e.L.setOpacity(parseFloat(t/100))},data_id:"opacitySlider",label:`${mapp.dictionary.layer_style_opacity}`,max:100,min:0,val:parseInt(e.L.getOpacity()*100)})}function gi(e){if(!e.style.theme)return;e.style.theme?.setLabel&&e.style.labels&&(e.style.label=e.style.labels[e.style.theme.setLabel]),e.style.theme?.setHover&&e.style.hovers&&(e.style.hover=e.style.hovers[e.style.theme.setHover]);let t=[];return e.style.theme?.meta&&(e.style.theme.meta_node=mapp.utils.html.node`<p>${e.style.theme.meta}`,t.push(e.style.theme.meta_node)),Object.hasOwn(mapp.ui.layers.legends,e.style.theme?.type)&&(mapp.ui.layers.legends[e.style.theme.type](e),e.style.legend&&t.push(e.style.legend)),mapp.utils.html.node`<div data-id="layerTheme">${t}`}function bi(e){if(!e.style.themes||Object.keys(e.style.themes).length<2)return;let t=Object.keys(e.style.themes).map(l=>({option:l,title:e.style.themes[l].title||l}));function i(l,n){e.style.theme=e.style.themes[n.option],e.style.theme.setLabel&&e.style.labels&&(e.style.label=e.style.labels[e.style.theme.setLabel]),e.style.theme.setHover&&e.style.hovers&&(e.style.hover=e.style.hovers[e.style.theme.setHover],e.style.hover.method??=mapp.layer.featureHover);let a=mapp.ui.layers.panels.style(e);e.style.panel&&e.style.panel.replaceChildren(...a.children),e.view?.querySelector("[data-id=style-drawer]").replaceChildren(...a.children),e.reload()}return mapp.utils.html`<div>
    ${mapp.dictionary.layer_style_select_theme}
    ${mapp.ui.elements.dropdown({callback:i,data_id:"themesDropdown",entries:t,placeholder:e.style.theme.title})}`}function vi(e){if(!e.style.icon_scaling||e.style.icon_scaling.hidden)return;let t=[];if(e.style.icon_scaling.fields){let i=Object.keys(e.style.icon_scaling.fields).map(l=>({option:e.style.icon_scaling.fields[l].field,title:e.style.icon_scaling.fields[l].title||l,key:l}));i.push({title:mapp.dictionary.icon_scaling_no_scaling}),e.style.icon_scaling.placeholder??=mapp.dictionary.icon_scaling_select_one,e.style.icon_scaling.title??=mapp.dictionary.icon_scaling_title;let o=Object.keys(e.style.icon_scaling.fields).find(l=>e.style.icon_scaling.fields[l].field===e.style.icon_scaling.field)||Object.keys(e.style.icon_scaling.fields)[0];t.push(mapp.utils.html`
        <h3>${e.style.icon_scaling.title}`,mapp.ui.elements.dropdown({data_id:"iconScalingFieldsDropdown",entries:i,callback:(l,n)=>{n.option?Object.assign(e.style.icon_scaling,{...e.style.icon_scaling.fields[n.key]}):delete e.style.icon_scaling.field,e.reload(),e.L.changed()},placeholder:e.style.icon_scaling.fields[o].title||o||e.style.icon_scaling.placeholder}))}else e.style.icon_scaling.field&&t.push(mapp.ui.elements.chkbox({checked:!!e.style.icon_scaling.field,data_id:`iconScalingFieldCheckbox-${e.key}`,label:mapp.dictionary.icon_scaling_field,onchange:i=>{i?(e.style.icon_scaling.field=e.style.icon_scaling._field,delete e.style.icon_scaling._field):(e.style.icon_scaling._field=e.style.icon_scaling.field,delete e.style.icon_scaling.field),e.L.changed()}}));return e.style.icon_scaling.icon&&(e.style.default.scale??=1,e.style.icon_scaling.maxScale??=e.style.default.scale*3,e.style.icon_scaling.minScale??=.1,e.style.icon_scaling.icon_scaling_label??=mapp.dictionary.icon_scaling_label,t.push(mapp.ui.elements.slider({callback:i=>{e.style.default.scale=parseFloat(i),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:"iconScalingSlider",label:e.style.icon_scaling.icon_scaling_label,max:e.style.icon_scaling.maxScale,min:e.style.icon_scaling.minScale,step:e.style.default.scale/10,val:e.style.default.scale}))),e.style.icon_scaling.clusterScale&&e.style.cluster?.clusterScale&&(e.style.cluster.clusterScale??=1,t.push(mapp.ui.elements.slider({callback:i=>{e.style.cluster.clusterScale=parseFloat(i),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:"iconScalingClusterSlider",label:mapp.dictionary.icon_scaling_cluster,max:e.style.cluster.clusterScale*3,min:0,step:e.style.cluster.clusterScale/10,val:e.style.cluster.clusterScale}))),e.style.icon_scaling.zoomInScale&&(e.style.zoomInScale??=1,t.push(mapp.ui.elements.slider({callback:i=>{e.style.zoomInScale=parseFloat(i),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:"iconScalingZoomInSlider",label:mapp.dictionary.icon_scaling_zoom_in,max:e.style.zoomInScale*3,min:0,step:e.style.zoomInScale/10,val:e.style.zoomInScale}))),e.style.icon_scaling.zoomOutScale&&(e.style.zoomOutScale??=1,t.push(mapp.ui.elements.slider({callback:i=>{e.style.zoomOutScale=parseFloat(i),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:"iconScalingZoomOutSlider",label:mapp.dictionary.icon_scaling_zoom_out,max:e.style.zoomOutScale*3,min:0,step:e.style.zoomOutScale/10,val:e.style.zoomOutScale}))),mapp.utils.html.node`<div>${t}`}var lt=new XMLSerializer;function W(e){let t=[];return Array.isArray(e.icon)?t.push(wi(e)):(e.icon||e.svg||e.type)&&t.push($i(e)),e.fillColor&&t.push(xi(e)),e.strokeColor&&!e.fillColor&&t.push(_i(e)),mapp.utils.html.node`<div class="legend-icon">${t}`}function wi(e){let t=document.createElement("canvas");t.width=e.width,t.height=e.height;let i=e.icon.length;function o(){if(--i)return;let n=ol.render.toContext(t.getContext("2d"),{pixelRatio:1,size:[e.width,e.height]});e.icon.forEach(a=>{n.setStyle(a.legendStyle),n.drawGeometry(new ol.geom.Point([t.width*.5,t.height*.5]))})}let l=e.icon[0].legendScale||1;for(let n of e.icon){if(n.type&&Object.hasOwn(mapp.utils.svgSymbols,n.type)&&(n.url=mapp.utils.svgSymbols[n.type](n)),!n.url){console.warn("legendIcon: icon has no url, the svg or template may be missing/invalid: ",n);continue}let a=new ol.style.Icon({anchor:n.legendAnchor||[.5,.5],crossOrigin:"anonymous",scale:l*(n.scale||1),src:n.url});n.legendStyle=new ol.style.Style({image:a});let s=a.getImage();a.getImageState()===2?o():(s.addEventListener("load",o),a.load())}return t}function $i(e){let t=e.icon?.svg||e.svg||e.icon?.url||e.url||mapp.utils.svgSymbols[e.icon?.type||e.type](e.icon||e),i=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width+"px"||"100%"};
    height: ${e.height+"px"||"100%"};
    background-image: url(${t})`;return mapp.utils.html.node`<div style=${i}>`}function _i(e){let t=`M 0,${e.height/2} L ${e.width/2},${e.height/2} ${e.width/2},${e.height/2} ${e.width},${e.height/2}`;e.strokeWidth??=1,e.lineDash??="";let i=mapp.utils.svg.node`
  <svg
    height=${e.height}
    width=${e.width}>
    <path
      d=${t}
      fill="none"
      stroke=${e.strokeColor}
      stroke-width=${e.strokeWidth}
      stroke-dasharray=${e.lineDash} />`,o=`data:image/svg+xml,${encodeURIComponent(lt.serializeToString(i))}`,l=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width}px;
    height: ${e.height}px;
    background-image: url(${o});`;return mapp.utils.html`<div style=${l}>`}function xi(e){e.fillOpacity??=1,e.strokeWidth??=1,e.lineDash??="";let t=mapp.utils.svg.node`
  <svg
    height=${e.height}
    width=${e.width}>
    <rect
      x=${e.strokeWidth||1}
      y=${e.strokeWidth||1}
      rx="4px"
      ry="4px"
      stroke-linejoin="round"
      width=${e.width-2*(e.strokeWidth||1)}
      height=${e.height-2*(e.strokeWidth||1)}
      fill=${e.fillColor}
      fill-opacity=${e.fillOpacity}
      stroke=${e.strokeColor}
      stroke-width=${e.strokeWidth}
      stroke-dasharray=${e.lineDash} >`,i=`data:image/svg+xml,${encodeURIComponent(lt.serializeToString(t))}`,o=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width}px;
    height: ${e.height}px;
    background-image: url(${i});`;return mapp.utils.html`<div style=${o}>`}async function J(e,t){let i=[];if(await nt(i,e,0,t),!!i.length&&!(i.length===1&&t.length===1))return mapp.utils.html.node`${i}`}async function nt(e,t,i,o){if(!o?.length)return;if(i>0){if(o=await mapp.utils.xhr(`${mapp.host}/api/workspace/locales?locale=${t.keys?.slice(0,i).join(",")||t.key}`),o instanceof Error||!o.length)return;t.keys?.length>i&&o.unshift({key:t.keys.slice(0,i).join(","),name:t.name.split("/").slice(0,i).join("/")})}let l=t.keys?.[i]||t.key;i>0&&(!t.keys||t.keys.length===i)&&(l="Select nested locale");let n=mapp.ui.elements.dropdown({data_id:`locale-dropdown-${i}`,placeholder:l,entries:o.map(a=>{let s=a.key.split(","),d=a.name.split("/"),c=`${s.length===i?"<- Back":""}${d.slice(i).join("/")}`,u=t.keys?t.keys.slice(0,i+1).join(","):t.key;return{title:c,key:a.key,option:a.key,selected:a.key===u}}),callback:(a,s)=>{globalThis.location.assign(`${mapp.host}?locale=${s.key}`)}});e.push(n),i++,(i===1||t.keys?.length>=i)&&await nt(e,t,i,o)}function G(e={}){e.msg??="",e.formAction=`${mapp.host}/api/user/login?language=${mapp.language}`,e.register??=`${mapp.host}/api/user/register?language=${mapp.language}&register=true`,e.classList??="",e.login_email??=mapp.dictionary.login_email,e.login_password??=mapp.dictionary.login_password,e.login_button??=mapp.dictionary.login_button,e.login_verification_note??=mapp.dictionary.login_verification_note,e.login_registration_link??=mapp.dictionary.login_registration_link,e.login_invalid??=mapp.dictionary.login_invalid;let t=`login-form no-select ${e.classList}`,i=mapp.utils.html.node`<input
    id="auth_user_email"
    name="email"
    type="email"
    required
    autocomplete="username"
    maxlength="50"
    onkeyup=${s}
    onchange=${s}>`,o=mapp.utils.html.node`<span class="bold" style="color: var(--color-danger)">`,l=mapp.utils.html.node`<input
    id="auth_user_password"
    name="password"
    type="password"
    required
    autocomplete="current-password"
    minlength="12"
    onkeyup=${s}
    onchange=${s}>`,n=mapp.utils.html.node`
    <button id="btnLogin" class="primary bold" type="submit" disabled>${e.login_button}`;return mapp.utils.html.node`<form
    class=${t}
    method="post"
    autocomplete="off"
    action=${e.formAction}>
    <input style="display: none" name="language" required value="en">
    <div class="input-group">
      ${i}
      <span class="bar"></span>
      <label for="auth_user_email">${e.login_email}</label>
    </div>
    <div class="input-group">
      ${l}
      <span class="bar"></span>
      <label for="auth_user_password">${e.login_password}</label>
      <br>
      ${o}
    </div>
    <p class="msg">${e.msg}</p>

    ${n}

    <p>${e.login_verification_note}</p>

    <a 
      class="switch"
      href=${e.register}>${e.login_registration_link}</a>`;function s(){n.disabled=!(i.validity.valid&&l.validity.valid),o.textContent=n.disabled?e.login_invalid:""}}function Z(e){e.placeholder??="",e.data_id??="numeric-input",e.numericChecks??=ki;let t=mapp.utils.formatNumericValue(e),o=`text-align: center; width: ${e.dynamicWidth?t.length+1.3+"ch":"100%"}`;return mapp.utils.html.node`<input
    data-id=${e.data_id}
    type="text"
    style=${o}
    placeholder=${e.placeholder}
    value=${t}
    onchange=${n=>at(n,e)}
    onfocus=${n=>n.target.value=mapp.utils.unformatStringValue({...e,stringValue:n.target.value})}
    oninput=${n=>at(n,e)}>`}function at(e,t){if(t.stringValue=e.target.value,t.numericChecks(e.target.value,t)?(t.newValue=t.onRangeInput?t.stringValue:mapp.utils.unformatStringValue(t),delete t.invalid,e.target.classList.remove("invalid"),t.sliderElement&&(t.sliderElement.style.setProperty(`--${e.target.dataset.id}`,t.newValue),t.sliderElement.querySelector(`[name=${t.rangeInput}]`).value=t.newValue)):(t.invalid=!0,e.target.classList.add("invalid")),t.invalid)return t.callback();t.callback(t.newValue),t.dynamicWidth&&(e.target.style.width=e.target.value.length+1.3+"ch"),t.onRangeInput=!1}function ki(e,t){return t.onRangeInput&&e===null||isNaN(e)||t.min&&e<t.min?!1:t.max?e<=t.max:!0}function Y(e={}){return e.container=mapp.utils.html.node`<div class="pill-container">`,e.pills=Array.isArray(e.pills)?new Set(e.pills):new Set,e.add=yi,e.remove=Li,e.pills.forEach(t=>e.add(t)),e.target instanceof HTMLElement&&e.target.append(e.container),e}function yi(e){let t=this,i=mapp.utils.html.node`<div
    class="pill"
    style=${t.css_pill}
    data-value=${e}
    title="${e}">${e}`;t.removeCallback&&i.append(mapp.utils.html.node`<button class="notranslate material-symbols-outlined close"
      data-value=${e}
      title=${mapp.dictionary.pill_component_remove}
      onclick=${o=>{o.stopPropagation(),t.remove(e)}}>`),t.pills.has(e)||t.pills.add(e),t.container.append(i),typeof t.addCallback=="function"&&t.addCallback(e,t.pills)}function Li(e){let t=this;Array.from(t.container.children).find(o=>o.getAttribute("data-value")===e.toString())?.remove(),t.pills.delete(e),typeof t.removeCallback=="function"&&t.removeCallback(e,t.pills)}function X(e){e.name??="mapp-ui-radio-element",e.data_id??="radio",e.label??="No label defined";let t=e.caption?mapp.utils.html`<legend>${e.caption}`:"",i=mapp.utils.html.node`<input 
    type="radio"
    data-id=${e.data_id}
    name="${e.name}"
    .disabled=${!!e.disabled}
    .checked=${!!e.checked}
    onchange=${o=>{e.onchange?.(o,e)}}/>`;return mapp.utils.html.node`<div>
    ${t}
    <label 
    class="radio">
    ${i}
    <span class="material-symbols-outlined"></span>
    <span>${e.label}`}function Q(e={}){e.msg??="",e.formAction=`${mapp.host}/api/user/register?language=${mapp.language}`,e.classList??="",e.login??=`${mapp.host}/api/user/login?language=${mapp.language}`,e.register_privacy_agreement??=mapp.dictionary.register_privacy_agreement,e.register_next_info??=mapp.dictionary.register_next_info,e.register_error=mapp.dictionary.register_error;let t=`login-form no-select ${e.classList}`,i=mapp.utils.html.node`<input
    id="auth_user_email"
    name="email"
    type="email"
    required
    autocomplete="username"
    maxlength="50"
    onkeyup=${c}
    onchange=${c}>`,o=mapp.utils.html.node`<input
      id="auth_user_password"
      name="password"
      type="password"
      required
      autocomplete="new-password"
      minlength="12"
      pattern="(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$"
      onkeyup=${c}
      onchange=${c}>`,l=mapp.utils.html.node`<input
    id="auth_user_password_retype"
    name="password_retype"
    type="password"
    required
    autocomplete="new-password"
    minlength="12"
    pattern="(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$"
    onkeyup=${c}
    onchange=${c}>`,n=mapp.utils.html.node`<div class="bold" style="color: var(--color-danger)">`,a=mapp.ui.elements.chkbox({name:"privacy_agreement",label:mapp.utils.html`<span class="asterisk">${mapp.dictionary.register_agree}`,onchange:c}),s=mapp.utils.html.node`<button 
    class="primary bold"
    id="btnRegister" type="submit" disabled>
    ${mapp.dictionary.register_reset}`;return mapp.utils.html.node`<form
    class=${t}
    method="post"
    autocomplete="off"
    action=${e.formAction}>
    <input style="display: none" name="language" required value=${mapp.language}>
    <div class="input-group">
      ${i}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_email">${mapp.dictionary.register_email}</label>
    </div>
    <div class="input-group">
      ${o}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_password">${mapp.dictionary.register_new_password}</label>
      <br>
    </div>
    <div class="input-group">
      ${l}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_password_retype">${mapp.dictionary.register_retype_password}</label>
      <br>
    </div>
    <p class="msg">${e.msg}</p>
    <br>
    <h2>${mapp.dictionary.register_privacy}</h2>
    <p>${e.register_privacy_agreement}</p>
    <br>
    ${a}
    ${s}
    <br>
    ${n}
    <br>
    <h2>${mapp.dictionary.register_next}</h2>
    <p>${e.register_next_info}</p>
    <br>
    <a 
      class="switch"
      href=${e.login}>${mapp.dictionary.register_login}
    </a>
    `;function c(){s.disabled=!(i.validity.valid&&o.validity.valid&&o.value===l.value&&a.querySelector("input").checked),n.textContent=s.disabled?e.register_error:""}}function K(e){if(e.data_id??="report-link",e.report){let i={template:e.report.template,locale:e.location?.layer.mapview.locale?.key||e.layer?.mapview.locale?.key,layer:e.location?.layer.key||e.layer?.key,id:e.location?.id,lat:mapp.hooks.current?.lat,lng:mapp.hooks.current?.lng,z:mapp.hooks.current?.z,...e.params};e.icon??="description",e.href=`${mapp.host}/view?${mapp.utils.paramString(i)}`}if(e.href??=e.url,!e.href){console.warn(`ReportLink ${e.data_id} is missing url or report definition.`);return}e.label??=e.report?.label||e.title||mapp.dictionary.link,e.icon_class??="",e.icon_class+=" notranslate material-symbols-outlined",e.dialog??=!mapp.utils.mobile()&&e.report?.dialog,e.icon??=e.dialog?"iframe":"open_in_new",e.link_class??="",e.link_class+=" link-with-img",e.target??="_blank";let t=mapp.utils.html.node`<a
    data-id=${e.data_id}
    class=${e.link_class}
    target=${e.target}
    href="${e.href}">
    <span class=${e.icon_class}>${e.icon}</span>
    <span>${e.label}</span>`;return e.dialog&&(e.header??=e.label,t.onclick=i=>{i.preventDefault(),Ci(e)}),t}function Ci(e){let t=mapp.utils.html`<iframe src=${e.href}>`;e.dialog=mapp.ui.elements.dialog({header:mapp.utils.html`<h2>&nbsp;${e.header}`,css_style:"width: 100%; height: 100%",containedCentre:!0,closeBtn:!0,content:t})}function ee(e={}){if(!(e.searchFunction instanceof Function)){console.warn("A searchFunction must be provided for the construction of a searchbox component.");return}return e.target instanceof HTMLElement||(e.target=mapp.utils.html.node`<div>`),e.name??="searchbox-input",e.input=mapp.utils.html.node`
  <input
    name=${e.name}
    type="search"
    placeholder=${e.placeholder}
    aria-label=${e.placeholder}>`,e.list=mapp.utils.html.node`<ul>`,e.node=mapp.utils.html.node`
    <div class="searchbox">
      ${e.input}
      ${e.list}`,e.target.append(e.node),e.input.addEventListener("input",t=>e.searchFunction(t)),e.input.addEventListener("focus",t=>e.searchFunction(t)),e}function te(e){e.group_id??=e.data_id||"slider",e.data_id="a",e.rangeInput="rangeInput",e.step??=1,e.value??=e.val,e.title??="",e.style??="";let t=mapp.ui.elements.numericInput(e);return e.sliderElement=mapp.utils.html.node`
    <div
      role="group"
      data-id=${e.group_id}
      title=${e.title}
      class="input-range single"
      style=${`
        --min: ${e.min};
        --max: ${e.max};
        --a: ${e.value};
        ${e.style}`}>
      <div class="label-row">
        <label>${e.label}
        ${t}
        </label>
      </div>
      <div class="track-bg"></div>
      <input data-id="a"
        name="rangeInput"
        type="range"
        min=${e.min}
        max=${e.max}
        step=${e.step}
        value=${e.value}
        oninput=${o=>i(o,e)}>`,e.sliderElement;function i(o,l){let n=Number(o.target.value);l.onRangeInput=!0,t.value=n,t.dispatchEvent(new Event("change"))}}function ie(e){e.group_id??=e.data_id||"slider_ab",e.step??=1;let t={...e,callback:e.callback_a,data_id:"a",dynamicWidth:!0,numericChecks:n,rangeInput:"minRangeInput",value:e.val_a},i=mapp.ui.elements.numericInput(t),o={...e,callback:e.callback_b,data_id:"b",dynamicWidth:!0,numericChecks:n,rangeInput:"maxRangeInput",value:e.val_b},l=mapp.ui.elements.numericInput(o);function n(p,$){return p===null||isNaN(p)||(p=Number(p),$.data_id==="a"&&p>Number(o.newValue??o.value))||$.data_id==="b"&&p<Number(t.newValue??t.value)?!1:!(p<$.min||p>$.max)}let a=e.showMinMax?"minmax-row":"minmax-row display-none",s=mapp.utils.formatNumericValue({value:e.min,...e}),d=mapp.utils.formatNumericValue({value:e.max,...e}),c=mapp.utils.html.node`
    <div
      role="group"
      data-id=${e.group_id}
      class="input-range multi"
      style=${`
        --min: ${e.min};
        --max: ${e.max};
        --a: ${e.val_a};
        --b: ${e.val_b};`}>
      <div class="label-row">
        ${i} ${l}
      </div>
      <div class="track-bg"></div>
      <div class=${a}>
        <span>${s}</span><span>${d}</span>
      </div>
      <input data-id="a" type="range"
        name="minRangeInput"
        min=${e.min}
        max=${e.max}
        step=${e.step}
        value=${e.val_a}
        oninput=${p=>u(p,e)}/>
      <input data-id="b" type="range"
        name="maxRangeInput"
        min=${e.min}
        max=${e.max}
        step=${e.step}
        value=${e.val_b}
        oninput=${p=>u(p,e)}/>`;t.sliderElement=c,o.sliderElement=c;function u(p,$){let Ge=Number(p.target.value);p.target.dataset.id==="a"&&(t.onRangeInput=!0,i.value=Ge,i.dispatchEvent(new Event("change"))),p.target.dataset.id==="b"&&(o.onRangeInput=!0,l.value=Ge,l.dispatchEvent(new Event("change")))}return e.max-e.min?c:mapp.utils.html.node`<div>No available range for slider element.`}function oe(e={}){return e.data_id??="ui-elements-toast",e.content??="Set custom HTML content in element configuration.",e.actions??=[],e.accept&&e.actions.push({label:typeof e.accept=="string"?e.accept:"Accept"}),e.cancel&&e.actions.push({label:typeof e.accept=="string"?e.cancel:"Cancel"}),new Promise(t=>{let i;e.close&&(i=mapp.utils.html`
        <button class="notranslate material-symbols-outlined close"
          onclick=${a}>`);let o=e.actions?.map(s=>(s.classlist??="bold raised primary",s.value??=s.label,mapp.utils.html`<button class="${s.classlist}"
        value=${s.value}
        onclick=${d=>a(d,s)}>${s.label}`));o.length||(e.timeout??=3e3,setTimeout(a,e.timeout));let l=e.logo&&mapp.utils.html`<div class="toast-logo"><img src=${e.logo}>`,n=mapp.utils.html.node`
      <div data-id=${e.data_id} class="toast">
      ${i}
      ${l}
      ${e.content}
      <div class="actions">
      ${o}
      </div>`;document.body.append(n);function a(s,d){n.classList.add("ease-out"),setTimeout(function(){n.remove()},1200),d?.callback instanceof Function&&d.callback(s),t(s?.target.value)}})}function le(e={}){if(e.data_id??="ui-elements-tooltip",!e.content){console.warn(`mapp.ui.elements.tooltip: content for ${e.data_id} not provided.`);return}return e.node=mapp.utils.html.node`<span 
    data-id=${e.data_id}
    title=${e.content}
    class="tooltip material-symbols-outlined notranslate">help</span>`,e.node}function ne(e,t){return e.localeInput=mapp.utils.html.node`<input
    type="text" value="${decodeURIComponent(t.locale.name)||t.locale.key}">`,e.ulLocales=mapp.utils.html.node`<div class="user-locales">`,e.panel=mapp.utils.html.node`
  <div>
    <p>${mapp.dictionary.user_locale_specific}</p>
    <p>${mapp.dictionary.user_locale_context}</p>
    <br>
    <h3>${mapp.dictionary.user_locale_save}</h3>

    <div style="display:flex;">${e.localeInput}
      <button style="font-size: 1.5em;"
        onclick=${async()=>await Si(e,t)}>
        <span class="notranslate material-symbols-outlined">save</span>
      </button>
    </div>
    ${e.ulLocales}`,ae(e,t),e.panel}async function Ei(e,t,i){e.panel.classList.add("disabled"),t.locale.name=i,await mapp.utils.userLocale.remove(t.locale),ae(e,t),e.panel.classList.remove("disabled")}async function Si(e,t){e.panel.classList.add("disabled"),t.locale.name=encodeURIComponent(e.localeInput.value),await mapp.utils.userLocale.putLocale(t)===t.locale.name&&(ae(e,t),e.panel.classList.remove("disabled"))}async function ae(e,t){let i=await mapp.utils.userLocale.list(t.locale.workspace);if(!i.length){mapp.utils.render(e.ulLocales,mapp.utils.html`<div>`);return}let o=i.map(l=>{let n=mapp.utils.html`<button
    onclick=${async s=>await Ei(e,t,l.name)}>
      <span class="notranslate material-symbols-outlined">delete</span>`,a=`${mapp.host}?locale=${l.key}&userlocale=${encodeURIComponent(l.name)}`;return mapp.utils.html`<li>${n}<a href=${a}>${decodeURIComponent(l.name)}`});mapp.utils.render(e.ulLocales,mapp.utils.html`
    <h3>${mapp.dictionary.user_locale_desc}</h3>
    <ul>${o}`)}var st={alert:I,btnPanel:Ze,card:z,chkbox:D,confirm:A,contextMenu:Ye,control:B,dialog:N,drawer:Qe,drawerDialog:M,drawing:et,dropdown:V,helpDialog:H,jsoneditor:R,layerStyle:ot,legendIcon:W,locales:J,loginForm:G,numericInput:Z,pills:Y,radio:X,reportLink:K,registerForm:Q,searchbox:ee,slider:te,slider_ab:ie,toast:oe,tooltip:le,userLocale:ne};var dt=e=>{e={...e,...mapp.ui.elements.searchbox({name:"gazetteer-search-input",placeholder:e.placeholder,searchFunction:t,target:e.target})};function t(i){if(e.list.innerHTML="",!i.target.value.length)return;let o=i.target.value.split(",").map(parseFloat);if(o.length===2&&o.every(l=>typeof l=="number"&&!isNaN(l)&&isFinite(l))){let[l,n]=o;if(l>=-90&&l<=90&&n>=-180&&n<=180){e.list.appendChild(mapp.utils.html.node`
        <li onclick=${a=>{mapp.utils.gazetteer.getLocation({label:`Latitude:${o[0]}, Longitude:${o[1]}`,lat:o[0],lng:o[1],source:"Coordinates"},e)}}><span>Latitude:${o[0]}, Longitude:${o[1]}</span>`);return}else e.list.appendChild(mapp.utils.html.node`
          <li style="color: red;">
            <span>${mapp.dictionary.invalid_lat_long_range}</span>`)}e.provider&&(Object.hasOwn(mapp.utils.gazetteer,e.provider)?mapp.utils.gazetteer[e.provider](i.target.value,e):console.warn("Requested gazetteer service not available")),mapp.utils.gazetteer.datasets(i.target.value,e)}};var f={applyFilter:ji,boolean:qi,date:mt,datetime:mt,in:pt,integer:ut,like:rt,match:rt,ni:pt,null:Fi,numeric:ut,removeFilter:Ti,resetFilter:Oi,generateMinMax:ht},ft=f,ct;function ji(e){clearTimeout(ct),ct=setTimeout(()=>{e.reload(),e.style?.theme&&mapp.ui.layers.legends[e.style.theme.type]?.(e),e.filter.list?.forEach(t=>{t.histogram?.update?.()}),e.mapview?.target.dispatchEvent(new Event("changeEnd"))},500)}function se(e,t){e.filter.current[t.field]&&(Object.hasOwn(e.filter.current[t.field],t.type)&&delete e.filter.current[t.field][t.type],Object.hasOwn(e.filter.current,t.field)&&delete e.filter.current[t.field],isNaN(t.Min)&&delete t.min,isNaN(t.Max)&&delete t.max),mapp.ui.layers.filters.applyFilter(e)}function Ti(e,t){se(e,t),t.li?.classList.remove("selected"),t.card?.remove(),t.histogram?.removeChangeEnd?.(),delete t.selected,delete t.card,e.filter.list?.some(i=>i.card)||(e.filter.clearAll instanceof HTMLElement&&e.filter.clearAll.style.setProperty("display","none"),e.filter.resetAll instanceof HTMLElement&&e.filter.resetAll.style.setProperty("display","none"),e.filter.feature_count instanceof HTMLElement&&e.filter.feature_count.style.setProperty("display","none"))}async function Oi(e,t){if(se(e,t),!t.card)return;t.content=[await mapp.ui.layers.filters[t.type](e,t)].flat();let i=mapp.ui.elements.card(t);t.card.replaceWith(i),t.card=i}function rt(e,t){return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${i=>{i.target.value.length?(e.filter.current[t.field]??={},e.filter.current[t.field][t.type]=encodeURIComponent(`${t.leading_wildcard&&"%"||""}${i.target.value}`)):delete e.filter.current[t.field],f.applyFilter(e)}}>`}function qi(e,t){function i(o){e.filter.current[t.field]={boolean:o},f.applyFilter(e)}return i(!1),mapp.ui.elements.chkbox({label:t.label||t.title||"chkbox",onchange:i})}function Fi(e,t){function i(o){e.filter.current[t.field]={null:o},f.applyFilter(e)}return i(!1),mapp.ui.elements.chkbox({label:t.label||t.title||"chkbox",onchange:i})}async function ht(e,t){let i=mapp.utils.queryParams({layer:e,queryparams:{table:!0,template:"field_minmax",field:t.field},viewport:e.filter.viewport});i.filter=structuredClone(e.filter.current),delete i.filter[t.field];let o=mapp.utils.paramString(i),l=await mapp.utils.xhr(`${e.mapview.host}/api/query?${o}`),n=isNaN(t.min)?l.minmax[0]:t.min,a=isNaN(t.max)?l.minmax[1]:t.max;e.filter?.viewport&&(n=l.minmax[0],a=l.minmax[1]),t.min=t.type==="integer"?Math.round(n):parseFloat(n),t.max=t.type==="integer"?Math.round(a):parseFloat(a),t.min=t.val_a<t.min?t.val_a:t.min,t.max=t.val_b>t.max?t.val_b:t.max}async function ut(e,t){let i=e.infoj.find(n=>n.field===t.field);if(Object.assign(t,i),delete t.val_a,delete t.val_b,t.Min??=Number.isFinite(t.min)?t.min:void 0,t.Max??=Number.isFinite(t.max)?t.max:void 0,(isNaN(t.max)||isNaN(t.min))&&await ht(e,t),isNaN(t.min)||isNaN(t.max))return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;t.step??=t.type==="integer"?1:.01,e.filter.current[t.field]=Object.assign({gte:Number(t.min),lte:Number(t.max)},e.filter.current[t.field]),f.applyFilter(e);let o=t.prefix||t.suffix?`(${(t.prefix||t.suffix).trim()})`:"";return t.label_a??=`${mapp.dictionary.layer_filter_greater_than} ${o}`,t.label_b??=`${mapp.dictionary.layer_filter_less_than} ${o}`,t.val_a=e.filter.current?.[t.field]?.gte,t.val_b=e.filter.current?.[t.field]?.lte,t.callback_a=n=>{e.filter.current[t.field].gte=n,t.val_a=Number(n),f.applyFilter(e)},t.callback_b=n=>{e.filter.current[t.field].lte=n,t.val_b=Number(n),f.applyFilter(e)},t.slider=mapp.ui.elements.slider_ab(t),await Ii(t,e),mapp.utils.html`
    ${t.histogram?.container}
    ${t.slider}`}async function Ii(e,t){if(e.histogram&&(e.histogram===!0&&(e.histogram={}),e.histogram.container??=mapp.utils.html.node`<div>`,e.histogram.dataview??="histogram",e.histogram.options??={tooltip:!0},e.histogram.target??=e.histogram.container,e.histogram.layer??=t,e.histogram.queryparams??={field:e.field,table:!0,filter:!0},e.histogram.viewport??=t.filter.viewport,e.histogram.update||await mapp.ui.Dataview(e.histogram),e.histogram.viewport)){let i=function(){e.histogram.update()};t.mapview.Map.getTargetElement().addEventListener("changeEnd",i),e.histogram.removeChangeEnd=()=>{t.mapview.Map.getTargetElement().removeEventListener("changeEnd",i)}}}async function pt(e,t){if(se(e,t),!Array.isArray(t[t.type])){let l=structuredClone(e.filter?.current);delete l?.[t.field];let n=await mapp.utils.xhr(`${e.mapview.host}/api/query?`+mapp.utils.paramString({field:t.field,filter:l,layer:e.key,locale:e.mapview.locale.key,table:e.tableCurrent(),template:"distinct_values"}));if(!n)return console.warn(`Distinct values query did not return any values for field ${t.field}`),mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;t[t.type]=[n].flat().map(a=>a[t.field]).filter(a=>a!==null)}let i=new Set(e.filter?.current[t.field]?.[t.type]||[]);if(t.dropdown||t.dropdown_pills||t.dropdown_search){let l=mapp.ui.elements.dropdown({callback:async(n,a)=>{a.length?Object.assign(e.filter.current,{[t.field]:{[t.type]:a}}):delete e.filter.current[t.field],f.applyFilter(e)},field:t.field,search:t.dropdown_search,entries:t[t.type].map(n=>({option:n,selected:i.has(n),title:n})),inputfilter:!0,keepPlaceholder:t.dropdown_pills,maxHeight:300,multi:!0,pills:t.dropdown_pills,placeholder:t.placeholder||mapp.dictionary.layer_filter_dropdown_select});return mapp.utils.html.node`<div class="filter">${l}`}if(t.searchbox){let l=mapp.utils.html.node`<div class="filter">`,n=mapp.ui.elements.pills({pills:e.filter?.current[t.field]?.[t.type],addCallback:(s,d)=>{Object.assign(e.filter.current,{[t.field]:{[t.type]:[...d]}}),f.applyFilter(e)},removeCallback:(s,d)=>{d.size===0?(a.input.value=null,delete e.filter.current[t.field]):Object.assign(e.filter.current,{[t.field]:{[t.type]:[...d]}}),f.applyFilter(e)},target:l}),a=mapp.ui.elements.searchbox({placeholder:mapp.dictionary.filter_searchbox_placeholder,searchFunction:s=>{if(a.list.innerHTML="",!s.target.value)return;let d=s.target.value,c=t[t.type].filter(u=>u.toString().toLowerCase().startsWith(d.toLowerCase()));if(!c.length){a.list.append(mapp.utils.html.node`
            <li><span>${mapp.dictionary.no_results}`);return}c.filter(u=>!n.pills.has(u)).filter((u,b)=>b<9).forEach(u=>{a.list.append(mapp.utils.html.node`
              <li onclick=${()=>{!n.pills.has(u)&&n.add(u)}}>${u}`)})},target:l});return l}let o=t[t.type].map(l=>mapp.ui.elements.chkbox({checked:i.has(l),label:l,onchange:(n,a)=>{if(n)e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field][t.type]||(e.filter.current[t.field][t.type]=[]),e.filter.current[t.field][t.type].push(a);else{let s=e.filter.current[t.field][t.type].indexOf(a);e.filter.current[t.field][t.type].splice(s,1),e.filter.current[t.field][t.type].length||delete e.filter.current[t.field]}f.applyFilter(e)},val:l}));return mapp.utils.html.node`<div class="filter">${o}`}function mt(e,t){let i=mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${l}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`,o=mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${l}
      type=${t.type==="datetime"&&"datetime-local"||"date"}>`;function l(n){n.target.dataset.id==="inputAfter"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{gt:new Date(n.target.value).getTime()/1e3})),n.target.dataset.id==="inputBefore"&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{lt:new Date(n.target.value).getTime()/1e3})),f.applyFilter(e)}return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${i}</label>
      <label>Date before
        ${o}</label>`}function de(e){let t=e.style.theme;t.legend??={},t.legend.grid=[],e.style.theme.style??={},e.style.theme.style.width??=24,e.style.theme.style.height??=24;let i=mapp.ui.elements.legendIcon(e.style.theme.style);return t.legend.grid.push(mapp.utils.html`
    <div 
      class="contents">
      ${i}<div class="label" style="grid-column: 2";>${e.style.theme.label}`),t.legend.node=mapp.utils.html.node`
    <div class="legend">
    <div class="contents-wrapper grid">${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}function _(e,t,i){if(e.field??=t.field,e.disabled??=i.filter?.current[e.field]?.ni?.includes(e.value),e.disabled||(e.style??=e._style),i.featureFields&&t.distribution==="count"){let d={value:i.featureFields[e.field]?.[e.value]};if(e.count=mapp.utils.formatNumericValue(d),!e.disabled&&!t.legend?.showEmptyCat&&!e.count)return}let o=mapp.ui.elements.legendIcon({height:24,width:24,...e._style||e.style}),l=mapp.utils.html`<div
    style="height: 24px; width: 24px; grid-column: 1;">
    ${o}`,n=["label"];i.filter&&n.push("switch"),e.disabled&&n.push("disabled");let a=e.label+(e.count?` [${e.count}]`:""),s=mapp.utils.html.node`<div
    class=${n.join(" ")}>
    ${a}`;return s.onclick=d=>ce(d,i,e),e.node=mapp.utils.html.node`<div
    data-id=${e.value}
    class="contents">
    ${l}${s}`,e.node}function ce(e,t,i){e.target.classList.toggle("disabled")?(i.disabled=!0,zi(t,i),i._style=i.style,i.style=null):(delete i.disabled,Di(t,i),i._style??=i.style,i.style=i._style,delete i._style),t.style.theme.filterOnly?t.L.changed():t.reload()}async function zi(e,t){if(e.style.theme.filterOnly)return;let i=e.filter.list?.find(l=>l.type==="in"&&l.field===t.field);i?.card&&mapp.ui.layers.filters.removeFilter(e,i),e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field].ni||(e.filter.current[t.field].ni=[]),e.filter.current[t.field].ni.push(t.keys||t.value),e.filter.current[t.field].ni=e.filter.current[t.field].ni.flat();let o=e.filter.list?.find(l=>l.type==="ni"&&l.field===t.field);if(o?.card){let l=await mapp.ui.layers.filters.ni(e,o);o.card.querySelector(".filter").replaceWith(l)}}async function Di(e,t){if(e.style.theme.filterOnly)return;if(Array.isArray(t.keys))for(let o of o.keys)e.filter.current[o.field].ni.splice(e.filter.current[o.field].ni.indexOf(key),1);else e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(t.value),1);e.filter.current[t.field].ni.length||(delete e.filter.current[t.field].ni,Object.keys(e.filter.current[t.field]).length||delete e.filter.current[t.field]);let i=e.filter.list?.find(o=>o.type==="ni"&&o.field===t.field);if(i?.card){let o=await mapp.ui.layers.filters.ni(e,i);i.card.querySelector(".filter").replaceWith(o)}}function x(e){let t=mapp.utils.html`<div
    style="height: 40px; width: 40px;">
    ${mapp.ui.elements.legendIcon({height:40,icon:e.style.cluster.icon,width:40})}`,i=mapp.utils.html`<div
    class="label">
    ${mapp.dictionary.layer_style_cluster}`;return mapp.utils.html`<div
    data-id="cluster"
    class="contents">
    ${t}${i}`}function v(e){e.legend??={},e.legend.layout??="grid";let t=["contents-wrapper",e.legend.layout];e.legend.nowrap&&t.push("nowrap"),e.legend.classList=t.join(" ")}function k(){return mapp.utils.html`<div
    class="switch-all"
    style="grid-column: 1/3;">
    ${mapp.dictionary.layer_style_switch_caption}
    <button
      class="bold"
      onclick=${e=>{let t=[...e.target.closest(".legend").querySelectorAll(".switch")],i=t.filter(o=>o.classList.contains("disabled"));i.length==0||i.length==t.length?t.forEach(o=>o.click()):i.forEach(o=>o.click())}}>${mapp.dictionary.layer_style_switch_all}
    </button>.`}function re(e){let t=e.style.theme;v(t),t.legend.grid=t.categories.map(o=>_(o,t,e)).filter(o=>o!==void 0),e.style.cluster&&t.legend.grid.push(x(e));let i=k();return t.legend.node=mapp.utils.html.node`
    <div class="legend">
      ${i}
      <div class=${t.legend.classList}>
        ${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}function y(e){e.style.theme.filterOnly=!0;let t=e.style.theme;if(v(t),!t.hideLegend){t.legend.grid=[];for(let i of t.categories)i.label=i.values?.join(", "),i.label!==void 0&&t.legend.grid.push(_(i,t,e));return e.style.cluster&&t.legend.grid.push(x(e)),t.legend.node=mapp.utils.html.node`
    <div class="legend">
      <div class=${t.legend.classList}>
        ${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),e.L.once("postrender",()=>{t.key===e.style.theme.key&&y(e)}),t.legend.node}}function ue(e){let t=e.style.theme;t.filterOnly=!0,v(t),t.legend??={};let i=t.categories.filter(l=>l.value!==void 0).map(l=>{let n=`contents ${t.legend?.horizontal?"horizontal":""}`,a=mapp.ui.elements.legendIcon({height:24,width:24,...l._style||l.style});l.label??=l.value;let s=`label switch ${l.disabled?"disabled":""}`;return mapp.utils.html`<div 
        data-id=${l.value}
        class=${n}>
        <div 
          style="height: 24px; width: 24px; grid-column: 1;">
          ${a}
        </div>
        <div 
          class=${s}
          style="grid-column: 2;"
          onclick=${d=>ce(d,e,l)}>
          ${l.label}`}),o=k();return t.legend.node=mapp.utils.html.node`
    <div class="legend">
      ${o}
      <div class=${t.legend.classList}>
        ${i}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}var gt={basic:de,categorized:re,distributed:y,graduated:ue};function pe(e){if(!e.target)return;let t={add:Ai,createGroup:Bi,groups:{},node:e.target};return typeof e.layers=="object"&&Object.values(e.layers).length&&Object.values(e.layers).forEach(i=>t.add(i)),t}function Ai(e){if(!e.hidden){if(mapp.ui.layers.view(e),!e.group){this.node.append(e.view),this.node.dispatchEvent(new CustomEvent("addLayerView",{detail:e}));return}this.groups[e.group]||this.createGroup(e),this.groups[e.group].addLayer(e),this.node.dispatchEvent(new CustomEvent("addLayerView",{detail:e}))}}function Bi(e){let t={list:[]};this.groups[e.group]=t,t.hideLayers=mapp.utils.html.node`<button
  class="notranslate material-symbols-outlined active"
    title=${mapp.dictionary.layer_group_hide_layers}
    onclick=${i=>{i.target.style.visibility="hidden",t.list.filter(o=>o.display).forEach(o=>o.hide())}}>visibility_off`,t.meta=mapp.utils.html.node`<div class="meta">`,t.drawer=mapp.ui.elements.drawer({class:`layer-group ${e.groupClassList||""}`,content:t.meta,data_id:e.group,header:mapp.utils.html`
       <h2>${e.group}</h2>
       ${t.hideLayers}`}),this.node.appendChild(t.drawer),t.chkVisibleLayer=Mi,t.addLayer=Ni}function Ni(e){if(e.groupmeta){let t=mapp.utils.html.node`<div>`;t.innerHTML=e.groupmeta,mapp.utils.render(this.meta,t)}this.list.push(e),this.drawer.appendChild(e.view),this.chkVisibleLayer(),e.showCallbacks.push(()=>this.chkVisibleLayer()),e.hideCallbacks.push(()=>this.chkVisibleLayer())}function Mi(){this.hideLayers.style.visibility=this.list.some(e=>e.display)?"visible":"hidden"}function me(e){let t=[];for(let[o,l]of Object.entries(e.dataviews))if(!(typeof l=="string"||l===!0||l===!1)){if(Object.assign(l,{host:e.mapview.host,key:o,layer:e}),Vi(l),l.tabview&&mapp.utils.mobile()||(l.label??=l.title||l.key,mapp.ui.utils.dataviewDialog(l),l.target=l.target instanceof HTMLElement?l.target:mapp.utils.html.node`
        <div class="dataview-target">`,mapp.ui.Dataview(l)instanceof Error))return;e.display&&l.display&&l.show(),e.showCallbacks.push(()=>{l.display&&(l.chkbox.querySelector("input").checked=!0,l.show())}),e.hideCallbacks.push(()=>{l.display&&(l.chkbox.querySelector("input").checked=!1,l.hide())}),t.push(l.chkbox),!l.tabview&&!l.dataview_dialog&&t.push(l.target)}return e.dataviews.hide?void 0:(e.dataviews.dialog&&(e.dataviews.dialog={btn_label:"Dataviews",title:"Dataviews",icon:"table_view",...e.dataviews.dialog}),mapp.ui.elements.drawer({drawer:e.dataviews.drawer,class:e.dataviews.classList||"",content:t,data_id:`${e.key}-dataviews-drawer`,layer:e,header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>`,popout:e.dataviews.popout,dialog:e.dataviews.dialog}))}function Vi(e){e.tabview=document.querySelector(`[data-id=${e.target}]`),e.tabview&&(e.show??=()=>{e.tabview.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.show()},e.hide??=()=>{e.display=!1,e.remove()})}function fe(e){if(typeof e.draw!="object"||e.draw.hidden)return;if(!e.geom){console.warn(`Layer: ${e.key} - You must have a geom property to draw new features.`);return}let t=Object.keys(e.draw).map(i=>mapp.ui.elements.drawing[i]?.(e)).filter(i=>!!i);if(t.length)return e.draw.content=mapp.utils.html`${t}`,e.draw.dialog&&(e.draw.dialog={btn_label:"Drawing",title:"Drawing",icon:"new_label",...e.draw.dialog}),e.draw.drawer===!1?e.draw.view=e.draw.dialog?.btn||mapp.utils.html.node`<div data-id="draw-drawer">
        <h3>${mapp.dictionary.layer_add_new_location}</h3>
        ${e.draw.content}`:e.draw.view=mapp.ui.elements.drawer({data_id:`${e.key}-draw-drawer`,dialog:e.draw.dialog,layer:e,header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,content:e.draw.content,class:e.draw.classList,popout:e.draw.popout}),e.draw.view}function he(e){if(Hi(e),!e.filter.hidden&&e.infoj&&(e.filter.list=Pi(e),!!e.filter.list.length))return e.filter.dropdown=mapp.ui.elements.dropdown({callback:async(t,i,o)=>{if(!o.selected){mapp.ui.layers.filters.removeFilter(e,o),L(e);return}if(!o?.card){if(e.filter.clearAll.style.display="inline-block",e.filter.resetAll.style.display="inline-block",L(e),o.content=[await mapp.ui.layers.filters[o.type](e,o)].flat(),o.meta&&o.content.unshift(mapp.utils.html.node`<p>${o.meta}`),o.header=o.title,o.close=()=>mapp.ui.layers.filters.removeFilter(e,o),o.card=mapp.ui.elements.card(o),e.filter.dialog?.view)return e.filter.dialog.view.append(o.card);if(e.filter.drawer?.popout?.view?.checkVisibility?.())return e.filter.drawer.popout.view.append(o.card);e.filter.view.querySelector(".content").append(o.card)}},data_id:`${e.key}-filter-dropdown`,entries:e.filter.list,keepPlaceholder:!0,multi:!0,placeholder:mapp.dictionary.filter_select}),e.filter.clearAll=mapp.utils.html.node`<button
    data-id=clearall
    class="flat underline"
    onclick=${t=>{e.filter.list.forEach(i=>mapp.ui.layers.filters.removeFilter(e,i))}}>${mapp.dictionary.filter_clear_all}`,e.filter.resetAll=mapp.utils.html.node`<button
    data-id=resetall
    class="flat underline"
    onclick=${t=>{e.filter.list.forEach(i=>mapp.ui.layers.filters.resetFilter(e,i))}}>${mapp.dictionary.filter_reset_all}`,e.filter.count=mapp.utils.html.node`<span class="bold">`,e.changeEndCallbacks.push(L),e.showCallbacks.push(L),e.hideCallbacks.push(t=>{t.filter.clearAll?.checkVisibility()&&t.filter.feature_count.style.setProperty("display","none")}),e.filter.count_meta??=mapp.dictionary.filter_count,e.filter.feature_count=mapp.utils.html.node`
    <p style="display:none">${e.filter.count} ${e.filter.count_meta}`,e.filter.viewport_description??=e.filter.viewport?mapp.dictionary.filter_in_viewport:mapp.dictionary.filter_not_in_viewport,e.filter.viewport_description=mapp.utils.html.node`<p style="display:none"><i>${e.filter.viewport_description}</i>`,e.filter.content=[e.filter.dropdown,e.filter.clearAll,e.filter.resetAll,e.filter.feature_count,e.filter.viewport_description],e.filter.dialog&&(e.filter.filter_list=mapp.utils.html.node`
      <div id=filter-list class=filter-list>`,e.filter.content=[mapp.utils.html`<p class=bold>${e.name}</p>`,e.filter.feature_count,e.filter.viewport_description,e.filter.clearAll,e.filter.resetAll,e.filter.dropdown,e.filter.filter_list],e.filter.content=mapp.utils.html.node`${e.filter.content}`,e.filter.dialog&&(e.filter.dialog={btn_label:"Filtering",title:"Filtering",icon:"filter_alt",view:e.filter.filter_list,...e.filter.dialog}),e.filter.clearAll.style.display="inline-block",e.filter.resetAll.style.display="inline-block"),e.filter.drawer={drawer:e.filter.drawer,data_id:"filter-drawer",class:e.filter.classList||"",header:mapp.utils.html`
        <h3>${mapp.dictionary.filter_header}</h3>`,content:e.filter.dialog?.btn||e.filter.content,popout:e.filter.popout,dialog:e.filter.dialog,view:e.view,layer:e},e.filter.view=mapp.ui.elements.drawer(e.filter.drawer),e.filter.view}var bt={numeric:"numeric",integer:"integer",text:"like",date:"date",datetime:"datetime",boolean:"boolean"};function Pi(e){let t=[];e.filter.include??=[],e.filter.exclude??=[];for(let i of e.infoj)if(!(i.skipEntry===!0||i.field===void 0||e.filter.exclude.includes(i.field))){if(e.filter.includeAll||e.filter.include.includes(i.field)||i.filter===!0){if(i.type??="text",!Object.hasOwn(bt,i.type))continue;Object.keys(i.filter||{}).length||(i.filter=bt[i.type])}typeof i.filter=="string"&&(i.filter={type:i.filter}),!(!i.filter?.type||!Object.hasOwn(mapp.ui.layers.filters,i.filter.type))&&(i.filter.title??=i.title,i.filter.field??=i.field,t.push(structuredClone(i.filter)))}return t}function L(e){e.display&&(clearTimeout(e.filter.debounce),e.filter.debounce=setTimeout(async()=>{for(let t of e.filter.list){if(!Object.hasOwn(e.filter.current,t.field)||t.min===void 0||t.max===void 0||t.Min&&t.Max||(await mapp.ui.layers.filters.generateMinMax(e,t),t.max-t.min===0))continue;let o=mapp.ui.elements.slider_ab(t);t.slider.replaceWith(o),t.slider=o}mapp.ui.utils.locationCount(e).then(t=>{let i=mapp.utils.formatNumericValue({value:t});e.filter.count.innerText=i,e.filter.feature_count.style.setProperty("display","block")})},1e3))}function Hi(e){e.multi_filter&&(mapp.layer.multi_filter||(delete e.filter.hidden,e.filter.dialog=!0,e.filter.drawer=!1,e.filter.includeAll=!0))}var vt=e=>{let t={layer:e.key,mapview:e.mapview,target:mapp.utils.html.node`<div>`,...e.gazetteer};return mapp.ui.Gazetteer(t),t.target};function ge(e){e.jsonEditor===!0&&(e.jsonEditor={});let t=mapp.utils.html.node`<button class="wide flat" data-id="jsonEditor">JSON Editor</button>`;return t.addEventListener("click",async()=>{t.classList.toggle("active");let i=mapp.utils.jsonParser(e),o=mapp.utils.html.node`<div>`,l={className:"text-button",onClick:()=>Ri(n,e),text:"Update Layer",title:"Update Layer",type:"button"},n=await mapp.ui.utils.layerJSE(o,{json:i},l);e.jsonEditor.dialog=mapp.ui.elements.dialog({header:mapp.utils.html.node`<div>`,css_style:"width: 500px; height 300px;",containedCentre:!0,contained:!0,closeBtn:!0,onClose:()=>{t.classList.toggle("active")},content:o})}),e.removeCallbacks.push(i=>{i.jsonEditor?.dialog?.close()}),t}async function Ri(e,t){let i=e.get(),o=JSON.parse(i.text);await t.update(o)}function be(e){let t=mapp.utils.html.node`<p data-id="meta" class="meta">`;return t.innerHTML=e.meta,t}function ve(e){let t=[];for(let[o,l]of Object.entries(e.reports)){if(typeof l=="boolean")continue;l.key=o,l.label??=o,l.layer=e,l.template&&(l.report={template:l.template});let n=mapp.ui.elements.reportLink(l);t.push(n)}return e.reports.dialog&&(e.reports.dialog={btn_label:"Reports",title:"Reports",icon:"summarize",...e.reports.dialog}),mapp.ui.elements.drawer({drawer:e.reports.drawer,class:e.reports.classList||"",data_id:"reports-drawer",header:mapp.utils.html`
      <h3>Reports</h3>`,content:mapp.utils.html`${t}`,popout:e.reports.popout,dialog:e.reports.dialog,layer:e})}function we(e){if(e.style.hidden)return;e.style.elements??=["labels","label","hovers","hover","themes","theme","icon_scaling","opacitySlider"];let t=mapp.ui.elements.layerStyle.panel(e);if(!t)return;e.style.classList??="";let i=mapp.utils.html`
    <h3>${mapp.dictionary.layer_style_header}</h3>`;return e.style.dialog&&(e.style.dialog={btn_label:"Styling",title:"Styling",icon:"brush",...e.style.dialog}),e.style.drawer=mapp.ui.elements.drawer({drawer:e.style.drawer,data_id:"style-drawer",class:e.style.classList,header:i,content:t,popout:e.style.popout,dialog:e.style.dialog,layer:e}),e.style.drawer}var wt={dataviews:me,draw:fe,filter:he,gazetteer:vt,jsonEditor:ge,meta:be,reports:ve,style:we};function $e(e){if(e.view===null)return;Ui(e);let t=mapp.utils.html`
    <h2>${e.name}</h2>
    ${e.viewConfig.headerBtn}`;e.view=mapp.ui.elements.drawer({drawer:e.viewConfig.drawer,data_id:e.key,class:e.viewConfig.classList,header:t,content:e.viewConfig.content,popout:e.viewConfig.popoutBtn}),e.changeEndCallbacks.push(Wi)}function Ui(e){e.viewConfig={displayToggle:!0,zoomBtn:!0,zoomToFilteredExtentBtn:!0,hideDisabled:!1,...e.viewConfig},e.viewConfig.drawer??=e.drawer,e.zoomBtn===!1&&(delete e.viewConfig.zoomBtn,delete e.zoomBtn),e.viewConfig.popoutBtn??=e.popout,e.tables||(delete e.viewConfig.zoomBtn,delete e.viewConfig.hideDisabled),e.viewConfig.panelOrder??=e.panelOrder,delete e.panelOrder,e.viewConfig.keyOrder??=["meta","style","filter","dataviews","draw"],e.viewConfig.content=Object.keys(e).sort((t,i)=>{let o=e.viewConfig.keyOrder.indexOf(t),l=e.viewConfig.keyOrder.indexOf(i);return o===-1&&(o=1/0),l===-1&&(l=1/0),o-l}).map(t=>mapp.ui.layers?.panels?.[t]?.(e)).filter(t=>t!==void 0),Array.isArray(e.viewConfig.panelOrder)&&(console.warn(`Layer [${e.key}] has the legacy panelOrder config with inverted logic; please use viewConfig.keyOrder array!`),e.viewConfig.content.sort((t,i)=>{let o=e.viewConfig.panelOrder.indexOf(t.dataset?.id),l=e.viewConfig.panelOrder.indexOf(i.dataset?.id);return o<l?1:-1})),e.viewConfig.classList??=e.classList||"",e.viewConfig.classList+=" layer-view ",e.viewConfig.classList+=e.viewConfig.content.length?"":" empty ",Array.isArray(e.viewConfig.headerOrder)||(e.viewConfig.headerOrder=["zoomToFilteredExtentBtn","zoomBtn","popoutBtn","displayToggle"].filter(t=>e.viewConfig[t])),e.viewConfig.headerBtn??=[];for(let t of e.viewConfig.headerOrder){let i=mapp.ui.layers.viewHeader[t]?.(e);e.viewConfig.headerBtn.push(i)}}function Wi(e){if(!e.tableCurrent)return;let t=Array.from(e.view.querySelectorAll(":scope > :not(.header)"));e.tableCurrent()?(e.viewConfig.hideDisabled&&e.view.classList.remove("display-none"),e.zoomBtn instanceof HTMLElement&&e.zoomBtn.style.setProperty("display","none"),e.view.querySelector('[data-id="display-toggle"]')?.classList.remove("disabled"),t.forEach(i=>{i.disabled=!1,i.classList.remove("disabled")})):(e.table||e.tables)&&(e.zoomBtn instanceof HTMLElement&&e.zoomBtn.style.removeProperty("display"),e.view.classList.remove("expanded"),[...e.view.querySelectorAll(".expanded")].forEach(o=>o.classList.remove("expanded")),e.view.querySelector('[data-id="display-toggle"]')?.classList.add("disabled"),t.forEach(o=>{o.disabled=!0,o.classList.add("disabled")}),e.viewConfig.hideDisabled&&e.view.classList.add("display-none"))}var $t={zoomToFilteredExtentBtn:Ji,zoomBtn:Gi,popoutBtn:Yi,displayToggle:Xi};function Ji(e){let t=Object.keys(e.filter.current).length?"":"display: none;",i=mapp.utils.html.node`<button
    data-id=zoomToFilteredExtentBtn
    title=${mapp.dictionary.layer_zoom_to_extent}
    style=${t}
    class="notranslate material-symbols-outlined"
    onclick=${async l=>{l.target.disabled=!await e.zoomToExtent(),e.show()}}>filter_alt`;function o(l){Object.keys(l.filter.current).length?i.style.display="inline-block":i.style.display="none"}return e.changeEndCallbacks.push(o),i}function Gi(e){let t=mapp.utils.html.node`<button
    data-id="zoom-to"
    title=${mapp.dictionary.zoom_to}
    class="notranslate material-symbols-outlined"
    onclick=${()=>Zi(e)}>arrows_input`;function i(o){if(o.tableCurrent()){t.style.display="none";return}t.style.display="block"}return e.changeEndCallbacks.push(i),t}function Zi(e){let t=Object.entries(e.tables).find(l=>!!l[1])[0],i=Object.entries(e.tables).reverse().find(l=>!!l[1])[0],o=e.mapview.Map.getView();o.getZoom()<t?o.setZoom(t):o.setZoom(i),e.show()}function Yi(e){return mapp.utils.html.node`<button
    data-id="popout-btn"
    class="notranslate material-symbols-outlined">open_in_new`}function Xi(e){let t=`notranslate material-symbols-outlined toggle ${e.zoomDisplay||e.display?"toggle-on":""}`,i=mapp.utils.html.node`<button
    data-id=display-toggle
    title=${mapp.dictionary.layer_visibility}
    class=${t}
    onclick=${o=>{o.target.classList.toggle("toggle-on")?e.show():e.hide()}}>`;return e.showCallbacks.push(()=>{i.classList.add("toggle-on")}),e.hideCallbacks.push(()=>{!e.zoomDisplay&&i.classList.remove("toggle-on")}),i}var _t={filters:ft,legends:gt,listview:pe,panels:wt,view:$e,viewHeader:$t};function _e(e){if(e.edit)return mapp.ui.elements.chkbox({checked:e.newValue!==void 0?e.newValue:e.value,disabled:!e.edit,label:e.label||e.title,onchange:i=>{e.newValue=i,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}});e.label??="";let t=e.value?"check":"close";return mapp.utils.html.node`
    <div class="link-with-img">
      <div class="notranslate material-symbols-outlined">${t}</div>
      <span>${e.label}`}var kt={documents:eo,image:Qi,images:Ki},C=e=>kt[e.type](e);function Qi(e){if(e.value){let t=e.edit&&mapp.utils.html`<button 
      title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${e.value.replace(/^.*\//,"").replace(/\.([\w-]{3})/,"")}
      data-src=${e.value}
      onclick=${i=>xe(i,e,mapp.dictionary.remove_image_confirm)}>delete`;return mapp.utils.html.node`<div class="img-item"><img
      style="width: 100%"
      src=${e.value}
      onclick=${mapp.ui.utils.imagePreview}>
      ${t}`}else if(e.edit)return mapp.utils.html.node`<div 
      class="drag_and_drop_zone"
      ondrop=${t=>{t.preventDefault(),w(t,e)}}>
      <p><span class="notranslate material-symbols-outlined add">add_a_photo</span>${mapp.dictionary.drag_and_drop_image}</p>
      <input
        type="file"
        accept="image/*;capture=camera" onchange=${t=>{w(t,e)}}>`}function Ki(e){let t=[];if(e.value?.map(i=>{let o=e.edit&&mapp.utils.html`<button title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${i.replace(/^.*\//,"").replace(/\.([\w-]{3})/,"")}
      data-src=${i}
      onclick=${l=>xe(l,e,mapp.dictionary.remove_image_confirm)}>delete`;t.push(mapp.utils.html`<div class="img-item"><img 
      src=${i}
      onclick=${mapp.ui.utils.imagePreview}>
      ${o}`)}),e.edit){let i=mapp.utils.html.node`<div 
      class="drag_and_drop_zone mobile-display-none"
      ondrop=${o=>{o.preventDefault(),w(o,e)}}>
      <p><span class="notranslate material-symbols-outlined add">add_a_photo</span>${mapp.dictionary.drag_and_drop_image}</p>
      <input
        type="file"
        accept="image/*;capture=camera" onchange=${o=>{w(o,e)}}>`;t.push(i)}if(t.length)return mapp.utils.html.node`<div class="images-grid">${t}`}function eo(e){let t=[];if(e.value?.map(i=>{let o=e.edit&&mapp.utils.html`<button 
      title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${i.replace(/^.*\//,"").replace(/\.([\w-]{3})/,"")}
      data-href=${i}
      onclick=${n=>xe(n,e,mapp.dictionary.remove_document_confirm)}>delete`,l=i.replace(/^.*\//,"").replace(/\.([\w-]{3})/,"");t.push(mapp.utils.html`<div class="link-with-img">
      <a target="_blank" href=${i}>${l}</a>${o}`)}),e.edit){let i=mapp.utils.html.node`<div 
      class="drag_and_drop_zone mobile-display-none"
      ondrop=${o=>{o.preventDefault(),w(o,e)}}>
      <p><span class="notranslate material-symbols-outlined add-doc">add_notes</span>${mapp.dictionary.drag_and_drop_doc}</p>
      <input type="file"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
        onchange=${o=>w(o,e)}>`;t.unshift(i)}if(t.length)return mapp.utils.html.node`<div>${t}`}async function w(e,t){let i=new FileReader,o=e.type==="drop"?e.dataTransfer?.files[0]:e.target.files[0];if(!o)return;t.location.view?.classList.add("disabled");let l={documents:io,image:xt,images:xt};i.onload=n=>l[t.type](n,t,o),i.readAsDataURL(o)}function xt(e,t,i){let o=new Image;o.onload=async()=>to(t,o,i),o.src=e.target.result}async function to(e,t,i){let o=document.createElement("canvas");e.max_size??=1024,t.width>t.height&&t.width>e.max_size?(t.height*=e.max_size/t.width,t.width=e.max_size):t.height>e.max_size&&(t.width*=e.max_size/t.height,t.height=e.max_size),o.width=t.width,o.height=t.height,o.getContext("2d").drawImage(t,0,0,t.width,t.height);let l=i.name.replace(/^.*\//,"").replace(/\.([\w-]{3})/,"")+e.suffix_date?`@${Date.now()}`:"",n=await ye(e,{public_id:l});if(!n)return;let a=new FormData;a.append("file",o.toDataURL("image/jpeg",.5));let s=await fetch(n,{body:a,method:"post"});if(!s||s.error){let u=`Cloudinary Image upload failed! ${s?.error?.message?`Error: ${s.error.message}`:""}`;mapp.ui.elements.alert({text:u});return}let d=await s.json();e.type==="image"?e.value=d.secure_url:e.value=Array.isArray(e.value)?e.value.concat([d.secure_url]):[d.secure_url],ke(e)}async function io(e,t,i){let o=new Date,l=`${o.getMonth()+1}-${o.getDate()}T${o.getHours()}:${o.getMinutes()}`,n=i.name.substring(i.name.lastIndexOf(".")),a=`${i.name.replace(n,"")}-${l}${n}`,s=await ye(t,{public_id:a});if(!s)return;let d=new FormData;d.append("file",e.target.result.toString());let c=await fetch(s,{body:d,method:"post"});if(!c||c.error){let b=c?.error?.message?`Error: ${c.error.message}`:"";mapp.ui.elements.alert(`Cloudinary document upload failed! ${b}`);return}let u=await c.json();t.value=Array.isArray(t.value)?t.value.concat([u.secure_url]):[u.secure_url],ke(t)}async function xe(e,t,i){if(!await mapp.ui.elements.confirm({text:i}))return;let l=decodeURIComponent(e.target.dataset.name),n=await ye(t,{destroy:!0,public_id:l});if(!n)return;await fetch(n,{method:"post"});let a=new Set(t.value);a.delete(e.target.dataset.src||e.target.dataset.href),t.type==="image"?t.value=null:t.value=a.size?Array.from(a):null,ke(t)}async function ke(e){e.location.view?.classList.add("disabled"),await mapp.utils.xhr({body:JSON.stringify({[e.field]:e.value}),method:"POST",url:`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({id:e.location.id,layer:e.location.layer.key,locale:e.location.layer.mapview.locale.key,table:e.location.table,template:e.location.updateTemplate})}),e.node.replaceChildren(mapp.utils.html.node`<div class="label">${e.title}`,kt[e.type](e)),e.location.view?.classList.remove("disabled")}async function ye(e,t){let i=mapp.utils.paramString({...t,folder:e.cloudinary_folder}),o=await mapp.utils.xhr({responseType:"text",url:`${e.location.layer.mapview.host}/api/sign/cloudinary?${i}`});return o instanceof Error&&console.error(o),o}function Le(e){if(e.value!==void 0&&(e.data=e.value),e.data?.length===0&&(e.data=null),e.layer??=e.location.layer,oo(e),e.target instanceof HTMLElement){if(!e.display&&typeof e.create=="function")return mapp.utils.html.node`
    ${e.chkbox||""}
    ${e.locationViewTarget||""}`;if(!(!e.create&&mapp.ui.Dataview(e)instanceof Error))return(!e.data||e.data instanceof Error)&&e.queryCheck&&(e.chkbox?.classList?.add?.("disabled"),e.chkbox.querySelector("input").checked=!1,e.display=!1,e.hide()),e.display&&e.show?.(),mapp.utils.html.node`
    ${e.chkbox||""}
    ${e.locationViewTarget||""}`}}function oo(e){if(e.target||(e.target="location"),typeof e.target!="string")return;if(e.target==="dialog"){mapp.ui.utils.dataviewDialog(e);return}if(document.getElementById(e.target)){e.target=document.getElementById(e.target),e.display=!0;return}if(document.querySelector(`[data-id=${e.target}]`)){if(mapp.utils.mobile())return;e.tabview??=document.querySelector(`[data-id=${e.target}]`),e.tab_style??=`border-bottom: 3px solid ${e.location.style?.strokeColor||"var(--color-primary)"}`,e.target=mapp.utils.html.node`
      <div class="dataview-target">`,e.tabview.dispatchEvent(new CustomEvent("addTab",{detail:e}));return}let t=`location ${e.key||e.query}`;e.locationViewTarget=mapp.utils.html.node`
    <div class="${t}">`,e.target=e.locationViewTarget}var Ce=lo;function lo(e){if(e.edit){e.newValue===!0&&(e.newValue=mapp.utils.temporal.dateToUnixEpoch(),e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e})));let o=e.newValue||e.value;typeof o=="string"&&console.warn(`${e.type} field: ${e.field} should be an integer.`);let l=mapp.utils.temporal[e.type](parseInt(o));return mapp.utils.html.node`<input
      type=${e.type==="datetime"?"datetime-local":"date"}
      value="${l}"
      onchange=${n=>{n.target.value===""?e.newValue=null:e.newValue=mapp.utils.temporal.dateToUnixEpoch(n.target.value),e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`}let t=e.value?mapp.utils.temporal.dateString(e):"null";return e.css_val??="",mapp.utils.html.node`<div
    class="val"
    style=${e.css_val}>
    ${t}`}function Ee(e){if(e.format??="GeoJSON",e.mapview??=e.location.layer.mapview,typeof e.value=="string"&&(e.value=JSON.parse(e.value)),e.srid??=e.location.layer.srid,e.zIndex??=e.location.layer.zIndex+1||99,e.display??=!1,e.edit?.draw&&(e.draw=e.edit.draw),e._edit?.draw&&delete e.draw,!e.value&&!e.draw&&!e.api){e.location.removeLayer(e);return}e.style!==null&&(e.style={...e.location.style,...e.style},e.Style??=mapp.utils.style(e.style)),e.show??=ao,e.hide??=so,e.getExtent??=no,e.modify??=uo,e.label??="Geometry",e.disabled=!e.value&&!e.api||e.error,e.chkbox=mapp.ui.elements.chkbox({checked:e.display,data_id:`chkbox-${e.key}`,disabled:e.disabled,label:e.label,onchange:i=>{i?e.show():e.hide()}}),Array.isArray(e.elements)||(e.elements=e.api_elements||[],po(e),co(e)),e.edit||delete e.elements;let t=mapp.ui.elements.legendIcon({height:24,width:24,...e.style});return e.display&&e.show(),mapp.utils.html.node`
    <div class="flex-spacer">${e.chkbox}${t}</div>
    ${e.elements}`}function no(){if(this.display&&this.L)return this.L.getSource().getExtent()}async function ao(){if(this.disabled)return;this.location.removeLayer(this),this.display=!0;let e=this.chkbox?.querySelector("input");if(e&&(e.checked=!0),!this.value&&this.api){if(this.blocking&&this.location.view?.classList.add("disabled"),await this.api(this),this.blocking)return;this.value||(this.disabled=!0)}this.value&&(this.L=this.location.layer.mapview.geometry(this),this.location.Layers.push(this))}function so(){this.display=!1,this.location.removeLayer(this)}function co(e){e.edit&&e.value&&(e.edit.modify_label??=mapp.dictionary.modify_geometry,e.edit.modify_btn=mapp.utils.html.node`
    <button
      class="action wide"
      data-id="modify-btn"
      onclick=${()=>{e.edit.modify_btn.classList.toggle("active")?e.modify():e.location.layer.mapview.interactions.highlight()}}>
      <span class="notranslate material-symbols-outlined">format_shapes</span>
      ${e.edit.modify_label}`,e.elements.push(e.edit.modify_btn),e.edit.delete_label??=mapp.dictionary.delete_geometry,e.edit.delete&&e.elements.push(mapp.utils.html`<button class="action wide"
    onclick=${()=>ro(e)}>
    <span class="notranslate material-symbols-outlined color-danger">ink_eraser</span>
    <span style="color: var(--color-danger)">${e.edit.delete_label}</span>`))}async function ro(e){if(await e.location.confirmUpdate(i)===null)return;i();function i(){e.display=!1,e.newValue=null,e.location.update(o)}function o(){delete e.elements,e.location.renderLocationView()}}async function uo(){let e=this;if(await e.location.confirmUpdate(()=>{e.location.renderLocationView()})===null){e.edit.modify_btn.classList.remove("active");return}if(!e.hideHelp){let o={content:mapp.utils.html.node`<li>
        <ul>${mapp.dictionary.edit_dialog_cancel_drawing}
        <ul>${mapp.dictionary.edit_dialog_remove_vertex}</ul>
        <ul>${mapp.dictionary.edit_dialog_modify_shape}</ul>
        <ul>${mapp.dictionary.edit_dialog_save}</ul>`,header:mapp.utils.html`<h3>${mapp.dictionary.edit_dialog_title}</h3>`};mapp.ui.elements.helpDialog(o)}!e.display&&e.show(),e.location.layer.mapview.Map.removeLayer(e.L);let i=e.L.getSource().getFeatures()[0].clone();e.location.layer.mapview.interactions.modify({Feature:i,layer:e.location.layer,snap:e.edit.snap,srid:e.srid,callback:o=>{e.edit.modify_btn.classList.remove("active"),yt(o,e)}})}function po(e){e.draw&&(Object.keys(e.draw).forEach(t=>{if(e.draw[t]===!0&&(e.draw[t]={}),mapp.ui.elements.drawing[t]){e.draw[t].callback??=o=>{e.draw[t].btn.classList.remove("active"),yt(o,e)};let i=mapp.ui.elements.drawing[t](e);e.draw.dialog&&e.edit?(e.draw.content??=[],i instanceof HTMLElement&&e.draw.content.push(i)):i instanceof HTMLElement&&e.elements.push(i)}}),mapp.ui.elements.drawer({layer:e,key:"draw",name:"Draw",icon:"new_label"}),e.edit&&e.draw?.dialog?.btn&&e.elements.push(e.draw.dialog.btn))}function yt(e,t){if(delete t.mapview.interaction,mapp.ui.elements.helpDialog(),!e){setTimeout(()=>{!t.mapview.interaction&&t.mapview.interactions.highlight()},400),t.location.renderLocationView();return}t.newValue=e.geometry,t.location.update(i);function i(){delete t.elements,t.location.renderLocationView()}}function Se(e){e.css_val??="",e.inline&&console.warn(`${e.key} - json entries cannot be inline, please remove inline true from entry`);let t=mapp.utils.html.node`<div
    class="val"
    style=${e.css_val}>`;e.data=e.newValue||e.value;function i(l){return l.filter(n=>n.text!=="tree").filter(n=>n.text!=="text").filter(n=>n.text!=="table").filter(n=>n.type!=="separator").filter(n=>n.className!=="jse-undo").filter(n=>n.className!=="jse-redo").filter(n=>n.className!=="jse-search").filter(n=>n.className!=="jse-contextmenu").filter(n=>n.className!=="jse-sort").filter(n=>n.className!=="jse-transform")}e.jsoneditor=mapp.ui.elements.jsoneditor({data:e.data,props:{mode:"text",onChange:o,onRenderMenu:i,readOnly:!e.edit},target:t});function o(l,n,a){a.contentErrors||(e.newValue=JSON.parse(l.text),e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e})))}return t}function je(e){e.hideLayer&&e.location.layer.hide();let t=`layer-key ${e.location.layer.display?"active":""}`;return mapp.utils.html.node`<div>
    <button 
      class=${t}
      title="${mapp.dictionary.layer_visibility}"
      onclick="${o=>{o.target.classList.toggle("active")?e.location.layer.show():e.location.layer.hide()}}">${e.location.layer.name}`}function E(e){return mo(e),e.mapview??=e.location.layer.mapview,fo(e),e.zIndex??=e.location.layer.zIndex++,ho(e),e.panel??=mapp.utils.html.node`<div class="entry-layer">`,e.panel}function mo(e){e.value!==void 0&&(e.data=e.value,e.data?.length===0&&(e.data=null)),(e.featureSet||e.featureLookup)&&(!e.query&&!e.data?(e.disabled=!0,e.display_toggle?.classList.add("disabled")):(e.disabled=!1,e.display_toggle?.classList.remove("disabled")))}function fo(e){if(!e.layer)return;e.key=e.layer;let t=structuredClone(e.mapview.locale.layers.find(o=>o.key===e.layer));if(!t){console.warn(`Layer [${e.layer}] not found in mapview.locale`);return}let i=Object.keys(t).filter(o=>!Object.hasOwn(e,o)).reduce((o,l)=>(o[l]=t[l],o),{});Object.assign(e,i),e.params??={},e.params.layer_template??=e.layer,delete e.layer}async function ho(e){if(e.L&&e.display){e.show();return}else if(e.L)return;e.source_key=e.key,await mapp.layer.decorate(e),e.L&&(e.location.Layers.push(e),e.key+=`-${e.location.id}`,e.L.set("key",e.key),e.show=go,e.hide=vo,e.mapview.layers[e.key]=e,e.display_toggle=mapp.ui.elements.chkbox({checked:e.display,data_id:`${e.key}-display`,disabled:e.disabled,label:e.name,onchange:t=>{t?e.show():e.hide()}}),e.tables&&(e.tableCurrent()||e.display_toggle.classList.add("disabled"),e.changeEndCallbacks.push(()=>{e.tableCurrent()?e.display_toggle.classList.remove("disabled"):e.display_toggle.classList.add("disabled")})),e.panel.append(e.display_toggle),e.meta&&e.panel.append(mapp.ui.layers.panels.meta(e)),e.style.elements??=["labels","label","hovers","hover","icon_scaling","opacitySlider","themes","theme"],e.style.panel=mapp.ui.elements.layerStyle.panel(e),e.style.default&&(e.style.default={...e.location?.style,...e.style.default}),e.style.panel?.style.setProperty("display","none"),e.style.panel&&e.panel.append(e.style.panel),e.location.removeCallbacks.push(()=>{e.remove()}),e.display&&e.show())}async function go(){let e=this;if(e.query){let t=mapp.utils.queryParams(e),i=mapp.utils.paramString(t);if(e.data=await mapp.utils.xhr(`${e.mapview.host}/api/query?${i}`),!e.data){e.disabled=!0,e.display_toggle?.classList.add("disabled"),e.panel.replaceChildren(e.display_toggle);return}}bo(e),e.style.panel?.style.setProperty("display","block"),e.display=!0;try{e.mapview.Map.addLayer(e.L)}catch{}e.reload instanceof Function&&e.reload(),e.showCallbacks?.forEach(t=>t instanceof Function&&t(e))}function bo(e){if(e.data){if(e.featureSet){let t=Array.isArray(e.data)?e.data:[e.data];e.featureSet=new Set(t);return}if(e.featureLookup){e.featureLookup=Array.isArray(e.data)?e.data:[e.data];return}e.features=e.data,e.setSource(e.features)}}function vo(){this.display=!1,this.style.panel?.style.setProperty("display","none"),this.mapview.Map.removeLayer(this.L),this.hideCallbacks?.forEach(e=>e instanceof Function&&e(this))}function S(e){let t=mapp.ui.elements.reportLink(e);return mapp.utils.html.node`<div class="val">${t}`}function j(e){if(e.edit)return wo(e);if(!(e.value===null||isNaN(e.value)))return mapp.utils.formatNumericValue(e),mapp.utils.html.node`<div 
    class="val"
    style=${e.css_val}
    >${e.stringValue}`}function wo(e){e.edit.callback??=()=>{e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))},e.edit.min??=e.min||-2147483648,e.edit.max??=e.max||2147483647,e.edit.step??=e.step||e.type==="integer"?1:.1,Object.assign(e,e.edit);let t=e.value??e.newValue;return e.edit.range&&!isNaN(t)&&t>e.min&&t<e.max?mapp.ui.elements.slider(e):mapp.ui.elements.numericInput(e)}var Lt=e=>(e.pills??=e.value||[],mapp.ui.elements.pills(e),e.container);function Te(e){if(!Array.isArray(e.value)){console.warn("Entry type pin requires a value array.");return}return e.srid??=e.location.layer.srid,e.display??=e.display===void 0,e.zIndex??=1/0,e.Style??=e.style?mapp.utils.style(e.style):e.location.pinStyle,e.show??=$o,e.hide??=_o,e.getExtent??=xo,e.geometry={coordinates:e.value,type:"Point"},e.display&&e.show(),e.label??=mapp.dictionary.pin,e.chkbox??=mapp.ui.elements.chkbox({checked:e.display,label:e.label,onchange:t=>{t?e.show():e.hide()}}),e.chkbox}function $o(){this.disabled||(this.location.removeLayer(this),this.display=!0,this.L=this.location.layer.mapview.geoJSON(this),this.location.Layers.push(this))}function _o(){this.display=!1,this.location.removeLayer(this)}function xo(){return this.buffer??=0,this.buffer=parseInt(this.buffer)||200,ol.extent.buffer(this.L.getSource().getExtent(),this.buffer)}function Oe(e){return e.textarea||(e.textarea=mapp.utils.html.node`<textarea
      class="val"
      style="auto; min-height: 50px;">`,e.callback??=async(t,i)=>{i.textarea.value=t},mapp.utils.ping(e),e.location.removeCallbacks.push(()=>{e.callback=!1})),e.textarea}function qe(e){if(!e.query){console.warn('You must provide a query to use "type": "query_button".');return}return e.label??=`Run query:${e.query}`,mapp.utils.html.node`
    <button 
      class="flat wide bold"
      onclick=${()=>ko(e)}>${e.label}`}async function ko(e){e.updated_fields&&(console.warn("entry.updated_fields is deprecated, please use entry.dependents instead."),e.dependents??=e.updated_fields),e.location.view.classList.add("disabled"),e.queryparams??={},e.queryparams.template=e.query;let t=mapp.utils.paramString(mapp.utils.queryParams(e));e.host??=e.location.layer.mapview.host+"/api/query";let i=await mapp.utils.xhr(`${e.host}?${t}`);if(i instanceof Error){mapp.ui.elements.alert({text:mapp.dictionary.query_failed}),e.location.view.classList.remove("disabled");return}e.value=i,e.alert&&mapp.ui.elements.alert({text:e.alert}),e.reload&&e.location.layer.reload(),e.dependents&&await e.location.syncFields(e.dependents),e.location.view.dispatchEvent(new Event("updateInfo")),e.location.view.classList.remove("disabled")}var Ct=e=>{let t=document.querySelector(`[data-id=${e.target}]`);return e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,t.dispatchEvent(new CustomEvent("addTab",{detail:e})),e.display&&e.show(),mapp.ui.elements.chkbox({checked:!!e.display,label:e.label,onchange:i=>{e.display=i,e.display?e.show():e.remove()}})};function Fe(e){if(!(!e.edit&&!e.value))return e.edit?yo(e):mapp.utils.html.node`
    <div
      class="val"
      style=${e.css_val}>
      ${e.prefix}${e.value}${e.suffix}`}function yo(e){return e.edit.options?(e.container=mapp.utils.html.node`<div>${mapp.dictionary.loading}`,Co(e),e.container):mapp.utils.html.node`<input
    type="text"
    maxlength=${e.edit.maxlength}
    value="${e.newValue||e.value||""}"
    placeholder="${e.edit.placeholder||""}"
    onkeyup=${t=>Lo(t,e)}>`}function Lo(e,t){t.newValue=t.edit.arraySeparator?e.target.value.split(t.edit.arraySeparator):e.target.value,t.location.infoj.find(i=>{(t.field===i.field||t.json_field===i.json_field)&&i.edit?.options&&(i.edit.options=[])}),t.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:t}))}async function Co(e){if(!e.edit.options.length){(e.jsonb_field||e.json_field)&&(e.edit.query??="distinct_values_json"),e.edit.query??="distinct_values";let l=mapp.utils.paramString({field:e.json_field||e.jsonb_field||e.field,filter:e.location.layer.filter?.current,id:e.location.id,key:e.jsonb_key||e.json_key,layer:e.location.layer.key,locale:e.location.layer.mapview.locale.key,table:e.location.layer.tableCurrent(),template:e.edit.query}),n=await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?${l}`);if(n===null){e.container.innerHTML=`${mapp.dictionary.no_options_available}`;return}e.edit.options=[n].flat().map(a=>Object.values(a)[0])}if(e.edit.radio){Eo(e);return}let t=e.edit.options.map(l=>({option:l===null?null:typeof l=="string"&&l||Object.values(l)[0],title:l===null?null:typeof l=="string"&&l||Object.keys(l)[0]})),i=t.find(l=>l.option===e.value),o=e.value!==void 0?e.value:e.edit.placeholder;mapp.utils.render(e.container,mapp.ui.elements.dropdown({callback:(l,n)=>{e.newValue=n.option,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))},entries:t,placeholder:o,span:i?.title||e.value}))}function Eo(e){let t=e.edit.options.map(i=>{let o={data_id:i,name:e.field,label:i,onchange:()=>{let l=t.find(n=>n.querySelector('input[type="radio"]:checked'));e.newValue=l.querySelector('input[type="radio"]').dataset.id,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}};return mapp.ui.elements.radio(o)});if(e.value){let i=t.find(o=>o.querySelector('input[type="radio"]').dataset.id===e.value);i&&(i.querySelector('input[type="radio"]').checked=!0)}mapp.utils.render(e.container,mapp.utils.html.node`${t}`)}function T(e){let t=e.type!=="html"?e.value:"";e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      maxlength=${e.edit.maxlength}
      placeholder="${e.edit.placeholder||""}"
      onfocus=${o=>{o.target.style.height=o.target.scrollHeight+"px"}}
      onfocusout=${o=>{o.target.style.height="auto"}}
      onkeyup=${o=>{e.newValue=o.target.value,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}
      onkeydown=${o=>setTimeout(()=>{o.target.style.height="auto",o.target.style.height=o.target.scrollHeight+"px"},100)}>
      ${e.newValue||e.value||""}`),e.css_val??="";let i=mapp.utils.html.node`
  <div
    class="val"
    style="${e.css_val}">${t}`;return!e.edit&&e.type==="html"&&(i.innerHTML=e.value||""),i}function Ie(e){let t,i=e.value?.toString().replace(".",":");return i=i&&i.length<3&&`${i}:00`||i,e.edit?t=mapp.utils.html.node`
      <input
        type="time"
        value=${i}
        onchange=${l=>{e.newValue=parseFloat(l.target.value.replace(":",".")),e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e}))}}>`:t=i,e.css_val??="",mapp.utils.html.node`
    <div
      class="val"
      style="${e.css_val}">
      ${t}`}function ze(e){return mapp.utils.html.node`
        <div
          class="label"
          style=${e.css_title}
          title=${e.tooltip}>${e.title}`}function So(){console.warn("The type:defaults entry method has been deprecated.")}function Et(e){return console.warn(`The type:${e.type} entry method has been deprecated in favour of the type:layer entry method.`),e.type="layer",e.qID??="id",e.name??=e.label,E(e)}var St={boolean:_e,dataview:Le,date:Ce,datetime:Ce,defaults:So,documents:C,geometry:Ee,html:T,image:C,images:C,integer:j,json:Se,key:je,layer:E,link:S,mvt_clone:Et,numeric:j,pills:Lt,pin:Te,ping:Oe,query_button:qe,report:S,tab:Ct,text:Fe,textarea:T,time:Ie,title:ze,vector_layer:Et};var O;function De(e,t){if(!e.infoj)return;let i=mapp.utils.html.node`<div class="location-view-grid">`;O={},t??=e?.layer?.infoj_order;let o=Array.isArray(t)?t.map(l).filter(a=>a!==void 0):e.infoj;function l(a){if(typeof a=="string"){let s=e.infoj.find(d=>new Set([d.key,d.field,d.query]).has(a));return s||console.warn(`infoj_order field: "${a}" not found in location.infoj. Please add entry.key, entry.field, or entry.query to the entry.`),s}else if(typeof a=="object")return a.location=e,a}let n=0;for(let a of o){if(a.key??=a.field||n++,e.view?.classList.contains("disabled"))break;if(a.listview=i,a.type??="text",a.edit===!0&&(a.edit={}),jo(a),To(a),jt(a)||(Oo(a),qo(a),Fo(a),Io(a),zo(a),Do(a)))continue;if(!Object.hasOwn(mapp.ui.locations.entries,a.type)){console.error(`entry.type:${a.type} method not found.`);continue}let s=mapp.ui.locations.entries[a.type]?.(a);s&&a.node.append(s),Bo(a)}return i}function jo(e){e.jsonb_field&&e.jsonb_key&&e.value!==null&&typeof e.value=="object"&&e.value.jsonb&&(e.value=e.value.jsonb[e.jsonb_field][e.jsonb_key])}function To(e){if(e.objectAssignFromField&&e.objectMergeFromField){console.warn(`${e.key}: objectAssignFromField and objectMergeFromField cannot both be used on the same entry.`);return}let t=e.objectAssignFromField||e.objectMergeFromField||e.json_field;if(!t)return;let i=e.location.infoj.find(o=>o.field===t);if(i&&typeof i.value=="object"){if(e.json_field){if(!e.json_key){console.warn("json_field requires entry.json_key to be specified");return}if(!i.value)return;e.value=i.value[e.json_key]}e.objectAssignFromField&&Object.assign(e,i.value),e.objectMergeFromField&&mapp.utils.merge(e,i.value)}}function jt(e){if(e.skipEntry||e.skipFalsyValue&&!e.value&&!e.edit||e.skipUndefinedValue&&typeof e.value>"u"&&!e.edit||e.skipNullValue&&e.value===null&&!e.edit)return!0}function Oo(e){e.nullValue!==void 0&&(e.edit||(e.value??=e.nullValue))}function qo(e){e.default!==void 0&&e.edit&&(e.newValue=e.default,e.location.view?.dispatchEvent(new CustomEvent("valChange",{detail:e})))}function Fo(e){e.group&&(O[e.group]||(O[e.group]=e.listview.appendChild(mapp.ui.elements.drawer({data_id:"location-infoj-group",class:`group ${e.groupClassList||""}`,header:mapp.utils.html`
          <h3>${e.group}</h3>`}))),e.listview=O[e.group])}function Io(e){let t=`contents ${e.type} ${e.class||""} ${e.inline&&"inline"||""}`;e.node=e.listview.appendChild(mapp.utils.html.node`
  <div
    data-type=${e.type}
    class=${t}>`)}function zo(e){e.title&&e.node.append(mapp.ui.locations.entries.title(e))}function Do(e){if(e.query)if(e.queryCheck??=e.run,e.queryCallback??=Ao,e.runOnce||e.queryCheck){delete e.runOnce,e.host??=e.location.layer?.mapview?.host||mapp.host;let t=mapp.utils.queryParams(e),i=mapp.utils.paramString(t);return e.url=`${e.host}/api/query?${i}`,e.blocking&&e.location.view?.classList.add("loading"),mapp.utils.xhr(e).then(o=>e.queryCallback(o,e)),!0}else e.field&&!e.xhr&&console.warn(`field:"${e.field}" has a query:"${e.query}" which is not set to run, please add the run or runOnce flag to the entry.`)}function Ao(e,t){if(t.blocking&&t.location.view?.classList.remove("loading"),e?t.value=t.field?e[t.field]:e:t.value=t.nullValue||null,jt(t)){t.node.remove();return}let i=mapp.ui.locations.entries[t.type]?.(t);i&&t.node.appendChild(i)}function Bo(e){if(!e.tooltip)return;let t=e.node.querySelector("label")||e.node.querySelector("div.label");t&&(e.tooltipElement||(e.tooltipElement=mapp.ui.elements.tooltip({content:e.tooltip}),t.append(e.tooltipElement)))}var No=[{symbol:"A",colour:"#2E6F9E"},{symbol:"B",colour:"#EC602D"},{symbol:"C",colour:"#5B8C5A"},{symbol:"D",colour:"#B84444"},{symbol:"E",colour:"#514E7E"},{symbol:"F",colour:"#E7C547"},{symbol:"G",colour:"#368F8B"},{symbol:"H",colour:"#841C47"},{symbol:"I",colour:"#61A2D1"},{symbol:"J",colour:"#37327F"},{symbol:"K",colour:"#FFA500"},{symbol:"L",colour:"#7FFF00"},{symbol:"M",colour:"#FFD700"},{symbol:"N",colour:"#00CED1"},{symbol:"O",colour:"#9932CC"},{symbol:"P",colour:"#FF69B4"},{symbol:"Q",colour:"#008B8B"},{symbol:"R",colour:"#8A2BE2"},{symbol:"S",colour:"#FF4500"},{symbol:"T",colour:"#00FF00"},{symbol:"U",colour:"#FF00FF"},{symbol:"V",colour:"#708090"},{symbol:"W",colour:"#F4A460"},{symbol:"X",colour:"#000080"},{symbol:"Y",colour:"#D2691E"},{symbol:"Z",colour:"#8FBC8F"}];function Ae(e){e.mapview||console.warn("A mapview is required in the locations listview params argument."),e.target||console.warn("A target element is required in the locations listview params argument.");let t=e.mapview.locale;t.locations??={},t.locations.pinStyle??={anchor:[.5,1],scale:3,type:"markerLetter"},t.locations.style??={fillColor:"#fff",fillOpacity:.1,strokeColor:"#fff"},t.locations.records??=t.listview_records||structuredClone(No),t.locations.clearAll=e.target.appendChild(mapp.utils.html.node`
    <button
      style="display: none; width: 100%; text-align: right;"
      class="tab-display bold text-shadow"
      onclick=${o=>{Object.values(e.mapview.locations).forEach(l=>l.remove())}}>
      ${mapp.dictionary.location_clear_all}`),t.locations.noLocations=e.target.appendChild(mapp.utils.html.node`<p class="no_locations">
                          ${mapp.dictionary.location_no_location_selected}</p>`),e.mapview.locations=new Proxy(e.mapview.locations,{deleteProperty:function(o,l){Reflect.deleteProperty(...arguments);let n=t.locations.records.find(a=>a.hook===l);return n&&delete n.hook,setTimeout(()=>Mo(t),300),!0},set:i});function i(o,l,n){let a=t.locations.records.find(s=>!s.hook);return a?(Reflect.set(...arguments),a.hook=n.hook,n.record=a,n.style=structuredClone(t.locations.style),a.colour&&(n.style.strokeColor&&=a.colour,n.style.fillColor&&=a.colour),n.pinStyle=mapp.utils.style({icon:{...t.locations.pinStyle,color:n.style.strokeColor,letter:a.symbol}}),mapp.ui.locations.view(n),Object.values(e.target.children).forEach(s=>s.classList.remove("expanded")),e.target.insertBefore(n.view,t.locations.clearAll.nextSibling),n.view.dispatchEvent(new Event("addLocationView")),t.locations.clearAll.style.display="block",t.locations.noLocations.style.display="none",document.querySelector("[data-id=locations]").click(),document.querySelector("[data-id=locations]").style.display="block",!!n):(mapp.ui.elements.alert({text:mapp.dictionary.location_listview_full}),!0)}}function Mo(e){if(!document.querySelectorAll("#locations > .location-view").length){document.querySelector("[data-id=layers]").click(),e.locations.clearAll.style.display="none";let t=document.querySelector("#locations input");t?t.value="":e.locations.noLocations.style.display="block"}}function Be(e){e.removeCallbacks?.push(function(){e.view.remove()});let t=e.infoj.find(n=>n.locationHeader)?.value,i=t?`${t} - (${e.record.symbol})`:`${e.record.symbol}`,o=[mapp.utils.html`<h2>${i}`,mapp.utils.html`<div class="notranslate material-symbols-outlined caret">`];e.infoj.filter(n=>new Set(["pin","geometry"]).has(n.type)).some(n=>!!n.value)&&o.push(mapp.utils.html`<button
      title = ${mapp.dictionary.location_zoom}
      class = "notranslate material-symbols-outlined"
      onclick = ${()=>e.flyTo()}>search`),Vo(e)&&o.push(e.editToggle),o.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_save}
    class="btn-save notranslate material-symbols-outlined color-info"
    style="display: none;"
    onclick = ${()=>{e.view.classList.add("disabled"),e.update()}}>cloud_upload`),e.updateCallbacks?.push(function(){e.view.dispatchEvent(new Event("updateInfo"))}),(e.layer?.edit?.delete||e.layer?.deleteLocation)&&o.push(mapp.utils.html`<button
      title=${mapp.dictionary.location_delete}
      class="notranslate material-symbols-outlined color-danger"
      onclick = ${()=>e.trash()}>delete`),o.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_remove}
    class="notranslate material-symbols-outlined"
    onclick=${l}>close</button>
    `);async function l(){e.infoj.some(a=>typeof a.newValue<"u")&&!await mapp.ui.elements.confirm({text:mapp.dictionary.location_close_without_save})||e.remove()}e.view=mapp.ui.elements.drawer({data_id:`location-${e.layer.key}-${e.id}`,class:"location-view raised expanded",header:o}),e.viewEntries=e.view.appendChild(mapp.ui.locations.infoj(e)),e.view.querySelector(".header").style.borderBottom=`3px solid ${e.record.colour}`,e.view.addEventListener("valChange",Po),e.renderLocationView=Ho,e.view.addEventListener("render",()=>e.renderLocationView()),e.view.addEventListener("updateInfo",()=>{e.editToggle&&(e.editToggle.classList.remove("toggle-on"),e.removeEdits()),e.layer?.dataviews&&Object.values(e.layer.dataviews).forEach(n=>{n.display===!0&&n.update()}),e.renderLocationView()})}function Vo(e){if(e.layer?.toggleLocationViewEdits===!1)return e.removeEdits(),!1;if(!e.layer?.toggleLocationViewEdits||!e.infoj.some(o=>o.edit))return!1;!e.new&&e.removeEdits();let t=`notranslate material-symbols-outlined ${e.new?"toggle-on":""}`;return e.editToggle=mapp.utils.html.node`<button
    title="Enable edits"
    class=${t}
    onclick=${i}>edit`,!0;async function i(o){await e.confirmUpdate()===void 0&&(o.target.classList.toggle("toggle-on")?e.restoreEdits():e.removeEdits(),e.renderLocationView())}}function Po(e){let t=e.detail,i=t.location;if(t.valChangeMethod instanceof Function){t.valChangeMethod(t);return}if(t.value!=t.newValue?t.node?.classList.add("val-changed"):(delete t.newValue,t.node?.classList.remove("val-changed")),i.infoj.some(o=>o.invalid)){i.view.querySelector(".btn-save").style.display="none";return}i.view.querySelector(".btn-save").style.display=i.infoj.some(o=>typeof o.newValue<"u")?"inline-block":"none"}function Ho(){let e=this;e.view.querySelector(".btn-save").style.display="none",e.viewEntries.remove(),e.view.classList.remove("disabled"),e.viewEntries=e.view.appendChild(mapp.ui.locations.infoj(e))}var Tt={entries:St,infoj:De,listview:Ae,view:Be};function Ne(e){if(e.node)return e.tabs=e.node.appendChild(mapp.utils.html.node`<div class="tabs">`),e.panel=e.node.appendChild(mapp.utils.html.node`<div class="panel">`),e.id&&e.node.setAttribute("data-id",e.id),e.addTab=Ro,e.node.addEventListener("addTab",t=>e.addTab(t.detail)),e}function Ro(e){if(e.tab&&!e.dynamic)return;let t=this;e.layer?.dataviews?.[e.key]&&(e.disableTabClose??=e.layer.dataviews.hide),e.activate??=n,e.location?e.location.removeCallbacks.push(()=>e.remove()):e.layer&&(e.layer.showCallbacks.push(()=>{e.display&&e.show()}),e.layer.hideCallbacks.push(()=>{e.remove()})),e.label??=e.title||e.key||"Tab",e.tab_btn=mapp.utils.html.node`<button
    onclick=${a}>${e.label}`;let i=!e.disableTabClose&&!e.hideTabClose,o=mapp.utils.html`<button 
    class="notranslate material-symbols-outlined close_tab"
    onclick=${d=>(d.stopPropagation(),s())}>close`;e.tab=mapp.utils.html.node`<div class="tab">
    <div 
      class="header" 
      style="${e.tab_style||""}"
      .inert=${e.disabled}
      onmousedown=${d=>{if((d.which===2||d.button===4)&&!e.disableTabClose)return s()}} 
      onclick=${d=>{e.tab_btn.dispatchEvent(new Event("click"))}}>
      ${e.tab_btn}
      ${i?o:""}`,e.disabled&&e.tab.style.setProperty("opacity",.3),e.class??="";let l=`panel ${e.class}`;e.panel??=e.target||mapp.utils.html.node`
    <div class=${l}>`,e.show=a,e.remove=s,e.hide=s;function n(){e.create===void 0?(e.create??=function(){mapp.ui.utils[e.dataview]?.create(e)},e.create()):e.dynamic&&e.create(),(!e.data||e.dynamic)&&e.update?.(),e.btnRow?.style.setProperty("display","flex")}function a(){mapp.utils.render(t.panel,e.panel),t.tabs.childNodes.forEach(d=>d.classList.remove("active")),!e.tab.parentElement&&t.tabs.append(e.tab),e.tab.classList.add("active"),t.timer&&window.clearTimeout(t.timer),t.timer=window.setTimeout(()=>e.activate(),500),t.showTab instanceof Function&&t.showTab()}function s(){if(!e.tab.parentElement)return;let d=e.tab.nextElementSibling||e.tab.previousElementSibling,c=e.tab.parentElement;if(e.tab.remove(),e.chkbox&&(e.chkbox.querySelector("input").checked=!1),!c.querySelector(".tab.active")){if(d)return d.querySelector(".header").click();t.removeLastTab?.()}}}var Ve={};Nt(Ve,{setTheme:()=>Wo,themes:()=>Uo});var Uo={dark:{active:"#e18335",base:"#222222","base-secondary":"#555555","base-tertiary":"#444444",border:"#666666",changed:"#666600",danger:"#ef5350",font:"#f2f2f2","font-contrast":"#3f3f3f","font-mid":"#CCCCCC",primary:"#DAD095"}},Me={};function Wo(e){let t=document.querySelector(":root");for(let[i,o]of Object.entries(Me))t.style.removeProperty(`--color-${i}`,`${o}`);Me=e;for(let[i,o]of Object.entries(Me))t.style.setProperty(`--color-${i}`,`${o}`)}var Jo={mapChange:Zo,Toolbar:Go,toolbar:{update:Yo,viewport:Qo}},Ot=Jo;function Go(e){if(!e.toolbar)return;typeof e.toolbar=="function"&&e.toolbar();let t=mapp.utils.html.node`<div class="dataview-target">`,i=Object.keys(e.toolbar).map(o=>{if(Object.hasOwn(mapp.ui.utils[e.dataview]?.toolbar,o))return mapp.ui.utils[e.dataview]?.toolbar[o]?.(e);if(Object.hasOwn(mapp.ui.utils.dataview.toolbar,o))return mapp.ui.utils.dataview.toolbar[o](e)}).filter(o=>!!o);e.btnRow=mapp.utils.html.node`<div class="btn-row">${i}</div>`,e.btnRow.style.setProperty("display","none"),e.panel=e.target.appendChild(mapp.utils.html.node`
      <div class="flex-col">
        ${e.btnRow}
        ${t}`),e.target=t}function Zo(e){e.mapChange&&e.layer?.mapview&&e.layer.changeEndCallbacks.push(()=>{e.display&&e.layer.display&&(e.tab&&!e.tab.classList.contains("active")||(typeof e.mapChange=="function"?e.mapChange():e.update()))})}function Yo(e){return e.toolbar.update.button=mapp.utils.html.node`<button 
    onclick=${()=>{e.toolbar.update.button.classList.toggle("active")?Xo(e):e.toolbar.update.dialog.close()}}>
    Update`,e.toolbar.update.button}async function Xo(e){let t=mapp.utils.html.node`<div>`,i={data:e.data,query:e.query,queryparams:e.queryparams},o=await mapp.ui.elements.jsoneditor({props:{content:{text:JSON.stringify(i)},mode:"text",onRenderMenu:l},target:t});e.toolbar.update.dialog={closeBtn:!0,content:t,header:"Dataview Update",onClose:s=>{e.toolbar.update.button.classList.remove("active")},target:document.getElementById("Map")},mapp.ui.elements.dialog(e.toolbar.update.dialog);function l(s){return s.push({className:"notranslate material-symbols-outlined-important",onClick:n,text:"sync",title:"Update Dataview Query",type:"button"}),s.push({className:"notranslate material-symbols-outlined-important",onClick:a,text:"data_object",title:"Set Dataview Data",type:"button"}),s.filter(d=>d.text!=="table").filter(d=>d.text!=="tree").filter(d=>d.type!=="separator").filter(d=>d.className!=="jse-undo").filter(d=>d.className!=="jse-redo").filter(d=>d.className!=="jse-search").filter(d=>d.className!=="jse-contextmenu").filter(d=>d.className!=="jse-sort").filter(d=>d.className!=="jse-transform")}function n(){let s=o.get(),d=JSON.parse(s.text);Object.assign(e,d),e.update()}function a(){let s=o.get(),d=JSON.parse(s.text);e.setData(d.data)}}function Qo(e){let t=["flat",e.viewport?"active":""].join(" ");return mapp.utils.html`<button
    class=${t}
    onclick=${i=>{let o=i.target.classList.toggle("active");e.viewport=o,e.update()}}>${mapp.dictionary.tabulator_viewport}`}function Pe(e){if(e.target!=="dialog")return;e.dataview_dialog={};let t=`
    width: ${e.dialog_css?.width||"300"}px;
    height: ${e.dialog_css?.height||"200"}px;
    min-width: ${e.dialog_css?.minWidth||"300"}px;
    min-height: ${e.dialog_css?.minHeight||"200"}px;
    resize: ${e.dialog_css?.resize||"both"};
    overflow: hidden !important`;Object.assign(e.dataview_dialog,{header:mapp.utils.html.node`<h1> ${e.label}`,data_id:`${e.key}-dataviews-dialog`,target:document.getElementById("Map"),height:"auto",left:"5%",top:"0.5em",class:"box-shadow tabview",css_style:t,containedCentre:!0,contained:!0,headerDrag:!0,closeBtn:!0,onClose:()=>{e.chkbox&&(e.chkbox.querySelector("input").checked=!1)}}),mapp.ui.elements.dialog(e.dataview_dialog);let i=e.dataview_dialog.node.querySelector(".content");i.classList.add("panel"),e.target=i,e.dataview_dialog.dialog.close(),e.show=()=>{e.update(),e.toolbar&&e.dataview_dialog.node.querySelector(".btn-row").style.removeProperty("display"),e.chart&&(e.dataview_dialog.node.appendChild(e.target.querySelector("canvas")),e.dataview_dialog.node.removeChild(e.target)),e.dataview_dialog.dialog.show()},e.hide=()=>{e.dataview_dialog.dialog.close()},e.location?.removeCallbacks?.push?.(()=>e.dataview_dialog.dialog.close())}var Ko={create:el},qt=Ko;async function el(e){e.query??="histogram",e.options??={};let t=`column-gap: ${e.options.columnGap||10}px`;e.node=mapp.utils.html.node`<div class="histogram" style=${t}>`,e.options.width&&(e.node.style.width=`${e.options.width}px`),e.options.height&&(e.node.style.height=`${e.options.height}px`),e.options.title&&e.target.append(mapp.utils.html.node`<h3 class="histogram-title">${e.options.title}`),e.setData=tl,e.target.append(e.node),e.options.xlabel&&(e.xlabel=mapp.utils.html.node`<div class="histogram-xlabel">${e.options.xlabel}`,e.options.width&&(e.xlabel.style.width=`${e.options.width}px`),e.target.append(e.xlabel)),e.options.caption&&(e.caption=mapp.utils.html.node`<span class="histogram-caption">${e.options.caption}`,e.target.append(e.caption))}function tl(e){this.data=e,il(this)}function il(e){if(!Array.isArray(e.data)){mapp.utils.render(e.node,mapp.utils.html`<div>`);return}let t=Math.max(...e.data.map(l=>l.count));e.options.height??=100;let i=e.data.map(l=>{let n=`height: ${Math.round(e.options.height*l.count/t)}px`,a="";return e.options.tooltip&&(a=mapp.utils.html`<div class="bucket-info">
        <span><b>Count</b> ${mapp.utils.formatNumericValue({value:l.count,...e})}</span><br>
        <span><b>Min</b> ${mapp.utils.formatNumericValue({value:l.bucket_min,...e})}</span><br>
        <span><b>Max</b> ${mapp.utils.formatNumericValue({value:l.bucket_max,...e})}</span>`),mapp.utils.html`<div
      class="bucket"
      data-bucket=${l.bucket}
      data-count=${l.count}
      data-bucket-min=${l.bucket_min}
      data-bucket-max=${l.bucket_max}
      style=${n}>
      ${a}`}),o=e.options.ylabel?mapp.utils.html`<div class="ylabel">${e.options.ylabel}`:"";mapp.utils.render(e.node,mapp.utils.html`${o}${i}`)}var m={idle:600};function He(e){Object.assign(m,e),m.idle!==0&&(window.onload=g,window.onmousemove=g,window.onmousedown=g,window.ontouchstart=g,window.onclick=g,window.onkeypress=g,g(),It())}function g(){m.locked||(m.timeout&&clearTimeout(m.timeout),m.timeout=setTimeout(Ft,m.idle*1e3))}function Ft(){m.locked=!0,m.renew&&clearTimeout(m.renew);let e={url:`${m.host}/api/user/cookie?destroy=true`};e.onLoad=t=>location.reload(),mapp.utils.xhr(e)}function It(){m.renew=setTimeout(ll,(m.idle-20)*1e3)}function ll(){let e={url:`${m.host}/api/user/cookie?renew=true`};e.onLoad=t=>{if(t.target.status===401)return Ft();It()},mapp.utils.xhr(e)}function Re(e){let t=mapp.utils.html.node`
  <div class="interface-mask">
    <div
      class="bg-image" 
      style=${`background-image:url(${e.target.src})`}>
    <button 
      class="btn-close notranslate material-symbols-outlined"
      onclick=${i=>i.target.closest(".interface-mask").remove()}>close</button>`;document.body.append(t)}var zt={create:nl,toolbar:{copyToClipboard:dl,csvupload:cl,jsonfile:sl,sqlinsert:rl}};async function nl(e){e.props??={mainMenuBar:!1,mode:"text",readOnly:!0},e.jsoneditor=await mapp.ui.elements.jsoneditor(e),e.setData=al,e.data&&e.setData(e.data)}function al(e){this.data=e;let t={json:e};this.jsoneditor.set(t)}function sl(e){return e.title??=e.label||"Unknown",mapp.utils.html.node`<button onclick=${()=>{let i={filename:`${e.title}.json`,text:JSON.stringify(e.data,null,2),type:"application/json"};mapp.utils.textFile(i)}}>Download</button>`}function dl(e){return mapp.utils.html.node`<button onclick=${()=>{let i=JSON.stringify(e.data,null,2);mapp.utils.copyToClipboard(i)}}>Copy to Clipboard</button>`}function cl(e){return e.toolbar.csvupload.label??="CSV Upload",e.toolbar.csvupload.input=mapp.utils.html.node`<input 
      type=file class="flat bold wide"
      accept=".csv"
      onchange=${async t=>{if(!t.target.files[0])return;e.toolbar.csvupload.file=t.target.files[0];let i=await mapp.utils.csvUpload(e.toolbar.csvupload.file,e.toolbar.csvupload),o;if(Array.isArray(i)?o=i.filter(l=>l instanceof Error):i instanceof Error&&(o=[i]),o?.length){mapp.ui.elements.alert({title:"CSV Upload",text:`Upload of CSV records has failed:

${o.map(l=>l.message).join(`
`)}`});return}e.setData(i)}}>`,e.toolbar.csvupload.input}function rl(e){return e.props={mainMenuBar:!1,mode:"text"},mapp.utils.html.node`<button onclick=${()=>{let i=e.jsoneditor.get();if(i.text==="")return;let o=mapp.utils.paramString(e.toolbar.sqlinsert),l=`${mapp.host}/api/query?${o}`;return mapp.utils.xhr({body:i.text,method:"POST",url:l})}}>SQL Insert</button>`}async function Ue(e,t,i){return await mapp.ui.elements.jsoneditor({props:{onRenderMenu:l=>ul(l,i),content:t,mode:"text"},target:e})}function ul(e,t){return e.push(t),e.filter(i=>i.text!=="text").filter(i=>i.text!=="tree").filter(i=>i.text!=="table").filter(i=>i.type!=="separator").filter(i=>i.className!=="jse-undo").filter(i=>i.className!=="jse-redo").filter(i=>i.className!=="jse-search").filter(i=>i.className!=="jse-contextmenu").filter(i=>i.className!=="jse-sort").filter(i=>i.className!=="jse-transform")}async function q(e){if(Array.isArray(e.Features)&&!e.filter?.viewport)return e.Features.length;let t={layer:e,queryparams:{}};t.viewport=e.filter?.viewport||e.queryparams?.viewport;let i=mapp.utils.queryParams(t),o=mapp.utils.paramString({...i,filter:e.filter?.current,layer:e.key,table:e.tableCurrent(),qID:e.qID,template:"location_count"}),l=await mapp.utils.xhr(`${e.mapview.host}/api/query?${o}`);if(l instanceof Error)if(e.filter?.viewport){console.warn("locationCount failed on viewport.");return}else return e.filter.viewport=!0,await q(e);return l}var We={},r={X:{min:75,lockSize:200,grid:"gridTemplateColumns"},Y:{min:0,lockSize:50,grid:"gridTemplateRows"},gridTemplate:{X:"auto",Z:"10px",Y:"auto"}};function Je(e){e.resizeEvent??=pl.bind(e),e.stopResize=fl.bind(e),e.axis??="X",e.doubleClickClose&&(e.target.ondblclick=t=>ml(t,e)),e.target.addEventListener("mousedown",t=>{t.preventDefault(),document.body.style.cursor="grabbing",globalThis.addEventListener("mousemove",e.resizeEvent),globalThis.addEventListener("mouseup",e.stopResize)}),e.target.addEventListener("touchstart",t=>{t.preventDefault(),globalThis.addEventListener("touchmove",e.resizeEvent),globalThis.addEventListener("touchend",e.stopResize)},{passive:!0}),We.gridTemplateColumns=getComputedStyle(document.body).gridTemplateColumns,We.gridTemplateRows=getComputedStyle(document.body).gridTemplateRows}function pl(e){let t=this.axis;r.X.size=e.touches?.[0]?.pageX||e.pageX,r.Y.size=globalThis.innerHeight-(e.touches?.[0]?.pageY||e.pageY);let i=r[t];if(i.size<i.min){r.gridTemplate[t]="0px",document.body.style[i.grid]=Object.values(r.gridTemplate).join(" ");return}i.size<i.lockSize||(t==="X"&&r.X.size>globalThis.innerWidth/2&&(r.X.size=globalThis.innerWidth/2),t==="Y"&&(r.Y.size>globalThis.innerHeight-10&&(r.Y.size=globalThis.innerHeight),OL.style.marginTop=`-${r.Y.size/2}px`),r.gridTemplate[t]=`${i.size}px`,document.body.style[i.grid]=Object.values(r.gridTemplate).join(" "),r.gridTemplate={X:"auto",Z:"10px",Y:"auto"})}function ml(e,t){if(r.X.size=e.touches?.[0]?.pageX||e.pageX,r.Y.size=globalThis.innerHeight-(e.touches?.[0]?.pageY||e.pageY),r[t.axis].size<r[t.axis].min){document.body.style[r[t.axis].grid]=We[r[t.axis].grid];return}r.gridTemplate[t.axis]="0px",document.body.style[r[t.axis].grid]=Object.values(r.gridTemplate).join(" "),r.gridTemplate={X:"auto",Z:"10px",Y:"auto"}}function fl(){document.body.style.cursor="auto",globalThis.removeEventListener("mousemove",this.resizeEvent),globalThis.removeEventListener("touchmove",this.resizeEvent),globalThis.removeEventListener("mouseup",this.stopResize),globalThis.removeEventListener("touchend",this.stopResize)}var Dt={cssColour:Ve,dataview:Ot,dataviewDialog:Pe,histogram:qt,idleLogout:He,imagePreview:Re,Json:zt,layerJSE:Ue,locationCount:q,resizeHandler:Je};var At={Dataview:F,elements:st,Gazetteer:dt,layers:_t,locations:Tt,Tabview:Ne,utils:Dt};globalThis.ui=At;globalThis.mapp??={};mapp.ui=At;
//# sourceMappingURL=ui.js.map
