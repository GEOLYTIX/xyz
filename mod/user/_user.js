/**
## /user

The _user module exports the user method to route User API requests.

- add
- admin
- cookie
- delete
- key
- list
- log
- login
- register
- token
- update
- verify

@requires module:/utils/reqHost

@module /user
*/

import reqHost from '../utils/reqHost.js';

import add from './add.js';
import admin from './admin.js';
import cookie from './cookie.js';
import deleteMethod from './delete.js'; // renamed because delete is a reserved word
import key from './key.js';
import list from './list.js';
import log from './log.js';
import login from './login.js';
import register from './register.js';
import token from './token.js';
import update from './update.js';
import verify from './verify.js';

const methods = {
  add,
  admin,
  cookie,
  delete: deleteMethod, // use the renamed import
  key,
  list,
  log,
  login,
  register,
  token,
  update,
  verify,
};

const previousAddress = {};

/**
@function user
@async

@description
The Mapp API uses the user method to lookup and route User API requests.

The route method assigns the host param from /utils/reqHost before the request and response arguments are passed a User API method identified by the method param.

The method request parameter must be an own member of the methods object, eg. `admin`, `register`, `verify`, `add`, `delete`, `update`, `list`, `log`, `key`, `token`, `cookie`, or `login`.

Requests to the user module are debounced by 5 seconds preventing registration, login, etc in quick succession from the same IP address.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} req.params.method Method request parameter.
*/
export default async function user(req, res) {
  if (!Object.hasOwn(methods, req.params.method)) {
    return res.send(`Failed to evaluate 'method' param.`);
  }

  if (req.body) {
    debounceRequest(req, res);

    if (res.finished) return;
  }

  req.params.host = reqHost(req);

  const method = await methods[req.params.method](req, res);

  if (method instanceof Error) {
    req.params.msg = method.message;
    methods.login(req, res);
  }
}

/**
@function debounceRequest

@description
The remote_address determined from the request header is stored in the previousAddress module variable. Requests from the same address within 30 seconds will be bounced.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.header HTTP request header.
*/
function debounceRequest(req, res) {
  // Admin user requests should not be debounced.
  if (req.params.user?.admin) return;

  if (!req.headers['x-forwarded-for']) {
    req.params.remote_address = 'unknown';
  } else {
    req.params.remote_address = /^[A-Za-z0-9.,_-\s]*$/.test(
      req.headers['x-forwarded-for'],
    )
      ? req.headers['x-forwarded-for']
      : 'invalid';
  }

  // The remote_address has been previously used
  if (
    Object.hasOwn(previousAddress, req.params.remote_address) &&
    // within 5 seconds or less.
    new Date() - previousAddress[req.params.remote_address] < 5000
  ) {
    res
      .status(429)
      .send(`Address ${req.params.remote_address} temporarily locked.`);

    return;
  }

  // Log the remote_address with the current datetime.
  previousAddress[req.params.remote_address] = new Date();
}
