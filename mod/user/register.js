/**
## /user/register

Exports the [user] register method for the /api/user/register route.

@requires /view
@requires /user/acl
@requires /user/login
@requires /utils/reqHost
@requires /utils/mailer
@requires /utils/languageTemplates
@requires /utils/bcrypt
@requires crypto
@requires module:/utils/processEnv

@module /user/register
*/

import crypto from 'crypto';
import bcrypt from '../utils/bcrypt.cjs';
import languageTemplates from '../utils/languageTemplates.js';
import mailer from '../utils/mailer.js';
import reqHost from '../utils/reqHost.js';
import view from '../view.js';
import acl from './acl.js';

/**
@function register

@description
Returns the user regestration or password reset form depending on the reset request parameter flag.

Returns the `registerUserBody` method with a request [user] body present.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} [req.body]
Post body object with user data.
*/

export default async function register(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.');
  }

  req.params.host = reqHost(req);

  // Register request [post] body.
  if (req.body) return registerUserBody(req, res);

  // The login view will set the cookie to null.
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
  );

  req.params.template = req.params.reset
    ? 'password_reset_view'
    : 'register_view';

  // Get request for registration form view.
  view(req, res);
}

/**
@function registerUserBody

@description
Will attempt to register the user object provided as request body as a new user. The request body JSON object must contain a user email, and password as string entries.

An email with a verification token will be sent to verify a newly registered account.

The `host=string` request parameter is required for the link passed to the user verification mail template.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.body
Post body object with user data.
*/

async function registerUserBody(req, res) {
  checkUserBody(req, res);

  if (res.finished) return;

  // The password will be reset for exisiting user accounts.
  await passwordReset(req, res);

  if (res.finished) return;

  // Get the date for logs.
  const date = new Date().toISOString().replace(/\..*/, '');

  const expiry_date = parseInt(
    (new Date().getTime() + xyzEnv.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24) /
      1000,
  );

  const USER = {
    access_log: [`${date}@${req.ips?.pop() || req.ip}`],
    email: req.body.email,
    language: req.body.language,
    password: req.body.password,
    password_reset: req.body.password,
    verificationtoken: req.body.verificationtoken,
  };

  if (xyzEnv.APPROVAL_EXPIRY) {
    USER['expires_on'] = expiry_date;
  }

  // Create new user account
  const KEYS = Object.keys(USER).join(',');
  const VALUES = Object.keys(USER).map((NULL, i) => `$${i + 1}`);

  const rows = await acl(
    `INSERT INTO acl_schema.acl_table (${KEYS})
    VALUES (${VALUES})`,
    Object.values(USER),
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  await mailer({
    host: req.params.host,
    language: req.body.language,
    link: `${req.params.host}/api/user/verify/${req.body.verificationtoken}`,
    remote_address: req.params.remote_address,
    template: 'verify_account',
    to: req.body.email,
  });

  // Return msg. No redirect for password reset.
  const new_account_registered = await languageTemplates({
    language: req.body.language,
    template: 'new_account_registered',
  });
  res.send(new_account_registered);
}

/**
@function checkUserBody

@description
The request body JSON object must contain a user email, and password as string entries.

The email address is tested against following regex: `/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/`.

The ACL can be restricted for email addresses provided as `xyzEnv.USER_DOMAINS`.

A valid password must be provided. Password rules can be defined as `xyzEnv.PASSWORD_REGEXP`. The default rule for password being `'(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$'`.


The `req.body.password` will be hashed with bcrypt.

A `req.body.verificationtoken` will be created with crypto.

The `req.body.language` will be checked against Intl.Collator.supportedLocalesOf.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.body
Post body object with user data.
*/

function checkUserBody(req, res) {
  if (!req.body.email) return res.status(400).send('No email provided');

  // Test email address
  if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(req.body.email)) {
    return res.status(400).send('Provided email address is invalid');
  }

  // Test whether email domain is allowed to register
  if (xyzEnv.USER_DOMAINS) {
    // Get array of allowed user email domains from split xyzEnvironment variable.
    const allowed_domains = xyzEnv.USER_DOMAINS.split(',');

    //  Get the user_domain from user email.
    const user_domain = req.body.email.split('@')[1];

    // Check whether not some of the allowed_domain includes the user_domain.
    if (!allowed_domains.some((domain) => user_domain.includes(domain))) {
      return res.status(400).send('Provided email address is invalid');
    }
  }

  // Test whether a password has been provided.
  if (!req.body.password) return res.status(400).send('No password provided');

  // Create regex to text password complexity from xyzEnv or set default.
  const passwordRgx = new RegExp(
    xyzEnv.PASSWORD_REGEXP || '(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$',
  );

  // Test whether the provided password is valid.
  if (!passwordRgx.test(req.body.password)) {
    res.status(403).send('Invalid password provided');
    return;
  }

  // Hash the password.
  req.body.password = bcrypt.hashSync(req.body.password, 8);

  // Create random verification token.
  req.body.verificationtoken = crypto.randomBytes(20).toString('hex');

  // Lookup the provided language key.
  req.body.language =
    Intl.Collator.supportedLocalesOf([req.body.language], {
      localeMatcher: 'lookup',
    })[0] || 'en';
}

/**
@function passwordReset

@description
The passwordReset method checks whether a user record exists for the email provided in the request body.

An email with a verification token will be sent to verify the password reset.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.body
Post body object with user data.
*/

async function passwordReset(req, res) {
  // Attempt to retrieve ACL record with matching email field.
  let rows = await acl(
    `
    SELECT email, password, password_reset, language, blocked
    FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
    [req.body.email],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  const user = rows[0];

  // Register new user.
  if (!user) return;

  // Setting the password to NULL will disable access to the account and prevent resetting the password.
  if (user?.password === null) {
    res.status(401).send('User account has restricted access');
    return;
  }

  // Blocked user may not reset their password.
  if (user.blocked) {
    const user_blocked = await languageTemplates({
      language: req.body.language,
      template: 'user_blocked',
    });
    res.status(403).send(user_blocked);
    return;
  }

  // Get the date for logs.
  const date = new Date().toISOString().replace(/\..*/, '');

  const expiry_date = parseInt(
    (new Date().getTime() + xyzEnv.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24) /
      1000,
  );

  const VALUES = [
    req.body.email,
    req.body.password,
    req.body.verificationtoken,
    `${date}@${req.params.remote_address}`,
  ];

  if (xyzEnv.APPROVAL_EXPIRY && user.expires_on) {
    VALUES.push(expiry_date);
  }

  // Set new password and verification token.
  // New passwords will only apply after account verification.
  rows = await acl(
    `
    UPDATE acl_schema.acl_table
    SET
      password_reset = $2,
      verificationtoken = $3,
      access_log = array_append(access_log, $4)
      ${xyzEnv.APPROVAL_EXPIRY && user.expires_on ? ',expires_on = $5' : ''}
    WHERE lower(email) = lower($1);`,
    VALUES,
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // Sent mail with verification token to the account email address.
  await mailer({
    host: req.params.host,
    language: req.body.language,
    link: `${req.params.host}/api/user/verify/${req.body.verificationtoken}/?language=${req.body.language}`,
    remote_address: req.params.remote_address,
    template: 'verify_password_reset',
    to: user.email,
  });

  const password_reset_verification = await languageTemplates({
    language: req.body.language,
    template: 'password_reset_verification',
  });

  res.send(password_reset_verification);
}
