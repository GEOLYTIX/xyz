export default async function createExtent(extents) {
  let overall_extent;

  for (const key of Object.keys(extents)) {
    const extent_value =
      typeof extents[key] === 'function' ? await extents[key]() : extents[key];

    overall_extent ??= extent_value;

    overall_extent =
      ol.extent.getArea(extent_value) > ol.extent.getArea(overall_extent)
        ? extent_value
        : overall_extent;
  }

  return overall_extent;
}
