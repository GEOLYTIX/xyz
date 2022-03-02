export default (_xyz) => (layer) => (feature) => {
  const properties = feature.getProperties();
  const geometryType = feature.getGeometry().getType();

  if (layer.featureLookup) {
    // modify properties

    Object.entries(layer.featureLookup).map((entry) => {
      let field = entry[0],
        values = entry[1];

      let f = values.find((v) => v.id === properties.id);
      properties[field] = f ? f.value : properties[field];
    });
  }

  // Assign cluster style, to default style if size property indicates that location is a cluster.
  const style =
    properties.size && properties.size > 1
      ? Object.assign({}, layer.style.default, layer.style.cluster)
      : Object.assign({}, layer.style.default);

  Object.assign(style, { label: layer.style.label || {} });

  if (geometryType === "Point") {
    // The style must be cloned as icon if not otherwise defined to prevent circular reference
    style.icon = style.icon || style.marker || _xyz.utils.cloneDeep(style);
    if (layer.name === "Custom" || layer.name === "Custom 4258") {
      const fillColor = properties.fillColor || style.fillColor;
      style.icon.fillColor = fillColor;
      delete style.icon.url;
      delete style.icon.customSvg
      if (properties.svg) {
        style.icon.customSvg = properties.svg;
      }
    } else if (
      layer.name === "Contributions" &&
      style.type === "clusterSummary"
    ) {
      style.icon.catValues = properties.cat;
    } else if(layer.name === '3d View'){
      delete style.icon.url;
      delete style.icon.customSvg
      if (properties.svg) {
        style.icon.customSvg = properties.svg;
      }
    }
  } else {
    delete style.icon;
    delete style.marker;
  }

  delete style.scale;
  delete style.clusterScale;

  const theme = layer.style.theme;

  // Categorized theme
  if (theme && theme.type === "categorized") {
    var catValue = properties.cat || properties[theme.field];

    var catStyle =
      theme.cat && (theme.cat[catValue]?.style || theme.cat[catValue]);

    if (catStyle) {
      // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
      catStyle.icon =
        geometryType === "Point" &&
        (catStyle.icon || catStyle.marker || _xyz.utils.cloneDeep(catStyle));

      delete catStyle.label;

      _xyz.utils.merge(style, catStyle);
    }
  }

  // Graduated theme.
  if (theme && theme.type === "graduated") {
    var catValue = parseFloat(properties.cat || properties[theme.field]);

    if (catValue || catValue === 0) {
      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {
        // Break iteration is cat value is below current cat array value.
        if (catValue < theme.cat_arr[i].value) break;

        // Set cat_style to current cat style after value check.
        var catStyle = theme.cat_arr[i].style || theme.cat_arr[i];
      }

      if (catStyle) {
        // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
        catStyle.icon =
          geometryType === "Point" &&
          (catStyle.icon || catStyle.marker || _xyz.utils.cloneDeep(catStyle));

        delete catStyle.label;

        _xyz.utils.merge(style, catStyle);
      }
    }
  }

  // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
  if (style.icon?.clusterScale) {
    // The clusterScale will be added to the icon scale.
    style.icon.clusterScale = style.icon.logScale
      ? // A natural log will be applied to the cluster scaling.
        (Math.log(style.icon.clusterScale) / Math.log(layer.max_size)) *
        Math.log(properties.size)
      : // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
        (style.icon.clusterScale / layer.max_size) * properties.size;
  }

  // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
  if (style.icon?.zoomInScale) {
    style.icon.zoomInScale *= _xyz.mapview.getZoom();
  }

  // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
  if (style.icon?.zoomOutScale) {
    style.icon.zoomOutScale /= _xyz.mapview.getZoom();
  }

  // Apply highlight style to features which are highlighted.
  if (layer.highlight === feature.get("id")) {
    const highlightStyle = _xyz.utils.cloneDeep(layer.style.highlight);
    if (layer.name === "Custom" || layer.name === "Custom 4258") {
      const fillColor =
        properties.highlightFillColor || highlightStyle.fillColor;
      const strokeColor =
        properties.highlightStrokeColor || highlightStyle.strokeColor;
      highlightStyle.fillColor = fillColor;
      highlightStyle.strokeColor = strokeColor;
    }

    if (geometryType === "Point") {
      // The highlightStyle must be cloned as icon if not otherwise defined to prevent circular reference
      highlightStyle.icon =
        highlightStyle.icon ||
        highlightStyle.marker ||
        _xyz.utils.cloneDeep(highlightStyle);

      highlightStyle.icon.highlightScale = highlightStyle.icon.scale || 1;

      // Remove scales to prevent assignment of highlight scale to the icon's base scale
      delete highlightStyle.icon.scale;
      delete highlightStyle.scale;
    }
    _xyz.utils.merge(style, highlightStyle);
  } else {
    if (layer.name === "Custom" || layer.name === "Custom 4258") {
      const fillColor = properties.fillColor || style.fillColor;
      const strokeColor = properties.strokeColor || style.strokeColor;
      style.fillColor = fillColor;
      style.strokeColor = strokeColor;
    }
  }

  if (style.label.display) {
    style.label.text =
      properties.label || (style.label.count && properties.count);
  } else {
    delete style.label;
  }
  style.properties = properties;

  if (layer.name === "Custom" || layer.name === "Custom 4258") {
    // console.log(style.icon.fillColor, style);
  }
  return _xyz.utils.style(style, feature);
};
