---
type: Environment Variable
title: Sources and signers
description: SRC_* substitutes values into src references; SIGN_*, KEY_CLOUDFRONT, AWS_S3_CLIENT and CLOUDINARY_URL enable signed requests; FILE_RESOURCES and CUSTOM_TEMPLATES configure file access and templates.
resource: ../../apps/xyz/mod/provider/getSrc.js
tags: [xyz, environment, providers, signers, templates]
status: draft
x-xyz-variables: [SRC_*, SIGN_*, FILE_RESOURCES, KEY_CLOUDFRONT, AWS_S3_CLIENT, CLOUDINARY_URL, CUSTOM_TEMPLATES]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/provider/getSrc.js
  - resource: ../../apps/xyz/mod/provider/file.js
  - resource: ../../apps/xyz/mod/utils/envReplace.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/sign/_sign.js
  - resource: ../../apps/xyz/mod/sign/file.js
  - resource: ../../apps/xyz/mod/sign/cloudfront.js
  - resource: ../../apps/xyz/mod/sign/s3.js
  - resource: ../../apps/xyz/mod/sign/cloudinary.js
  - resource: ../../apps/xyz/mod/workspace/cache.js
  - resource: ../../apps/xyz/tests/mod/utils/envReplace.test.mjs
  - resource: ../../apps/xyz/tests/mod/provider/getSrc.test.mjs
  - resource: ../../apps/xyz/tests/mod/provider/file.test.mjs
  - resource: ../../apps/xyz/tests/mod/sign/file.test.mjs
  - resource: ../../apps/xyz/tests/mod/sign/cloudfront.test.mjs
  - resource: ../../apps/xyz/tests/mod/sign/s3.test.mjs
  - resource: ../../apps/xyz/tests/mod/sign/cloudinary.test.mjs
  - resource: ../../apps/xyz/tests/mod/utils/processEnv.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/cache.test.mjs
---
# Sources and signers

A `src` reference in a workspace or template is resolved by the provider named
by its prefix: `file:`, `https:`, `cloudfront:` or a `SIGN_*` key. The same
signers are available from `/api/sign/<signer>`; the `cloudfront` and `s3`
signers answer `405` when not configured. Key files are read relative to
`XYZ_CWD`.

## SRC_*

`SRC_<NAME>` replaces `${NAME}` in every src reference the API resolves,
including `WORKSPACE` and `CUSTOM_TEMPLATES`. A placeholder without a variable
is left unchanged.

```dotenv
SRC_ASSETS=assets.example.com/maps
```

```json
{ "src": "https://${ASSETS}/templates/layer.json" }
```

`file:` paths and `cloudfront:` URLs also replace `{NAME}` in single braces,
eg. `file:{RESOURCES}/layer.json`. There a missing variable gives the text
`undefined`.

Values are only substituted in src references, not elsewhere in a workspace.
The Wiki example which puts `${DIR}` in a `plugins` URL is not substituted by
the API.[^wiki]

## SIGN_*

`SIGN_<KEY>` connects another XYZ instance as a source. The value is its host,
with an optional path and without a scheme; `https://` is prepended. The
private key is read at startup from `<KEY>.pem`; an unreadable file is logged.

```dotenv
SIGN_ASSETS=assets.example.com/geo
```

A src `ASSETS:templates/layer.json` is then fetched from
`https://assets.example.com/geo/api/provider/file` with the path, an expiry
one day ahead, the key id and an HMAC-SHA256 signature made with the key. The
other instance must hold the same key to verify the signature; that check is
not part of `apps/xyz`. The Wiki example value with `https://` would give a
doubled scheme.[^wiki]

`FILE_RESOURCES`, default `resources`, is the directory under `XYZ_CWD` from
which files are served to signed file provider requests.

## CloudFront

`KEY_CLOUDFRONT` is the CloudFront key pair id. The private key is read from
`<KEY_CLOUDFRONT>.pem` when the module loads. It enables the `cloudfront:` src
provider and the `cloudfront` signer, and needs the optional
`@aws-sdk/cloudfront-signer` dependency. Signed URLs expire at the next
midnight, server time. `{NAME}` placeholders in the URL
are replaced from `SRC_*`. The Wiki only describes the key file name.[^wiki]

## S3

`AWS_S3_CLIENT` holds the access key id and secret as URL search params, and
enables the `s3` signer. It needs the optional `@aws-sdk/client-s3` and
`@aws-sdk/s3-request-presigner` dependencies.

```dotenv
AWS_S3_CLIENT=accessKeyId=<access-key-id>&secretAccessKey=<secret-access-key>
```

The request names an S3 client `command`, eg. `GetObjectCommand`, with
`Bucket`, `Key` and `Region`. The signed URL is valid for one hour. Public
buckets can be read without the signer.

## Cloudinary

`CLOUDINARY_URL` is the Cloudinary environment variable,
`cloudinary://<api_key>:<api_secret>@<cloud_name>`. It enables the
`cloudinary` signer, which returns a signed upload URL for a `folder` and
`public_id`, or a destroy URL with `destroy=true`.

## CUSTOM_TEMPLATES

`CUSTOM_TEMPLATES` is a src for a JSON object of templates by key, eg.
`file:/templates/custom.json`. It is loaded each time the workspace cache is
built. Its templates replace the core view, mail, message and query
templates of the same key, and workspace templates replace both. A source
which fails to load is recorded as a workspace error; the workspace still
loads with the core templates.

Keep the keys and secrets of all signers in a secret manager or the varlock
schema.

[^wiki]: Wiki Process-Environment page at revision 3fc379b.
