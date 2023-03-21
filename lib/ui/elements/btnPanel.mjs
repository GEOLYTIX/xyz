export default (params) => mapp.utils.html.node`
    <button 
        data-id=${params.data_id || 'btnPanel'}
        class=${`btn-panel ${params.class || ''}`}
        style=${`${params.style || ''}`}
        onclick=${params.btnOnclick}
    >
        <div class="header">
            <h3>${params.btnLabel}</h3>
            <div
                class="mask-icon"
                style=${`
                    mask-image: url("${params.btnIcon}");
                    -webkit-mask-image: url("${params.btnIcon}");
                `}>
            </div>
        </div>
        <div
            class=${`panel ${params.panelClass || ''}`}
            style=${`${params.style || ''}`}
        >
            <h3>
                ${params.panelTitle}
            </h3>
            <div class="content">
                ${params.panelContent}
            </div>
        </div>
    </button>
`