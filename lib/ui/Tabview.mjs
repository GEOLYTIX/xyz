export default tabview => {

  if (!tabview.node) return;

  tabview.tabs = tabview.node.appendChild(mapp.utils.html.node`<div class="tabs">`)

  tabview.panel = tabview.node.appendChild(mapp.utils.html.node`<div class="panel">`)

  tabview.id && tabview.node.setAttribute('data-id', tabview.id);

  tabview.addTab = addTab

  tabview.node.addEventListener('addTab', e => tabview.addTab(e.detail))
}

// add entry as tab to this tabview.
function addTab(entry) {

  const tabview = this

  if (entry.location) {
 
    // The tabview should be removed if the location is removed.
    entry.location.removeCallbacks.push(()=>entry.remove())

  } else if (entry.layer) {

    // Show tab when layer is displayed.
    entry.layer.showCallbacks.push(()=>{

      // Entry must have display flag.
      entry.display && entry.show()
    })
  
    // Hide tab when layer is hidden.
    entry.layer.hideCallbacks.push(()=>{
      entry.remove()
    })
  }

  entry.tab = mapp.utils.html.node`
    <div class="tab">
      <div
        class="header"
        style="${entry.tab_style || ''}"
        onclick=${showTab}>
          ${entry.label || entry.title || entry.key || 'Tab'}`
      
  entry.panel = entry.panel || entry.target || mapp.utils.html.node`
    <div class="${`panel ${entry.class || ''}`}">`

  entry.panel.addEventListener('activate', ()=>{
    entry.update && entry.update()
  })

  entry.show = showTab

  entry.remove = removeTab

  function showTab (){

    // Render entry.panel into tabview.panel
    mapp.utils.render(tabview.panel, entry.panel)

    // Remove the active class from all tabs.
    tabview.tabs.childNodes.forEach(tab => tab.classList.remove('active'))

    // Add the tab element to tabs container if the tab element has no parent yet.
    !entry.tab.parentElement && tabview.tabs.appendChild(entry.tab)

    // Make the tab active by assigning class.
    entry.tab.classList.add('active')

    // The activate event should be delayed with a timeout.
    // This prevents each tab to activate when multiple tabs are added in quick succession.
    tabview.timer && window.clearTimeout(tabview.timer)

    tabview.timer = window.setTimeout(()=>{
      if (entry.panel instanceof HTMLElement) {
        entry.panel.dispatchEvent(new CustomEvent('activate'))
        return
      }
      entry.target instanceof HTMLElement
        && entry.target.dispatchEvent(new CustomEvent('activate'))
    }, 500)

    tabview.showTab && tabview.showTab()
  }

  function removeTab () {

    // A tab without parent element cannot be in the tab bar.
    if (!entry.tab.parentElement) return

    // Find a sibling of the entry.
    const sibling = entry.tab.nextElementSibling || entry.tab.previousElementSibling

    // Remove the tab element from tab bar.
    entry.tab.remove()

    // Activate the sibling.
    if (sibling) return sibling.querySelector('.header').click()

    tabview.removeLastTab && tabview.removeLastTab()
  }
}