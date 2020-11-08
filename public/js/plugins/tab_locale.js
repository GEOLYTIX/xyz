document.dispatchEvent(new CustomEvent('tab_locale', {
  detail: _xyz => {

    _xyz.tabview.plugins.tab_fixed = _xyz => {

      const tab = {
        title: 'Locale',
        target: _xyz.utils.html.node`<div>This is the way`
      }

      _xyz.tabview.add(tab)

      tab.show()

    }

  }
}))