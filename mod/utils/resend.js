/**
## /utils/resend
The resend module provides a way to send emails to clients/admins, etc.

The resend dependency will be imported dynamically on the condition that a TRANSPORT_EMAIL [sender] Or a RESEND_KEY is defined the process environment.

@requires nodemailer
@requires /utils/logger
@requires /utils/languageTemplates
@requires /provider/getFrom

@module /utils/resend
*/

import getFrom from '../provider/getFrom.js';

import languageTemplates from './languageTemplates.js';
import logger from './logger.js';

let resend;

if (xyzEnv.TRANSPORT_PASSWORD || xyzEnv.RESEND_KEY) {
  try {
    const { Resend } = await import('resend');
    resend = new Resend(xyzEnv.TRANSPORT_PASSWORD || xyzEnv.RESEND_KEY);
  } catch {
    console.error('Error: Missing resend dependency');
  }
}

export default mailer;

/**
@param {Object} params
@property {String} params.to The email recipient.
@property {String} params.template The html that will make up the body of the email.
@property {String} params.language The language to be used.
@property {String} params.host The URL of the instance.
*/
async function mailer(params) {
  // The resend module is not available.
  if (!resend) return;

  const template = await languageTemplates(params);

  await getBody(template);

  const mailTemplate = {
    from: xyzEnv.TRANSPORT_EMAIL,
    html: template.html
      ? replaceStringParams(template.html, params)
      : undefined,
    sender: xyzEnv.TRANSPORT_EMAIL,
    subject: replaceStringParams(template.subject, params),
    text: template.text
      ? replaceStringParams(template.text, params)
      : undefined,
    to: params.to,
  };

  const { data, error } = await resend.emails.send(mailTemplate);

  if (error) {
    console.error(error);
    return;
  }

  let result = `${data.id}\nFrom: ${xyzEnv.TRANSPORT_EMAIL}\nTo: ${params.to}`;

  logger(result, 'mailer');

  result += `\nBody:\n ${mailTemplate.text?.replace('    ', '')}`;

  logger(result, 'mailer_body');
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
  return string.replaceAll(
    /\$\{(.*?)\}/g,

    // Replace matched params in string values
    (matched) => params[matched.replaceAll(/\$\{|\}/g, '')] || '',
  );
}
