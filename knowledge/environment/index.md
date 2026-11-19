# Environment

- [Workspace source and cache](workspace.md) - WORKSPACE and WORKSPACE_AGE configuration.
- [TRUSTED_RETURN_HOSTS](trusted-return-hosts.md) - Origin allowlist for absolute redirects after login.
- [Session token claims](jwt-claims.md) - JWT_TYPE, JWT_ISSUER and JWT_AUDIENCE.
- [Telemetry](telemetry.md) - OTEL_* tracing configuration.
- [Server](server.md) - PORT, DIR, ALIAS, XYZ_CWD, APP_ENV and the rate limit.
- [Databases](databases.md) - DBS_* connections, STATEMENT_TIMEOUT and RETRY_LIMIT.
- [Access control list](access-control.md) - PRIVATE or PUBLIC ACL connection, AUTH_PATH and LEGACY_ROLES; start here to add users.
- [User accounts](user-accounts.md) - USER_SESSION, FAILED_ATTEMPTS, APPROVAL_EXPIRY, USER_DOMAINS and PASSWORD_REGEXP rules.
- [Tokens and cookies](tokens-and-cookies.md) - SECRET, SECRET_KEY, SECRET_ALGORITHM, TITLE, COOKIE_TTL and COOKIE_PROPS.
- [SAML](saml.md) - SAML_* and SLO_CALLBACK single sign-on with the SAML app.
- [Mail](mail.md) - TRANSPORT_EMAIL and TRANSPORT_PASSWORD for Resend; obsolete TRANSPORT_PORT and TRANSPORT_TLS.
- [Sources and signers](sources-and-signers.md) - SRC_*, SIGN_*, FILE_RESOURCES, KEY_CLOUDFRONT, AWS_S3_CLIENT, CLOUDINARY_URL and CUSTOM_TEMPLATES.
- [Logging](logging.md) - LOGS keys and the LOGGER Logflare or PostgreSQL output.
- [CORS_ORIGINS](cors.md) - Origins allowed to read the API and public files cross-origin.

Concepts group the variables which are configured together, one concept per
feature. The knowledge check warns about every variable read by the XYZ API
which no concept lists in its `x-xyz-variables` metadata.
