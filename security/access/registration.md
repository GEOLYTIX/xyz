# Registration

New accounts consist of an email address and password.

Once a record for the account is stored in the ACL an email with a link that contains a verification token is sent. The account holder of the email account must follow this link to verify that access rights to the email account are given.

Once the account is **verified** an email is sent to all site administrators. The email provides a link with the newly generated approval token for the verified user record in the ACL. The account will be **approved** if an administrator validates the link. Login credentials will have to be provided by the administrator if not already logged in \(valid JWT cookie\).

_It is possible to create user accounts which are not email addresses. These accounts must be verified by an administrator._

An email will be sent to inform whether an account has been deleted or approved.

