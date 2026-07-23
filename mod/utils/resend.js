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

import getSrc from '../provider/getSrc.js';

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

  const emailTemplates = [];

  for (const params of Object.values(emails)) {
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

    emailTemplates.push(mailTemplate);
  }

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
@function getBody
@async

@description
Retrieves the body of the text from the provided url/file.

@param {Object} template
@property {String} template.text The url from which to retrieve the text content using {@link module:/provider/getSrc}.
@property {String} template.html The url from which to retrieve the html content using {@link module:/provider/getSrc}.
*/
async function getBody(template) {
  if (template.text) {
    // Prevent mail template from having text and html
    delete template.html;

    if (await getSrc({ src: template.text, test: true })) {
      template.text = await getSrc(template.text);
    }
  }

  if (template.html) {
    if (await getSrc({ src: template.html, test: true })) {
      template.html = await getSrc(template.html);
    }
  }
}

/**
@function replaceStringParams

@description
Substitutes supplied params into a supplied string.

@param {String} string
@property {Object} params The url from which to retrieve the text content using {@link module:/provider/getSrc}.

@returns {String} The string with substitutions made.
*/
function replaceStringParams(string, params) {
  return string.replaceAll(
    /\$\{(.*?)\}/g,

    // Replace matched params in string values
    (matched) => params[matched.replaceAll(/\$\{|\}/g, '')] || '',
  );
}
