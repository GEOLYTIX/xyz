export default (params) => mapp.utils.html.node`
    <button 
        data-id=${params.data_id || 'btnPanel'}
        class=${`btn-panel ${params.class || ''}`}
        style=${params.style || ''}
        onclick=${(e) => {
          e.target.classList.toggle('active');
          params.callback(e);
        }}>
        <div class="header">
            <h3>${params.label}</h3>
            <div class="notranslate material-symbols-outlined">${params.icon_name}</div>
        </div>
        ${
          params.panel &&
          mapp.utils.html`
            <div class="panel">${params.panel}`
        }`;
