---
title: Tabview

layout: root.html
---

# Tabview

[/lib/tabview](https://github.com/GEOLYTIX/xyz/blob/development/lib/tabview.mjs)

The tabview control manages a single tabview element which may hold a set of tab elements.

The tabview element must be initialised by providing a node param to the `tabview.init()` method. The init method will create a `.tabs` element in the tabview node which will hold the tabs.

A tab can be added to the tabview tabs container by calling the `tabview.add()` method with a tab object. 

A tab element consists of a header and a panel. The header is shown in the `.tabs` container of the tabview. The tab panel is only shown for a single active tab. Clicking the header of a shown tab will make the tab active after deactivating all other sibling tabs.

A tab has `.show()` and `.remove()` methods. A tab will only become visible after the show method is called.

The `.remove()` will remove a tab for good.

<iframe height="406" style="width: 100%;" scrolling="no" title="tabview" src="https://codepen.io/dbauszus-glx/embed/YzGwOWJ?height=406&theme-id=light&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/dbauszus-glx/pen/YzGwOWJ'>tabview</a> by dbauzus-glx
  (<a href='https://codepen.io/dbauszus-glx'>@dbauszus-glx</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>