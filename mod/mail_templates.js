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
    }),
    ko: _ => ({
      subject: `비밀번호 재설정을 확인해주십시오. ${_.host}`,
      text: `이 계정의 새로운 비밀번호가 설정되었습니다.
      계정 소유자임을 확인해주십시오. ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      기기의 고유주소로부터 재설정이 되었습니다. ${_.address}
      본인이 아니면 담당매니저에게 알려주십시오.`
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
    }),
    ko: _ => ({
  		subject: `계정 확인바랍니다 ${_.host}`,
  		text: `이 이메일주소의 새로운 계정이 등록되었습니다. ${_.host}
    계정 소유자임을 확인해주십시오. ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
    로그인전에 입지 관리자가 계정을 승인해야만 합니다. 
    관리자가 계정 승인을 하면 공지 이메일을 받게됩니다.
    기기의 고유주소로부터 계정 등록이 되었습니다. ${_.remote_address}\n
    본인이 아니면 계정 확인을 하지말고 관리자에게 알려주십시오.`
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
    }),
    ko: _ => ({
  		subject: `계정이 승인되었습니다. ${_.host}`,
  		text: `로그인이 가능합니다. ${_.protocol}${_.host}`
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
    }),
    ko: _ => ({
  		subject: `계정이 삭제되었습니다. ${_.host}`,
  		text: `더 이상 로그인이 불가합니다. ${_.protocol}${_.host}`
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
  	}),
  	ko: _ => ({
  		subject: `잘못된 로그인 시도입니다. ${_.host}`,
  		text: `${_.verified ? '계정이 확인되었습니다.' : '계정이 확인되지않았습니다.'}
  		${_.approved ? '계정이 승인되었습니다.' : '계정승인 확인 이메일을 기다려주십시오.'}
      기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. ${_.remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`
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
  	}),
  	ko: _ => ({
  		subject: `다수의 잘못된 로그인 시도가 발생했습니다. ${_.host}`,
  		text: `이 계정에 ${_.failed_attempts} 번의 잘못된 로그인 시도가 발생했습니다.
      이 계정은 확인될때까지 봉쇄되었습니다.
      계정 소유자임을 확인해주십시오. ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      계정 확인은 잘못된 로그인 시도를 재설정합니다.
      기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. ${_.remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`
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
  	}),
  	ko: _ => ({
  		subject: `잘못된 로그인 시도입니다. ${_.host}`,
  		text: `잘못된 비밀번호입니다.
    기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. ${_.remote_address}
    본인이 아니면 담당매니저에게 알려주십시오.`
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
    }),
    ko: _ => ({
  		subject: `새로운 계정이 확인되었습니다. ${_.host}`,
  		text: `승인을 위해서 관리 패널로 로그인하십시오. ${_.protocol}${_.host}/view/admin_user to approve ${_.email}
        다음의 링크로 또한 계정 승인을 할 수 있습니다. ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	})
  }
}