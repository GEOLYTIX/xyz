export default (params) => mapp.utils.html.node`
  <button 
    data-id=${params.data_id || 'iconButton'}
    class=${`btn-icon ${params.class || ''}`}
    style=${`${params.style || ''}`}
    onclick=${params.onclick}
  >
    <div class="header">
      <h3>${params.label}</h3>
      <div
        class="mask-icon"
        style=${`
          mask-image: url(${params.iconURL});
          -webkit-mask-image: url(${params.iconURL});
        `}></div>
    </div>`;