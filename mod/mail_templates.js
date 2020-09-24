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
    }),
    zh: _ => ({
      subject: `请验证您的密码重置 ${_.host}`,
      text: `为此帐户设置了新密码
      请确认您是帐户持有人 ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      账户重置发生于远程地址 ${_.address}
      如果这不是您本人的操作，请告知您的相关负责人`
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
  	}),
  	zh: _ => ({
  		subject: `请验证您的帐户 ${_.host}`,
  		text: `已为此电子邮件地址设立新帐户 ${_.host}
    请确认您是帐户持有人 ${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
    等待网站管理员批准该帐户，然后才能登录。
    一旦管理员批准了您的帐户，就会通过电子邮件通知您。
    该帐户是从该远程地址注册的 ${_.remote_address}\n
    如果这不是您本人的操作，请不要进行验证；同时请告知您的相关负责人`
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
  	}),
  	zh: _ => ({
  		subject: `该帐户已得到批准 ${_.host}`,
  		text: `您现在已可登录 ${_.protocol}${_.host}`
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
  	}),
  	zh: _ => ({
  		subject: `此帐户已被删除 ${_.host}`,
  		text: `您将不再能登录 ${_.protocol}${_.host}`
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
  	}),
  	zh: _ => ({
  		subject: `尝试登录失败 ${_.host}`,
  		text: `${_.verified ? '该帐户已通过验证。' : '该帐户尚未验证。'}
  		${_.approved ? '该帐户已被批准。' : '请等待帐户批准确认电子邮件。'}
      操作失败。该尝试发生于这个远程地址 ${_.remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`
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
  	}),
  	zh: _ => ({
  		subject: `发生太多失败的登录尝试 ${_.host}`,
  		text: `此帐户登录尝试失败已发生${_.failed_attempts}次
      此帐户现已锁定，等待通过验证。
      请确认您是帐户持有人：${_.protocol}${_.host}/api/user/verify/${_.verificationtoken}
      验证帐户将重置失败的登录尝试。
      操作失败。该尝试发生于这个远程地址 ${_.remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`
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
  	}),
  	zh: _ => ({
  		subject: `尝试登录失败 ${_.host}`,
  		text: `密码输入错误
    操作失败。该尝试发生于这个远程地址 ${_.remote_address}
    如果这不是您本人的操作，请告知您的相关负责人`
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
    	text: `${_.email} を承認するには、管理パネル ${_.protocol}${_.host}/view/admin_user にログインしてください
    	このリンクからもアカウントを承認することができます ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
    }),
    ko: _ => ({
  		subject: `새로운 계정이 확인되었습니다. ${_.host}`,
  		text: `${_.email} 을 승인하려면 관리자 패널 ${_.protocol}${_.host}/view/admin_user 에 로그인하세요.
        다음의 링크로 또한 계정 승인을 할 수 있습니다. ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	}),
  	zh: _ => ({
  		subject: `新帐户已通过验证 ${_.host}`,
  		text: `请登录管理控制台 ${_.protocol}${_.host}/view/admin_user 批准 ${_.email}
        You can also approve the account by following this link: ${_.protocol}${_.host}/api/user/approve/${_.approvaltoken}`
  	})
  }
}