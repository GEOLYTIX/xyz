/**
@module /utils/mailer
@requires module:/utils/processEnv
*/

import logger from './logger.js';

import languageTemplates from './languageTemplates.js';

import getFrom from '../provider/getFrom.js';

//Attempt to import node mailer
let nodeMailer;
try {
  if (
    xyzEnv.TRANSPORT ||
    xyzEnv.TRANSPORT_EMAIL ||
    xyzEnv.TRANSPORT_HOST ||
    xyzEnv.TRANSPORT_PASSWORD
  ) {
    nodeMailer = await import('nodemailer');
  } else {
    console.warn(
      'Mailer: environment keys are missing for mailing functionality',
    );
  }
} catch {
  //Dependencies not installed
}

let transport;

export default nodeMailer ? mailer : null;

async function mailer(params) {
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
      name: xyzEnv.TRANSPORT_EMAIL.split('@')[0],
      port: xyzEnv.TRANSPORT_PORT || 587,
      secure: false,
      requireTLS: xyzEnv.TRANSPORT_TLS,
      auth: {
        user: xyzEnv.TRANSPORT_EMAIL,
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

function replaceStringParams(string, params) {
  return string.replace(
    /\$\{(.*?)\}/g,

    // Replace matched params in string values
    (matched) => params[matched.replace(/\$\{|\}/g, '')] || '',
  );
}
