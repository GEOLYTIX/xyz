## 3.0.1

Icon in theme drop down no longer removed after switch.

Check whether remove dataview function exists before trying to remove dataview. A dataview will be pushed into the location array but may not be created if the display is false. This caused an error when trying to remove location with dataviews.

Failing to select location will now remove the hook and not prompt the error message twice.

Integer and numeric fields now can be set to empty - previously resulted in database column type error.

Fix to document container - newly uploaded document added at the end of the list, original file name is retained instead of unix timestamp. #262 

Cluster markers - markerMin/Max now supported within theme markers. #251 