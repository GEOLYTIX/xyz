document.dispatchEvent(new CustomEvent('tab_locale', {
  detail: _xyz => {

    _xyz.dataviews.tabview.plugins.tab_fixed = _xyz => {

      _xyz.dataviews.tabview.add({
        title: 'Locale',
        node: _xyz.utils.html.node`<div>This is the way`
      })

    }

  }
}))