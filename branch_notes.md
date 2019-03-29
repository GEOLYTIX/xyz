**Workspaces**

The workspace editor is now nested in the desktop. Workspace methods are in the XYZ control library. The json editor library has been removed from the repo. The code mirror library has been added and should be used to edit json. 

Workspace routes are:

/workspace/get

Get the workspace from XYZ host.

/workspace/set

Post a workspace to the XYZ host. Will run checks, load workspace into memory and store the workspace as a new record in the workspace table.


**Views**

Scripts which only apply to a single view are stored with the html template in the public /views folder. Styles which only apply to a single view are in the head of that view. Only shared SCSS stylesheets are in the public /css folder.

Scripts sources should not be defined after the body. All sources should be defined in the head and user the defer / async declaration in order to prevent the page locking while loading the script.

/register

Small print has been added to the register view. The submit button should only be active if the checkbox in regard to the small print is checked.

Google recaptcha has been added to Login and Register forms. This is enabled if a captcha key and secret are provided in the environment key GOOGLE_CAPTCHA.

A mask has been added to the desktop view. This mask shades the view to prevent user input. e.g. While waiting for a response to workspace checks / load.


**Log rocket**

Log rocket has been added to the repo. A confirmation dialog will ask whether a session should be recorded. The log rocket button will be visible if a log rocket key is provided in the environment key LOG_ROCKET.


**Authentication**

Token authentication is now happening pre route validation.


**Validation**

All params must be provided on the querystring. The querystring params must be validated in route schema.

Additional checks are run in an array of pre-handler methods.


**User schema**

Additional fields have been added to the ACL.

admin_user

admin_workspace

blocked

approved_by

access_log


**Error Codes**

The 406 error code has been retired in favour of the more common 400 error code. Error code should return a new Error('msg').


**Swagger**

The [fastify swagger plugin](https://github.com/fastify/fastify-swagger) has been added to respond with a json to describe the API on the /swagger/json route.