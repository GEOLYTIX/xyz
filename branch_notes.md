**Workspaces**

The workspace editor is now nested in the desktop. Workspace methods are in the XYZ control library. The json editor library has been removed from the repo. The code mirror library has been added and should be used to edit json. 

Workspace routes are:

/workspace/get

Get the workspace from XYZ host.

/workspace/set

Post a workspace to the XYZ host. Will run checks, load workspace into memory and store the workspace as a new record in the workspace table.

The workspace is stored in env.workspace



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


**Token**

The /token endpoint will return an API key and store the key in the ACL database in the api field for the user. Token do not timeout but can never be used to login or for administrative tasks. An API token will always be checked against the database to create a signed token with the user roles.


**Validation**

All params must be provided on the querystring. The querystring params must be validated in route schema.

Additional checks are run in an array of pre-handler methods.


**User routes**

Routes for the management of users are:

/user/admin The admin view for the ACL.

/user/approve The endroute to approve a user with an approval token.

/user/verify The endroute to approve a user with an verification token.

/user/log Returns the access log for a user.

/user/list Returns a list of all users.

/user/update Updates a user field in the ACL.

/user/delete Endpoint to delete a user from the ACL.

/user/block Endpoint to block a user.

**User schema**

```
create table users
(
	"_id" serial not null,
	email text not null,
	password text not null,
	verified boolean default false,
	approved boolean default false,
	verificationtoken text,
	approvaltoken text,
	failedattempts integer default 0,
	password_reset text,
	api text,
	approved_by text,
	access_log text[] default '{}'::text[],
	blocked boolean default false,
	roles text[] default '{}'::text[],
	admin_workspace boolean default false,
	admin_user boolean default false
);
```

**Roles**

Roles are set on the layer.

```
"roles": {
  "boo" : null,
  "foo" : {
    "retailer": {
      "in": [
        "Tesco",
        "Sainsburys"
      ]
    }
  }
}
```

If a roles are set means that the layer is not available to anybody who doesn't have a role from the layer. If a filter is set on the role means that the user has access to the layer but the filter will be applied to any query.


**Error Codes**

The 406 error code has been retired in favour of the more common 400 error code. Error code should return a new Error('msg').


**Swagger**

The [fastify swagger plugin](https://github.com/fastify/fastify-swagger) has been added to respond with a json to describe the API on the /swagger/json route.