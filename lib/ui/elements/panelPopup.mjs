export default (params) => mapp.utils.html.node`
    <div class="panel-container popup">
        <div
            data-id=${params.data_id || 'panelPopup'}
            class=${`panel popup ${params.class || ''}`}
            style=${`${params.style || ''}`}
        >
            <h3>
                ${params.title}
            </h3>
            <div class="content">
                ${params.content}
            </div>`;