# Editing

Layers can be made editable by setting a flag in the root of the layer definition.

`"editable": true`

Seting the editable flag to `true` allows editing of location attributes. Setting the editable flag to `'geometry'` allows to create locations and modify a locations geometry. _!!! Geometry edits are currently only supported on cluster layer._

The primary key of a table which allows geometry edits must be a serial key. New features must get a unique ID when they are created in the database.

Edits can be logged in a seperate table. The log table must be identical to the editable table but the id must not be a serial key. Allowing a feature to be stored several times under its original ID. Both tables need to have a JSON field for the log information. The default name for this field is _log_.

`"log": {"table": "<tablename>", "field": "<log field>"}`

The log table can be added as a seperate layer. Adding the log\_table flag to this layer will make sure that only the last version of a logged edit will be loaded from the database.

`"log_table": <true or "field name">}`

If set to true, then _log_ will be used as the default fieldname for the edit log.

The log field stores the username, a timestamp and the operation which is either 'new', 'update' or 'delete'.

