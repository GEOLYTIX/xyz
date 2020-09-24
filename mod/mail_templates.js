module.exports = {
  verify_password_reset: {
    en: _ => ({
      subject: `Please verify your password reset for ${_.host}`,
      text: `A new password has been set for this account.
      Please verify that you are the account holder: ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      The reset occured from this remote address ${_.address}
      This wasn't you? Please let your manager know.`
    }),
    ja: _ => ({
    	subject: `リセットするパスワードを検証してください ${_.host}`,
    	text: `このアカウントに新規パスワードが設定されました.
      アカウントホールダーであることを検証してください ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      このリモートアドレスによりリセットがされました ${_.address}
      あなたではなかった場合、マネージャーに連絡をして下さい`
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
  	}),
    ja: _ => ({
    	subject: `${_.host} についてアカウントを検証して下さい`,
    	text: `このE-メールアドレスの新規アカウントは${_.host}に登録されています
    アカウントホールダーであることを検証してください ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
    サイトアドミニストレーター承認後にログインが可能となります
    サイトアドミニストレーターによるアカウント承認後通知メールが送信されます
    アカウントはこのリモートアドレスより登録されました。 ${_.remote_address}\n
    これがあなたでなかった場合はアカウントの検証は行わずマネージャーに連絡をしてください`
    })
  },
  approved_account: {
  	en: _ => ({
  		subject: `This account has been approved on ${_.host}`,
  		text: `You are now able to log on to ${_.protocol}${_.host}`
  	}),
    ja: _ => ({
    	subject: `アカウントは承認されました ${_.host}`,
  		text: `これで、${_.protocol}${_.host}にログオンできます。`
    })
  },
  deleted_account: {
  	en: _ => ({
  		subject: `This ${_.host} account has been deleted.`,
  		text: `You will no longer be able to log in to ${_.protocol}${_.host}`
  	}),
    ja: _ => ({
    	subject: `${_.host}のこのアカウントは削除されました`,
    	text: `${_.protocol}${_.host}にログインできなくなります削除されました`
    })
  },
  failed_login: {
  	en: _ => ({
  		subject: `A failed login attempt was made on ${_.host}`,
  		text: `${_.verified ? 'The account has been verified.' : 'The account has NOT been verified.'}
  		${_.approved ? 'The account has been approved.' : 'Please wait for account approval confirmation email.'}
      The failed attempt occured from this remote address ${_.remote_address}
      This wasn't you? Please let your manager know.`
  	}),
    ja: _ => ({
  		subject: `ログインに失敗しました ${_.host}にログインしようとしました`,
  		text: `${_.verified ? 'アカウントは検証されました' : 'アカウントは検証されていません'}
  		${_.approved ? 'アカウントは承認されました' : 'アカウント承認確認メールが送信されるのをお待ちください'}
      このリモートアドレスから試されましたが失敗しました ${_.remote_address}
      これがあなたではなかった場合、マネージャーに連絡をして下さい`
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
  	}),
  	ja: _ => ({
  		subject: `${_.host}ログインに多数失敗しました`,
  		text: `このアカウントによるログインが${_.failed_attempts}回失敗しました 
      このアカウントは検証されるまでロックされます 
      アカウントホールダーであることを検証してください ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      アカウント検証によりログイン失敗がリセットされます 
      このリモートアドレスから試されましたが失敗しました ${_.remote_address}
      これがあなたではなかった場合、マネージャーに連絡をして下さい`
  	})
  },
  login_incorrect: {
  	en: _ => ({
  		subject: `A failed login attempt was made on ${_.host}`,
  		text: `An incorrect password was entered.
    The failed attempt occured from this remote address ${_.remote_address}
    This wasn't you? Please let your manager know.`
  	}),
    ja: _ => ({
  		subject: `ログインに失敗しました ${_.host}にログインしようとしました`,
  		text: `間違ったパスワードが入力されました 
    このリモートアドレスから試されましたが失敗しました ${_.remote_address}
    これがあなたではなかった場合、マネージャーに連絡をして下さい`
  	})
  },
  admin_email: {
  	en: _ => ({
  		subject: `A new account has been verified on ${_.host}`,
  		text: `Please log into the admin panel ${_.protocol}${_.host}/view/admin_user to approve ${_.email}
        You can also approve the account by following this link: ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	}),
    ja: _ => ({
    	subject: `${_.host}についてアカウントを検証されました`,
    	text: `アドミンパネルにログインして承認してください ${_.protocol}${_.host}/view/admin_user to approve ${_.email}
    	このリンクからもアカウントを承認することができます ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
    })
  }
}