/**
## /utils/resend
The resend module provides a way to send emails to clients/admins, etc.

The resend dependency will be imported dynamically on the condition that a TRANSPORT_EMAIL [sender] is defined the process environment.

The mailer object has two methods. send and batch.
The send function sends one email. And the batch function queues a batch of emails to be sent.

@requires resend
@requires /utils/logger
@requires /utils/languageTemplates
@requires /provider/getSrc

@module /utils/resend
*/

import { getSrc, hasProvider } from '../provider/getSrc.js';

import languageTemplates from './languageTemplates.js';
import logger from './logger.js';

let resend;

if (xyzEnv.TRANSPORT_PASSWORD && xyzEnv.TRANSPORT_EMAIL) {
  try {
    const { Resend } = await import('resend');
    resend = new Resend(xyzEnv.TRANSPORT_PASSWORD);
  } catch {
    console.error('Error: Missing resend dependency');
  }
}

const mailer = {
  send,
  batch,
};

export default mailer;

/**
@function send
@async

@description
Sends one email via the resend sdk.

@param {Object} params
@property {String} params.to The email recipient.
@property {String} params.template The html that will make up the body of the email.
@property {String} params.language The language to be used.
@property {String} params.host The URL of the instance.
*/
async function send(params) {
  // The resend module is not available.
  if (!resend) return;

  const mailTemplate = await getMailTemplate(params);

  if (mailTemplate instanceof Error) {
    console.error(mailTemplate);
    return;
  }

  const { error } = await resend.emails.send(mailTemplate);

  if (error) {
    console.error(error);
    return;
  }

  logger(
    `${params.template}\nFrom: ${xyzEnv.TRANSPORT_EMAIL}\nTo: ${params.to}`,
    'mailer',
  );
}

/**
@function batch

@description
Takes an array of emails to queue via the resend sdk. This allows us to trigger 100 emails at once.

@async

@param {Array} emails
@property {String} params.to The email recipient.
@property {String} params.template The html that will make up the body of the email.
@property {String} params.language The language to be used.
@property {String} params.host The URL of the instance.
*/
async function batch(emails) {
  // The resend module is not available.
  if (!resend) return;

  const mailTemplates = await Promise.all(
    Object.values(emails).map(getMailTemplate),
  );

  // Skip emails with a template body which failed to load.
  const emailTemplates = mailTemplates.filter((mailTemplate) => {
    if (!(mailTemplate instanceof Error)) return true;
    console.error(mailTemplate);
  });

  if (!emailTemplates.length) return;

  const { error } = await resend.batch.send(emailTemplates);

  if (error) {
    console.error(error);
  }

  let result = `From: ${xyzEnv.TRANSPORT_EMAIL}\nTo: ${emailTemplates.map((template) => template.to)?.join?.(',')}`;

  logger(result, 'mailer');

  result += `\nBody:\n ${emailTemplates?.[0].text?.replace?.('    ', '')}`;

  logger(result, 'mailer_body');
}

/**
@function getMailTemplate
@async

@description
Creates the mail template for the resend sdk from the language template and body for the params.

@param {Object} params
@property {String} params.to The email recipient.
@property {String} params.template The language template for the email.

@returns {Promise<Object|Error>} The mail template or an error if the template body failed to load.
*/
async function getMailTemplate(params) {
  const template = await languageTemplates(params);

  const err = await getBody(template);

  if (err instanceof Error) return err;

  return {
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
}

/**
@function getBody
@async

@description
Retrieves the body of the text from the provided url/file. The html is removed from a template with text.

Text and html values without a provider prefix are inline bodies and are kept as is. An error is returned if a src reference fails to load.

@param {Object} template
@property {String} template.text The inline text or the src reference from which to retrieve the text content using {@link module:/provider/getSrc}.
@property {String} template.html The inline html or the src reference from which to retrieve the html content using {@link module:/provider/getSrc}.

@returns {Promise<Error|undefined>} An error if a src reference failed to load.
*/
async function getBody(template) {
  // Prevent mail template from having text and html
  if (template.text) delete template.html;

  const key = template.text ? 'text' : 'html';

  if (!hasProvider(template[key])) return;

  const body = await getSrc(template[key]);

  // A failed src reference must not be sent as the body.
  if (body instanceof Error) return body;

  template[key] = body;
}

/**
@function replaceStringParams

@description
Substitutes supplied params into a supplied string.

@param {String} string
@property {Object} params The parameters to substitute into the string.

@returns {String} The string with substitutions made.
*/
function replaceStringParams(string, params) {
  return string.replaceAll(
    /\$\{(.*?)\}/g,

    // Replace matched params in string values
    (matched) => params[matched.replaceAll(/\$\{|\}/g, '')] || '',
  );
}
