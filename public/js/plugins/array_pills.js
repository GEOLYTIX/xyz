document.dispatchEvent(new CustomEvent('array_pills', {
  detail: _xyz => {

    _xyz.locations.plugins.array_pills = entry => {

      entry.value && entry.listview.appendChild(_xyz.utils.html.node`
        <div
          class="${`label ${entry.class}`}"
          style="${`${entry.css_title || ''}`}"
          title="${entry.tooltip || null}">${entry.title}`)

      entry.value && entry.value.forEach(val => {

        entry.listview.appendChild(_xyz.utils.html.node`
          <div
            class="${`val ${entry.class}`}"
            style="
              border-radius: 5px;
              padding: 5px;
              margin: 0 5px;
              box-shadow: 1px 1px 5px 0px #999;">${val}`)

      })

    }

  }
}))