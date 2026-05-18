import { afterEach, describe, expect, it, vi } from 'vitest';

const batchSend = vi.fn();
const emailSend = vi.fn();
const fileGet = vi.fn();
const languageTemplates = vi.fn();
const logger = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    return {
      batch: {
        send: batchSend,
      },
      emails: {
        send: emailSend,
      },
    };
  }),
}));

vi.mock('../../../mod/provider/getFrom.js', () => ({
  default: {
    file: fileGet,
  },
}));

vi.mock('../../../mod/utils/languageTemplates.js', () => ({
  default: languageTemplates,
}));

vi.mock('../../../mod/utils/logger.js', () => ({
  default: logger,
}));

async function importMailer(env = {}) {
  vi.resetModules();
  globalThis.xyzEnv = env;

  return (await import('../../../mod/utils/resend.js')).default;
}

describe('resend Module', () => {
  afterEach(() => {
    vi.clearAllMocks();
    globalThis.xyzEnv = {};
  });

  it('does not send email when transport is not configured', async () => {
    const mailer = await importMailer();

    await mailer.send({ template: 'welcome', to: 'user@example.com' });
    await mailer.batch([{ template: 'welcome', to: 'user@example.com' }]);

    expect(emailSend).not.toHaveBeenCalled();
    expect(batchSend).not.toHaveBeenCalled();
  });

  it('sends a single templated email and logs the mailer event', async () => {
    emailSend.mockResolvedValue({});
    languageTemplates.mockResolvedValue({
      html: 'Hello ${name}',
      subject: 'Welcome ${name}',
      text: 'Plain ${name}',
    });

    const mailer = await importMailer({
      TRANSPORT_EMAIL: 'sender@example.com',
      TRANSPORT_PASSWORD: 'secret',
    });

    await mailer.send({
      name: 'Rob',
      template: 'welcome',
      to: 'user@example.com',
    });

    expect(emailSend).toHaveBeenCalledWith({
      from: 'sender@example.com',
      html: undefined,
      sender: 'sender@example.com',
      subject: 'Welcome Rob',
      text: 'Plain Rob',
      to: 'user@example.com',
    });

    expect(logger).toHaveBeenCalledWith(
      'welcome\nFrom: sender@example.com\nTo: user@example.com',
      'mailer',
    );
  });

  it('does not log a single email when resend returns an error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('send failed');

    emailSend.mockResolvedValue({ error });
    languageTemplates.mockResolvedValue({
      subject: 'Welcome',
      text: 'Plain body',
    });

    const mailer = await importMailer({
      TRANSPORT_EMAIL: 'sender@example.com',
      TRANSPORT_PASSWORD: 'secret',
    });

    await mailer.send({ template: 'welcome', to: 'user@example.com' });

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(logger).not.toHaveBeenCalled();
  });

  it('fetches html template bodies for html-only email', async () => {
    emailSend.mockResolvedValue({});
    fileGet.mockResolvedValue('<p>Hello ${name}</p>');
    languageTemplates.mockResolvedValue({
      html: 'file:html-template',
      subject: 'Welcome ${name}',
    });

    const mailer = await importMailer({
      TRANSPORT_EMAIL: 'sender@example.com',
      TRANSPORT_PASSWORD: 'secret',
    });

    await mailer.send({
      name: 'Rob',
      template: 'welcome',
      to: 'user@example.com',
    });

    expect(fileGet).toHaveBeenCalledWith('file:html-template');
    expect(emailSend).toHaveBeenCalledWith({
      from: 'sender@example.com',
      html: '<p>Hello Rob</p>',
      sender: 'sender@example.com',
      subject: 'Welcome Rob',
      text: undefined,
      to: 'user@example.com',
    });
  });

  it('fetches file template bodies before sending batch email', async () => {
    batchSend.mockResolvedValue({});
    fileGet.mockResolvedValue('    Body for ${name}');
    languageTemplates
      .mockResolvedValueOnce({
        html: 'file:unused-html',
        subject: 'Welcome ${name}',
        text: 'file:text-template',
      })
      .mockResolvedValueOnce({
        subject: 'Hello ${name}',
        text: 'Second ${name}',
      });

    const mailer = await importMailer({
      TRANSPORT_EMAIL: 'sender@example.com',
      TRANSPORT_PASSWORD: 'secret',
    });

    await mailer.batch([
      { name: 'Rob', template: 'welcome', to: 'rob@example.com' },
      { name: 'Ada', template: 'hello', to: 'ada@example.com' },
    ]);

    expect(fileGet).toHaveBeenCalledWith('file:text-template');
    expect(batchSend).toHaveBeenCalledWith([
      {
        from: 'sender@example.com',
        html: undefined,
        sender: 'sender@example.com',
        subject: 'Welcome Rob',
        text: '    Body for Rob',
        to: 'rob@example.com',
      },
      {
        from: 'sender@example.com',
        html: undefined,
        sender: 'sender@example.com',
        subject: 'Hello Ada',
        text: 'Second Ada',
        to: 'ada@example.com',
      },
    ]);

    expect(logger).toHaveBeenNthCalledWith(
      1,
      'From: sender@example.com\nTo: rob@example.com,ada@example.com',
      'mailer',
    );
    expect(logger).toHaveBeenNthCalledWith(
      2,
      'From: sender@example.com\nTo: rob@example.com,ada@example.com\nBody:\n Body for Rob',
      'mailer_body',
    );
  });

  it('logs batch send errors and still writes batch log entries', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('batch failed');

    batchSend.mockResolvedValue({ error });
    languageTemplates.mockResolvedValue({
      subject: 'Hello ${name}',
      text: 'Body ${name}',
    });

    const mailer = await importMailer({
      TRANSPORT_EMAIL: 'sender@example.com',
      TRANSPORT_PASSWORD: 'secret',
    });

    await mailer.batch([
      { name: 'Rob', template: 'hello', to: 'rob@example.com' },
    ]);

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(logger).toHaveBeenCalledWith(
      'From: sender@example.com\nTo: rob@example.com',
      'mailer',
    );
    expect(logger).toHaveBeenCalledWith(
      'From: sender@example.com\nTo: rob@example.com\nBody:\n Body Rob',
      'mailer_body',
    );
  });
});
