export default (params) => mapp.utils.html.node`
  <button 
    data-id=${params.data_id || 'buttonIcon'}
    class=${`btn-icon ${params.class || ''}`}
    style=${`${params.style || ''}`}
    onclick=${params.onclick}
  >
    <div class="header">
      <h3>${params.label}</h3>
      <div
        class="mask-icon"
        style=${`
          mask-image: url("${params.icon}");
          -webkit-mask-image: url("${params.icon}");
        `}></div>
    </div>`;