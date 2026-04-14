/**
## /utils/languageTemplates

The languageTemplates module requests templates that maybe localised.

A localised template object will have properties matching a language code. The property value being the localised template for that language.

```js
token_not_found: {
  en: `Token not found. The token has probably been resolved already.`,
  fr: `Token n’a pas été trouvé. Il a probablement déjà été utilisé.`,
  pl: `Token wygasł. Prawdopodobnie został już wykorzystany.`,
  ja: `トークンが見つかりません。 トークンはおそらくすでに解決されています。`,
  ko: `토근이 발견되지 않았습니다. 이미 해결된 것 같습니다.`,
  zh: `未找到相关令牌， 该令牌可能已解析`
}
```

English being the default language, each language template should have the 'en' property.

@requires /provider/getFrom
@requires /workspace/getTemplate

@module /utils/languageTemplates
*/

import getFrom from '../provider/getFrom.js';

import getTemplate from '../workspace/getTemplate.js';

/**
@function languageTemplates
@async

@description
The method will request a template from the `getTemplate()` module method.

The params.template string will be returned if the getTemplate method returns an error. A message template may not exist and the template reference should be returned to the requesting method rather than an error message stating that the template doesn't exist.

A [view] template which is not a languageTemplate maybe requested from the {@link module:/view View API module}. The object returned from the getTemplate method will have a template string property which will be returned to the caller.

Valid language template objects must have an `en` property. The english template will be returned if the requested language is not a property of the template object.

@param {Object} params Params object which specifies the template.
@property {string} params.template The key of the template.
@property {string} [params.language = 'en'] The template language

@returns {Promise} The promise will resolve to a string or object.
*/
export default async function languageTemplates(params) {
  if (params.template === undefined) return;

  const languageTemplate = await getTemplate(params.template);

  if (languageTemplate instanceof Error) {
    // Return the error object for failed view_template lookup.
    if (params.view_template) return languageTemplate;

    // Return the template string value if the template is not available in workspace.
    return params.template;
  }

  // NOT a language template
  if (typeof languageTemplate.template === 'string') {
    return languageTemplate.template;
  }

  // The getTemplate method failed to retrieve the template from a src string property.
  if (languageTemplate.src && languageTemplate.err instanceof Error) {
    return params.template;
  }

  // Set english as default template language.
  params.language ??= 'en';

  // Assign language property from languageTemplate as template
  const template = Object.hasOwn(languageTemplate, params.language)
    ? languageTemplate[params.language]
    : languageTemplate.en;

  if (typeof template !== 'string') return template;

  const method = template.split(':')[0];

  // HTML Templates must be gotten as string from [template] string.
  if (Object.hasOwn(getFrom, method)) {
    // Get template from method.
    return await getFrom[method](template);
  }

  return template;
}
