# JWT token

[JSON Web Token \(JWT\)](https://jwt.io/) are used to store session and user data. Token themselves will be held in a cookie on the browser. The backend will _not_ store these cookies in order to horizontally scale the application in a serverless environment.

The **user cookie** stores the email address as well as user access privileges \(verified, approved, admin\).

The **session cookie** holds a redirect address which allows the application to return to a specific parameterized address from the login view. This allows the auth module to respond with a redirect instead of passing the original request to the login function.

