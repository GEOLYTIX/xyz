/**
@module /utils/mailer
@description
The mailer module provides a way to send emails to clients/admins, etc.

@requires module:/utils/logger
@requires module:/utils/languageTemplates
@requires module:/provider/getFrom

@requires nodemailer
*/

import logger from './logger.js';

import languageTemplates from './languageTemplates.js';

import getFrom from '../provider/getFrom.js';

//Attempt to import node mailer
let nodeMailer, transport;
if (
  xyzEnv.TRANSPORT ||
  xyzEnv.TRANSPORT_EMAIL ||
  xyzEnv.TRANSPORT_USERNAME ||
  xyzEnv.TRANSPORT_HOST ||
  xyzEnv.TRANSPORT_PASSWORD
) {
  try {
    nodeMailer = await import('nodemailer');
  } catch {
    console.error('Error: Missing nodemailer dependancy');
  }
}

export default mailer;

/**
@function mailer
@async

@description
Function which sends email using the nodemailer dependancy.

@param {Object} params
@property {String} params.to The email recipient.
@property {String} params.template The html that will make up the body of the email.
@property {String} params.language The language to be used.
@property {String} params.host The URL of the instance.
*/
async function mailer(params) {
  // The nodeMailer module could not be imported.
  if (!nodeMailer) return;

  if (xyzEnv.TRANSPORT) {
    console.warn(
      'Please replace xyzEnv.TRANSPORT with TRANSPORT_HOST,TRANSPORT_EMAIL, and TRANSPORT_PASSWORD',
    );
  }

  if (!xyzEnv.TRANSPORT_HOST) {
    console.warn('xyzEnv.TRANSPORT_HOST missing.');
    return;
  }

  if (!xyzEnv.TRANSPORT_EMAIL) {
    console.warn('xyzEnv.TRANSPORT_EMAIL missing.');
    return;
  }

  if (!xyzEnv.TRANSPORT_PASSWORD) {
    console.warn('xyzEnv.TRANSPORT_PASSWORD missing.');
    return;
  }

  if (!transport) {
    transport = nodeMailer.createTransport({
      host: xyzEnv.TRANSPORT_HOST,
      name: xyzEnv.TRANSPORT_NAME || xyzEnv.TRANSPORT_EMAIL.split('@')[0],
      port: xyzEnv.TRANSPORT_PORT || 587,
      secure: false,
      requireTLS: xyzEnv.TRANSPORT_TLS,
      auth: {
        user: xyzEnv.TRANSPORT_USERNAME,
        pass: xyzEnv.TRANSPORT_PASSWORD,
      },
    });
  }

  const template = await languageTemplates(params);

  await getBody(template);

  const mailTemplate = {
    to: params.to,
    from: xyzEnv.TRANSPORT_EMAIL,
    sender: xyzEnv.TRANSPORT_EMAIL,
    subject: replaceStringParams(template.subject, params),
    html: template.html
      ? replaceStringParams(template.html, params)
      : undefined,
    text: template.text
      ? replaceStringParams(template.text, params)
      : undefined,
  };

  const result = await transport
    .sendMail(mailTemplate)
    .catch((err) => console.error(err));

  logger(result, 'mailer');
}

/**
@function getBody
@async

@description
Retrieves the body of the text from the provided url/file.

@param {Object} template
@property {String} template.text The url from which to retrieve the text content using {@link module:/provider/getFrom~flyTo}.
@property {String} template.html The url from which to retrieve the html content using {@link module:/provider/getFrom~flyTo}.
*/
async function getBody(template) {
  if (template.text) {
    // Prevent mail template from having text and html
    delete template.html;

    if (Object.hasOwn(getFrom, template.text.split(':')[0])) {
      template.text = await getFrom[template.text.split(':')[0]](template.text);
    }
  }

  if (template.html) {
    if (Object.hasOwn(getFrom, template.html.split(':')[0])) {
      template.html = await getFrom[template.html.split(':')[0]](template.html);
    }
  }
}

/**
@function replaceStringParams

@description
Substitutes supplied params into a supplied string.

@param {String} string
@property {Object} params The url from which to retrieve the text content using {@link module:/provider/getFrom~flyTo}.

@returns {String} The string with substitutions made.
*/
function replaceStringParams(string, params) {
  return string.replace(
    /\$\{(.*?)\}/g,

    // Replace matched params in string values
    (matched) => params[matched.replace(/\$\{|\}/g, '')] || '',
  );
}
