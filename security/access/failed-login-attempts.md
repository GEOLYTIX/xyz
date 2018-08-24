# Failed login attempts

Failed login attempts are stored with the record in the ACL. The verification will be removed once a maximum number of failed attempts has been recorded. The maximum number for failed login attempts can be set in the FAILED\_ATTEMPTS environment setting. The default is 3 attempts. Having the verification removed, an account holder is forced to re-register. Setting a new \(or old\) password in the registration form for an existing account will reset the failed attempts and generate a new verification token to be sent via email. After verifying the account the user is able to login once again.

