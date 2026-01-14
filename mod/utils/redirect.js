export function setRedirect(req) {
  let redirectUrl =
    req.url && decodeURIComponent(req.url).replace(/login=true/, '');

  // Validate and sanitize the redirect URL to prevent cookie injection
  if (redirectUrl) {
    // Remove any characters that could be used for cookie injection
    redirectUrl = redirectUrl.replace(/[;\r\n]/g, '');

    // Ensure it's a relative URL (it starts with '/')
    if (!redirectUrl.startsWith('/')) {
      redirectUrl = xyzEnv.DIR || '/';
    }
  } else {
    redirectUrl = xyzEnv.DIR || '/';
  }

  // Encode the URL for safe storage in the cookie
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);

  // Set cookie with properly encoded redirect value.
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}_redirect=${encodedRedirectUrl};HttpOnly;Max-Age=60000;Path=${xyzEnv.DIR || '/'}`,
  );
}
