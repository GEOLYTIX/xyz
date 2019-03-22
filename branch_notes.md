**Fixes**

check() method in login and register script was borked. Validity.valid is only true on required fields.

check() will now be called on keyup and change to work with manual input as well as copy/paste/autofill.

```
function check() {
  btnRegister.disabled = !(
    email.validity.valid &&
    password.validity.valid &&
    password.value === password_retype.value &&
    captcha_input.validity.valid);
}
```

**Enhacements**

Logrocket

Registration text

Captcha

ACL fields

admin_user
admin_workspace
blocked
approved_by
access_log

defer async load of scripts

compose load workspace

desktop mask

composition params