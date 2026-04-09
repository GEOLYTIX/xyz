/**
## /ui/locations/entries/ping

The ping module exports an entry method to test the ping utility.

@module /ui/locations/entries/ping
*/

/**
@function ping

@description
The ping method creates a text field and initiates the ping utility with the entry object as params.

The ping callback method will update a textarea input with the response.

The ping will be cancelled by setting the callback to false.

@param {infoj-entry} entry type:ping entry.

@return {HTMLElement} The entry node containing a textarea input.
*/
export default function ping(entry) {
  if (!entry.textarea) {
    entry.textarea = mapp.utils.html.node`<textarea
      class="val"
      style="auto; min-height: 50px;">`;

    entry.callback ??= async (response, entry) => {
      entry.textarea.value = response;
    };

    mapp.utils.ping(entry);

    entry.location.removeCallbacks.push(() => {
      entry.callback = false;
    });
  }

  return entry.textarea;
}
