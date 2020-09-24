module.exports = {
  verify_password_reset: {
    en: _ => ({
      subject: `Please verify your password reset for ${_.host}`,
      text: `A new password has been set for this account.
      Please verify that you are the account holder: ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      The reset occured from this remote address ${_.address}
      This wasn't you? Please let your manager know.`
    })
  },
  verify_account: {
  	en: _ => ({
  		subject: `Please verify your account on ${_.host}`,
  		text: `A new account for this email address has been registered with ${_.host}
    Please verify that you are the account holder: ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
    A site administrator must approve the account before you are able to login.
    You will be notified via email once an adimistrator has approved your account.
    The account was registered from this remote address ${_.remote_address}\n
    This wasn't you? Do NOT verify the account and let your manager know.`
  	})
  },
  approved_account: {
  	en: _ => ({
  		subject: `This account has been approved on ${_.host}`,
  		text: `You are now able to log on to ${_.protocol}${_.host}`
  	})
  },
  deleted_account: {
  	en: _ => ({
  		subject: `This ${_.host} account has been deleted.`,
  		text: `You will no longer be able to log in to ${_.protocol}${_.host}`
  	})
  },
  failed_login: {
  	en: _ => ({
  		subject: `A failed login attempt was made on ${_.host}`,
  		text: `${_.verified ? 'The account has been verified.' : 'The account has NOT been verified.'}
  		${_.approved ? 'The account has been approved.' : 'Please wait for account approval confirmation email.'}
      The failed attempt occured from this remote address ${_.remote_address}
      This wasn't you? Please let your manager know.`
  	})
  },
  locked_account: {
  	en: _ => ({
  		subject: `Too many failed login attempts occured on ${_.host}`,
  		text: `${_.failed_attempts} failed login attempts have been recorded on this account.
      This account has now been locked until verified.
      Please verify that you are the account holder: ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      Verifying the account will reset the failed login attempts.
      The failed attempt occured from this remote address ${_.remote_address}
      This wasn't you? Please let your manager know.`
  	})
  },
  login_incorrect: {
  	en: _ => ({
  		subject: `A failed login attempt was made on ${_.host}`,
  		text: `An incorrect password was entered.
    The failed attempt occured from this remote address ${_.remote_address}
    This wasn't you? Please let your manager know.`
  	})
  },
  admin_approved: {
  	en: _ => ({
  		subject: `A new account has been verified on ${_.host}`,
  		text: `Please log into the admin panel ${_.protocol}${_.host}/view/admin_user to approve ${_.email}
        You can also approve the account by following this link: ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	})
  },
  admin_email: {
  	en: _ => ({
  		subject: `A new account has been verified on ${_.host}`,
  		text: `Please log into the admin panel ${_.protocol}${_.host}/view/admin_user to approve ${_.email}
        You can also approve the account by following this link: ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	})
  }
}