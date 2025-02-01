/**
The svg_templates plugin module has been deprectated in favour of {@link module:/utils/svgTemplates}.

@module /plugins/svg_templates
@deprecated
*/

/**
@function svg_templates
@deprecated
*/
export async function svg_templates(plugin) {
  return mapp.utils.svgTemplates(plugin);
}
