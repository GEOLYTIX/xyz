export default (params) => mapp.utils.html.node`
  <button 
    data-id=${params.data_id || 'iconButton'}
    class=${`drawer expandable icon-btn ${params.class || ''}`}
    style=${`
      padding: 0.3em 1em;
      border: 1px solid #D5E1E6;
      border-radius: 3px;
      box-shadow: 1px 1px 3px #939faa;
      ${params.style || ''}
    `}
    onclick=${params.onclick}
  >
    <div class="header">
      <h3>${params.label}</h3>
      <div
        class="mask-icon"
        style=${`
          mask-image: url(${params.iconURL});
          -webkit-mask-image: url(${params.iconURL});
          ${params.styleIcon || ''}
        `}></div>
    </div>`;