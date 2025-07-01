export default async function createExtent(extents) {
  let overall_extent;

  for (let [key, extent] of Object.entries(extents)) {
    if (typeof extent === 'function') extent = await extent();

    console.log(extent);
    if (extent) {
      overall_extent ??= extent;

      overall_extent =
        ol.extent.getArea(extent) > ol.extent.getArea(overall_extent)
          ? extent
          : overall_extent;
    }
  }

  return overall_extent;
}
