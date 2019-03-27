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

remove querystring params from payload on edit xhr due to the validation order of the fastify backend.

**Enhacements**

workspace get/set routes

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

https://github.com/fastify/fastify-swagger

400 / 406 codes

gazetteer filter