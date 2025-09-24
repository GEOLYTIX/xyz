export function toolbar(plugin, mapview) {
    console.log('hello world!');

    const container = mapp.utils.html
        .node`<div class="core-menu">`;

    document.body.append(container);

    const groups = [];

    new Set(['group 1', 'group 2', 'group 3']).forEach(item => {
        const group = mapp.utils.html.node`<button class="" onclick="${group_on_click}">
            <span class="material-symbols-outlined">construction</span>
            <span class="title">
                <span>${item}</span>
                </button>`;
        groups.push(group);
    });

    mapp.utils.render(container, mapp.utils.html`<ul>${groups}`)
}


function group_on_click(e) {
    const container = e.target.closest('.core-menu');
    const submenus = container.querySelectorAll('.submenu');

    for (const submenu of submenus) {
        container.contains(submenu) ?
            submenu.classList.toggle('display-none') : submenu.classList.add('display-none')
    }
}