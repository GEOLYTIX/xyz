module.exports = {
  verification: {
    en: _=>({
      subject: `Please verify your password reset for ${_.host}`,
      text: `A new password has been set for this account.
      Please verify that you are the account holder: ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      The reset occured from this remote address ${_.address}
      This wasn't you? Please let your manager know.`
    })
  }
}