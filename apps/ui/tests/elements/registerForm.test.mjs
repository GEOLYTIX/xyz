import { describe, expect, it } from 'vitest';

const { registerForm } = mapp.ui.elements;

/**
Assigns the values to the inputs of a register form, checks the privacy agreement and dispatches the keyup event, like a user typing.
*/
function fill(form, { email, password, retype, agree = true }) {
  form.querySelector('[name=email]').value = email;
  form.querySelector('[name=password]').value = password;

  const retypeInput = form.querySelector('[name=password_retype]');
  retypeInput.value = retype;

  form.querySelector('[name=privacy_agreement]').checked = agree;

  retypeInput.dispatchEvent(new Event('keyup'));
}

const VALID = {
  email: 'user@geolytix.co.uk',
  password: 'Password1234',
  retype: 'Password1234',
};

describe('ui/elements/registerForm', () => {
  it('creates a register form with the dictionary defaults', () => {
    const form = registerForm();

    expect(form.getAttribute('action')).toBe(
      `${mapp.host}/api/user/register?language=${mapp.language}`,
    );
    expect(form.querySelector('[name=language]').value).toBe(mapp.language);
    expect(form.querySelector('[for=auth_user_email]').textContent).toBe(
      mapp.dictionary.register_email,
    );
    expect(form.querySelector('#btnRegister').textContent.trim()).toBe(
      mapp.dictionary.register_reset,
    );

    const login = form.querySelector('a.switch');

    expect(login.getAttribute('href')).toBe(
      `${mapp.host}/api/user/login?language=${mapp.language}`,
    );
  });

  it('assigns the custom params', () => {
    const form = registerForm({
      msg: 'Welcome',
      login: '/custom/login',
      classList: 'custom-register',
      register_privacy_agreement: 'Custom agreement',
      register_next_info: 'Custom next',
    });

    expect(form.classList).toContain('custom-register');
    expect(form.querySelector('.msg').textContent).toBe('Welcome');
    expect(form.querySelector('a.switch').getAttribute('href')).toBe(
      '/custom/login',
    );

    const paragraphs = [...form.querySelectorAll('p')].map(
      (p) => p.textContent,
    );

    expect(paragraphs).toContain('Custom agreement');
    expect(paragraphs).toContain('Custom next');
  });

  it('enables the register button for valid inputs and the agreement', () => {
    const form = registerForm();

    const btn = form.querySelector('#btnRegister');
    const info = btn.parentElement.querySelector('div.bold');

    expect(btn.disabled).toBe(true);

    fill(form, VALID);

    expect(btn.disabled).toBe(false);
    expect(info.textContent).toBe('');
  });

  it.each([
    ['an invalid email', { email: 'user' }],
    [
      'a password without a number',
      { password: 'PasswordAbcd', retype: 'PasswordAbcd' },
    ],
    ['a short password', { password: 'Pass1', retype: 'Pass1' }],
    ['a retyped password which doesn’t match', { retype: 'Password12345' }],
    ['no privacy agreement', { agree: false }],
  ])('disables the register button for %s', (_, values) => {
    const form = registerForm();

    fill(form, { ...VALID, ...values });

    const btn = form.querySelector('#btnRegister');

    expect(btn.disabled).toBe(true);
    expect(btn.parentElement.querySelector('div.bold').textContent).toBe(
      mapp.dictionary.register_error,
    );
  });

  it('checks the inputs with a change of the privacy agreement', () => {
    const form = registerForm();

    fill(form, { ...VALID, agree: false });

    const btn = form.querySelector('#btnRegister');

    expect(btn.disabled).toBe(true);

    // A click on a checkbox which is not in the document doesn't dispatch a change event.
    document.body.append(form);

    form.querySelector('[name=privacy_agreement]').click();

    expect(btn.disabled).toBe(false);

    form.remove();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3141: the register_error param is assigned from the dictionary with = instead of ??=, so a custom message is replaced.
  it.fails('shows a custom register_error message', () => {
    const form = registerForm({ register_error: 'Check your input' });

    fill(form, { ...VALID, agree: false });

    expect(
      form.querySelector('#btnRegister').parentElement.querySelector('div.bold')
        .textContent,
    ).toBe('Check your input');
  });
});
