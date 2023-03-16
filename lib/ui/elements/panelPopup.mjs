export default (params) => mapp.utils.html.node`
    <div class="panel-popup-container">
        <div
            data-id=${params.data_id || 'panelPopup'}
            class=${`panel popup ${params.class || ''}`}
            style=${`${params.style || ''}`}
            onclick="${(e) => e.stopPropagation()}"
        >
            <h3>
                ${params.title}
            </h3>
            <div class="content">
                ${params.content}
            </div>`;