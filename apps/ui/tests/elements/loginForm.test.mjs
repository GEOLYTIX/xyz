import { describe, expect, it } from 'vitest';

const { loginForm } = mapp.ui.elements;

/**
Assigns the values to the email and password inputs of a form and dispatches the keyup event, like a user typing.
*/
function type(form, email, password) {
  const emailInput = form.querySelector('[name=email]');
  const passwordInput = form.querySelector('[name=password]');

  emailInput.value = email;
  passwordInput.value = password;

  passwordInput.dispatchEvent(new Event('keyup'));
}

describe('ui/elements/loginForm', () => {
  it('creates a login form with the dictionary defaults', () => {
    const form = loginForm();

    expect(form.tagName).toBe('FORM');
    expect(form.method).toBe('post');
    expect(form.getAttribute('action')).toBe(
      `${mapp.host}/api/user/login?language=${mapp.language}`,
    );
    expect(form.className.trim()).toBe('login-form no-select');

    expect(form.querySelector('[for=auth_user_email]').textContent).toBe(
      mapp.dictionary.login_email,
    );
    expect(form.querySelector('[for=auth_user_password]').textContent).toBe(
      mapp.dictionary.login_password,
    );
    expect(form.querySelector('#btnLogin').textContent.trim()).toBe(
      mapp.dictionary.login_button,
    );

    const register = form.querySelector('a.switch');

    expect(register.getAttribute('href')).toBe(
      `${mapp.host}/api/user/register?language=${mapp.language}`,
    );
    expect(register.textContent).toBe(mapp.dictionary.login_registration_link);
  });

  it('assigns the custom params', () => {
    const form = loginForm({
      msg: 'Session expired',
      register: '/custom/register',
      classList: 'custom-login',
      login_email: 'Email address',
      login_button: 'Sign in',
    });

    expect(form.classList).toContain('custom-login');
    expect(form.querySelector('.msg').textContent).toBe('Session expired');
    expect(form.querySelector('a.switch').getAttribute('href')).toBe(
      '/custom/register',
    );
    expect(form.querySelector('[for=auth_user_email]').textContent).toBe(
      'Email address',
    );
    expect(form.querySelector('#btnLogin').textContent.trim()).toBe('Sign in');
  });

  it('enables the login button for a valid email and password', () => {
    const form = loginForm();

    const btn = form.querySelector('#btnLogin');
    const span = form.querySelector('span.bold');

    expect(btn.disabled).toBe(true);

    // The minlength is only validated for a value edited by the user.
    type(form, 'user@geolytix.co.uk', '');

    expect(btn.disabled).toBe(true);
    expect(span.textContent).toBe(mapp.dictionary.login_invalid);

    type(form, 'user@geolytix.co.uk', 'a password of length');

    expect(btn.disabled).toBe(false);
    expect(span.textContent).toBe('');

    type(form, 'not an email', 'a password of length');

    expect(btn.disabled).toBe(true);
    expect(span.textContent).toBe(mapp.dictionary.login_invalid);
  });

  it('shows a custom login_invalid message', () => {
    const form = loginForm({ login_invalid: 'Check your input' });

    type(form, 'user', '');

    expect(form.querySelector('span.bold').textContent).toBe(
      'Check your input',
    );
  });
});
