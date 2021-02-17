---
title: Logging
layout: root.html
---

# Logging

By default log messages send to the [logger module](https://github.com/GEOLYTIX/xyz/blob/master/mod/logger.js) will be written to the console if the `LOGS` process environment variable is set. If falsy, logs will not be written.

## Logflare

The logger module will attempt to send logs to a [logflare](https://logflare.app/) source with `LOGS=logflare` as environment variable. The logflare API key and source ID, seperated by a pipe `|` must be provided as value for the `KEY_LOGFLARE` environment variable.

```
  "LOGS": "logflare",
  "KEY_LOGFLARE": "6oCQu******|ad443baf-3e30-4c73-891e-**********",
```

## Vercel Integration

Request handler and console logs will not be retained by Vercel. The functions panel must be open in the Vercel project dashboard to show realtime logs.

A [logflare integration](https://vercel.com/integrations/logflare) can be added to Vercel. The configuration for this integration allows to assign Logflare sources as log drains for projects within the scope.