# /api/images/new

Uploads an image to cloudinary and attaches the image reference to a location.

Post request body:

* dbs: The name of the Postgres database connection as defined in the environment settings.
* table: The table name of the location.
* qID: The id field of the location. Defaults to 'id'.
* id: The id of the location.
* The image data itself is send as an octet stream in the payload.

