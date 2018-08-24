# Password reset

Password reset works the same way as the registration. The hashed password is overwritten in the ACL and account verification is removed. A new verification token is sent to the user. The account will be verified again with the new password once the account holder ascertains access to the email account by following the link containing the verification token. _Administrator do **not** need to approve the account again._ Changing the password resets failed login attempts to 0.

