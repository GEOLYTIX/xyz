/**
## /plugins/consent

The module exports method to display and store configurable user consent.

@requires /utils/userIndexedDB
@requires /ui/elements/confirm

@module /plugins/consent
*/

/**
@function consent
@async

@description
The method will shortcircuit without a mapp.user{} object.

The method will shortcircuit without a consent text being defined in the plugin configuration.

The method awaits the confirm dialog promise to resolve and stores the response as the user.consent property in the userIndexedDB user store.

The confirm dialog will not be displayed if consent has been provided previously.

```json
"consent": {
  "text": "Please confirm you consent to user 3rd party cookies."
}
```

@param {Object} plugin The consent configuration.
@param {mapview} mapview
@property {string} plugin.text The text shown in the consent dialog.
@property {string} [plugin.title="mapp.user.consent"] The title for the consent confirmation dialog.
*/
export async function consent(plugin, mapview) {
  if (!mapp.user) return;

  if (!plugin.text) {
    console.warn('consent plugin is missing consent text');
    return;
  }

  if (mapp.user.consent) {
    console.log('mapp.user has consent flag');
    return;
  }

  plugin.title ??= 'mapp.user.consent';

  mapp.user.consent = await mapp.ui.elements.confirm(plugin);

  if (mapp.user.consent) {
    await mapp.utils.userIndexedDB.put({
      store: 'user',
      name: mapp.user.email,
      obj: mapp.user,
    });
  }
}
