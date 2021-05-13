---
title: Location
layout: root.html
---

# Location API

The [Location API module](https://github.com/GEOLYTIX/xyz/blob/master/mod/location/_location.js) provides methods to interface with locations.

### /api/location/get?locale=UK&layer=Scratch&table=dev.scratch&id=8

Get requests will use a DBS connection as defined by the locale and layer parameter to query a location record from the table. The id field is defined as `qID` parameter in the layer confirguration. Fields to be returned from a location/get query must be defined in the layer's infoj array.

### /api/location/new?locale=UK&layer=Scratch&table=dev.scratch

Post requests to the location/new endpoint must contain the geometry for the new location. Request require that the DBS connection has priviliges to insert new records into the database table. The id field must be `serial not null` and return an id from the post request to the client.

### /api/location/update?locale=UK&layer=Scratch&table=dev.scratch&id=8

Post requests to the location/update endpoint must have a JSON object in the body with the field and their values to be updated in the location record. Update requests require that the DBS connection has priviliges to update existing records in the database table.

### /api/location/delete?locale=UK&layer=Scratch&table=dev.scratch&id=8

Get requests to the location/delete endpoint will remove a location record from the database table which matches the id request parameter. Delete requests require that the DBS connection has priviliges to remove existing records in the database table.