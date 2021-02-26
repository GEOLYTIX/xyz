---
title: Dataviews

layout: root.html
---

# Dataviews

[/lib/dataviews](https://github.com/GEOLYTIX/xyz/blob/development/lib/dataviews.mjs)

Dataviews can be created as either chart or table.

The dataview must be provided as an object to the `dataviews.create()` method. A target for the dataview may be provided as ID (string) or HTMLElement. New target element will be created if no target value is provided with the dataview object.

The dataview will be appended as a child if a `.panel` HTMLElement is provided with the dataview object. This allows for dataviews to be created in a tabview panel.

Dataviews can be nested by providing the multiple dataview objects within a dataviews array on the dataview object. This allows for mutiple dataviews to be arranged in a grid display.

A dataview HTMLElement contains a `.toolbar` container which allows for additional utility controls to be created alongside the dataview, and the dataview target itself which will hold the canvas on which dataview is drawm.

Dataviews have a `.setData()` method which will assign data to the dataview and render the newly set data.

The `.update()` method of a dataview will wait for a promise to execute the dataview query and send the response to the `.setData()` method.

The update method will be called from a `changeEnd` event listener on the `mapview.node` if the `.mapChange = true` flag is set.

## ChartJS

The Mapp library will attempt to create a ChartJS dataview if a `.chart` object is assigned to the input dataview object.

<iframe height="406" style="width: 100%;" scrolling="no" title="tabview" src="https://codepen.io/dbauszus-glx/embed/ExgPdeB?height=406&theme-id=light&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/dbauszus-glx/pen/ExgPdeB'>tabview</a> by dbauzus-glx
  (<a href='https://codepen.io/dbauszus-glx'>@dbauszus-glx</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

## Tabulator

The Mapp library will attempt to create a Tabulator dataview is a `.columns` array is assigned to the input dataview object.

The Tabulator library must be available as a script ressource.

<iframe height="406" style="width: 100%;" scrolling="no" title="tabview" src="https://codepen.io/dbauszus-glx/embed/BaLjvae?height=406&theme-id=light&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/dbauszus-glx/pen/BaLjvae'>tabview</a> by dbauzus-glx
  (<a href='https://codepen.io/dbauszus-glx'>@dbauszus-glx</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>