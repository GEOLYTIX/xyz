This branch is for the migration from Zeit Now v1 to v2.

Node runtime must be 10+, should be 12.

Fastify has been removed on this branch.

There is a micro.js placeholder which is not currently used.

For debugging the express.js file must be executed with node.

A now.json file must be in the root to test now dev local or to deploy to the Zeit/Now platform.

Routing is now implicit. A url path route is derived from the handlers location in the api/directory.


Isolines have a common save and not a save handler depending on the isolines provider.

This is provisional. There should not be a handler to save isolines. This should be handled like any other geometry field.

The images_upload & documents_upload have now become cloudinary_upload.

Likewise, images_delete and documents_delete have become cloudinary_delete.


We are using express-http-proxy (also for the Zeit Now deployment). This may be temporary but requires a change to the URL which have a provider defined. The host needs to be split from the beginning of the URL path and added as a host query param.

e.g.

`"URI": "https://api.mapbox.com/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?&provider=MAPBOX"`

becomes

"URI": "/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?&provider=MAPBOX&host=https://api.mapbox.com"

This doesn't work for provider=OS. In this case the key needs to be provided instead of the provider as these calls can not be proxied due to the use of encoded character in the URL path.

I haven't figured out yet how to consistently use URL params between the Zeit Now rewrites and Express routing. For the time being /:x/:y/:z etc. must be changed to ?x=1&y=2&z=3

The build file is now stored in the repository and building must be done locally not on deployment. Build dependencies are now installed as save-dev.

I haven't tested using dotenv config yet.

Workspaces are now in the public folder due to the implicit routing for static files.

Valid workspace locations are:

http://localhost:3000/zeit/workspaces/dev.json

https://cdn.jsdelivr.net/gh/GEOLYTIX/public/dev.json

github://api.github.com/repos/GEOLYTIX/xyz_resources/contents/dev/workspace.json

Github is the recommended method.

postgres://omfug:cbgb@pg.xyz.geolytix.net/xyz|dev.workspace

file:dev.json

file:* can only work with express and is not recommended.



Layer checks


There is no longer a DEBUG nor LOG_LEVEL option.

Debug wouldn't make sense and log lebel was Fastify specific.

There will be a LOG environment option but this is not yet implemented.

There is TITLE environment key which supercedes the title in the workspace root.

The ALIAS environment key is no more.


Workspace administration is now a seperate view. This is likely to stay in alpha for a while due to Github being the opinionated choice.

There are two endpoints to create PostgreSQL tables for the ACL and workspaces. These endpoints are:

/api/workspace/pgtable

/api/user/pgtable

The endpoints are only available to user with admin rights. Obviously there are no users yet if a new ACL table is to be created. For this reason a token will have to be fudged from the SECRET which is used to sign and verify token. This can be done via jwt.io website.

The SECRET goes into the signature and the payload needs to have an email (any) and admin_user set to true.