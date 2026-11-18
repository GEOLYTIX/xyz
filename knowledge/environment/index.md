# Environment

- [Workspace source and cache](workspace.md) - WORKSPACE and WORKSPACE_AGE configuration.
- [TRUSTED_RETURN_HOSTS](trusted-return-hosts.md) - Origin allowlist for absolute redirects after login.
- [Session token claims](jwt-claims.md) - JWT_TYPE, JWT_ISSUER and JWT_AUDIENCE.
- [Telemetry](telemetry.md) - OTEL_* tracing configuration.
- [Server](server.md) - PORT, DIR, ALIAS, XYZ_CWD, APP_ENV and the rate limit.
- [Databases](databases.md) - DBS_* connections, STATEMENT_TIMEOUT and RETRY_LIMIT.

Concepts group the variables which are configured together, one concept per
feature. The knowledge check warns about every variable read by the XYZ API
which no concept lists in its `variables` metadata.
