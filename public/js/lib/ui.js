import{t as e}from"./chunk-DK3Fl9T5.js";async function t(e){if(!(!e.dynamic&&typeof e.create==`function`)){if(typeof e.create==`function`){e.create();return}if(typeof e.target==`string`&&(e.target=document.getElementById(e.target)),!(e.target instanceof HTMLElement)){console.warn(`Dataviews require a HTMLHtmlElement target`);return}return i(e)instanceof Error?e.err:(typeof e.label==`string`&&(e.chkbox=mapp.ui.elements.chkbox({checked:!!e.display,data_id:e.key,disabled:e.disabled,label:e.label,onchange:t=>{e.display=t,e.display?e.show():e.hide()}})),e.update??=a,e.show??=n,e.hide??=r,mapp.ui.utils.dataview.Toolbar(e),mapp.ui.utils.dataview.mapChange(e),e)}}async function n(){this.display=!0,this.create===void 0?(this.create=()=>{mapp.ui.utils[this.dataview].create(this)},this.create(),typeof this.update==`function`&&this.update()):this.dynamic?(typeof this.create==`function`&&await this.create(),typeof this.update==`function`&&this.update()):this.reload&&typeof this.update==`function`&&this.update(),this.btnRow?.style.setProperty(`display`,`flex`),this.target.style.display=`block`}function r(){this.display=!1,this.target.style.display=`none`,this.btnRow?.style.setProperty(`display`,`none`)}function i(e){if(e.key??=e.query||e.title||e.label,e.dataview||(e.chart&&(e.dataview=`chartjs`),e.columns!==void 0&&(console.warn(`Table dataviews should be configured inside a tables object`),e.table={columns:e.columns},e.dataview=`tabulator`),e.table&&(e.dataview=`tabulator`)),!Object.hasOwn(mapp.ui.utils,e.dataview))return e.err=Error(`mapp.ui.utils.${e.dataview} doesnt exist`),console.error(e.err),e.update=()=>console.warn(`Unable to update ${e.key} dataview.`),e.err;if(typeof mapp.ui.utils[e.dataview].create!=`function`)return e.err=Error(`mapp.ui.utils.${e.dataview}.create() method doesn't exist`),console.error(e.err),e.err}async function a(){if(this.create===void 0&&(this.create=function(){mapp.ui.utils[this.dataview].create(this)},this.create()),!this.query)return;let e=mapp.utils.queryParams(this),t=mapp.utils.paramString(e);this.host??=this.layer?.mapview?.host;let n=await mapp.utils.xhr(`${this.host||mapp.host}/api/query?${t}`);if(!(n instanceof Error)){if(typeof this.responseFunction==`function`){this.responseFunction(n);return}typeof this.setData==`function`&&this.setData(n)}}function o(e){typeof e==`string`&&(e={text:e}),e.title??=mapp.dictionary.information,e.icon??=`info`,e.data_id??=`alert`,e.class??=`alert-confirm box-shadow no-select`;let t=e.icon===``?``:mapp.utils.html`<span class="material-symbols-outlined notranslate">${e.icon}</span>`;return e.header=mapp.utils.html`${t}${e.title}`,e.innerContent??=mapp.utils.html`<p>${e.text}</p>`,e.content=mapp.utils.html`
    ${e.innerContent}
    <div class="buttons">
      <button 
        class="action outlined bold"
        onclick=${e=>{e.target.closest(`dialog`).close()}}>${mapp.dictionary.ok}`,mapp.ui.elements.dialog(e)}var s=e=>mapp.utils.html.node`
    <button 
        data-id=${e.data_id||`btnPanel`}
        class=${`btn-panel ${e.class||``}`}
        style=${e.style||``}
        onclick=${t=>{t.target.classList.toggle(`active`),e.callback(t)}}>
        <div class="header">
            <h3>${e.label}</h3>
            <div class="notranslate material-symbols-outlined">${e.icon_name}</div>
        </div>
        ${e.panel&&mapp.utils.html`
            <div class="panel">${e.panel}`}`;function c(e){return e.data_id??=`card`,mapp.utils.html.node`
  <div 
    data-id=${e.data_id}
    class="drawer">
    <header class="header bold">
      <span>${e.header}</span>
      <button
        class="notranslate material-symbols-outlined color-font-mid"
        onclick=${t=>{t.target.closest(`.drawer`).remove(),typeof e.close==`function`&&e.close(t)}}>close</button>
    </header>
    ${e.content}`}function l(e){return e.data_id??=`chkbox`,e.name??=`mapp-ui-chkbox-element`,mapp.utils.html.node`<label 
    data-id=${e.data_id}
    class="checkbox">
    <input
      name=${e.name}
      type="checkbox"
      .disabled=${!!e.disabled}
      .checked=${!!e.checked}
      onchange=${t=>{e.onchange?.(t.target.checked,e.val)}}/>
    <span class="notranslate material-symbols-outlined"/>
    <span>${e.label}`}function u(e){typeof e==`string`&&(e={text:e}),e.title??=mapp.dictionary.confirm,e.data_id??=`confirm`,e.icon??=`warning`;let t=e.icon===``?``:mapp.utils.html`<span class="material-symbols-outlined notranslate">${e.icon}</span>`;e.header=mapp.utils.html`${t}${e.title}`,delete e.minimizeBtn,delete e.closeBtn;let n=mapp.utils.html.node`<button 
      class="action outlined bold">
      ${mapp.dictionary.ok}`,r=mapp.utils.html.node`<button
      class="action outlined bold">
      ${mapp.dictionary.cancel}`;return e.innerContent??=mapp.utils.html`<p>${e.text}</p>`,e.content=mapp.utils.html`
      ${e.innerContent}
      <div class="buttons">
        ${n}  
        ${r}`,e.class??=`alert-confirm box-shadow no-select`,mapp.ui.elements.dialog(e),new Promise(t=>{n.addEventListener(`click`,()=>{t(!0),e.close()}),r.addEventListener(`click`,()=>{t(!1),e.close()})})}var d={draw:te,modify:ee};function ee(e){e?.preventDefault?.();let t=[];t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),this.popup({content:mapp.utils.html.node`<ul>${t}`,coords:this.interaction.vertices[this.interaction.vertices.length-1]})}function te(e){if(this.interaction.vertices.length===0)return;let t=[];t.push(mapp.utils.html`
  <li
    onclick=${()=>this.interaction.finish(this.interaction.getFeature())}>
      ${mapp.dictionary.save}`),t.push(mapp.utils.html`
    <li
      onclick=${()=>this.interaction.finish()}>
      ${mapp.dictionary.cancel}`),setTimeout(()=>this.popup({autoPan:!0,content:mapp.utils.html.node`<ul>${t}`,coords:this.interaction.vertices[this.interaction.vertices.length-1]}),100)}function ne(e){if(e.target)return e.target.classList.add(`mapp-control`),e.tabs=mapp.utils.html.node`<nav class="tabs hover">`,e.target.append(e.tabs),e.panels=mapp.utils.html.node`<div class="panels">`,e.target.append(e.panels),e.add=re,e}function re(e){e.parent=this,e.minWidth??=0,e.icon??=e.key,e.classList??=`notranslate material-symbols-outlined`,e.onClick??=ie,e.title??=mapp.dictionary[e.key]||e.key,e.panel??=mapp.utils.html.node`<div>`,this.tabs.children.length||(e.classList+=` active`),e.tab=mapp.utils.html.node`<div
    data-id=${e.key}
    title=${e.title}
    onclick=${t=>e.onClick(t,e)}
    class=${e.classList}>
    ${e.icon}`,this.tabs.append(e.tab),this.panels.append(e.panel)}function ie(e,t){for(let e of Array.from(t.parent.tabs.children))e.classList.remove(`active`);t.tab.classList.add(`active`);for(let e of Array.from(t.parent.panels.children))e.classList.remove(`active`);t.panel.classList.add(`active`),t.focus&&(t.focus=t.focus instanceof HTMLElement?t.focus:document.querySelector(`[name=${t.focus}]`),t.focus.focus())}function ae(e){if(!e.new&&typeof e.show==`function`){e.show();return}if(e.show=f,!e.target)e.modal=!0;else if(e.target instanceof HTMLElement)e.show=f;else return;document.querySelector(`dialog.modal`)?.close(),e.minimizeBtn&&=mapp.utils.html`<button
    data-id="minimize"
    class="minimize-btn notranslate material-symbols-outlined"
    onclick=${e=>{e.target.closest(`dialog`).classList.toggle(`minimized`)}}>`;function t(t){typeof e.onClose==`function`&&e.onClose(t),e.node.remove()}e.close=t,e.closeBtn&&=mapp.utils.html`<button
    data-id=close
    class="notranslate material-symbols-outlined close"
    onclick=${t}>`,e.header=e.header instanceof HTMLElement?e.header:mapp.utils.html`<h2>${e.header}`,e.headerHtml=mapp.utils.html`<header
    class=${e.headerDrag?`headerDrag`:``}>
    ${e.header}${e.minimizeBtn}${e.closeBtn}`,e.data_id??=`dialog`,e.class??=`box-shadow`,e.class+=e.modal?` modal`:` dialog`,e.node=mapp.utils.html.node`<dialog 
    onclose=${t}
    style=${e.css_style}
    data-id=${e.data_id}
    class=${e.class}>
    ${e.headerHtml}
    <div class="content">${e.content}`,e.modal?(document.body.append(e.node),e.node.showModal()):(e.target.appendChild(e.node),e.node.show(),e.right&&(e.left=e.target.offsetWidth-e.node.offsetWidth-Number.parseInt(e.right)),e.node.style.top=`${e.top||0}`,e.node.style.left=`${e.left||0}`,e.node.addEventListener(`mousedown`,n),e.node.addEventListener(`touchstart`,n),new ResizeObserver(r).observe(e.target));function n(t){if(e.headerDrag&&!t.target.closest(`header`)||t.which===3)return;e.node.style.cursor=`grabbing`;let{move:n,end:r}={mousedown:{end:`mouseup`,move:`mousemove`},touchstart:{end:`touchend`,move:`touchmove`}}[t.type];e.target.addEventListener(n,a),window.addEventListener(r,i)}function r(){let{offsetWidth:t,offsetHeight:n}=e.target,{offsetWidth:r,offsetHeight:i}=e.node,a=t-r<0?0:t-r,o=n-i<0?0:n-i;e.node.style.left=`${Math.min(Math.max(e.node.offsetLeft,0),a)}px`,e.node.style.top=`${Math.min(Math.max(e.node.offsetTop,0),o)}px`}function i(){delete e.x,delete e.y,e.node.style.cursor=e.headerDrag?`auto`:`grab`,e.target.removeEventListener(`mousemove`,a),e.target.removeEventListener(`touchmove`,a),e.target.removeEventListener(`mouseup`,i),e.target.removeEventListener(`touchend`,i)}function a(t){e.x??=t.x;let n=t.x-e.x;e.x=t.x,e.y??=t.y;let r=t.y-e.y;if(e.y=t.y,e.contained&&!e.modal){oe(e,n,r);return}if(e.containedCentre&&!e.modal){se(e,n,r);return}e.node.style.left=`${e.node.offsetLeft+n}px`,e.node.style.top=`${e.node.offsetTop+r}px`}return e.dialog=e,e}function oe(e,t,n){e.node.offsetLeft+t<0?e.node.style.left=0:(t<0||e.target.offsetWidth-e.node.offsetWidth-e.node.offsetLeft>0)&&(e.node.style.left=`${e.node.offsetLeft+t}px`),e.node.offsetTop+n<0?e.node.style.top=0:(n<0||e.target.offsetHeight-e.node.offsetHeight-e.node.offsetTop>0)&&(e.node.style.top=`${e.node.offsetTop+n}px`)}function se(e,t,n){e.node.offsetLeft+Number.parseInt(e.node.offsetWidth/2)+t<0||((t<0||e.target.offsetWidth-Number.parseInt(e.node.offsetWidth/2)-e.node.offsetLeft>0)&&(e.node.style.left=`${e.node.offsetLeft+t}px`),!(e.node.offsetTop+Number.parseInt(e.node.offsetHeight/2)+n<0)&&(n<0||e.target.offsetHeight-Number.parseInt(e.node.offsetHeight/2)-e.node.offsetTop>0)&&(e.node.style.top=`${e.node.offsetTop+n}px`))}function f(){this.node&&this.target instanceof HTMLElement&&this.target.append(this.node)}function ce(e){if(e.data_id??=`drawer`,e.dialog)return de(e);if(e.drawer===!1)return e.drawer=mapp.utils.html.node`<div
      class="${`drawer `+(e.class||``)}"
      data-id=${e.data_id}>
      <div class="header no-select">${e.header}</div>
      <div class="content">${e.content}`,e.drawer;if(e.drawer===null)return e.drawer=mapp.utils.html.node`<div
    data-id=${e.data_id}
    class="${e.class||``}">
    <div class="content">${e.content}`,e.drawer;e.class=`drawer expandable ${e.class||``}`;let t=(e.header?.template||e.header)?.find?.(e=>(e=e?.template?.[0]||e,e?.includes?.(`caret`)||e?.classList?.contains?.(`caret`)))?``:mapp.utils.html`
      <div class="notranslate material-symbols-outlined caret">`;return e.drawer===`disableOnHide`&&e.layer?.showCallbacks&&(e.class+=e.layer.display?``:` disabled`,e.layer.showCallbacks.push(()=>{e.drawer.classList.remove(`disabled`)}),e.layer.hideCallbacks.push(()=>{e.drawer.classList.add(`disabled`),e.drawer.classList.remove(`expanded`)})),e.drawer=mapp.utils.html.node`
  <div
    data-id=${e.data_id}
    class=${e.class}>
    <div
      class="header no-select"
      onclick=${n}>
      ${e.header}
      ${t}
    </div>
    <div class="content">
      ${e.content}
    </div>`,le(e),e.drawer;function n(e){e.target.parentElement.classList.contains(`empty`)||e.target.parentElement.classList.toggle(`expanded`)}}function le(e){if(e.popout){if(e.popout={},e.originalTarget=e.drawer.querySelector(`.content`),e.popoutBtn=e.drawer.querySelector(`.header`).querySelector(`[data-id=popout-btn]`),!e.popoutBtn){e.popoutBtn=mapp.utils.html.node`<button
      data-id="popout-btn"
      class="notranslate material-symbols-outlined">
      open_in_new`;let t=e.drawer.querySelector(`.header`).querySelector(`.caret`);e.drawer.querySelector(`.header`).insertBefore(e.popoutBtn,t)}e.popoutBtn.onclick=()=>{e.drawer.style.display=`none`,e.view=e.drawer.parentElement,ue(e),e.view&&(e.viewChildren=Array.from(e.view.children||[]).filter(e=>e.checkVisibility())),e.viewChildren&&!e.viewChildren.length&&(e.view.previousElementSibling.dispatchEvent(new Event(`click`)),e.view.parentElement.classList.add(`empty`),e.view.previousElementSibling.querySelector(`.caret`).style.setProperty(`display`,`none`))}}}function ue(e){if(e.popout?.dialog)return e.popout.node.querySelector(`.content`).appendChild(mapp.utils.html.node`${Array.from(e.drawer.querySelector(`.content`).children)}`),e.popout.node.querySelector(`header`).replaceChildren(mapp.utils.html.node`${Array.from(e.drawer.querySelector(`.header`).children)}${e.popout.minimizeBtn}${e.popout.closeBtn}`),e.popout.show();e.popout={data_id:`${e.data_id}-popout`,target:document.getElementById(`Map`),height:`auto`,left:`5%`,top:`0.5em`,class:`box-shadow popout`,css_style:`width: 300px; height 300px`,containedCentre:!0,contained:!0,headerDrag:!0,closeBtn:!0,minimizeBtn:!0,onClose:()=>{e.viewChildren&&!e.viewChildren.length&&(e.view.parentElement.classList.remove(`empty`),e.view.previousElementSibling.dispatchEvent(new Event(`click`)),e.view.previousElementSibling.querySelector(`.caret`).style.removeProperty(`display`)),e.drawer.style.removeProperty(`display`),e.drawer.querySelector(`.header`).replaceChildren(mapp.utils.html.node`${Array.from(e.popout.node.querySelector(`header`).children).filter(e=>![`close`,`minimize`].includes(e.dataset.id))}`),e.originalTarget.appendChild(mapp.utils.html.node`${Array.from(e.popout.node.querySelector(`.content`).children)}`)},...e.popout},mapp.ui.elements.dialog(e.popout),e.popout.node.querySelector(`header`).replaceChildren(mapp.utils.html.node`${Array.from(e.drawer.querySelector(`.header`).children)}${e.popout.minimizeBtn}${e.popout.closeBtn}`),e.popout.node.querySelector(`.content`).appendChild(mapp.utils.html.node`${Array.from(e.drawer.querySelector(`.content`).children)}`),e.popout.view=e.popout.node.querySelector(`.content`)}function de(e){e.dialog===!0&&(e.dialog={}),e.dialog.btn_label??=`Open dialog`,e.dialog.btn_title??=e.dialog.btn_label;let t=e.dialog.icon_name||e.dialog.btnIcon||e.dialog.icon;return e.dialog.btn=mapp.utils.html.node`<button
    class="wide flat action multi_hover"
    data-id=${e.data_id}
    title=${e.dialog.btn_title}
    onclick=${()=>{e.dialog.btn.classList.toggle(`active`)?fe(e):e.dialog.close()}}>
    <span class="material-symbols-outlined notranslate">${t}</span>
    ${e.dialog.btn_label}`,e.layer?.hideCallbacks?.push(()=>{e.dialog.close?.()}),e.dialog.showOnLayerDisplay&&e.layer?.showCallbacks.push(()=>{e.dialog.show?.()}),e.dialog.btn}function fe(e){if(e.layer?.show(),e.dialog.show)return e.dialog.show();e.dialog.data_id??=`${e.data_id}-dialog`,e.dialog.title??=`Dialog`,e.dialog.header??=mapp.utils.html`<h1>${e.dialog.title}`,e.dialog={target:document.getElementById(`Map`),content:e.content,height:`auto`,left:`5em`,top:`0.5em`,class:`box-shadow`,css_style:`min-width: 300px; width: 350px`,containedCentre:!0,contained:!0,headerDrag:!0,minimizeBtn:!0,closeBtn:!0,onClose:()=>{e.dialog.btn.classList.remove(`active`)},...e.dialog},mapp.ui.elements.dialog(e.dialog)}var pe={circle:ye,circle_2pt:ve,drawOnclick:p,line:he,locator:be,point:me,polygon:ge,rectangle:_e};async function p(e,t,n){if(t.location){let r=await t.location.confirmUpdate(i);if(r===null)return;if(r===!0){p(e,t,n);return}function i(){t.location.renderLocationView()}}let r=n.btn||e.target;if(n.callback??=e=>{mapp.location.create(e,n,t),r.classList.remove(`active`),delete t.mapview.interaction,mapp.ui.elements.helpDialog(),setTimeout(()=>{!t.mapview.interaction&&t.mapview.interactions.highlight()},400)},!r.classList.toggle(`active`)){t.mapview.interactions.highlight();return}!t.display&&t.show(),t.mapview.interactions.draw(n),!(t.draw.hideHelp||n.hideHelp)&&(n.helpDialog.header=mapp.utils.html`<h3 style="line-height: 2em; margin-right: 1em">${mapp.dictionary.draw_dialog_title}</h3>`,n.helpDialog.data_id=`dialog_drawing`,mapp.ui.elements.helpDialog(n.helpDialog))}function me(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.point={helpDialog:t,label:mapp.dictionary.draw_point,type:`Point`,...e.draw.point,layer:e},e.draw.point.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${t=>p(t,e,e.draw.point)}>
      <span class="notranslate material-symbols-outlined">add_location_alt</span>
      ${e.draw.point.label}`,e.draw.point.btn}function he(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.line={helpDialog:t,label:mapp.dictionary.draw_line,type:`LineString`,...e.draw.line,layer:e},e.draw.line.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${t=>p(t,e,e.draw.line)}>
      <span class="notranslate material-symbols-outlined">polyline</span>
      ${e.draw.line.label}`,e.draw.line.btn}function ge(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_cancel_drawing}
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save}</ul>`};return e.draw.polygon={helpDialog:t,label:mapp.dictionary.draw_polygon,type:`Polygon`,...e.draw.polygon,layer:e},e.draw.polygon.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${t=>p(t,e,e.draw.polygon)}>
      <span class="notranslate material-symbols-outlined">activity_zone</span>
      ${e.draw.polygon.label}`,e.draw.polygon.btn}function _e(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.rectangle={geometryFunction:ol.interaction.Draw.createBox(),helpDialog:t,label:mapp.dictionary.draw_rectangle,type:`Circle`,...e.draw.rectangle,layer:e},e.draw.rectangle.btn=mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${t=>p(t,e,e.draw.rectangle)}>
    <span class="notranslate material-symbols-outlined">rectangle</span>
    ${e.draw.rectangle.label}`,e.draw.rectangle.btn}function ve(e){let t={content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`};return e.draw.circle_2pt={geometryFunction:ol.interaction.Draw.createRegularPolygon(33),helpDialog:t,label:mapp.dictionary.draw_circle_2pt,type:`Circle`,...e.draw.circle_2pt,layer:e},e.draw.circle_2pt.btn=mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${t=>p(t,e,e.draw.circle_2pt)}>
    <span class="notranslate material-symbols-outlined">outbound</span>
    ${e.draw.circle_2pt.label}`,e.draw.circle_2pt.btn}function ye(e){let t={helpDialog:{content:mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`},label:mapp.dictionary.draw_circle,type:`Point`,units:`meter`,unitsConfig:{meter:{max:1e3,min:1,title:`Meter`},km:{max:10,min:1,title:`KM`},miles:{max:10,min:1,title:`Miles`},meter2:{max:1e3,min:1,title:`Meter²`},km2:{max:10,min:1,title:`KM²`}},unitConversion:{km:e=>e*1e3,km2:e=>Math.sqrt(e*1e6/Math.PI),meter:e=>e,meter2:e=>Math.sqrt(e/Math.PI),miles:e=>e*1609.34},...e.draw.circle,layer:e};e.draw.circle=t,t.unitsOptions??=Object.keys(t.unitsConfig),t.unitsOptions=t.unitsOptions.filter(e=>Object.hasOwn(t.unitsConfig,e)?(t.unitsConfig[e].option=e,t.unitsConfig[e].title??=e,!0):(console.warn(`Unknown circle drawing unit ${e}`),!1)),t.unitsOptions.length&&Object.keys(t.unitsConfig).forEach(e=>{t.unitsOptions.includes(e)||delete t.unitsConfig[e]}),Object.hasOwn(t.unitsConfig,t.units)||(t.units=Object.keys(t.unitsConfig)[0]),t.geometryFunction??=t=>new ol.geom.Polygon.circular(ol.proj.toLonLat(t),e.draw.circle.unitConversion[e.draw.circle.units](e.draw.circle.radius),64).transform(`EPSG:4326`,`EPSG:3857`),t.unitsDropDown=mapp.utils.html.node`<div
    style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({callback:(e,n)=>m(t,n.option),entries:Object.values(t.unitsConfig),placeholder:t.unitsConfig[t.units].title})}`,t.rangeSlider=mapp.utils.html.node`<div>`,m(t,t.units),t.btn=mapp.utils.html.node`<button
    class="action wide"
    onclick=${n=>p(n,e,t)}>
      <span class="notranslate material-symbols-outlined">add_circle</span>
      ${t.label}`;let n=mapp.utils.html.node`
    <div class="panel flex-col">
      ${t.unitsDropDown}
      ${t.rangeSlider}
      ${t.btn}`;return t.hidePanel?t.btn:(t.dialog&&={btn_label:mapp.dictionary.draw_circle_dialog,title:mapp.dictionary.draw_settings,...t.dialog},t.drawer=mapp.ui.elements.drawer({data_id:`draw-circle-${e.key}`,drawer:t.drawer,layer:e,header:mapp.utils.html`
    <h3>${mapp.dictionary.circle_config}</h3>`,content:n,popout:t.popout,dialog:t.dialog}),t.drawer)}function m(e,t){let n=e.unitsConfig[t];e.units=n.option,e.radius??=n.min,e.radius=e.radius>n.max?n.max:e.radius,mapp.utils.render(e.rangeSlider,mapp.ui.elements.slider({callback:t=>{e.radius=Number.parseFloat(t)},max:n.max,min:n.min,val:e.radius}))}function be(e){return e.draw.locator={label:mapp.dictionary.draw_position,type:`Point`,...e.draw.locator,layer:e},e.draw.locator.btn=mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${t=>{mapp.utils.getCurrentPosition(async t=>{let n={layer:e,new:!0,table:e.tableCurrent()},r=ol.proj.transform([Number.parseFloat(t.coords.longitude),Number.parseFloat(t.coords.latitude)],`EPSG:4326`,`EPSG:${e.srid}`);n.id=await mapp.utils.xhr({body:JSON.stringify({[e.geom]:{coordinates:r,type:`Point`}}),method:`POST`,url:`${e.mapview.host}/api/query?`+mapp.utils.paramString({layer:e.key,locale:e.mapview.locale.key,table:n.table,template:`location_new`})}),mapp.location.get(n)})}}>
      <span class="notranslate material-symbols-outlined">my_location</span>
      ${e.draw.locator.label}`,e.draw.locator.btn}function xe(e){e.selectedTitles=new Set,e.selectedOptions=new Set,e.placeholder??=e.span||``,e.entries=e.entries?.filter?.(e=>e.option!==``),Te(e),Ee(e),e.onChange??=Ce,e.options=we(e);let t=e.selectedTitles.size?Array.from(e.selectedTitles).join(`, `):e.placeholder,n=e.keepPlaceholder?e.placeholder:t;return e.placeHolderOption=mapp.utils.html.node`
    <option style="display: none;" value="" disabled selected>${n}`,e.options.unshift(e.placeHolderOption),e.data_id??=`dropdown`,e.select=mapp.utils.html.node`<select
    class="select-dropdown"
    data-id=${e.data_id}
    onfocus=${Se}
    onblur=${Se}
    onchange=${t=>Ce(t,e)}>
    ${e.options}`,e.multiple&&(e.select.multiple=!0),e.node=mapp.utils.html.node`
    ${e.pills?.container}
    ${e.search||e.select}`,e.node}function Se(e){e.target.selectedIndex=0}function Ce(e,t){let n=e.target.selectedIndex;e.target.selectedIndex=0;let r=t.entries[n-1];if(r.selected=!r.selected,t.multi){if(t.options[n].classList.toggle(`selected`)?(t.selectedTitles.add(r.title),t.selectedOptions.add(r.option),t.pills?.add(r.title)):(t.selectedTitles.delete(r.title),t.selectedOptions.delete(r.option),t.pills?.remove(r.title)),!t.pills&&!t.keepPlaceholder){let e=t.selectedTitles?.size&&Array.from(t.selectedTitles).join(`, `);t.placeHolderOption.textContent=e||t.placeholder}t.callback?.(e,[...t.selectedOptions],r);return}t.options.forEach(e=>{e.classList.remove(`selected`),e.style.backgroundColor=`var(--color-base-secondary)`}),t.options[n].classList.add(`selected`),t.options[n].style.removeProperty(`background-color`),t.keepPlaceholder||(t.placeHolderOption.textContent=r.title),t.callback?.(e,r)}function we(e){return e.entries.map(t=>(t.li=mapp.utils.html.node`<option
        value=${t.option}>
        ${t.title||t.label||t.field}`,t.selected&&(t.li.classList.add(`selected`),e.selectedTitles.add(t.title),e.selectedOptions.add(t.option),e.pills?.add(t.title)),t.li))}function Te(e){e.pills&&=mapp.ui.elements.pills({addCallback:(t,n)=>{e.callback?.(null,[...n])},pills:[...e.selectedTitles],removeCallback:(t,n)=>{let r=e.entries.findIndex(e=>e.option===t),i=e.entries.findIndex(e=>e.option===t)+1;e.entries.find(e=>e.option===t).selected=!1,e.options[i].classList.remove(`selected`),e.selectedTitles.delete(r.title),e.selectedOptions.delete(r.option),e.callback?.(null,[...n])}})}function Ee(e){if(!e.search)return;let t=`${e.field}-search-options`,n=e.placeholder||`Enter search term...`,r=mapp.utils.html.node`<input
    placeholder=${n}
    type="search" list=${t}
    onInput=${t=>De(t,e)}
    onfocus="this.placeholder=''"
    onblur=${e=>e.target.placeholder=n}>`;e.searchOptions=[];for(let t of e.entries){let n=mapp.utils.html.node`
      <option value=${t.option} data-title=${t.title}>${t.title}`;e.searchOptions.push(n)}let i=mapp.utils.html.node`<datalist id=${t}>${e.searchOptions}`;return e.search=mapp.utils.html.node`${r}${i}`,e.search}function De(e,t){t.entries.forEach(n=>{n.title===e.target.value&&(n.selected=!n.selected,n.selected?(t.selectedTitles.add(n.title),t.selectedOptions.add(n.option),t.pills?.add(n.title)):(t.selectedTitles.delete(n.title),t.selectedOptions.delete(n.option),t.pills?.remove(n.title)),e.target.value=``,e.target.dispatchEvent(new Event(`blur`)),t.pills||t.callback?.(e,[...t.selectedOptions]))})}var h;function Oe(e){h?.node.remove(),e&&(mapp.user?.hideHelp||(h={closeBtn:!0,contained:!0,css_style:`padding: 0.5em;`,headerDrag:!0,height:`auto`,left:`6em`,minimizeBtn:!0,target:document.getElementById(`Map`),top:`3em`,...e},mapp.ui.elements.dialog(h)))}async function ke(e){let t=await mapp.utils.esmImport(`vanilla-jsoneditor@3.3.1`);return e.content??={json:{}},typeof e.data==`object`&&(e.content.json=e.data),t.createJSONEditor({props:{content:e.content,...e.props},target:e.target})}var g={hover:je,hovers:Me,icon_scaling:Re,label:Ne,labels:Pe,opacitySlider:Fe,panel:Ae,theme:Ie,themes:Le};function Ae(e){if(!e.style)return;e.style.elements??=Object.keys(e.style);let t=[];for(let n of e.style.elements){if(!Object.hasOwn(e.style,n)||!Object.hasOwn(g,n))continue;let r=g[n](e);r&&t.push(r)}if(t.length)return e.style.view=mapp.utils.html.node`<div>${t}`,e.style.view}function je(e){if(e.style.hover&&!e.style.hover.hidden)return mapp.ui.elements.chkbox({checked:!!e.style.hover.display,data_id:`hoverCheckbox-${e.key}`,label:e.style.hovers&&mapp.dictionary.layer_style_display_hover||e.style.hover.title||mapp.dictionary.layer_style_display_hover,onchange:t=>{e.style.hover.display=t}})}function Me(e){if(!e.style.hover||e.style.hover.hidden||!e.style.hovers||Object.keys(e.style.hovers).length<2)return;let t=Object.keys(e.style.hovers).filter(t=>!e.style.hovers[t].hidden).map(t=>({option:t,title:e.style.hovers[t].title||t}));return mapp.ui.elements.dropdown({callback:(t,n)=>{let r=e.style.hover.display;e.style.hover=e.style.hovers[n.option],e.style.hover.method??=mapp.layer.featureHover,e.style.hover.display=r},data_id:`hoversDropdown-${e.key}`,entries:t,placeholder:e.style.hover.title})}function Ne(e){if(!e.style.label||e.style.label.hidden)return;if(e.style.labelCheckbox)return e.style.labelCheckbox;let t=e.style.labels&&mapp.dictionary.layer_style_display_labels;return t??=e.style.label.title||mapp.dictionary.layer_style_display_labels,e.style.labelCheckbox=mapp.ui.elements.chkbox({checked:!!e.style.label.display,data_id:`labelCheckbox-${e.key}`,label:t,onchange:t=>{e.style.label.display=t,e.reload()}}),e.changeEndCallbacks.push(_),e.style.labelCheckbox}function _(e){if(e.style.label.minZoom||e.style.label.maxZoom){let t=e.mapview.Map.getView().getZoom();t<=e.style.label.minZoom||t>=e.style.label.maxZoom?e.style.labelCheckbox?.classList.add(`disabled`):e.style.labelCheckbox?.classList.remove(`disabled`)}}function Pe(e){if(!e.style.label||e.style.label.hidden||!e.style.labels||Object.keys(e.style.labels).length<2)return;let t=Object.keys(e.style.labels).filter(t=>!e.style.labels[t].hidden).map(t=>({option:t,title:e.style.labels[t].title||t}));return mapp.utils.html`
  <div>${mapp.dictionary.layer_style_select_label}</div>
  ${mapp.ui.elements.dropdown({callback:n,data_id:`labelsDropdown`,entries:t,placeholder:e.style.label.title})}`;function n(t,n){let r=e.style.label.display;e.style.label=e.style.labels[n.option],e.style.label.display=r,e.reload(),_(e)}}function Fe(e){return mapp.ui.elements.slider({callback:t=>{e.L.setOpacity(Number.parseFloat(t/100))},data_id:`opacitySlider`,label:`${mapp.dictionary.layer_style_opacity}`,max:100,min:0,val:Number.parseInt(e.L.getOpacity()*100)})}function Ie(e){if(!e.style.theme)return;e.style.labels&&Object.hasOwn(e.style.labels,e.style.theme?.setLabel)&&(e.style.label=e.style.labels[e.style.theme.setLabel]),e.style.hovers&&Object.hasOwn(e.style.hovers,e.style.theme?.setHover)&&(e.style.hover=e.style.hovers[e.style.theme.setHover]);let t=[];return e.style.theme?.meta&&(e.style.theme.meta_node=mapp.utils.html.node`<p>${e.style.theme.meta}`,t.push(e.style.theme.meta_node)),Object.hasOwn(mapp.ui.layers.legends,e.style.theme?.type)&&(e.style.legend=mapp.utils.html.node`<div class="legend">`,t.push(e.style.legend),Object.hasOwn(mapp.layer.featureFields.distribution,e.style.theme.distribution)||e.showCallbacks.push(()=>{mapp.ui.layers.legends[e.style.theme.type](e)})),mapp.utils.html.node`<div data-id="layerTheme">${t}`}function Le(e){if(!e.style.themes||Object.keys(e.style.themes).length<2)return;let t=Object.keys(e.style.themes).map(t=>({option:t,title:e.style.themes[t].title||t}));function n(t,n){e.style.theme=e.style.themes[n.option],e.style.theme.setLabel&&e.style.labels&&(e.style.label=e.style.labels[e.style.theme.setLabel]),e.style.theme.setHover&&e.style.hovers&&(e.style.hover=e.style.hovers[e.style.theme.setHover],e.style.hover.method??=mapp.layer.featureHover);let r=mapp.ui.layers.panels.style(e);e.style.panel&&e.style.panel.replaceChildren(...r.children),e.view?.querySelector(`[data-id=style-drawer]`).replaceChildren(...r.children),e.reload()}return mapp.utils.html`<div>
    ${mapp.dictionary.layer_style_select_theme}
    ${mapp.ui.elements.dropdown({callback:n,data_id:`themesDropdown`,entries:t,placeholder:e.style.theme.title})}`}function Re(e){if(!e.style.icon_scaling||e.style.icon_scaling.hidden)return;let t=[];if(e.style.icon_scaling.fields){let n=Object.keys(e.style.icon_scaling.fields).map(t=>({option:e.style.icon_scaling.fields[t].field,title:e.style.icon_scaling.fields[t].title||t,key:t}));n.push({title:mapp.dictionary.icon_scaling_no_scaling}),e.style.icon_scaling.placeholder??=mapp.dictionary.icon_scaling_select_one,e.style.icon_scaling.title??=mapp.dictionary.icon_scaling_title;let r=Object.keys(e.style.icon_scaling.fields).find(t=>e.style.icon_scaling.fields[t].field===e.style.icon_scaling.field)||Object.keys(e.style.icon_scaling.fields)[0];t.push(mapp.utils.html`
        <h3>${e.style.icon_scaling.title}`,mapp.ui.elements.dropdown({data_id:`iconScalingFieldsDropdown`,entries:n,callback:(t,n)=>{n.option?Object.assign(e.style.icon_scaling,{...e.style.icon_scaling.fields[n.key]}):delete e.style.icon_scaling.field,e.reload(),e.L.changed()},placeholder:e.style.icon_scaling.fields[r].title||r||e.style.icon_scaling.placeholder}))}else e.style.icon_scaling.field&&t.push(mapp.ui.elements.chkbox({checked:!!e.style.icon_scaling.field,data_id:`iconScalingFieldCheckbox-${e.key}`,label:mapp.dictionary.icon_scaling_field,onchange:t=>{t?(e.style.icon_scaling.field=e.style.icon_scaling._field,delete e.style.icon_scaling._field):(e.style.icon_scaling._field=e.style.icon_scaling.field,delete e.style.icon_scaling.field),e.L.changed()}}));return e.style.icon_scaling.icon&&(e.style.default.scale??=1,e.style.icon_scaling.maxScale??=e.style.default.scale*3,e.style.icon_scaling.minScale??=.1,e.style.icon_scaling.icon_scaling_label??=mapp.dictionary.icon_scaling_label,t.push(mapp.ui.elements.slider({callback:t=>{e.style.default.scale=Number.parseFloat(t),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:`iconScalingSlider`,label:e.style.icon_scaling.icon_scaling_label,max:e.style.icon_scaling.maxScale,min:e.style.icon_scaling.minScale,step:e.style.default.scale/10,val:e.style.default.scale}))),e.style.icon_scaling.clusterScale&&e.style.cluster?.clusterScale&&(e.style.cluster.clusterScale??=1,t.push(mapp.ui.elements.slider({callback:t=>{e.style.cluster.clusterScale=Number.parseFloat(t),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:`iconScalingClusterSlider`,label:mapp.dictionary.icon_scaling_cluster,max:e.style.cluster.clusterScale*3,min:0,step:e.style.cluster.clusterScale/10,val:e.style.cluster.clusterScale}))),e.style.icon_scaling.zoomInScale&&(e.style.zoomInScale??=1,t.push(mapp.ui.elements.slider({callback:t=>{e.style.zoomInScale=Number.parseFloat(t),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:`iconScalingZoomInSlider`,label:mapp.dictionary.icon_scaling_zoom_in,max:e.style.zoomInScale*3,min:0,step:e.style.zoomInScale/10,val:e.style.zoomInScale}))),e.style.icon_scaling.zoomOutScale&&(e.style.zoomOutScale??=1,t.push(mapp.ui.elements.slider({callback:t=>{e.style.zoomOutScale=Number.parseFloat(t),clearTimeout(e.style.timeout),e.style.timeout=setTimeout(()=>e.L.changed(),400)},data_id:`iconScalingZoomOutSlider`,label:mapp.dictionary.icon_scaling_zoom_out,max:e.style.zoomOutScale*3,min:0,step:e.style.zoomOutScale/10,val:e.style.zoomOutScale}))),mapp.utils.html.node`<div>${t}`}var v=new XMLSerializer,y=24;function ze(e){let t=[];return Array.isArray(e.icon)?t.push(Be(e)):(e.icon||e.svg||e.type)&&t.push(He(e)),e.fillColor&&t.push(Ge(e)),e.strokeColor&&!e.fillColor&&t.push(We(e)),mapp.utils.html.node`<div class="legend-icon">${t}`}function Be(e){let t=e.width||y,n=e.height||y,r=document.createElement(`canvas`);if(r.width=t,r.height=n,!e.bitmap_icons)return b(r,e,t,n),r;let i=e.icon.map(e=>mapp.utils.iconUrl(e));return mapp.utils.svgBitmap.requestBitmaps(i).then(()=>b(r,e,t,n)),r}function b(e,t,n,r){let i=t.icon.length;function a(){if(--i)return;let a=t.icon.map(e=>e.legendStyle?.getImage()).filter(Boolean),o=a.map(e=>{let t=e.getImageSize()||[n,r],i=e.getScale()||1;return[t[0]*i,t[1]*i]}),s=Math.max(...o.map(e=>e[0]))||n,c=Math.max(...o.map(e=>e[1]))||r,l=Math.min(n/s,r/c),u=[s*l,c*l];a.forEach(e=>e.setScale(e.getScale()*l));let d=ol.render.toContext(e.getContext(`2d`),{pixelRatio:1,size:u});t.icon.forEach(e=>{d.setStyle(e.legendStyle),d.drawGeometry(new ol.geom.Point([u[0]*.5,u[1]*.5]))})}let o=t.icon[0].legendScale||1;for(let e of t.icon){let n=mapp.utils.iconUrl(e);if(!n){console.warn(`legendIcon: icon has no url, the svg or template may be missing/invalid: `,e);continue}let r=Ve(n,e.legendAnchor||[.5,.5],o*(e.scale||1),t.bitmap_icons);e.legendStyle=new ol.style.Style({image:r});let i=r.getImage();r.getImageState()===2?a():(i.addEventListener(`load`,a),r.load())}return e}function Ve(e,t,n,r){let i=r&&mapp.utils.svgBitmap.iconBitmap(e);return i?new ol.style.Icon({anchor:t,img:i.image,scale:n/i.pixelRatio}):new ol.style.Icon({anchor:t,crossOrigin:e.startsWith(`data:`)?void 0:`anonymous`,scale:n,src:e})}function He(e){let t=mapp.utils.iconUrl(e.icon||e);if(t||console.warn(`legendIcon: icon has no url, the svg or template may be missing/invalid: `,e.icon||e),e.bitmap_icons&&t?.startsWith(`data:`))return Ue(t,e);let n=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width+`px`||`100%`};
    height: ${e.height+`px`||`100%`};
    background-image: url(${t})`;return mapp.utils.html.node`<div style=${n}>`}function Ue(e,t){let n=t.width||y,r=t.height||y,i=`width: ${n}px; height: ${r}px;`,a=mapp.utils.html.node`<canvas
    style=${i}>`;return mapp.utils.svgBitmap.requestBitmaps([e]).then(()=>{let t=mapp.utils.svgBitmap.iconBitmap(e);if(!t){let t=`
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        width: ${n}px;
        height: ${r}px;
        background-image: url(${e})`,i=mapp.utils.html.node`<div style=${t}>`;a.replaceWith(i);return}a.width=t.image.width,a.height=t.image.height;let i=t.image.width/t.pixelRatio,o=t.image.height/t.pixelRatio,s=Math.min(n/i,r/o);a.style.width=`${i*s}px`,a.style.height=`${o*s}px`,a.getContext(`2d`).drawImage(t.image,0,0)}),a}function We(e){let t=`M 0,${e.height/2} L ${e.width/2},${e.height/2} ${e.width/2},${e.height/2} ${e.width},${e.height/2}`;e.strokeWidth??=1,e.lineDash??=``;let n=mapp.utils.svg.node`
  <svg
    height=${e.height}
    width=${e.width}>
    <path
      d=${t}
      fill="none"
      stroke=${e.strokeColor}
      stroke-width=${e.strokeWidth}
      stroke-dasharray=${e.lineDash} />`,r=`data:image/svg+xml,${encodeURIComponent(v.serializeToString(n))}`,i=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width}px;
    height: ${e.height}px;
    background-image: url(${r});`;return mapp.utils.html`<div style=${i}>`}function Ge(e){e.fillOpacity??=1,e.strokeWidth??=1,e.lineDash??=``;let t=mapp.utils.svg.node`
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
      stroke-dasharray=${e.lineDash} >`,n=`data:image/svg+xml,${encodeURIComponent(v.serializeToString(t))}`,r=`
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${e.width}px;
    height: ${e.height}px;
    background-image: url(${n});`;return mapp.utils.html`<div style=${r}>`}async function Ke(e,t){let n=[];if(await x(n,e,0,t),n.length&&!(n.length===1&&t.length===1))return mapp.utils.html.node`${n}`}async function x(e,t,n,r){if(!r?.length)return;if(n>0){if(r=await mapp.utils.xhr(`${mapp.host}/api/workspace/locales?locale=${t.keys?.slice(0,n).join(`,`)||t.key}`),r instanceof Error||!r.length)return;t.keys?.length>n&&r.unshift({key:t.keys.slice(0,n).join(`,`),name:t.name.split(`/`).slice(0,n).join(`/`)})}let i=t.keys?.[n]||t.key;n>0&&(!t.keys||t.keys.length===n)&&(i=`Select nested locale`);let a=mapp.ui.elements.dropdown({data_id:`locale-dropdown-${n}`,placeholder:i,entries:r.map(e=>{e.key.split(`,`);let r=e.name.split(`/`).slice(n).join(`/`),i=t.keys?.slice(0,n+1).join(`,`)||t.key;return{title:r,key:e.key,option:e.key,selected:e.key===i}}),callback:(e,t)=>{globalThis.location.assign(`${mapp.host}?locale=${t.key}`)}});e.push(a),n++,(n===1||t.keys?.length>=n)&&await x(e,t,n,r)}function qe(e={}){e.msg??=``,e.formAction=`${mapp.host}/api/user/login?language=${mapp.language}`,e.register??=`${mapp.host}/api/user/register?language=${mapp.language}`,e.classList??=``,e.login_email??=mapp.dictionary.login_email,e.login_password??=mapp.dictionary.login_password,e.login_button??=mapp.dictionary.login_button,e.login_verification_note??=mapp.dictionary.login_verification_note,e.login_registration_link??=mapp.dictionary.login_registration_link,e.login_invalid??=mapp.dictionary.login_invalid;let t=`login-form no-select ${e.classList}`,n=mapp.utils.html.node`<input
    id="auth_user_email"
    name="email"
    type="email"
    required
    autocomplete="username"
    maxlength="50"
    onkeyup=${o}
    onchange=${o}>`,r=mapp.utils.html.node`<span class="bold" style="color: var(--color-danger)">`,i=mapp.utils.html.node`<input
    id="auth_user_password"
    name="password"
    type="password"
    required
    autocomplete="current-password"
    minlength="12"
    onkeyup=${o}
    onchange=${o}>`,a=mapp.utils.html.node`
    <button id="btnLogin" class="primary bold" type="submit" disabled>${e.login_button}`;return mapp.utils.html.node`<form
    class=${t}
    method="post"
    autocomplete="off"
    action=${e.formAction}>
    <input style="display: none" name="language" required value="en">
    <div class="input-group">
      ${n}
      <span class="bar"></span>
      <label for="auth_user_email">${e.login_email}</label>
    </div>
    <div class="input-group">
      ${i}
      <span class="bar"></span>
      <label for="auth_user_password">${e.login_password}</label>
      <br>
      ${r}
    </div>
    <p class="msg">${e.msg}</p>

    ${a}

    <p>${e.login_verification_note}</p>

    <a 
      class="switch"
      href=${e.register}>${e.login_registration_link}</a>`;function o(){a.disabled=!(n.validity.valid&&i.validity.valid),r.textContent=a.disabled?e.login_invalid:``}}function Je(e){e.placeholder??=``,e.data_id??=`numeric-input`,e.numericChecks??=Ye;let t=mapp.utils.formatNumericValue(e),n=`text-align: center; width: ${e.dynamicWidth?t.length+1.3+`ch`:`100%`}`;return mapp.utils.html.node`<input
    data-id=${e.data_id}
    type="text"
    style=${n}
    placeholder=${e.placeholder}
    value=${t}
    onchange=${t=>S(t,e)}
    onfocus=${t=>t.target.value=mapp.utils.unformatStringValue({...e,stringValue:t.target.value})}
    oninput=${t=>S(t,e)}>`}function S(e,t){if(t.stringValue=e.target.value,t.numericChecks(e.target.value,t)?(t.newValue=t.onRangeInput?t.stringValue:mapp.utils.unformatStringValue(t),delete t.invalid,e.target.classList.remove(`invalid`),t.sliderElement&&(t.sliderElement.style.setProperty(`--${e.target.dataset.id}`,t.newValue),t.sliderElement.querySelector(`[name=${t.rangeInput}]`).value=t.newValue)):(t.invalid=!0,e.target.classList.add(`invalid`)),t.invalid)return t.callback();t.callback(t.newValue),t.dynamicWidth&&(e.target.style.width=e.target.value.length+1.3+`ch`),t.onRangeInput=!1}function Ye(e,t){return t.onRangeInput&&e===null||Number.isNaN(Number(e))||t.min&&e<t.min?!1:t.max?e<=t.max:!0}function Xe(e={}){return e.container=mapp.utils.html.node`<div class="pill-container">`,e.pills=Array.isArray(e.pills)?new Set(e.pills):new Set,e.add=Ze,e.remove=Qe,e.pills.forEach(t=>e.add(t)),e.target instanceof HTMLElement&&e.target.append(e.container),e}function Ze(e){let t=this,n=mapp.utils.html.node`<div
    class="pill"
    style=${t.css_pill}
    data-value=${e}
    title="${e}">${e}`;t.removeCallback&&n.append(mapp.utils.html.node`<button class="notranslate material-symbols-outlined close"
      data-value=${e}
      title=${mapp.dictionary.pill_component_remove}
      onclick=${n=>{n.stopPropagation(),t.remove(e)}}>`),t.pills.has(e)||t.pills.add(e),t.container.append(n),typeof t.addCallback==`function`&&t.addCallback(e,t.pills)}function Qe(e){let t=this;Array.from(t.container.children).find(t=>t.dataset.value===e.toString())?.remove(),t.pills.delete(e),typeof t.removeCallback==`function`&&t.removeCallback(e,t.pills)}function $e(e){e.name??=`mapp-ui-radio-element`,e.data_id??=`radio`,e.label??=`No label defined`;let t=e.caption?mapp.utils.html`<legend>${e.caption}`:``,n=mapp.utils.html.node`<input 
    type="radio"
    data-id=${e.data_id}
    name="${e.name}"
    .disabled=${!!e.disabled}
    .checked=${!!e.checked}
    onchange=${t=>{e.onchange?.(t,e)}}/>`;return mapp.utils.html.node`<div>
    ${t}
    <label 
    class="radio">
    ${n}
    <span class="material-symbols-outlined"></span>
    <span>${e.label}`}function et(e={}){e.msg??=``,e.formAction=`${mapp.host}/api/user/register?language=${mapp.language}`,e.classList??=``,e.login??=`${mapp.host}/api/user/login?language=${mapp.language}`,e.register_privacy_agreement??=mapp.dictionary.register_privacy_agreement,e.register_next_info??=mapp.dictionary.register_next_info,e.register_error=mapp.dictionary.register_error;let t=`login-form no-select ${e.classList}`,n=mapp.utils.html.node`<input
    id="auth_user_email"
    name="email"
    type="email"
    required
    autocomplete="username"
    maxlength="50"
    onkeyup=${c}
    onchange=${c}>`,r=mapp.utils.html.node`<input
      id="auth_user_password"
      name="password"
      type="password"
      required
      autocomplete="new-password"
      minlength="12"
      pattern="(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$"
      onkeyup=${c}
      onchange=${c}>`,i=mapp.utils.html.node`<input
    id="auth_user_password_retype"
    name="password_retype"
    type="password"
    required
    autocomplete="new-password"
    minlength="12"
    pattern="(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$"
    onkeyup=${c}
    onchange=${c}>`,a=mapp.utils.html.node`<div class="bold" style="color: var(--color-danger)">`,o=mapp.ui.elements.chkbox({name:`privacy_agreement`,label:mapp.utils.html`<span class="asterisk">${mapp.dictionary.register_agree}`,onchange:c}),s=mapp.utils.html.node`<button 
    class="primary bold"
    id="btnRegister" type="submit" disabled>
    ${mapp.dictionary.register_reset}`;return mapp.utils.html.node`<form
    class=${t}
    method="post"
    autocomplete="off"
    action=${e.formAction}>
    <input style="display: none" name="language" required value=${mapp.language}>
    <div class="input-group">
      ${n}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_email">${mapp.dictionary.register_email}</label>
    </div>
    <div class="input-group">
      ${r}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_password">${mapp.dictionary.register_new_password}</label>
      <br>
    </div>
    <div class="input-group">
      ${i}
      <span class="bar"></span>
      <label class="asterisk" for="auth_user_password_retype">${mapp.dictionary.register_retype_password}</label>
      <br>
    </div>
    <p class="msg">${e.msg}</p>
    <br>
    <h2>${mapp.dictionary.register_privacy}</h2>
    <p>${e.register_privacy_agreement}</p>
    <br>
    ${o}
    ${s}
    <br>
    ${a}
    <br>
    <h2>${mapp.dictionary.register_next}</h2>
    <p>${e.register_next_info}</p>
    <br>
    <a 
      class="switch"
      href=${e.login}>${mapp.dictionary.register_login}
    </a>
    `;function c(){s.disabled=!(n.validity.valid&&r.validity.valid&&r.value===i.value&&o.querySelector(`input`).checked),a.textContent=s.disabled?e.register_error:``}}function tt(e){if(e.data_id??=`report-link`,e.report){let t={template:e.report.template,locale:e.location?.layer.mapview.locale?.key||e.layer?.mapview.locale?.key,layer:e.location?.layer.key||e.layer?.key,id:e.location?.id,lat:mapp.hooks.current?.lat,lng:mapp.hooks.current?.lng,z:mapp.hooks.current?.z,...e.params};e.icon??=`description`,e.href=`${mapp.host}/view?${mapp.utils.paramString(t)}`}if(e.href??=e.url,!e.href){console.warn(`ReportLink ${e.data_id} is missing url or report definition.`);return}e.label??=e.report?.label||e.title||mapp.dictionary.link,e.icon_class??=``,e.icon_class+=` notranslate material-symbols-outlined`,e.dialog??=!mapp.utils.mobile()&&e.report?.dialog,e.icon??=e.dialog?`iframe`:`open_in_new`,e.link_class??=``,e.link_class+=` link-with-img`,e.target??=`_blank`;let t=mapp.utils.html.node`<a
    data-id=${e.data_id}
    class=${e.link_class}
    target=${e.target}
    href="${e.href}">
    <span class=${e.icon_class}>${e.icon}</span>
    <span>${e.label}</span>`;return e.dialog&&(e.header??=e.label,t.onclick=t=>{t.preventDefault(),nt(e)}),t}function nt(e){let t=mapp.utils.html`<iframe src=${e.href}>`;e.dialog=mapp.ui.elements.dialog({header:mapp.utils.html`<h2>&nbsp;${e.header}`,css_style:`width: 100%; height: 100%`,containedCentre:!0,closeBtn:!0,content:t})}function rt(e={}){if(typeof e.searchFunction!=`function`){console.warn(`A searchFunction must be provided for the construction of a searchbox component.`);return}return e.target instanceof HTMLElement||(e.target=mapp.utils.html.node`<div>`),e.name??=`searchbox-input`,e.input=mapp.utils.html.node`
  <input
    name=${e.name}
    type="search"
    placeholder=${e.placeholder}
    aria-label=${e.placeholder}>`,e.list=mapp.utils.html.node`<ul>`,e.node=mapp.utils.html.node`
    <div class="searchbox">
      ${e.input}
      ${e.list}`,e.target.append(e.node),e.input.addEventListener(`input`,t=>e.searchFunction(t)),e.input.addEventListener(`focus`,t=>e.searchFunction(t)),e}function it(e){e.group_id??=e.data_id||`slider`,e.data_id=`a`,e.rangeInput=`rangeInput`,e.step??=1,e.value??=e.val,e.title??=``,e.style??=``;let t=mapp.ui.elements.numericInput(e);return e.sliderElement=mapp.utils.html.node`
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
        oninput=${t=>n(t,e)}>`,e.sliderElement;function n(e,n){let r=Number(e.target.value);n.onRangeInput=!0,t.value=r,t.dispatchEvent(new Event(`change`))}}function at(e){e.group_id??=e.data_id||`slider_ab`,e.step??=1;let t={...e,callback:e.callback_a,data_id:`a`,dynamicWidth:!0,numericChecks:a,rangeInput:`minRangeInput`,value:e.val_a},n=mapp.ui.elements.numericInput(t),r={...e,callback:e.callback_b,data_id:`b`,dynamicWidth:!0,numericChecks:a,rangeInput:`maxRangeInput`,value:e.val_b},i=mapp.ui.elements.numericInput(r);function a(e,n){return e===null||Number.isNaN(Number(e))||(e=Number(e),n.data_id===`a`&&e>Number(r.newValue??r.value))||n.data_id===`b`&&e<Number(t.newValue??t.value)?!1:!(e<n.min||e>n.max)}let o=e.showMinMax?`minmax-row`:`minmax-row display-none`,s=mapp.utils.formatNumericValue({value:e.min,...e}),c=mapp.utils.formatNumericValue({value:e.max,...e}),l=mapp.utils.html.node`
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
        ${n} ${i}
      </div>
      <div class="track-bg"></div>
      <div class=${o}>
        <span>${s}</span><span>${c}</span>
      </div>
      <input data-id="a" type="range"
        name="minRangeInput"
        min=${e.min}
        max=${e.max}
        step=${e.step}
        value=${e.val_a}
        oninput=${t=>u(t,e)}/>
      <input data-id="b" type="range"
        name="maxRangeInput"
        min=${e.min}
        max=${e.max}
        step=${e.step}
        value=${e.val_b}
        oninput=${t=>u(t,e)}/>`;t.sliderElement=l,r.sliderElement=l;function u(e,a){let o=Number(e.target.value);e.target.dataset.id===`a`&&(t.onRangeInput=!0,n.value=o,n.dispatchEvent(new Event(`change`))),e.target.dataset.id===`b`&&(r.onRangeInput=!0,i.value=o,i.dispatchEvent(new Event(`change`)))}return e.max-e.min?l:mapp.utils.html.node`<div>No available range for slider element.`}function ot(e={}){return e.data_id??=`ui-elements-toast`,e.content??=`Set custom HTML content in element configuration.`,e.actions??=[],e.accept&&e.actions.push({label:typeof e.accept==`string`?e.accept:`Accept`}),e.cancel&&e.actions.push({label:typeof e.accept==`string`?e.cancel:`Cancel`}),new Promise(t=>{let n;e.close&&(n=mapp.utils.html`
        <button class="notranslate material-symbols-outlined close"
          onclick=${o}>`);let r=e.actions?.map(e=>(e.classlist??=`bold raised primary`,e.value??=e.label,mapp.utils.html`<button class="${e.classlist}"
        value=${e.value}
        onclick=${t=>o(t,e)}>${e.label}`));r.length||(e.timeout??=3e3,setTimeout(o,e.timeout));let i=e.logo&&mapp.utils.html`<div class="toast-logo"><img src=${e.logo}>`,a=mapp.utils.html.node`
      <div data-id=${e.data_id} class="toast">
      ${n}
      ${i}
      ${e.content}
      <div class="actions">
      ${r}
      </div>`;document.body.append(a);function o(e,n){a.classList.add(`ease-out`),setTimeout(function(){a.remove()},1200),typeof n?.callback==`function`&&n.callback(e),t(e?.target.value)}})}function st(e={}){if(e.data_id??=`ui-elements-tooltip`,!e.content){console.warn(`mapp.ui.elements.tooltip: content for ${e.data_id} not provided.`);return}return e.node=mapp.utils.html.node`<span 
    data-id=${e.data_id}
    title=${e.content}
    class="tooltip material-symbols-outlined notranslate">help</span>`,e.node}function ct(e,t){return e.localeInput=mapp.utils.html.node`<input
    type="text" value="${decodeURIComponent(t.locale.name)||t.locale.key}">`,e.ulLocales=mapp.utils.html.node`<div class="user-locales">`,e.panel=mapp.utils.html.node`
  <div>
    <p>${mapp.dictionary.user_locale_specific}</p>
    <p>${mapp.dictionary.user_locale_context}</p>
    <br>
    <h3>${mapp.dictionary.user_locale_save}</h3>

    <div style="display:flex;">${e.localeInput}
      <button style="font-size: 1.5em;"
        onclick=${async()=>await ut(e,t)}>
        <span class="notranslate material-symbols-outlined">save</span>
      </button>
    </div>
    ${e.ulLocales}`,C(e,t),e.panel}async function lt(e,t,n){e.panel.classList.add(`disabled`),t.locale.name=n,await mapp.utils.userLocale.remove(t.locale),C(e,t),e.panel.classList.remove(`disabled`)}async function ut(e,t){e.panel.classList.add(`disabled`),t.locale.name=encodeURIComponent(e.localeInput.value),await mapp.utils.userLocale.putLocale(t)===t.locale.name&&(C(e,t),e.panel.classList.remove(`disabled`))}async function C(e,t){let n=await mapp.utils.userLocale.list(t.locale.workspace);if(!n.length){mapp.utils.render(e.ulLocales,mapp.utils.html`<div>`);return}let r=n.map(n=>{let r=mapp.utils.html`<button
    onclick=${async r=>await lt(e,t,n.name)}>
      <span class="notranslate material-symbols-outlined">delete</span>`,i=`${mapp.host}?locale=${n.key}&userlocale=${encodeURIComponent(n.name)}`;return mapp.utils.html`<li>${r}<a href=${i}>${decodeURIComponent(n.name)}`});mapp.utils.render(e.ulLocales,mapp.utils.html`
    <h3>${mapp.dictionary.user_locale_desc}</h3>
    <ul>${r}`)}var dt={alert:o,btnPanel:s,card:c,chkbox:l,confirm:u,contextMenu:d,control:ne,dialog:ae,drawer:ce,drawerDialog:de,drawing:pe,dropdown:xe,helpDialog:Oe,jsoneditor:ke,layerStyle:g,legendIcon:ze,locales:Ke,loginForm:qe,numericInput:Je,pills:Xe,radio:$e,reportLink:tt,registerForm:et,searchbox:rt,slider:it,slider_ab:at,toast:ot,tooltip:st,userLocale:ct},ft=e=>{e={...e,...mapp.ui.elements.searchbox({name:`gazetteer-search-input`,placeholder:e.placeholder,searchFunction:t,target:e.target})};function t(t){if(e.list.innerHTML=``,!t.target.value.length)return;let n=t.target.value.split(`,`).map(parseFloat);if(n.length===2&&n.every(e=>typeof e==`number`&&!Number.isNaN(Number(e))&&Number.isFinite(Number(e)))){let[t,r]=n;if(t>=-90&&t<=90&&r>=-180&&r<=180){e.list.appendChild(mapp.utils.html.node`
        <li onclick=${t=>{mapp.utils.gazetteer.getLocation({label:`Latitude:${n[0]}, Longitude:${n[1]}`,lat:n[0],lng:n[1],source:`Coordinates`},e)}}><span>Latitude:${n[0]}, Longitude:${n[1]}</span>`);return}else e.list.appendChild(mapp.utils.html.node`
          <li style="color: red;">
            <span>${mapp.dictionary.invalid_lat_long_range}</span>`)}e.provider&&(Object.hasOwn(mapp.utils.gazetteer,e.provider)?mapp.utils.gazetteer[e.provider](t.target.value,e):console.warn(`Requested gazetteer service not available`)),mapp.utils.gazetteer.datasets(t.target.value,e)}},w={applyFilter:mt,boolean:vt,date:E,datetime:E,in:Ct,integer:xt,like:_t,match:_t,ni:Ct,null:yt,numeric:xt,removeFilter:ht,resetFilter:gt,generateMinMax:bt},pt;function mt(e){clearTimeout(pt),pt=setTimeout(()=>{e.reload(),e.style?.theme&&mapp.ui.layers.legends[e.style.theme.type]?.(e),e.filter.list?.forEach(e=>{e.histogram?.update?.()}),e.mapview?.target.dispatchEvent(new Event(`changeEnd`))},500)}function T(e,t){e.filter.current[t.field]&&(Object.hasOwn(e.filter.current[t.field],t.type)&&delete e.filter.current[t.field][t.type],Object.hasOwn(e.filter.current,t.field)&&delete e.filter.current[t.field],Number.isNaN(Number(t.Min))&&delete t.min,Number.isNaN(Number(t.Max))&&delete t.max),mapp.ui.layers.filters.applyFilter(e)}function ht(e,t){T(e,t),t.li?.classList.remove(`selected`),t.card?.remove(),t.histogram?.removeChangeEnd?.(),delete t.selected,delete t.card,e.filter.list?.some(e=>e.card)||(e.filter.clearAll instanceof HTMLElement&&e.filter.clearAll.style.setProperty(`display`,`none`),e.filter.resetAll instanceof HTMLElement&&e.filter.resetAll.style.setProperty(`display`,`none`),e.filter.feature_count instanceof HTMLElement&&e.filter.feature_count.style.setProperty(`display`,`none`))}async function gt(e,t){if(T(e,t),!t.card)return;t.content=[await mapp.ui.layers.filters[t.type](e,t)].flat();let n=mapp.ui.elements.card(t);t.card.replaceWith(n),t.card=n}function _t(e,t){return mapp.utils.html.node`
  <input
    type="text"
    onkeyup=${n=>{n.target.value.length?(e.filter.current[t.field]??={},e.filter.current[t.field][t.type]=encodeURIComponent(`${t.leading_wildcard&&`%`||``}${n.target.value}`)):delete e.filter.current[t.field],w.applyFilter(e)}}>`}function vt(e,t){function n(n){e.filter.current[t.field]={boolean:n},w.applyFilter(e)}return n(!1),mapp.ui.elements.chkbox({label:t.label||t.title||`chkbox`,onchange:n})}function yt(e,t){function n(n){e.filter.current[t.field]={null:n},w.applyFilter(e)}return n(!1),mapp.ui.elements.chkbox({label:t.label||t.title||`chkbox`,onchange:n})}async function bt(e,t){let n=mapp.utils.queryParams({layer:e,queryparams:{table:!0,template:`field_minmax`,field:t.field},viewport:e.filter.viewport});n.filter=structuredClone(e.filter.current),delete n.filter[t.field];let r=mapp.utils.paramString(n),i=await mapp.utils.xhr(`${e.mapview.host}/api/query?${r}`),a=Number.isNaN(Number(t.min))?i.minmax[0]:t.min,o=Number.isNaN(Number(t.max))?i.minmax[1]:t.max;e.filter?.viewport&&(a=i.minmax[0],o=i.minmax[1]),t.min=t.type===`integer`?Math.round(a):Number.parseFloat(a),t.max=t.type===`integer`?Math.round(o):Number.parseFloat(o),t.min=t.val_a<t.min?t.val_a:t.min,t.max=t.val_b>t.max?t.val_b:t.max}async function xt(e,t){if(t={...e.infoj.find(e=>e.field===t.field),...t},delete t.val_a,delete t.val_b,t.Min??=Number.isFinite(t.min)?t.min:void 0,t.Max??=Number.isFinite(t.max)?t.max:void 0,(Number.isNaN(Number(t.max))||Number.isNaN(Number(t.min)))&&await bt(e,t),Number.isNaN(Number(t.min))||Number.isNaN(Number(t.max)))return mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;t.step??=t.type===`integer`?1:.01,e.filter.current[t.field]=Object.assign({gte:Number(t.min),lte:Number(t.max)},e.filter.current[t.field]),w.applyFilter(e);let n=t.prefix||t.suffix?`(${(t.prefix||t.suffix).trim()})`:``;return t.label_a??=`${mapp.dictionary.layer_filter_greater_than} ${n}`,t.label_b??=`${mapp.dictionary.layer_filter_less_than} ${n}`,t.val_a=e.filter.current?.[t.field]?.gte,t.val_b=e.filter.current?.[t.field]?.lte,t.callback_a=n=>{e.filter.current[t.field].gte=n,t.val_a=Number(n),w.applyFilter(e)},t.callback_b=n=>{e.filter.current[t.field].lte=n,t.val_b=Number(n),w.applyFilter(e)},t.slider=mapp.ui.elements.slider_ab(t),await St(t,e),mapp.utils.html`
    ${t.histogram?.container}
    ${t.slider}`}async function St(e,t){if(e.histogram&&(e.histogram===!0&&(e.histogram={}),e.histogram.container??=mapp.utils.html.node`<div>`,e.histogram.dataview??=`histogram`,e.histogram.options??={tooltip:!0},e.histogram.target??=e.histogram.container,e.histogram.layer??=t,e.histogram.queryparams??={field:e.field,table:!0,filter:!0},e.histogram.viewport??=t.filter.viewport,e.histogram.update||await mapp.ui.Dataview(e.histogram),e.histogram.viewport)){t.mapview.Map.getTargetElement().addEventListener(`changeEnd`,n),e.histogram.removeChangeEnd=()=>{t.mapview.Map.getTargetElement().removeEventListener(`changeEnd`,n)};function n(){e.histogram.update()}}}async function Ct(e,t){if(T(e,t),!Array.isArray(t[t.type])){let n=structuredClone(e.filter?.current);delete n?.[t.field];let r=await mapp.utils.xhr(`${e.mapview.host}/api/query?`+mapp.utils.paramString({field:t.field,filter:n,layer:e.key,locale:e.mapview.locale.key,table:e.tableCurrent(),template:`distinct_values`}));if(!r)return console.warn(`Distinct values query did not return any values for field ${t.field}`),mapp.utils.html.node`<div>${mapp.dictionary.no_data_filter}</div>`;t[t.type]=[r].flat().map(e=>e[t.field]).filter(e=>e!==null)}let n=new Set(e.filter?.current[t.field]?.[t.type]||[]);if(t.dropdown||t.dropdown_pills||t.dropdown_search){let r=mapp.ui.elements.dropdown({callback:async(n,r)=>{r.length?Object.assign(e.filter.current,{[t.field]:{[t.type]:r}}):delete e.filter.current[t.field],w.applyFilter(e)},field:t.field,search:t.dropdown_search,entries:t[t.type].map(e=>({option:e,selected:n.has(e),title:e})),inputfilter:!0,keepPlaceholder:t.dropdown_pills,maxHeight:300,multi:!0,pills:t.dropdown_pills,placeholder:t.placeholder||mapp.dictionary.layer_filter_dropdown_select});return mapp.utils.html.node`<div class="filter">${r}`}if(t.searchbox){let n=mapp.utils.html.node`<div class="filter">`,r=mapp.ui.elements.pills({pills:e.filter?.current[t.field]?.[t.type],addCallback:(n,r)=>{Object.assign(e.filter.current,{[t.field]:{[t.type]:[...r]}}),w.applyFilter(e)},removeCallback:(n,r)=>{r.size===0?(i.input.value=null,delete e.filter.current[t.field]):Object.assign(e.filter.current,{[t.field]:{[t.type]:[...r]}}),w.applyFilter(e)},target:n}),i=mapp.ui.elements.searchbox({placeholder:mapp.dictionary.filter_searchbox_placeholder,searchFunction:e=>{if(i.list.innerHTML=``,!e.target.value)return;let n=e.target.value,a=t[t.type].filter(e=>e.toString().toLowerCase().startsWith(n.toLowerCase()));if(!a.length){i.list.append(mapp.utils.html.node`
            <li><span>${mapp.dictionary.no_results}`);return}a.filter(e=>!r.pills.has(e)).filter((e,t)=>t<9).forEach(e=>{i.list.append(mapp.utils.html.node`
              <li onclick=${()=>{!r.pills.has(e)&&r.add(e)}}>${e}`)})},target:n});return n}let r=t[t.type].map(r=>mapp.ui.elements.chkbox({checked:n.has(r),label:r,onchange:(n,r)=>{if(n)e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field][t.type]||(e.filter.current[t.field][t.type]=[]),e.filter.current[t.field][t.type].push(r);else{let n=e.filter.current[t.field][t.type].indexOf(r);e.filter.current[t.field][t.type].splice(n,1),e.filter.current[t.field][t.type].length||delete e.filter.current[t.field]}w.applyFilter(e)},val:r}));return mapp.utils.html.node`<div class="filter">${r}`}function E(e,t){let n=mapp.utils.html.node`
    <input
      data-id="inputAfter"
      onchange=${i}
      type=${t.type===`datetime`&&`datetime-local`||`date`}>`,r=mapp.utils.html.node`
    <input
      data-id="inputBefore"
      onchange=${i}
      type=${t.type===`datetime`&&`datetime-local`||`date`}>`;function i(n){n.target.dataset.id===`inputAfter`&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{gt:new Date(n.target.value).getTime()/1e3})),n.target.dataset.id===`inputBefore`&&(e.filter.current[t.field]=Object.assign(e.filter.current[t.field]||{},{lt:new Date(n.target.value).getTime()/1e3})),w.applyFilter(e)}return mapp.utils.html`
    <div style="
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      grid-gap: 5px;">
      <label>Date after
        ${n}</label>
      <label>Date before
        ${r}</label>`}function wt(e){let t=e.style.theme;t.legend??={},t.legend.grid=[],e.style.theme.style??={},e.style.theme.style.width??=24,e.style.theme.style.height??=24,e.style.theme.style.bitmap_icons??=e.style.bitmap_icons;let n=mapp.ui.elements.legendIcon(e.style.theme.style);return t.legend.grid.push(mapp.utils.html`
    <div 
      class="contents">
      ${n}<div class="label" style="grid-column: 2";>${e.style.theme.label}`),t.legend.node=mapp.utils.html.node`
    <div class="legend">
    <div class="contents-wrapper grid">${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}function D(e,t,n){if(e.field??=t.field,e.disabled??=n.filter?.current[e.field]?.ni?.includes(e.value),e.disabled||(e.style??=e._style),n.featureFields&&t.distribution===`count`){let r={value:n.featureFields[e.field]?.[e.value]};if(e.count=mapp.utils.formatNumericValue(r),!e.disabled&&!t.legend?.showEmptyCat&&!e.count)return}let r=mapp.ui.elements.legendIcon({bitmap_icons:n.style.bitmap_icons,height:24,width:24,...e._style||e.style}),i=mapp.utils.html`<div
    style="height: 24px; width: 24px; grid-column: 1;">
    ${r}`,a=[`label`];n.filter&&a.push(`switch`),e.disabled&&a.push(`disabled`);let o=e.label+(e.count?` [${e.count}]`:``),s=mapp.utils.html.node`<div
    class=${a.join(` `)}>
    ${o}`;return s.onclick=t=>O(t,n,e),e.node=mapp.utils.html.node`<div
    data-id=${e.value}
    class="contents">
    ${i}${s}`,e.node}function O(e,t,n){e.target.classList.toggle(`disabled`)?(n.disabled=!0,Tt(t,n),n._style=n.style,n.style=null):(delete n.disabled,Et(t,n),n._style??=n.style,n.style=n._style,delete n._style),t.style.theme.filterOnly?t.L.changed():t.reload()}async function Tt(e,t){if(e.style.theme.filterOnly)return;let n=e.filter.list?.find(e=>e.type===`in`&&e.field===t.field);n?.card&&mapp.ui.layers.filters.removeFilter(e,n),e.filter.current[t.field]||(e.filter.current[t.field]={}),e.filter.current[t.field].ni||(e.filter.current[t.field].ni=[]),e.filter.current[t.field].ni.push(t.keys||t.value),e.filter.current[t.field].ni=e.filter.current[t.field].ni.flat();let r=e.filter.list?.find(e=>e.type===`ni`&&e.field===t.field);if(r?.card){let t=await mapp.ui.layers.filters.ni(e,r);r.card.querySelector(`.filter`).replaceWith(t)}}async function Et(e,t){if(e.style.theme.filterOnly)return;if(Array.isArray(t.keys))for(let t of t.keys)e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(key),1);else e.filter.current[t.field].ni.splice(e.filter.current[t.field].ni.indexOf(t.value),1);e.filter.current[t.field].ni.length||(delete e.filter.current[t.field].ni,Object.keys(e.filter.current[t.field]).length||delete e.filter.current[t.field]);let n=e.filter.list?.find(e=>e.type===`ni`&&e.field===t.field);if(n?.card){let t=await mapp.ui.layers.filters.ni(e,n);n.card.querySelector(`.filter`).replaceWith(t)}}function k(e){let t=mapp.utils.html`<div
    style="height: 40px; width: 40px;">
    ${mapp.ui.elements.legendIcon({bitmap_icons:e.style.bitmap_icons,height:40,icon:e.style.cluster.icon,width:40})}`,n=mapp.utils.html`<div
    class="label">
    ${mapp.dictionary.layer_style_cluster}`;return mapp.utils.html`<div
    data-id="cluster"
    class="contents">
    ${t}${n}`}function A(e){e.legend??={},e.legend.layout??=`grid`;let t=[`contents-wrapper`,e.legend.layout];e.legend.nowrap&&t.push(`nowrap`),e.legend.classList=t.join(` `)}function j(){return mapp.utils.html`<div
    class="switch-all"
    style="grid-column: 1/3;">
    ${mapp.dictionary.layer_style_switch_caption}
    <button
      class="bold"
      onclick=${e=>{let t=[...e.target.closest(`.legend`).querySelectorAll(`.switch`)],n=t.filter(e=>e.classList.contains(`disabled`));n.length==0||n.length==t.length?t.forEach(e=>e.click()):n.forEach(e=>e.click())}}>${mapp.dictionary.layer_style_switch_all}
    </button>.`}function Dt(e){let t=e.style.theme;A(t),t.legend.grid=t.categories.map(n=>D(n,t,e)).filter(e=>e!==void 0),e.style.cluster&&t.legend.grid.push(k(e));let n=j();return t.legend.node=mapp.utils.html.node`
    <div class="legend">
      ${n}
      <div class=${t.legend.classList}>
        ${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}function M(e){e.style.theme.filterOnly=!0;let t=e.style.theme;if(A(t),!t.hideLegend){t.legend.grid=[];for(let n of t.categories)n.label=n.values?.join(`, `),n.label!==void 0&&t.legend.grid.push(D(n,t,e));return e.style.cluster&&t.legend.grid.push(k(e)),t.legend.node=mapp.utils.html.node`
    <div class="legend">
      <div class=${t.legend.classList}>
        ${t.legend.grid}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),e.L.once(`postrender`,()=>{t.key===e.style.theme.key&&M(e)}),t.legend.node}}function Ot(e){let t=e.style.theme;t.filterOnly=!0,A(t),t.legend??={};let n=t.categories.filter(e=>e.value!==void 0).map(n=>{let r=`contents ${t.legend?.horizontal?`horizontal`:``}`,i=mapp.ui.elements.legendIcon({bitmap_icons:e.style.bitmap_icons,height:24,width:24,...n._style||n.style});n.label??=n.value;let a=`label switch ${n.disabled?`disabled`:``}`;return mapp.utils.html`<div 
        data-id=${n.value}
        class=${r}>
        <div 
          style="height: 24px; width: 24px; grid-column: 1;">
          ${i}
        </div>
        <div 
          class=${a}
          style="grid-column: 2;"
          onclick=${t=>O(t,e,n)}>
          ${n.label}`}),r=j();return t.legend.node=mapp.utils.html.node`
    <div class="legend">
      ${r}
      <div class=${t.legend.classList}>
        ${n}`,e.style.legend??=t.legend.node,e.style.legend&&e.style.legend.replaceChildren(...t.legend.node.children),t.legend.node}var kt={basic:wt,categorized:Dt,distributed:M,graduated:Ot};function At(e){if(!e.target)return;let t={add:jt,createGroup:Mt,groups:{},node:e.target};return typeof e.layers==`object`&&Object.values(e.layers).length&&Object.values(e.layers).forEach(e=>t.add(e)),t}function jt(e){if(!e.hidden){if(mapp.ui.layers.view(e),!e.group){this.node.append(e.view),this.node.dispatchEvent(new CustomEvent(`addLayerView`,{detail:e}));return}this.groups[e.group]||this.createGroup(e),this.groups[e.group].addLayer(e),this.node.dispatchEvent(new CustomEvent(`addLayerView`,{detail:e}))}}function Mt(e){let t={list:[]};this.groups[e.group]=t,t.hideLayers=mapp.utils.html.node`<button
  class="notranslate material-symbols-outlined active"
    title=${mapp.dictionary.layer_group_hide_layers}
    onclick=${e=>{e.target.style.visibility=`hidden`,t.list.filter(e=>e.display).forEach(e=>e.hide())}}>visibility_off`,t.meta=mapp.utils.html.node`<div class="meta no-select">`,t.drawer=mapp.ui.elements.drawer({class:`layer-group ${e.groupClassList||``}`,content:t.meta,data_id:e.group,header:mapp.utils.html`
       <h2>${e.group}</h2>
       ${t.hideLayers}`}),this.node.appendChild(t.drawer),t.chkVisibleLayer=Pt,t.addLayer=Nt}function Nt(e){if(e.groupmeta){let t=mapp.utils.html.node`<div>`;t.innerHTML=e.groupmeta,mapp.utils.render(this.meta,t)}this.list.push(e),this.drawer.appendChild(e.view),this.chkVisibleLayer(),e.showCallbacks.push(()=>this.chkVisibleLayer()),e.hideCallbacks.push(()=>this.chkVisibleLayer())}function Pt(){this.hideLayers.style.visibility=this.list.some(e=>e.display)?`visible`:`hidden`}function Ft(e){let t=[];for(let[n,r]of Object.entries(e.dataviews))if(!(typeof r==`string`||r===!0||r===!1)){if(Object.assign(r,{host:e.mapview.host,key:n,layer:e}),It(r),r.tabview&&mapp.utils.mobile()||(r.label??=r.title||r.key,mapp.ui.utils.dataviewDialog(r),r.target=r.target instanceof HTMLElement?r.target:mapp.utils.html.node`
        <div class="dataview-target">`,mapp.ui.Dataview(r)instanceof Error))return;e.display&&r.display&&r.show(),e.showCallbacks.push(()=>{r.display&&(r.chkbox.querySelector(`input`).checked=!0,r.show())}),e.hideCallbacks.push(()=>{r.display&&(r.chkbox.querySelector(`input`).checked=!1,r.hide())}),t.push(r.chkbox),!r.tabview&&!r.dataview_dialog&&t.push(r.target)}if(!e.dataviews.hide)return e.dataviews.dialog&&(e.dataviews.dialog={btn_label:`Dataviews`,title:`Dataviews`,icon:`table_view`,...e.dataviews.dialog}),mapp.ui.elements.drawer({drawer:e.dataviews.drawer,class:e.dataviews.classList||``,content:t,data_id:`${e.key}-dataviews-drawer`,layer:e,header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>`,popout:e.dataviews.popout,dialog:e.dataviews.dialog})}function It(e){e.tabview=document.querySelector(`[data-id=${e.target}]`),e.tabview&&(e.show??=()=>{e.tabview.dispatchEvent(new CustomEvent(`addTab`,{detail:e})),e.show()},e.hide??=()=>{e.display=!1,e.remove()})}function Lt(e){if(typeof e.draw!=`object`||e.draw.hidden)return;if(!e.geom){console.warn(`Layer: ${e.key} - You must have a geom property to draw new features.`);return}let t=Object.keys(e.draw).map(t=>mapp.ui.elements.drawing[t]?.(e)).filter(e=>!!e);if(t.length)return e.draw.content=mapp.utils.html`${t}`,e.draw.dialog&&(e.draw.dialog={btn_label:`Drawing`,title:`Drawing`,icon:`new_label`,...e.draw.dialog}),e.draw.drawer===!1?e.draw.view=e.draw.dialog?.btn||mapp.utils.html.node`<div data-id="draw-drawer">
        <h3>${mapp.dictionary.layer_add_new_location}</h3>
        ${e.draw.content}`:e.draw.view=mapp.ui.elements.drawer({data_id:`${e.key}-draw-drawer`,dialog:e.draw.dialog,layer:e,header:mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="notranslate material-symbols-outlined caret"/>`,content:e.draw.content,class:e.draw.classList,popout:e.draw.popout}),e.draw.view}function Rt(e){if(Bt(e),!e.filter.hidden&&e.infoj&&(e.filter.list=zt(e),e.filter.list.length))return e.filter.dropdown=mapp.ui.elements.dropdown({callback:async(t,n,r)=>{if(!r.selected){mapp.ui.layers.filters.removeFilter(e,r),P(e);return}if(!r?.card){if(e.filter.clearAll.style.display=`inline-block`,e.filter.resetAll.style.display=`inline-block`,P(e),r.content=[await mapp.ui.layers.filters[r.type](e,r)].flat(),r.meta&&r.content.unshift(mapp.utils.html.node`<p>${r.meta}`),r.header=r.title,r.close=()=>mapp.ui.layers.filters.removeFilter(e,r),r.card=mapp.ui.elements.card(r),e.filter.dialog?.view)return e.filter.dialog.view.append(r.card);if(e.filter.drawer?.popout?.view?.checkVisibility?.())return e.filter.drawer.popout.view.append(r.card);e.filter.view.querySelector(`.content`).append(r.card)}},data_id:`${e.key}-filter-dropdown`,entries:e.filter.list,keepPlaceholder:!0,multi:!0,placeholder:mapp.dictionary.filter_select}),e.filter.clearAll=mapp.utils.html.node`<button
    data-id=clearall
    class="flat underline"
    onclick=${t=>{e.filter.list.forEach(t=>mapp.ui.layers.filters.removeFilter(e,t))}}>${mapp.dictionary.filter_clear_all}`,e.filter.resetAll=mapp.utils.html.node`<button
    data-id=resetall
    class="flat underline"
    onclick=${t=>{e.filter.list.forEach(t=>mapp.ui.layers.filters.resetFilter(e,t))}}>${mapp.dictionary.filter_reset_all}`,e.filter.count=mapp.utils.html.node`<span class="bold">`,e.changeEndCallbacks.push(P),e.showCallbacks.push(P),e.hideCallbacks.push(e=>{e.filter.clearAll?.checkVisibility()&&e.filter.feature_count.style.setProperty(`display`,`none`)}),e.filter.count_meta??=mapp.dictionary.filter_count,e.filter.feature_count=mapp.utils.html.node`
    <p style="display:none">${e.filter.count} ${e.filter.count_meta}`,e.filter.viewport_description??=e.filter.viewport?mapp.dictionary.filter_in_viewport:mapp.dictionary.filter_not_in_viewport,e.filter.viewport_description=mapp.utils.html.node`<p style="display:none"><i>${e.filter.viewport_description}</i>`,e.filter.content=[e.filter.dropdown,e.filter.clearAll,e.filter.resetAll,e.filter.feature_count,e.filter.viewport_description],e.filter.dialog&&(e.filter.filter_list=mapp.utils.html.node`
      <div id=filter-list class=filter-list>`,e.filter.content=[mapp.utils.html`<p class=bold>${e.name}</p>`,e.filter.feature_count,e.filter.viewport_description,e.filter.clearAll,e.filter.resetAll,e.filter.dropdown,e.filter.filter_list],e.filter.content=mapp.utils.html.node`${e.filter.content}`,e.filter.dialog&&(e.filter.dialog={btn_label:`Filtering`,title:`Filtering`,icon:`filter_alt`,view:e.filter.filter_list,...e.filter.dialog}),e.filter.clearAll.style.display=`inline-block`,e.filter.resetAll.style.display=`inline-block`),e.filter.drawer={drawer:e.filter.drawer,data_id:`filter-drawer`,class:e.filter.classList||``,header:mapp.utils.html`
        <h3>${mapp.dictionary.filter_header}</h3>`,content:e.filter.dialog?.btn||e.filter.content,popout:e.filter.popout,dialog:e.filter.dialog,view:e.view,layer:e},e.filter.view=mapp.ui.elements.drawer(e.filter.drawer),e.filter.view}var N={numeric:`numeric`,integer:`integer`,text:`like`,date:`date`,datetime:`datetime`,boolean:`boolean`};function zt(e){let t=[];e.filter.include??=[],e.filter.exclude??=[];for(let n of e.infoj)if(n.type??=`text`,!(n.skipEntry===!0||n.field===void 0||e.filter.exclude.includes(n.field)||!Object.hasOwn(N,n.type))&&(e.filter.includeAll||e.filter.include.includes(n.field)||n.filter===!0)){if(n.type??=`text`,Object.keys(n.filter||{}).length||(n.filter=N[n.type]),typeof n.filter==`string`&&(n.filter={type:n.filter}),!n.filter?.type||!Object.hasOwn(mapp.ui.layers.filters,n.filter.type)){n.filter??={type:n.type},console.warn(`${n.filter.type} is not a valid filter type`);continue}n.filter.title??=n.title,n.filter.field??=n.field,t.push(structuredClone(n.filter))}return t}function P(e){e.display&&(clearTimeout(e.filter.debounce),e.filter.debounce=setTimeout(async()=>{for(let t of e.filter.list){if(!Object.hasOwn(e.filter.current,t.field)||t.min===void 0||t.max===void 0||t.Min&&t.Max||(await mapp.ui.layers.filters.generateMinMax(e,t),t.max-t.min===0))continue;let n=mapp.ui.elements.slider_ab(t);t.slider.replaceWith(n),t.slider=n}mapp.ui.utils.locationCount(e).then(t=>{let n=mapp.utils.formatNumericValue({value:t});e.filter.count.innerText=n,e.filter.feature_count.style.setProperty(`display`,`block`)})},1e3))}function Bt(e){e.multi_filter&&(mapp.layer.multi_filter||(delete e.filter.hidden,e.filter.dialog=!0,e.filter.drawer=!1,e.filter.includeAll=!e.filter.include?.length))}var Vt=e=>{let t={layer:e.key,mapview:e.mapview,target:mapp.utils.html.node`<div>`,...e.gazetteer};return mapp.ui.Gazetteer(t),t.target};function Ht(e){e.jsonEditor===!0&&(e.jsonEditor={});let t=mapp.utils.html.node`<button class="wide flat" data-id="jsonEditor">JSON Editor</button>`;return t.addEventListener(`click`,async()=>{t.classList.toggle(`active`);let n=mapp.utils.jsonParser(e),r=mapp.utils.html.node`<div>`,i=await mapp.ui.utils.layerJSE(r,{json:n},{className:`text-button`,onClick:()=>Ut(i,e),text:`Update Layer`,title:`Update Layer`,type:`button`});e.jsonEditor.dialog=mapp.ui.elements.dialog({header:mapp.utils.html.node`<div>`,css_style:`width: 500px; height 300px;`,containedCentre:!0,contained:!0,closeBtn:!0,onClose:()=>{t.classList.toggle(`active`)},content:r})}),e.removeCallbacks.push(e=>{e.jsonEditor?.dialog?.close()}),t}async function Ut(e,t){let n=e.get(),r=JSON.parse(n.text);await t.update(r)}function Wt(e){let t=mapp.utils.html.node`<p data-id="meta" class="meta no-select">`;return t.innerHTML=e.meta,t}function Gt(e){let t=[];for(let[n,r]of Object.entries(e.reports)){if(typeof r==`boolean`)continue;r.key=n,r.label??=n,r.layer=e,r.template&&(r.report={template:r.template});let i=mapp.ui.elements.reportLink(r);t.push(i)}return e.reports.dialog&&(e.reports.dialog={btn_label:`Reports`,title:`Reports`,icon:`summarize`,...e.reports.dialog}),mapp.ui.elements.drawer({drawer:e.reports.drawer,class:e.reports.classList||``,data_id:`reports-drawer`,header:mapp.utils.html`
      <h3>Reports</h3>`,content:mapp.utils.html`${t}`,popout:e.reports.popout,dialog:e.reports.dialog,layer:e})}function Kt(e){if(e.style.hidden)return;e.style.elements??=[`labels`,`label`,`hovers`,`hover`,`themes`,`theme`,`icon_scaling`,`opacitySlider`];let t=mapp.ui.elements.layerStyle.panel(e);if(!t)return;e.style.classList??=``;let n=mapp.utils.html`
    <h3>${mapp.dictionary.layer_style_header}</h3>`;return e.style.dialog&&(e.style.dialog={btn_label:`Styling`,title:`Styling`,icon:`brush`,...e.style.dialog}),e.style.drawer=mapp.ui.elements.drawer({drawer:e.style.drawer,data_id:`style-drawer`,class:e.style.classList,header:n,content:t,popout:e.style.popout,dialog:e.style.dialog,layer:e}),e.style.drawer}var qt={dataviews:Ft,draw:Lt,filter:Rt,gazetteer:Vt,jsonEditor:Ht,meta:Wt,reports:Gt,style:Kt};function Jt(e){if(e.view===null)return;Yt(e);let t=mapp.utils.html`
    <h2>${e.name}</h2>
    ${e.viewConfig.headerBtn}`;e.view=mapp.ui.elements.drawer({drawer:e.viewConfig.drawer,data_id:e.key,class:e.viewConfig.classList,header:t,content:e.viewConfig.content,popout:e.viewConfig.popoutBtn}),e.changeEndCallbacks.push(Xt)}function Yt(e){e.viewConfig={displayToggle:!0,zoomBtn:!0,zoomToFilteredExtentBtn:!0,hideDisabled:!1,...e.viewConfig},e.viewConfig.drawer??=e.drawer,e.zoomBtn===!1&&(delete e.viewConfig.zoomBtn,delete e.zoomBtn),e.viewConfig.popoutBtn??=e.popout,e.tables||(delete e.viewConfig.zoomBtn,delete e.viewConfig.hideDisabled),e.viewConfig.panelOrder??=e.panelOrder,delete e.panelOrder,e.viewConfig.keyOrder??=[`meta`,`style`,`filter`,`dataviews`,`draw`],e.viewConfig.content=Object.keys(e).sort((t,n)=>{let r=e.viewConfig.keyOrder.indexOf(t),i=e.viewConfig.keyOrder.indexOf(n);return r===-1&&(r=1/0),i===-1&&(i=1/0),r-i}).map(t=>mapp.ui.layers?.panels?.[t]?.(e)).filter(e=>e!==void 0),Array.isArray(e.viewConfig.panelOrder)&&(console.warn(`Layer [${e.key}] has the legacy panelOrder config with inverted logic; please use viewConfig.keyOrder array!`),e.viewConfig.content.sort((t,n)=>e.viewConfig.panelOrder.indexOf(t.dataset?.id)<e.viewConfig.panelOrder.indexOf(n.dataset?.id)?1:-1)),e.viewConfig.classList??=e.classList||``,e.viewConfig.classList+=` layer-view `,e.viewConfig.classList+=e.viewConfig.content.length?``:` empty `,Array.isArray(e.viewConfig.headerOrder)||(e.viewConfig.headerOrder=[`zoomToFilteredExtentBtn`,`zoomBtn`,`popoutBtn`,`displayToggle`].filter(t=>e.viewConfig[t])),e.viewConfig.headerBtn??=[];for(let t of e.viewConfig.headerOrder){let n=mapp.ui.layers.viewHeader[t]?.(e);e.viewConfig.headerBtn.push(n)}}function Xt(e){if(!e.tableCurrent)return;let t=Array.from(e.view.querySelectorAll(`:scope > :not(.header)`));e.tableCurrent()?(e.viewConfig.hideDisabled&&e.view.classList.remove(`display-none`),e.zoomBtn instanceof HTMLElement&&e.zoomBtn.style.setProperty(`display`,`none`),e.view.querySelector(`[data-id="display-toggle"]`)?.classList.remove(`disabled`),t.forEach(e=>{e.disabled=!1,e.classList.remove(`disabled`)})):(e.table||e.tables)&&(e.zoomBtn instanceof HTMLElement&&e.zoomBtn.style.removeProperty(`display`),e.view.classList.remove(`expanded`),[...e.view.querySelectorAll(`.expanded`)].forEach(e=>e.classList.remove(`expanded`)),e.view.querySelector(`[data-id="display-toggle"]`)?.classList.add(`disabled`),t.forEach(e=>{e.disabled=!0,e.classList.add(`disabled`)}),e.viewConfig.hideDisabled&&e.view.classList.add(`display-none`))}var Zt={zoomToFilteredExtentBtn:Qt,zoomBtn:$t,popoutBtn:tn,displayToggle:nn};function Qt(e){let t=Object.keys(e.filter.current).length?``:`display: none;`,n=mapp.utils.html.node`<button
    data-id=zoomToFilteredExtentBtn
    title=${mapp.dictionary.layer_zoom_to_extent}
    style=${t}
    class="notranslate material-symbols-outlined"
    onclick=${async t=>{t.target.disabled=!await e.zoomToExtent(),e.show()}}>filter_alt`;function r(e){Object.keys(e.filter.current).length?n.style.display=`inline-block`:n.style.display=`none`}return e.changeEndCallbacks.push(r),n}function $t(e){let t=mapp.utils.html.node`<button
    data-id="zoom-to"
    title=${mapp.dictionary.zoom_to}
    class="notranslate material-symbols-outlined"
    onclick=${()=>en(e)}>arrows_input`;function n(e){if(e.tableCurrent()){t.style.display=`none`;return}t.style.display=`block`}return e.changeEndCallbacks.push(n),t}function en(e){let t=Object.entries(e.tables).find(e=>!!e[1])[0],n=Object.entries(e.tables).reverse().find(e=>!!e[1])[0],r=e.mapview.Map.getView();r.getZoom()<t?r.setZoom(t):r.setZoom(n),e.show()}function tn(e){return mapp.utils.html.node`<button
    data-id="popout-btn"
    class="notranslate material-symbols-outlined">open_in_new`}function nn(e){let t=`notranslate material-symbols-outlined toggle ${e.zoomDisplay||e.display?`toggle-on`:``}`,n=mapp.utils.html.node`<button
    data-id=display-toggle
    title=${mapp.dictionary.layer_visibility}
    class=${t}
    onclick=${t=>{t.target.classList.toggle(`toggle-on`)?e.show():e.hide()}}>`;return e.showCallbacks.push(()=>{n.classList.add(`toggle-on`)}),e.hideCallbacks.push(()=>{!e.zoomDisplay&&n.classList.remove(`toggle-on`)}),n}var rn={filters:w,legends:kt,listview:At,panels:qt,view:Jt,viewHeader:Zt};function an(e){if(e.edit)return mapp.ui.elements.chkbox({checked:e.newValue===void 0?e.value:e.newValue,disabled:!e.edit,label:e.label||e.title,onchange:t=>{e.newValue=t,e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))}});e.label??=``;let t=e.value?`check`:`close`;return mapp.utils.html.node`
    <div class="link-with-img">
      <div class="notranslate material-symbols-outlined">${t}</div>
      <span>${e.label}`}var F={documents:cn,image:on,images:sn},I=e=>F[e.type](e);function on(e){if(e.value){let t=e.edit&&mapp.utils.html`<button
      title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${e.value.replace(/^.*\//,``).replace(/\.([\w-]{3})/,``)}
      data-src=${e.value}
      onclick=${t=>z(t,e,mapp.dictionary.remove_image_confirm)}>delete`;return mapp.utils.html.node`<div class="img-item"><img
      style="width: 100%"
      src=${e.value}
      onclick=${mapp.ui.utils.imagePreview}>
      ${t}`}else if(e.edit)return mapp.utils.html.node`<div
      class="drag_and_drop_zone"
      ondrop=${t=>{t.preventDefault(),L(t,e)}}>
      <p><span class="notranslate material-symbols-outlined add">add_a_photo</span>${mapp.dictionary.drag_and_drop_image}</p>
      <input
        type="file"
        accept="image/*;capture=camera" onchange=${t=>{L(t,e)}}>`}function sn(e){let t=[];if(e.value?.map(n=>{let r=e.edit&&mapp.utils.html`<button title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${n.replace(/^.*\//,``).replace(/\.([\w-]{3})/,``)}
      data-src=${n}
      onclick=${t=>z(t,e,mapp.dictionary.remove_image_confirm)}>delete`;t.push(mapp.utils.html`<div class="img-item"><img
      src=${n}
      onclick=${mapp.ui.utils.imagePreview}>
      ${r}`)}),e.edit){let n=mapp.utils.html.node`<div
      class="drag_and_drop_zone mobile-display-none"
      ondrop=${t=>{t.preventDefault(),L(t,e)}}>
      <p><span class="notranslate material-symbols-outlined add">add_a_photo</span>${mapp.dictionary.drag_and_drop_image}</p>
      <input
        type="file"
        accept="image/*;capture=camera" onchange=${t=>{L(t,e)}}>`;t.push(n)}if(t.length)return mapp.utils.html.node`<div class="images-grid">${t}`}function cn(e){let t=[];if(e.value?.map(n=>{let r=e.edit&&mapp.utils.html`<button
      title="${mapp.dictionary.delete}"
      class="notranslate material-symbols-outlined color-danger delete"
      data-name=${n.replace(/^.*\//,``).replace(/\.([\w-]{3})/,``)}
      data-href=${n}
      onclick=${t=>z(t,e,mapp.dictionary.remove_document_confirm)}>delete`,i=n.replace(/^.*\//,``).replace(/\.([\w-]{3})/,``);t.push(mapp.utils.html`<div class="link-with-img">
      <a target="_blank" href=${n}>${i}</a>${r}`)}),e.edit){let n=mapp.utils.html.node`<div
      class="drag_and_drop_zone mobile-display-none"
      ondrop=${t=>{t.preventDefault(),L(t,e)}}>
      <p><span class="notranslate material-symbols-outlined add-doc">add_notes</span>${mapp.dictionary.drag_and_drop_doc}</p>
      <input type="file"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
        onchange=${t=>L(t,e)}>`;t.unshift(n)}if(t.length)return mapp.utils.html.node`<div>${t}`}async function L(e,t){let n=new FileReader,r=e.type===`drop`?e.dataTransfer?.files[0]:e.target.files[0];if(!r)return;t.location.view?.classList.add(`disabled`);let i={documents:un,image:R,images:R};n.onload=e=>i[t.type](e,t,r),n.readAsDataURL(r)}function R(e,t,n){let r=new Image;r.onload=async()=>ln(t,r,n),r.src=e.target.result}async function ln(e,t,n){let r=document.createElement(`canvas`);e.max_size??=1024,t.width>t.height&&t.width>e.max_size?(t.height*=e.max_size/t.width,t.width=e.max_size):t.height>e.max_size&&(t.width*=e.max_size/t.height,t.height=e.max_size),r.width=t.width,r.height=t.height,r.getContext(`2d`).drawImage(t,0,0,t.width,t.height);let i=await V(e,{public_id:n.name.replace(/^.*\//,``).replace(/\.([\w-]{3})/,``)+e.suffix_date?`@${Date.now()}`:``});if(!i)return;let a=new FormData;a.append(`file`,r.toDataURL(`image/jpeg`,.5));let o=await fetch(i,{body:a,method:`post`});if(!o.ok){mapp.ui.elements.alert(`Cloudinary Image upload failed!`),e.location.view?.classList.remove(`disabled`);return}let s=await o.json();e.type===`image`?e.value=s.secure_url:e.value=Array.isArray(e.value)?e.value.concat([s.secure_url]):[s.secure_url],B(e)}async function un(e,t,n){let r=new Date,i=`${r.getMonth()+1}-${r.getDate()}T${r.getHours()}:${r.getMinutes()}`,a=n.name.substring(n.name.lastIndexOf(`.`)),o=await V(t,{public_id:`${n.name.replace(a,``)}-${i}${a}`});if(!o)return;let s=new FormData;s.append(`file`,e.target.result.toString());let c=await fetch(o,{body:s,method:`post`});if(!c.ok){mapp.ui.elements.alert(`Cloudinary Document upload failed!`),t.location.view?.classList.remove(`disabled`);return}let l=await c.json();t.value=Array.isArray(t.value)?t.value.concat([l.secure_url]):[l.secure_url],B(t)}async function z(e,t,n){if(!await mapp.ui.elements.confirm({text:n}))return;let r=await V(t,{destroy:!0,public_id:decodeURIComponent(e.target.dataset.name)});if(!r)return;await fetch(r,{method:`post`});let i=new Set(t.value);i.delete(e.target.dataset.src||e.target.dataset.href),t.type===`image`?t.value=null:t.value=i.size?Array.from(i):null,B(t)}async function B(e){e.location.view?.classList.add(`disabled`),await mapp.utils.xhr({body:JSON.stringify({[e.field]:e.value}),method:`POST`,url:`${e.location.layer.mapview.host}/api/query?`+mapp.utils.paramString({id:e.location.id,layer:e.location.layer.key,locale:e.location.layer.mapview.locale.key,table:e.location.table,template:e.location.updateTemplate})}),e.node.replaceChildren(mapp.utils.html.node`<div class="label">${e.title}`,F[e.type](e)),e.location.view?.classList.remove(`disabled`)}async function V(e,t){let n=mapp.utils.paramString({...t,folder:e.cloudinary_folder}),r=await mapp.utils.xhr({responseType:`text`,url:`${e.location.layer.mapview.host}/api/sign/cloudinary?${n}`});return r instanceof Error&&(console.error(r),e.location.view?.classList.remove(`disabled`)),r}function dn(e){if(e.value!==void 0&&(e.data=e.value),e.data?.length===0&&(e.data=null),e.layer??=e.location.layer,fn(e),e.target instanceof HTMLElement){if(!e.display&&typeof e.create==`function`)return mapp.utils.html.node`
    ${e.chkbox||``}
    ${e.locationViewTarget||``}`;if(!(!e.create&&mapp.ui.Dataview(e)instanceof Error))return(!e.data||e.data instanceof Error)&&e.queryCheck&&(e.chkbox&&(e.chkbox.classList.add(`disabled`),e.chkbox.querySelector(`input`).checked=!1),e.display=!1,e.hide()),e.display&&e.show?.(),mapp.utils.html.node`
    ${e.chkbox||``}
    ${e.locationViewTarget||``}`}}function fn(e){if(e.target||=`location`,typeof e.target!=`string`)return;if(e.target===`dialog`){mapp.ui.utils.dataviewDialog(e);return}if(document.getElementById(e.target)){e.target=document.getElementById(e.target),e.display=!0;return}if(document.querySelector(`[data-id=${e.target}]`)){if(mapp.utils.mobile())return;e.tabview??=document.querySelector(`[data-id=${e.target}]`),e.tab_style??=`border-bottom: 3px solid ${e.location.style?.strokeColor||`var(--color-primary)`}`,e.target=mapp.utils.html.node`
      <div class="dataview-target">`,e.tabview.dispatchEvent(new CustomEvent(`addTab`,{detail:e}));return}let t=`location ${e.key||e.query}`;e.locationViewTarget=mapp.utils.html.node`
    <div class="${t}">`,e.target=e.locationViewTarget}var H=pn;function pn(e){if(e.edit){e.newValue===!0&&(e.newValue=mapp.utils.temporal.dateToUnixEpoch(),e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e})));let t=e.newValue||e.value;typeof t==`string`&&console.warn(`${e.type} field: ${e.field} should be an integer.`);let n=mapp.utils.temporal[e.type](Number.parseInt(t));return mapp.utils.html.node`<input
      type=${e.type===`datetime`?`datetime-local`:`date`}
      value="${n}"
      onchange=${t=>{t.target.value===``?e.newValue=null:e.newValue=mapp.utils.temporal.dateToUnixEpoch(t.target.value),e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))}}>`}let t=e.value?mapp.utils.temporal.dateString(e):`null`;return e.css_val??=``,mapp.utils.html.node`<div
    class="val"
    style=${e.css_val}>
    ${t}`}function mn(e){if(e.format??=`GeoJSON`,e.mapview??=e.location.layer.mapview,typeof e.value==`string`&&(e.value=JSON.parse(e.value)),e.srid??=e.location.layer.srid,e.zIndex??=e.location.layer.zIndex+1||99,e.display??=!1,e.edit?.draw&&(e.draw=e.edit.draw),e._edit?.draw&&delete e.draw,!e.value&&!e.draw&&!e.api){e.location.removeLayer(e);return}e.style!==null&&(e.style={...e.location.style,...e.style},e.Style??=mapp.utils.style(e.style)),e.show??=gn,e.hide??=_n,e.getExtent??=hn,e.modify??=bn,e.label??=`Geometry`,e.disabled=!e.value&&!e.api||e.error,e.chkbox=mapp.ui.elements.chkbox({checked:e.display,data_id:`chkbox-${e.key}`,disabled:e.disabled,label:e.label,onchange:t=>{t?e.show():e.hide()}}),Array.isArray(e.elements)||(e.elements=e.api_elements||[],xn(e),vn(e)),e.edit||delete e.elements;let t=mapp.ui.elements.legendIcon({height:24,width:24,...e.style});return e.display&&e.show(),mapp.utils.html.node`
    <div class="flex-spacer">${e.chkbox}${t}</div>
    ${e.elements}`}function hn(){if(this.display&&this.L)return this.L.getSource().getExtent()}async function gn(){if(this.disabled)return;this.location.removeLayer(this),this.display=!0;let e=this.chkbox?.querySelector(`input`);if(e&&(e.checked=!0),!this.value&&this.api){if(this.blocking&&this.location.view?.classList.add(`disabled`),await this.api(this),this.blocking)return;this.value||(this.disabled=!0)}this.value&&(this.L=this.location.layer.mapview.geometry(this),this.location.Layers.push(this))}function _n(){this.display=!1,this.location.removeLayer(this)}function vn(e){e.edit&&e.value&&(e.edit.modify_label??=mapp.dictionary.modify_geometry,e.edit.modify_btn=mapp.utils.html.node`
    <button
      class="action wide"
      data-id="modify-btn"
      onclick=${()=>{e.edit.modify_btn.classList.toggle(`active`)?e.modify():e.location.layer.mapview.interactions.highlight()}}>
      <span class="notranslate material-symbols-outlined">format_shapes</span>
      ${e.edit.modify_label}`,e.elements.push(e.edit.modify_btn),e.edit.delete_label??=mapp.dictionary.delete_geometry,e.edit.delete&&e.elements.push(mapp.utils.html`<button class="action wide"
    onclick=${()=>yn(e)}>
    <span class="notranslate material-symbols-outlined color-danger">ink_eraser</span>
    <span style="color: var(--color-danger)">${e.edit.delete_label}</span>`))}async function yn(e){if(await e.location.confirmUpdate(t)===null)return;t();function t(){e.display=!1,e.newValue=null,e.location.update(n)}function n(){delete e.elements,e.location.renderLocationView()}}async function bn(){let e=this;if(await e.location.confirmUpdate(()=>{e.location.renderLocationView()})===null){e.edit.modify_btn.classList.remove(`active`);return}if(!e.hideHelp){let e={content:mapp.utils.html.node`<li>
        <ul>${mapp.dictionary.edit_dialog_cancel_drawing}
        <ul>${mapp.dictionary.edit_dialog_remove_vertex}</ul>
        <ul>${mapp.dictionary.edit_dialog_modify_shape}</ul>
        <ul>${mapp.dictionary.edit_dialog_save}</ul>`,header:mapp.utils.html`<h3>${mapp.dictionary.edit_dialog_title}</h3>`};mapp.ui.elements.helpDialog(e)}!e.display&&e.show(),e.location.layer.mapview.Map.removeLayer(e.L);let t=e.L.getSource().getFeatures()[0].clone();e.location.layer.mapview.interactions.modify({Feature:t,layer:e.location.layer,snap:e.edit.snap,srid:e.srid,callback:t=>{e.edit.modify_btn.classList.remove(`active`),U(t,e)}})}function xn(e){e.draw&&(Object.keys(e.draw).forEach(t=>{if(e.draw[t]===!0&&(e.draw[t]={}),mapp.ui.elements.drawing[t]){e.draw[t].callback??=n=>{e.draw[t].btn.classList.remove(`active`),U(n,e)};let n=mapp.ui.elements.drawing[t](e);e.draw.dialog&&e.edit?(e.draw.content??=[],n instanceof HTMLElement&&e.draw.content.push(n)):n instanceof HTMLElement&&e.elements.push(n)}}),mapp.ui.elements.drawer({layer:e,key:`draw`,name:`Draw`,icon:`new_label`}),e.edit&&e.draw?.dialog?.btn&&e.elements.push(e.draw.dialog.btn))}function U(e,t){if(delete t.mapview.interaction,mapp.ui.elements.helpDialog(),!e){setTimeout(()=>{!t.mapview.interaction&&t.mapview.interactions.highlight()},400),t.location.renderLocationView();return}t.newValue=e.geometry,t.location.update(n);function n(){delete t.elements,t.location.renderLocationView()}}function Sn(e){e.css_val??=``,e.inline&&console.warn(`${e.key} - json entries cannot be inline, please remove inline true from entry`);let t=mapp.utils.html.node`<div
    class="val"
    style=${e.css_val}>`;e.data=e.newValue||e.value;function n(e){return e.filter(e=>e.text!==`tree`).filter(e=>e.text!==`text`).filter(e=>e.text!==`table`).filter(e=>e.type!==`separator`).filter(e=>e.className!==`jse-undo`).filter(e=>e.className!==`jse-redo`).filter(e=>e.className!==`jse-search`).filter(e=>e.className!==`jse-contextmenu`).filter(e=>e.className!==`jse-sort`).filter(e=>e.className!==`jse-transform`)}e.jsoneditor=mapp.ui.elements.jsoneditor({data:e.data,props:{mode:`text`,onChange:r,onRenderMenu:n,readOnly:!e.edit},target:t});function r(t,n,r){r.contentErrors||(e.newValue=JSON.parse(t.text),e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e})))}return t}function Cn(e){e.hideLayer&&e.location.layer.hide();let t=`layer-key ${e.location.layer.display?`active`:``}`;return mapp.utils.html.node`<div>
    <button 
      class=${t}
      title="${mapp.dictionary.layer_visibility}"
      onclick="${t=>{t.target.classList.toggle(`active`)?e.location.layer.show():e.location.layer.hide()}}">${e.location.layer.name}`}function W(e){return wn(e),e.mapview??=e.location.layer.mapview,Tn(e),e.zIndex??=e.location.layer.zIndex++,En(e),e.panel??=mapp.utils.html.node`<div class="entry-layer">`,e.panel}function wn(e){e.value!==void 0&&(e.data=e.value,e.data?.length===0&&(e.data=null)),(e.featureSet||e.featureLookup)&&(!e.query&&!e.data?(e.disabled=!0,e.display_toggle?.classList.add(`disabled`)):(e.disabled=!1,e.display_toggle?.classList.remove(`disabled`)))}function Tn(e){if(!e.layer)return;e.key=e.layer;let t=structuredClone(e.mapview.locale.layers.find(t=>t.key===e.layer));if(!t){console.warn(`Layer [${e.layer}] not found in mapview.locale`);return}let n=Object.keys(t).filter(t=>!Object.hasOwn(e,t)).reduce((e,n)=>(e[n]=t[n],e),{});Object.assign(e,n),e.params??={},e.params.layer_template??=e.layer,delete e.layer}async function En(e){if(e.L&&e.display){e.show();return}else if(e.L)return;e.source_key=e.key,await mapp.layer.decorate(e),e.L&&(e.location.Layers.push(e),e.key+=`-${e.location.id}`,e.L.set(`key`,e.key),e.show=Dn,e.hide=kn,e.mapview.layers[e.key]=e,e.display_toggle=mapp.ui.elements.chkbox({checked:e.display,data_id:`${e.key}-display`,disabled:e.disabled,label:e.name,onchange:t=>{t?e.show():e.hide()}}),e.tables&&(e.tableCurrent()||e.display_toggle.classList.add(`disabled`),e.changeEndCallbacks.push(()=>{e.tableCurrent()?e.display_toggle.classList.remove(`disabled`):e.display_toggle.classList.add(`disabled`)})),e.panel.append(e.display_toggle),e.meta&&e.panel.append(mapp.ui.layers.panels.meta(e)),e.style.elements??=[`labels`,`label`,`hovers`,`hover`,`icon_scaling`,`opacitySlider`,`themes`,`theme`],e.style.panel=mapp.ui.elements.layerStyle.panel(e),e.style.default&&(e.style.default={...e.location?.style,...e.style.default}),e.style.panel?.style.setProperty(`display`,`none`),e.style.panel&&e.panel.append(e.style.panel),e.location.removeCallbacks.push(()=>{typeof e.remove==`function`&&e.remove()}),e.display&&e.show())}async function Dn(){let e=this;if(e.query){let t=mapp.utils.queryParams(e),n=mapp.utils.paramString(t);if(e.data=await mapp.utils.xhr(`${e.mapview.host}/api/query?${n}`),!e.data){e.disabled=!0,e.display_toggle?.classList.add(`disabled`),e.panel.replaceChildren(e.display_toggle);return}}On(e),e.style.panel?.style.setProperty(`display`,`block`),e.display=!0;try{e.mapview.Map.addLayer(e.L)}catch{}typeof e.reload==`function`&&e.reload(),e.showCallbacks?.forEach(t=>typeof t==`function`&&t(e))}function On(e){if(e.data){if(e.featureSet){let t=Array.isArray(e.data)?e.data:[e.data];e.featureSet=new Set(t);return}if(e.featureLookup){e.featureLookup=Array.isArray(e.data)?e.data:[e.data];return}e.features=e.data,e.setSource(e.features)}}function kn(){this.display=!1,this.style.panel?.style.setProperty(`display`,`none`),this.mapview.Map.removeLayer(this.L),this.hideCallbacks?.forEach(e=>typeof e==`function`&&e(this))}function G(e){let t=mapp.ui.elements.reportLink(e);return mapp.utils.html.node`<div class="val">${t}`}function K(e){if(e.edit)return An(e);if(!(e.value===null||Number.isNaN(Number(e.value))))return mapp.utils.formatNumericValue(e),mapp.utils.html.node`<div 
    class="val"
    style=${e.css_val}
    >${e.stringValue}`}function An(e){e.edit.callback??=()=>{e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))},e.edit.min??=e.min||-2147483648,e.edit.max??=e.max||2147483647,e.edit.step??=e.step||e.type===`integer`?1:.1,Object.assign(e,e.edit);let t=e.value??e.newValue;return e.edit.range&&!Number.isNaN(Number(t))&&t>e.min&&t<e.max?mapp.ui.elements.slider(e):mapp.ui.elements.numericInput(e)}var jn=e=>(e.pills??=e.value||[],mapp.ui.elements.pills(e),e.container);function Mn(e){if(!Array.isArray(e.value)){console.warn(`Entry type pin requires a value array.`);return}return e.srid??=e.location.layer.srid,e.display??=e.display===void 0,e.zIndex??=1/0,e.Style??=e.style?mapp.utils.style(e.style):e.location.pinStyle,e.show??=Nn,e.hide??=Pn,e.getExtent??=Fn,e.geometry={coordinates:e.value,type:`Point`},e.display&&e.show(),e.label??=mapp.dictionary.pin,e.chkbox??=mapp.ui.elements.chkbox({checked:e.display,label:e.label,onchange:t=>{t?e.show():e.hide()}}),e.chkbox}function Nn(){this.disabled||(this.location.removeLayer(this),this.display=!0,this.L=this.location.layer.mapview.geoJSON(this),this.location.Layers.push(this))}function Pn(){this.display=!1,this.location.removeLayer(this)}function Fn(){return this.buffer??=0,this.buffer=Number.parseInt(this.buffer)||200,ol.extent.buffer(this.L.getSource().getExtent(),this.buffer)}function In(e){return e.textarea||(e.textarea=mapp.utils.html.node`<textarea
      class="val"
      style="auto; min-height: 50px;">`,e.callback??=async(e,t)=>{t.textarea.value=e},mapp.utils.ping(e),e.location.removeCallbacks.push(()=>{e.callback=!1})),e.textarea}function Ln(e){if(!e.query){console.warn(`You must provide a query to use "type": "query_button".`);return}return e.label??=`Run query:${e.query}`,mapp.utils.html.node`
    <button 
      class="flat wide bold"
      onclick=${()=>Rn(e)}>${e.label}`}async function Rn(e){e.updated_fields&&(console.warn(`entry.updated_fields is deprecated, please use entry.dependents instead.`),e.dependents??=e.updated_fields),e.location.view.classList.add(`disabled`),e.queryparams??={},e.queryparams.template=e.query;let t=mapp.utils.paramString(mapp.utils.queryParams(e));e.host??=e.location.layer.mapview.host+`/api/query`;let n=await mapp.utils.xhr(`${e.host}?${t}`);if(n instanceof Error){mapp.ui.elements.alert({text:mapp.dictionary.query_failed}),e.location.view.classList.remove(`disabled`);return}e.value=n,e.alert&&mapp.ui.elements.alert({text:e.alert}),e.reload&&e.location.layer.reload(),e.dependents&&await e.location.syncFields(e.dependents),e.location.view.dispatchEvent(new Event(`updateInfo`)),e.location.view.classList.remove(`disabled`)}var zn=e=>{let t=document.querySelector(`[data-id=${e.target}]`);return e.tab_style=`border-bottom: 3px solid ${e.location.style.strokeColor}`,t.dispatchEvent(new CustomEvent(`addTab`,{detail:e})),e.display&&e.show(),mapp.ui.elements.chkbox({checked:!!e.display,label:e.label,onchange:t=>{e.display=t,e.display?e.show():e.remove()}})};function Bn(e){if(!(!e.edit&&!e.value))return e.edit?Vn(e):mapp.utils.html.node`
    <div
      class="val"
      style=${e.css_val}>
      ${e.prefix}${e.value}${e.suffix}`}function Vn(e){return e.edit.options?(e.container=mapp.utils.html.node`<div>${mapp.dictionary.loading}`,Un(e),e.container):mapp.utils.html.node`<input
    type="text"
    maxlength=${e.edit.maxlength}
    value="${e.newValue||e.value||``}"
    placeholder="${e.edit.placeholder||``}"
    onkeyup=${t=>Hn(t,e)}>`}function Hn(e,t){t.newValue=t.edit.arraySeparator?e.target.value.split(t.edit.arraySeparator):e.target.value,t.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:t}))}async function Un(e){if(e.edit.dynamic===!0&&(e.edit.options=[]),!e.edit.options.length){(e.jsonb_field||e.json_field)&&(e.edit.query??=`distinct_values_json`),e.edit.query??=`distinct_values`;let t=mapp.utils.paramString({field:e.json_field||e.jsonb_field||e.field,filter:e.location.layer.filter?.current,id:e.location.id,key:e.jsonb_key||e.json_key,layer:e.location.layer.key,locale:e.location.layer.mapview.locale.key,table:e.location.layer.tableCurrent(),template:e.edit.query}),n=await mapp.utils.xhr(`${e.location.layer.mapview.host}/api/query?${t}`);if(n===null){e.container.innerHTML=`${mapp.dictionary.no_options_available}`;return}e.edit.options=[n].flat().map(e=>Object.values(e)[0])}if(e.edit.radio){Wn(e);return}let t=e.edit.options.map(e=>({option:e===null?null:typeof e==`string`&&e||Object.values(e)[0],title:e===null?null:typeof e==`string`&&e||Object.keys(e)[0]})),n=t.find(t=>t.option===e.value),r=e.value===void 0?e.edit.placeholder:e.value;mapp.utils.render(e.container,mapp.ui.elements.dropdown({callback:(t,n)=>{e.newValue=n.option,e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))},entries:t,placeholder:r,span:n?.title||e.value}))}function Wn(e){let t=e.edit.options.map(n=>{let r={data_id:n,name:e.field,label:n,onchange:()=>{e.newValue=t.find(e=>e.querySelector(`input[type="radio"]:checked`)).querySelector(`input[type="radio"]`).dataset.id,e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))}};return mapp.ui.elements.radio(r)});if(e.value){let n=t.find(t=>t.querySelector(`input[type="radio"]`).dataset.id===e.value);n&&(n.querySelector(`input[type="radio"]`).checked=!0)}mapp.utils.render(e.container,mapp.utils.html.node`${t}`)}function Gn(e){let t=e.type===`html`?``:e.value;e.edit&&(t=mapp.utils.html`
    <textarea
      style="auto; min-height: 50px;"
      maxlength=${e.edit.maxlength}
      placeholder="${e.edit.placeholder||``}"
      onfocus=${e=>{e.target.style.height=e.target.scrollHeight+`px`}}
      onfocusout=${e=>{e.target.style.height=`auto`}}
      onkeyup=${t=>{e.newValue=t.target.value,e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))}}
      onkeydown=${e=>setTimeout(()=>{e.target.style.height=`auto`,e.target.style.height=e.target.scrollHeight+`px`},100)}>
      ${e.newValue||e.value||``}`),e.css_val??=``;let n=mapp.utils.html.node`
  <div
    class="val"
    style="${e.css_val}">${t}`;return!e.edit&&e.type===`html`&&(n.innerHTML=e.value||``),n}function Kn(e){let t,n=e.value?.toString().replace(`.`,`:`);return n=n&&n.length<3&&`${n}:00`||n,t=e.edit?mapp.utils.html.node`
      <input
        type="time"
        value=${n}
        onchange=${t=>{e.newValue=Number.parseFloat(t.target.value.replace(`:`,`.`)),e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))}}>`:n,e.css_val??=``,mapp.utils.html.node`
    <div
      class="val"
      style="${e.css_val}">
      ${t}`}function qn(e){return mapp.utils.html.node`
        <div
          class="label"
          style=${e.css_title}
          title=${e.tooltip}>${e.title}`}function Jn(){console.warn(`The type:defaults entry method has been deprecated.`)}function Yn(e){return console.warn(`The type:${e.type} entry method has been deprecated in favour of the type:layer entry method.`),e.type=`layer`,e.qID??=`id`,e.name??=e.label,W(e)}var Xn={boolean:an,dataview:dn,date:H,datetime:H,defaults:Jn,documents:I,geometry:mn,html:Gn,image:I,images:I,integer:K,json:Sn,key:Cn,layer:W,link:G,mvt_clone:Yn,numeric:K,pills:jn,pin:Mn,ping:In,query_button:Ln,report:G,tab:zn,text:Bn,textarea:Gn,time:Kn,title:qn,vector_layer:Yn},q;function Zn(e,t){if(!e.infoj)return;let n=mapp.utils.html.node`<div class="location-view-grid">`;q={},t??=e?.layer?.infoj_order;let r=Array.isArray(t)?t.map(i).filter(e=>e!==void 0):e.infoj;function i(t){if(typeof t==`string`){let n=e.infoj.find(e=>new Set([e.key,e.field,e.query]).has(t));return n||console.warn(`infoj_order field: "${t}" not found in location.infoj. Please add entry.key, entry.field, or entry.query to the entry.`),n}else if(typeof t==`object`)return t.location=e,t}let a=0;for(let t of r){if(t.key??=t.field||a++,e.view?.classList.contains(`disabled`))break;if(t.listview=n,t.type??=`text`,t.edit===!0&&(t.edit={}),Qn(t),$n(t),er(t)||(tr(t),nr(t),rr(t),ir(t),ar(t),or(t)))continue;if(!Object.hasOwn(mapp.ui.locations.entries,t.type)){console.error(`entry.type:${t.type} method not found.`);continue}let r=mapp.ui.locations.entries[t.type]?.(t);r&&t.node.append(r),cr(t)}return n}function Qn(e){e.jsonb_field&&e.jsonb_key&&e.value!==null&&typeof e.value==`object`&&e.value.jsonb&&(e.value=e.value.jsonb[e.jsonb_field][e.jsonb_key])}function $n(e){if(e.objectAssignFromField&&e.objectMergeFromField){console.warn(`${e.key}: objectAssignFromField and objectMergeFromField cannot both be used on the same entry.`);return}let t=e.objectAssignFromField||e.objectMergeFromField||e.json_field;if(!t)return;let n=e.location.infoj.find(e=>e.field===t);if(n&&typeof n.value==`object`){if(e.json_field){if(!e.json_key){console.warn(`json_field requires entry.json_key to be specified`);return}if(!n.value)return;e.value=n.value[e.json_key]}e.objectAssignFromField&&Object.assign(e,n.value),e.objectMergeFromField&&mapp.utils.merge(e,n.value)}}function er(e){if(e.skipEntry||e.skipFalsyValue&&!e.value&&!e.edit||e.skipUndefinedValue&&e.value===void 0&&!e.edit||e.skipNullValue&&e.value===null&&!e.edit)return!0}function tr(e){e.nullValue!==void 0&&(e.edit||(e.value??=e.nullValue))}function nr(e){e.default!==void 0&&e.edit&&(e.value||(e.newValue=e.default,e.location.view?.dispatchEvent(new CustomEvent(`valChange`,{detail:e}))))}function rr(e){e.group&&(q[e.group]||(q[e.group]=e.listview.appendChild(mapp.ui.elements.drawer({data_id:`location-infoj-group`,class:`group ${e.groupClassList||``}`,header:mapp.utils.html`
          <h3>${e.group}</h3>`}))),e.listview=q[e.group])}function ir(e){let t=`contents ${e.type} ${e.class||``} ${e.inline&&`inline`||``}`;e.node=e.listview.appendChild(mapp.utils.html.node`
  <div
    data-type=${e.type}
    class=${t}>`)}function ar(e){e.title&&e.node.append(mapp.ui.locations.entries.title(e))}function or(e){if(e.query)if(e.queryCheck??=e.run,e.queryCallback??=sr,e.runOnce||e.queryCheck){delete e.runOnce,e.host??=e.location.layer?.mapview?.host||mapp.host;let t=mapp.utils.queryParams(e),n=mapp.utils.paramString(t);return e.url=`${e.host}/api/query?${n}`,e.blocking&&e.location.view?.classList.add(`loading`),mapp.utils.xhr(e).then(t=>e.queryCallback(t,e)),!0}else e.field&&!e.xhr&&console.warn(`field:"${e.field}" has a query:"${e.query}" which is not set to run, please add the run or runOnce flag to the entry.`)}function sr(e,t){if(t.blocking&&t.location.view?.classList.remove(`loading`),e?t.value=t.field?e[t.field]:e:t.value=t.nullValue||null,er(t)){t.node.remove();return}let n=mapp.ui.locations.entries[t.type]?.(t);n&&t.node.appendChild(n)}function cr(e){if(!e.tooltip)return;let t=e.node.querySelector(`label`)||e.node.querySelector(`div.label`);t&&(e.tooltipElement||(e.tooltipElement=mapp.ui.elements.tooltip({content:e.tooltip}),t.append(e.tooltipElement)))}var lr=[{symbol:`A`,colour:`#2E6F9E`},{symbol:`B`,colour:`#EC602D`},{symbol:`C`,colour:`#5B8C5A`},{symbol:`D`,colour:`#B84444`},{symbol:`E`,colour:`#514E7E`},{symbol:`F`,colour:`#E7C547`},{symbol:`G`,colour:`#368F8B`},{symbol:`H`,colour:`#841C47`},{symbol:`I`,colour:`#61A2D1`},{symbol:`J`,colour:`#37327F`},{symbol:`K`,colour:`#FFA500`},{symbol:`L`,colour:`#7FFF00`},{symbol:`M`,colour:`#FFD700`},{symbol:`N`,colour:`#00CED1`},{symbol:`O`,colour:`#9932CC`},{symbol:`P`,colour:`#FF69B4`},{symbol:`Q`,colour:`#008B8B`},{symbol:`R`,colour:`#8A2BE2`},{symbol:`S`,colour:`#FF4500`},{symbol:`T`,colour:`#00FF00`},{symbol:`U`,colour:`#FF00FF`},{symbol:`V`,colour:`#708090`},{symbol:`W`,colour:`#F4A460`},{symbol:`X`,colour:`#000080`},{symbol:`Y`,colour:`#D2691E`},{symbol:`Z`,colour:`#8FBC8F`}];function ur(e){e.mapview||console.warn(`A mapview is required in the locations listview params argument.`),e.target||console.warn(`A target element is required in the locations listview params argument.`);let t=e.mapview.locale;t.locations??={},t.locations.pinStyle??={anchor:[.5,1],scale:3,type:`markerLetter`},t.locations.style??={fillColor:`#fff`,fillOpacity:.1,strokeColor:`#fff`},t.locations.records??=t.listview_records||structuredClone(lr),t.locations.clearAll=e.target.appendChild(mapp.utils.html.node`
    <button
      style="display: none; width: 100%; text-align: right;"
      class="tab-display bold text-shadow"
      onclick=${t=>{Object.values(e.mapview.locations).forEach(e=>e.remove())}}>
      ${mapp.dictionary.location_clear_all}`),t.locations.noLocations=e.target.appendChild(mapp.utils.html.node`<p class="no_locations">
                          ${mapp.dictionary.location_no_location_selected}</p>`),e.mapview.locations=new Proxy(e.mapview.locations,{deleteProperty:function(e,n){Reflect.deleteProperty(...arguments);let r=t.locations.records.find(e=>e.hook===n);return r&&delete r.hook,setTimeout(()=>dr(t),300),!0},set:n});function n(n,r,i){let a=t.locations.records.find(e=>!e.hook);return a?(Reflect.set(...arguments),a.hook=i.hook,i.record=a,i.style=structuredClone(t.locations.style),a.colour&&(i.style.strokeColor&&=a.colour,i.style.fillColor&&=a.colour),i.pinStyle=mapp.utils.style({icon:{...t.locations.pinStyle,color:i.style.strokeColor,letter:a.symbol}}),mapp.ui.locations.view(i),Object.values(e.target.children).forEach(e=>e.classList.remove(`expanded`)),e.target.insertBefore(i.view,t.locations.clearAll.nextSibling),i.view.dispatchEvent(new Event(`addLocationView`)),t.locations.clearAll.style.display=`block`,t.locations.noLocations.style.display=`none`,document.querySelector(`[data-id=locations]`).click(),document.querySelector(`[data-id=locations]`).style.display=`block`,!!i):(mapp.ui.elements.alert({text:mapp.dictionary.location_listview_full}),!0)}}function dr(e){if(!document.querySelectorAll(`#locations > .location-view`).length){document.querySelector(`[data-id=layers]`).click(),e.locations.clearAll.style.display=`none`;let t=document.querySelector(`#locations input`);t?t.value=``:e.locations.noLocations.style.display=`block`}}function fr(e){e.removeCallbacks?.push(function(){e.view.remove()});let t=e.infoj.find(e=>e.locationHeader)?.value,n=t?`${t} - (${e.record.symbol})`:`${e.record.symbol}`,r=[mapp.utils.html`<h2>${n}`,mapp.utils.html`<div class="notranslate material-symbols-outlined caret">`];e.infoj.filter(e=>new Set([`pin`,`geometry`]).has(e.type)).some(e=>!!e.value)&&r.push(mapp.utils.html`<button
      title = ${mapp.dictionary.location_zoom}
      class = "notranslate material-symbols-outlined"
      onclick = ${()=>e.flyTo()}>search`),pr(e)&&r.push(e.editToggle),r.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_save}
    class="btn-save notranslate material-symbols-outlined color-info"
    style="display: none;"
    onclick = ${()=>{e.view.classList.add(`disabled`),e.update()}}>cloud_upload`),e.updateCallbacks?.push(function(){e.view.dispatchEvent(new Event(`updateInfo`))}),(e.layer?.edit?.delete||e.layer?.deleteLocation)&&r.push(mapp.utils.html`<button
      title=${mapp.dictionary.location_delete}
      class="notranslate material-symbols-outlined color-danger"
      onclick = ${()=>e.trash()}>delete`),r.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_remove}
    class="notranslate material-symbols-outlined"
    onclick=${i}>close</button>
    `);async function i(){e.infoj.some(e=>e.newValue!==void 0)&&!await mapp.ui.elements.confirm({text:mapp.dictionary.location_close_without_save})||e.remove()}e.view=mapp.ui.elements.drawer({data_id:`location-${e.layer.key}-${e.id}`,class:`location-view raised expanded`,header:r}),e.viewEntries=e.view.appendChild(mapp.ui.locations.infoj(e)),e.view.querySelector(`.header`).style.borderBottom=`3px solid ${e.record.colour}`,e.view.addEventListener(`valChange`,mr),e.renderLocationView=hr,e.view.addEventListener(`render`,()=>e.renderLocationView()),e.view.addEventListener(`updateInfo`,()=>{e.editToggle&&(e.editToggle.classList.remove(`toggle-on`),e.removeEdits()),e.layer?.dataviews&&Object.values(e.layer.dataviews).forEach(e=>{e.display===!0&&e.update()}),e.renderLocationView()})}function pr(e){if(e.layer?.toggleLocationViewEdits===!1)return e.removeEdits(),!1;if(!e.layer?.toggleLocationViewEdits||!e.infoj.some(e=>e.edit))return!1;!e.new&&e.removeEdits();let t=`notranslate material-symbols-outlined ${e.new?`toggle-on`:``}`;return e.editToggle=mapp.utils.html.node`<button
    title="Enable edits"
    class=${t}
    onclick=${n}>edit`,!0;async function n(t){await e.confirmUpdate()===void 0&&(t.target.classList.toggle(`toggle-on`)?e.restoreEdits():e.removeEdits(),e.renderLocationView())}}function mr(e){let t=e.detail,n=t.location;if(typeof t.valChangeMethod==`function`){t.valChangeMethod(t);return}if(t.value==t.newValue?(delete t.newValue,t.node?.classList.remove(`val-changed`)):t.node?.classList.add(`val-changed`),n.infoj.some(e=>e.invalid)){n.view.querySelector(`.btn-save`).style.display=`none`;return}n.view.querySelector(`.btn-save`).style.display=n.infoj.some(e=>e.newValue!==void 0)?`inline-block`:`none`}function hr(){let e=this;e.view.querySelector(`.btn-save`).style.display=`none`,e.viewEntries.remove(),e.view.classList.remove(`disabled`),e.viewEntries=e.view.appendChild(mapp.ui.locations.infoj(e))}var gr={entries:Xn,infoj:Zn,listview:ur,view:fr};function _r(e){if(e.node)return e.tabs=e.node.appendChild(mapp.utils.html.node`<div class="tabs">`),e.panel=e.node.appendChild(mapp.utils.html.node`<div class="panel">`),e.id&&(e.node.dataset.id=e.id),e.addTab=vr,e.node.addEventListener(`addTab`,t=>e.addTab(t.detail)),e}function vr(e){if(e.tab&&!e.dynamic)return;let t=this;e.layer?.dataviews?.[e.key]&&(e.disableTabClose??=e.layer.dataviews.hide),e.activate??=a,e.location?e.location.removeCallbacks.push(()=>e.remove()):e.layer&&(e.layer.showCallbacks.push(()=>{e.display&&e.show()}),e.layer.hideCallbacks.push(()=>{e.remove()})),e.label??=e.title||e.key||`Tab`,e.tab_btn=mapp.utils.html.node`<button
    onclick=${o}>${e.label}`;let n=!e.disableTabClose&&!e.hideTabClose,r=mapp.utils.html`<button 
    class="notranslate material-symbols-outlined close_tab"
    onclick=${e=>(e.stopPropagation(),s())}>close`;e.tab=mapp.utils.html.node`<div class="tab">
    <div 
      class="header" 
      style="${e.tab_style||``}"
      .inert=${e.disabled}
      onmousedown=${t=>{if((t.which===2||t.button===4)&&!e.disableTabClose)return s()}} 
      onclick=${t=>{e.tab_btn.dispatchEvent(new Event(`click`))}}>
      ${e.tab_btn}
      ${n?r:``}`,e.disabled&&e.tab.style.setProperty(`opacity`,.3),e.class??=``;let i=`panel ${e.class}`;e.panel??=e.target||mapp.utils.html.node`
    <div class=${i}>`,e.show=o,e.remove=s,e.hide=s;function a(){e.create===void 0?(e.create??=function(){mapp.ui.utils[e.dataview]?.create(e)},e.create()):e.dynamic&&e.create(),(!e.data||e.dynamic)&&e.update?.(),e.btnRow?.style.setProperty(`display`,`flex`)}function o(){mapp.utils.render(t.panel,e.panel),t.tabs.childNodes.forEach(e=>e.classList.remove(`active`)),!e.tab.parentElement&&t.tabs.append(e.tab),e.tab.classList.add(`active`),t.timer&&window.clearTimeout(t.timer),t.timer=window.setTimeout(()=>e.activate(),500),typeof t.showTab==`function`&&t.showTab()}function s(){if(!e.tab.parentElement)return;e.display=!1;let n=e.tab.nextElementSibling||e.tab.previousElementSibling,r=e.tab.parentElement;if(e.tab.remove(),e.chkbox&&(e.chkbox.querySelector(`input`).checked=!1),!r.querySelector(`.tab.active`)){if(n)return n.querySelector(`.header`).click();t.removeLastTab?.()}}}var yr=e({setTheme:()=>xr,themes:()=>br}),br={dark:{active:`#e18335`,base:`#222222`,"base-secondary":`#444444`,"base-tertiary":`#555555`,"base-quartenary":`#2B2C30`,border:`#666666`,changed:`#666600`,danger:`#ef5350`,font:`#f2f2f2`,"font-contrast":`#3f3f3f`,"font-mid":`#CCCCCC`,primary:`#DAD095`}},J={};function xr(e){let t=document.querySelector(`:root`);for(let[e,n]of Object.entries(J))t.style.removeProperty(`--color-${e}`,`${n}`);J=e;for(let[e,n]of Object.entries(J))t.style.setProperty(`--color-${e}`,`${n}`)}var Sr={mapChange:wr,Toolbar:Cr,toolbar:{update:Tr,viewport:Dr}};function Cr(e){if(!e.toolbar)return;typeof e.toolbar==`function`&&e.toolbar();let t=mapp.utils.html.node`<div class="dataview-target">`,n=Object.keys(e.toolbar).map(t=>{if(Object.hasOwn(mapp.ui.utils[e.dataview]?.toolbar,t))return mapp.ui.utils[e.dataview]?.toolbar[t]?.(e);if(Object.hasOwn(mapp.ui.utils.dataview.toolbar,t))return mapp.ui.utils.dataview.toolbar[t](e)}).filter(e=>!!e);e.btnRow=mapp.utils.html.node`<div class="btn-row">${n}</div>`,e.btnRow.style.setProperty(`display`,`none`),e.panel=e.target.appendChild(mapp.utils.html.node`
      <div class="flex-col">
        ${e.btnRow}
        ${t}`),e.target=t}function wr(e){e.mapChange&&e.layer?.mapview&&e.layer.changeEndCallbacks.push(()=>{e.display&&e.layer.display&&(e.tab&&!e.tab.classList.contains(`active`)||(typeof e.mapChange==`function`?e.mapChange():e.update()))})}function Tr(e){return e.toolbar.update.button=mapp.utils.html.node`<button 
    onclick=${()=>{e.toolbar.update.button.classList.toggle(`active`)?Er(e):e.toolbar.update.dialog.close()}}>
    Update`,e.toolbar.update.button}async function Er(e){let t=mapp.utils.html.node`<div>`,n={data:e.data,query:e.query,queryparams:e.queryparams},r=await mapp.ui.elements.jsoneditor({props:{content:{text:JSON.stringify(n)},mode:`text`,onRenderMenu:i},target:t});e.toolbar.update.dialog={closeBtn:!0,content:t,header:`Dataview Update`,onClose:t=>{e.toolbar.update.button.classList.remove(`active`)},target:document.getElementById(`Map`)},mapp.ui.elements.dialog(e.toolbar.update.dialog);function i(e){return e.push({className:`notranslate material-symbols-outlined-important`,onClick:a,text:`sync`,title:`Update Dataview Query`,type:`button`}),e.push({className:`notranslate material-symbols-outlined-important`,onClick:o,text:`data_object`,title:`Set Dataview Data`,type:`button`}),e.filter(e=>e.text!==`table`).filter(e=>e.text!==`tree`).filter(e=>e.type!==`separator`).filter(e=>e.className!==`jse-undo`).filter(e=>e.className!==`jse-redo`).filter(e=>e.className!==`jse-search`).filter(e=>e.className!==`jse-contextmenu`).filter(e=>e.className!==`jse-sort`).filter(e=>e.className!==`jse-transform`)}function a(){let t=r.get(),n=JSON.parse(t.text);Object.assign(e,n),e.update()}function o(){let t=r.get(),n=JSON.parse(t.text);e.setData(n.data)}}function Dr(e){let t=[`flat`,e.viewport?`active`:``].join(` `);return mapp.utils.html`<button
    class=${t}
    onclick=${t=>{e.viewport=t.target.classList.toggle(`active`),e.update()}}>${mapp.dictionary.tabulator_viewport}`}function Or(e){if(e.target!==`dialog`)return;e.dataview_dialog={};let t=`
    width: ${e.dialog_css?.width||`300`}px;
    height: ${e.dialog_css?.height||`200`}px;
    min-width: ${e.dialog_css?.minWidth||`300`}px;
    min-height: ${e.dialog_css?.minHeight||`200`}px;
    resize: ${e.dialog_css?.resize||`both`};
    overflow: hidden !important`;Object.assign(e.dataview_dialog,{header:mapp.utils.html.node`<h1> ${e.label}`,data_id:`${e.key}-dataviews-dialog`,target:document.getElementById(`Map`),height:`auto`,left:`5%`,top:`0.5em`,class:`box-shadow tabview`,css_style:t,containedCentre:!0,contained:!0,headerDrag:!0,closeBtn:!0,onClose:()=>{e.chkbox&&(e.chkbox.querySelector(`input`).checked=!1)}}),mapp.ui.elements.dialog(e.dataview_dialog);let n=e.dataview_dialog.node.querySelector(`.content`);n.classList.add(`panel`),e.target=n,e.dataview_dialog.dialog.close(),e.show=()=>{e.update(),e.toolbar&&e.dataview_dialog.node.querySelector(`.btn-row`).style.removeProperty(`display`),e.chart&&(e.dataview_dialog.node.appendChild(e.target.querySelector(`canvas`)),e.dataview_dialog.node.removeChild(e.target)),e.dataview_dialog.dialog.show()},e.hide=()=>{e.dataview_dialog.dialog.close()},e.location?.removeCallbacks?.push?.(()=>e.dataview_dialog.dialog.close())}var kr={create:Ar};async function Ar(e){e.query??=`histogram`,e.options??={};let t=`column-gap: ${e.options.columnGap||10}px`;e.node=mapp.utils.html.node`<div class="histogram" style=${t}>`,e.options.width&&(e.node.style.width=`${e.options.width}px`),e.options.height&&(e.node.style.height=`${e.options.height}px`),e.options.title&&e.target.append(mapp.utils.html.node`<h3 class="histogram-title">${e.options.title}`),e.setData=jr,e.target.append(e.node),e.options.xlabel&&(e.xlabel=mapp.utils.html.node`<div class="histogram-xlabel">${e.options.xlabel}`,e.options.width&&(e.xlabel.style.width=`${e.options.width}px`),e.target.append(e.xlabel)),e.options.caption&&(e.caption=mapp.utils.html.node`<span class="histogram-caption">${e.options.caption}`,e.target.append(e.caption))}function jr(e){this.data=e,Mr(this)}function Mr(e){if(!Array.isArray(e.data)){mapp.utils.render(e.node,mapp.utils.html`<div>`);return}let t=Math.max(...e.data.map(e=>e.count));e.options.height??=100;let n=e.data.map(n=>{let r=`height: ${Math.round(e.options.height*n.count/t)}px`,i=``;return e.options.tooltip&&(i=mapp.utils.html`<div class="bucket-info">
        <span><b>Count</b> ${mapp.utils.formatNumericValue({value:n.count,...e})}</span><br>
        <span><b>Min</b> ${mapp.utils.formatNumericValue({value:n.bucket_min,...e})}</span><br>
        <span><b>Max</b> ${mapp.utils.formatNumericValue({value:n.bucket_max,...e})}</span>`),mapp.utils.html`<div
      class="bucket"
      data-bucket=${n.bucket}
      data-count=${n.count}
      data-bucket-min=${n.bucket_min}
      data-bucket-max=${n.bucket_max}
      style=${r}>
      ${i}`}),r=e.options.ylabel?mapp.utils.html`<div class="ylabel">${e.options.ylabel}`:``;mapp.utils.render(e.node,mapp.utils.html`${r}${n}`)}var Y={idle:600};function Nr(e){Object.assign(Y,e),Y.idle!==0&&(window.onload=X,window.onmousemove=X,window.onmousedown=X,window.ontouchstart=X,window.onclick=X,window.onkeypress=X,X(),Z())}function X(){Y.locked||(Y.timeout&&clearTimeout(Y.timeout),Y.timeout=setTimeout(Pr,Y.idle*1e3))}function Pr(){Y.locked=!0,Y.renew&&clearTimeout(Y.renew);let e={url:`${Y.host}/api/user/cookie?destroy=true`};e.onLoad=e=>location.reload(),mapp.utils.xhr(e)}function Z(){Y.renew=setTimeout(Fr,(Y.idle-20)*1e3)}function Fr(){let e={url:`${Y.host}/api/user/cookie`};e.onLoad=e=>{if(e.target.status===401)return Pr();Z()},mapp.utils.xhr(e)}function Ir(e){let t=mapp.utils.html.node`
  <div class="interface-mask">
    <div
      class="bg-image" 
      style=${`background-image:url(${e.target.src})`}>
    <button 
      class="btn-close notranslate material-symbols-outlined"
      onclick=${e=>e.target.closest(`.interface-mask`).remove()}>close</button>`;document.body.append(t)}var Lr={create:Rr,toolbar:{copyToClipboard:Vr,csvupload:Hr,jsonfile:Br,sqlinsert:Ur}};async function Rr(e){e.props??={mainMenuBar:!1,mode:`text`,readOnly:!0},e.jsoneditor=await mapp.ui.elements.jsoneditor(e),e.setData=zr,e.data&&e.setData(e.data)}function zr(e){this.data=e;let t={json:e};this.jsoneditor.set(t)}function Br(e){return e.title??=e.label||`Unknown`,mapp.utils.html.node`<button onclick=${()=>{let t={filename:`${e.title}.json`,text:JSON.stringify(e.data,null,2),type:`application/json`};mapp.utils.textFile(t)}}>Download</button>`}function Vr(e){return mapp.utils.html.node`<button onclick=${()=>{let t=JSON.stringify(e.data,null,2);mapp.utils.copyToClipboard(t)}}>Copy to Clipboard</button>`}function Hr(e){return e.toolbar.csvupload.label??=`CSV Upload`,e.toolbar.csvupload.input=mapp.utils.html.node`<input 
      type=file class="flat bold wide"
      accept=".csv"
      onchange=${async t=>{if(!t.target.files[0])return;e.toolbar.csvupload.file=t.target.files[0];let n=await mapp.utils.csvUpload(e.toolbar.csvupload.file,e.toolbar.csvupload),r;if(Array.isArray(n)?r=n.filter(e=>e instanceof Error):n instanceof Error&&(r=[n]),r?.length){mapp.ui.elements.alert({title:`CSV Upload`,text:`Upload of CSV records has failed:\n\n${r.map(e=>e.message).join(`
`)}`});return}e.setData(n)}}>`,e.toolbar.csvupload.input}function Ur(e){return e.props={mainMenuBar:!1,mode:`text`},mapp.utils.html.node`<button onclick=${()=>{let t=e.jsoneditor.get();if(t.text===``)return;let n=mapp.utils.paramString(e.toolbar.sqlinsert),r=`${mapp.host}/api/query?${n}`;return mapp.utils.xhr({body:t.text,method:`POST`,url:r})}}>SQL Insert</button>`}async function Wr(e,t,n){return await mapp.ui.elements.jsoneditor({props:{onRenderMenu:e=>Gr(e,n),content:t,mode:`text`},target:e})}function Gr(e,t){return e.push(t),e.filter(e=>e.text!==`text`).filter(e=>e.text!==`tree`).filter(e=>e.text!==`table`).filter(e=>e.type!==`separator`).filter(e=>e.className!==`jse-undo`).filter(e=>e.className!==`jse-redo`).filter(e=>e.className!==`jse-search`).filter(e=>e.className!==`jse-contextmenu`).filter(e=>e.className!==`jse-sort`).filter(e=>e.className!==`jse-transform`)}async function Kr(e){if(Array.isArray(e.Features)&&!e.filter?.viewport)return e.Features.length;let t={layer:e,queryparams:{}};t.viewport=e.filter?.viewport||e.queryparams?.viewport;let n=mapp.utils.queryParams(t),r=mapp.utils.paramString({...n,filter:e.filter?.current,layer:e.key,table:e.tableCurrent(),qID:e.qID,template:`location_count`}),i=await mapp.utils.xhr(`${e.mapview.host}/api/query?${r}`);if(i instanceof Error)if(e.filter?.viewport){console.warn(`locationCount failed on viewport.`);return}else return e.filter.viewport=!0,await Kr(e);return i}var Q={},$={X:{min:75,lockSize:200,grid:`gridTemplateColumns`},Y:{min:0,lockSize:50,grid:`gridTemplateRows`},gridTemplate:{X:`auto`,Z:`10px`,Y:`auto`}};function qr(e){e.resizeEvent??=Jr.bind(e),e.stopResize=Xr.bind(e),e.axis??=`X`,e.doubleClickClose&&(e.target.ondblclick=t=>Yr(t,e)),e.target.addEventListener(`mousedown`,t=>{t.preventDefault(),document.body.style.cursor=`grabbing`,globalThis.addEventListener(`mousemove`,e.resizeEvent),globalThis.addEventListener(`mouseup`,e.stopResize)}),e.target.addEventListener(`touchstart`,t=>{t.preventDefault(),globalThis.addEventListener(`touchmove`,e.resizeEvent),globalThis.addEventListener(`touchend`,e.stopResize)},{passive:!0}),Q.gridTemplateColumns=getComputedStyle(document.body).gridTemplateColumns,Q.gridTemplateRows=getComputedStyle(document.body).gridTemplateRows}function Jr(e){let t=this.axis;$.X.size=e.touches?.[0]?.pageX||e.pageX,$.Y.size=globalThis.innerHeight-(e.touches?.[0]?.pageY||e.pageY);let n=$[t];if(n.size<n.min){$.gridTemplate[t]=`0px`,document.body.style[n.grid]=Object.values($.gridTemplate).join(` `);return}n.size<n.lockSize||(t===`X`&&$.X.size>globalThis.innerWidth/2&&($.X.size=globalThis.innerWidth/2),t===`Y`&&($.Y.size>globalThis.innerHeight-10&&($.Y.size=globalThis.innerHeight),OL.style.marginTop=`-${$.Y.size/2}px`),$.gridTemplate[t]=`${n.size}px`,document.body.style[n.grid]=Object.values($.gridTemplate).join(` `),$.gridTemplate={X:`auto`,Z:`10px`,Y:`auto`})}function Yr(e,t){if($.X.size=e.touches?.[0]?.pageX||e.pageX,$.Y.size=globalThis.innerHeight-(e.touches?.[0]?.pageY||e.pageY),$[t.axis].size<$[t.axis].min){document.body.style[$[t.axis].grid]=Q[$[t.axis].grid];return}$.gridTemplate[t.axis]=`0px`,document.body.style[$[t.axis].grid]=Object.values($.gridTemplate).join(` `),$.gridTemplate={X:`auto`,Z:`10px`,Y:`auto`}}function Xr(){document.body.style.cursor=`auto`,globalThis.removeEventListener(`mousemove`,this.resizeEvent),globalThis.removeEventListener(`touchmove`,this.resizeEvent),globalThis.removeEventListener(`mouseup`,this.stopResize),globalThis.removeEventListener(`touchend`,this.stopResize)}var Zr={Dataview:t,elements:dt,Gazetteer:ft,layers:rn,locations:gr,Tabview:_r,utils:{cssColour:yr,dataview:Sr,dataviewDialog:Or,histogram:kr,idleLogout:Nr,imagePreview:Ir,Json:Lr,layerJSE:Wr,locationCount:Kr,resizeHandler:qr}};globalThis.ui=Zr,globalThis.mapp??={},mapp.ui=Zr;
//# sourceMappingURL=ui.js.map