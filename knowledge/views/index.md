# Views

A view is an HTML page served by the XYZ API from a workspace template. Its
script loads MAPP and MAPP.UI, a locale and its layers.

- [View API](view-api.md) - How `/view` finds a template and fills in `{{params}}`; use when adding, overriding or debugging a view template.
- [Core views](core-views.md) - The default map view, the login view and the user admin view and what they do on load; use when changing `public/views`.
- [Building a custom view](custom-views.md) - A minimal working view with a locale, plugins and layers; use when creating any view other than the default.
- [URL hooks](url-hooks.md) - URL params which select the locale, view, layers and locations; use when a view reads or writes URL params.
- [Language and dictionaries](language.md) - Language selection, dictionaries and language templates; use when translating a view or adding a language.
- [Report views](linked-views.md) - Report links from layers and locations, and a report script; use when building a location report or print layout.
- [Embedding views and maps](embedding.md) - Linking, framing, or the MAPP package on another site; use when a map must appear outside the default view.
