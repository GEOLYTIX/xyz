export default _xyz => {

  const tabview = {

    init: init,

    plugins: {}

  }

  return tabview

  function init(params) {

    if (!params.target) return

    tabview.node = params.target

    tabview.panel = tabview.node.querySelector('.tabs')

    tabview.tabs = new Set()

    tabview.add = tab => {

      if (!tabview.node) return

      // Add tab which has previously been created.
      if (tab.show) return tab.show()

      tab.show = () => {

        tabview.tabs.forEach(tab => tab.node.classList.remove('active'))

        !tab.node.parentElement && tabview.panel.appendChild(tab.node)

        tab.node.classList.add('active')

        tabview.timer && clearTimeout(tabview.timer)
        tabview.timer = setTimeout(()=>tab.node.dispatchEvent(new CustomEvent('activate')), 500)
        
        if (tabview.node.classList.contains('desktop-display-none')) {
          tabview.node.classList.remove('desktop-display-none')
          document.body.style.gridTemplateRows = 'auto 65px'
        }
      }

      tab.node = _xyz.utils.html.node`<div class="tab">`

      tab.header = tab.node.appendChild(_xyz.utils.html.node`
        <div
          style="${tab.tab_style || ''}"
          class="header"
          onclick=${tab.show}>${tab.title || tab.key || 'Tab'}`)

      tab.panel = tab.node.appendChild(_xyz.utils.html.node`
        <div
          class="${`content ${tab.class || ''}`}"
          style="${tab.style || ''}">`)

      tab.target && tab.panel.appendChild(tab.target)

      tabview.tabs.add(tab)

      tab.layer && tab.layer.tabs.add(tab)

      tab.location && tab.location.tabs.add(tab)

      tab.remove = () => {

        const sibling = tab.node.nextElementSibling || tab.node.previousElementSibling

        tab.node.remove()

        tabview.tabs.delete(tab)

        // Show first tab in set.
        if (sibling) return sibling.querySelector('.header').click()

        // Hide tabview container if no tabs remain in set.
        tabview.node.classList.add('desktop-display-none')
        document.body.style.gridTemplateRows = 'auto 0'
        _xyz.mapview.node.style.marginTop = 0
      }

    }

    Object.values(tabview.plugins).forEach(plugin => plugin(_xyz))

  }

}