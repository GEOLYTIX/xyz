export default _xyz => {

  const tabview = {

    init: init,

    add: add,

    plugins: {}

  }

  return tabview

  function init(params) {

    if (!params.node) return

    tabview.node = params.node

    // Create a tabs container as a parent for tab elements.
    tabview.tabs = tabview.node.appendChild(_xyz.utils.html.node`<div class="tabs">`)

    // Tabview plugins are executed when tabview is initialised.
    Object.values(tabview.plugins).forEach(plugin => plugin(_xyz))

  }

  function add(tab) {

    if (!tabview.node) return

    // A tab should not be create twice.
    if (tab.tab) return

    tab.show = () => {

      // Remove the active class from all tabs.
      tabview.tabs.childNodes.forEach(tab => tab.classList.remove('active'))

      // Add the tab element to tabs container if the tab element has no parent yet.
      !tab.tab.parentElement && tabview.tabs.appendChild(tab.tab)

      // Make the tab active by assigning class.
      tab.tab.classList.add('active')

      // The activate event should be delayed with a timeout.
      // This prevents each tab to activate when multiple tabs are added in quick succession.
      tabview.timer && window.clearTimeout(tabview.timer)
      tabview.timer = window.setTimeout(()=>tab.tab.dispatchEvent(new CustomEvent('activate')), 500)
      
      // Hide the tabview when empty.
      if (tabview.node.classList.contains('desktop-display-none')) {
        tabview.node.classList.remove('desktop-display-none')
        document.body.style.gridTemplateRows = 'auto 10px 50px'
      }
    }

    tab.tab = _xyz.utils.html.node`<div class="tab">`

    // The tab header will always be shown in the tabs bar.
    // Clicking the tab header will show a tab.
    tab.header = tab.tab.appendChild(_xyz.utils.html.node`
      <div
        style="${tab.tab_style || ''}"
        class="header"
        onclick=${tab.show}>${tab.title || tab.key || 'Tab'}`)

    // The tab panel holds the tab content.
    // The tab panel will only be shown for an active tab.
    tab.panel = tab.tab.appendChild(_xyz.utils.html.node`
      <div
        class="${`panel ${tab.class || ''}`}"
        style="${tab.style || ''}">`)

    // Assign target element as content to the tab panel.
    tab.target && tab.target instanceof HTMLElement && tab.panel.appendChild(tab.target)

    // Assign tab to layer to enable activation and removal from layer object.
    tab.layer && tab.layer.tabs.add(tab)

    // Assign tab to location to enable activation and removal from location object.
    tab.location && tab.location.tabs.add(tab)

    tab.remove = () => {

      // A tab without parent element cannot be in the tab bar.
      if (!tab.tab.parentElement) return

      // Find a sibling of the tab.
      const sibling = tab.tab.nextElementSibling || tab.tab.previousElementSibling

      // Remove the tab element from tab bar.
      tab.tab.remove()

      // Activate the sibling.
      if (sibling) return sibling.querySelector('.header').click()

      // Hide tabview if tab had no siblings.
      tabview.node.classList.add('desktop-display-none')
      document.body.style.gridTemplateRows = 'auto 0 0'
      _xyz.mapview.node.style.marginTop = 0
    }

  }

}