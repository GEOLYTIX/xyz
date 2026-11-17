/**
## SAML cache provider

node-saml records the ID of each assertion it accepts while `rejectReplayedAssertions` is set. An assertion with an ID that has been received before is rejected as a replay.

The SAML app runs as serverless functions on Vercel. The instance that accepts an assertion is not necessarily the one that receives a replay of it, so the IDs are stored in the ACL database. A SAML login already requires the ACL for the user lookup.

The cache table must be created in the ACL schema:

```sql
CREATE TABLE IF NOT EXISTS acl_schema.saml_cache (
  key text PRIMARY KEY,
  value text NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS saml_cache_expires_at
  ON acl_schema.saml_cache (expires_at);
```

The ACL connection role needs SELECT, INSERT, UPDATE and DELETE on the table.

@requires module:/user/acl
@module saml-cache-provider
*/
import acl from '@geolytix/xyz-app/mod/user/acl.js';

/**
The time in milliseconds for which a key saved with saveAsync is kept. node-saml uses the same default for request IDs.
*/
const DEFAULT_EXPIRATION_MS = 8 * 60 * 60 * 1000;

/**
@function query
@async

@description
The acl module returns an error instead of throwing. node-saml must reject the SAML response if the cache cannot be read or written, so the error is thrown.

@param {string} q Query template.
@param {Array} params Query parameters.
@returns {Promise<Array>} The rows.
*/
async function query(q, params) {
  const rows = await acl(q, params);

  if (rows instanceof Error) {
    throw new Error(
      'The SAML cache table acl_schema.saml_cache is not available.',
    );
  }

  return rows;
}

/**
@function createAclCacheProvider

@description
Creates a node-saml cache provider which stores its keys in the `saml_cache` table of the ACL schema.

Keys are kept until they expire. An expired key reads as absent and is replaced by the next save. Expired keys are removed when an assertion ID is saved.

@param {number} [expirationMs] The time in milliseconds for which a key saved with saveAsync is kept.
@returns {Object} The node-saml cache provider.
@throws {TypeError} The SAML app requires an ACL connection.
*/
export function createAclCacheProvider(expirationMs = DEFAULT_EXPIRATION_MS) {
  if (typeof acl !== 'function') {
    throw new TypeError(
      'SAML requires an ACL connection in the PRIVATE or PUBLIC environment variable.',
    );
  }

  return {
    async saveAsync(key, value) {
      await query(
        `
        INSERT INTO acl_schema.saml_cache (key, value, expires_at)
        VALUES ($1, $2, now() + $3 * interval '1 millisecond')
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at;`,
        [key, value, expirationMs],
      );

      return { createdAt: Date.now(), value };
    },

    async getAsync(key) {
      const rows = await query(
        `
        SELECT value FROM acl_schema.saml_cache
        WHERE key = $1 AND expires_at > now();`,
        [key],
      );

      return rows[0]?.value ?? null;
    },

    async removeAsync(key) {
      if (key == null) return null;

      const rows = await query(
        `
        DELETE FROM acl_schema.saml_cache
        WHERE key = $1
        RETURNING value;`,
        [key],
      );

      return rows[0]?.value ?? null;
    },

    async consumeAsync(key) {
      const rows = await query(
        `
        DELETE FROM acl_schema.saml_cache
        WHERE key = $1 AND expires_at > now()
        RETURNING value;`,
        [key],
      );

      return rows[0]?.value ?? null;
    },

    /**
    Saves the key unless an unexpired key is present, in one statement. Two copies of an assertion validated at the same time can therefore not both be accepted.

    An expired key with the same name is replaced. Other expired keys are removed. The purge excludes the key that is saved, so the statement does not modify the same row twice.
    */
    async saveIfAbsentAsync(key, value, expiresAtMs) {
      const rows = await query(
        `
        WITH purge AS (
          DELETE FROM acl_schema.saml_cache
          WHERE expires_at <= now() AND key <> $1
        )
        INSERT INTO acl_schema.saml_cache (key, value, expires_at)
        VALUES ($1, $2, to_timestamp($3 / 1000.0))
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
        WHERE acl_schema.saml_cache.expires_at <= now()
        RETURNING key;`,
        [key, value, expiresAtMs],
      );

      return rows.length > 0;
    },
  };
}
