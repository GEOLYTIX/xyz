export default _xyz => {

  const tabview = {

    init: init,

    plugins: {}

  }

  return tabview

  function init(params) {

    if (!params.target) return

    tabview.node = params.target

    const bar = _xyz.utils.html.node`<div class="tab-bar">`

    tabview.bar = _xyz.utils.html.node`<div>`

    bar.appendChild(tabview.bar)

    tabview.node.appendChild(bar)

    tabview.panel = _xyz.utils.html.node`<div class="tab-panel">`

    tabview.node.appendChild(tabview.panel)

    tabview._dataviews = new Set()

    tabview.add = tab => {

      // Add tab which has previously been created.
      if (tab.showTab) {

        tabview.bar.appendChild(tab.tab)
        tabview.panel.appendChild(tab.target)
        tabview._dataviews.add(tab)

        return tab.showTab()
      }

      tab.showTab = () => {

        tabview._dataviews.forEach(view => {
          view.target.style.display = 'none'
          view.tab.classList.remove('active')
          view.target.classList.remove('active')
        })

        tab.tab.classList.add('active')
        tab.target.style.display = 'grid'
        tab.target.classList.add('active')

        if (tabview.node.classList.contains('desktop-display-none')) {
          tabview.node.classList.remove('desktop-display-none')
          document.body.style.gridTemplateRows = 'auto 65px'
        }

        tab.update && tab.update()
        tab.dataviews && tab.dataviews.forEach(_dataview => _dataview.update && _dataview.update())
      }

      tab.tab = _xyz.utils.html.node`
        <div
          style="${tab.tab_style || ''}"
          class="active"
          onclick=${() => {
            tab.timer && clearTimeout(tab.timer)
            tab.timer = setTimeout(() => tab.showTab(), 500)
          }}>${tab.title || tab.key || 'Tab'}`

      tabview.bar.appendChild(tab.tab)

      tab.target = tab.node || _xyz.utils.html.node`
        <div
          class="${tab.class || ''}"
          style="${tab.style || ''}">`

      tabview.panel.appendChild(tab.target)

      if (tab.query || tab.dataviews) _xyz.dataviews.create(tab)

      tabview._dataviews.add(tab)


      tab.remove = () => {

        tab.target.remove()

        tab.layer && tab.layer._dataviews.delete(tab)

        tab.tab.remove()

        tabview._dataviews.delete(tab)

        if (tabview._dataviews.size) return Array.from(tabview._dataviews)[0].showTab()

        // Hide tabview container if no dataviews remain in set _dataviews.
        tabview.node.classList.add('desktop-display-none')

        document.body.style.gridTemplateRows = 'auto 0'

        _xyz.map.updateSize()
      }

      tab.tab.click()

    }

    Object.values(tabview.plugins).forEach(plugin => plugin(_xyz))

  }

}