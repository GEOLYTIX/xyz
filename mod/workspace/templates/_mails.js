/**
@module /workspace/templates/mails
*/

export default {
  admin_email: {
    de: {
      subject: `A neues Benutzerkonto wurde erstellt fuer \${host}`,
      text: `Please log into the admin panel \${host}/api/user/admin to approve \${email}
      You can also approve the account by following this link: \${host}/api/user/admin?email=\${email}`,
    },
    en: {
      subject: `A new account has been verified on \${host}`,
      text: `Please log into the admin panel \${host}/api/user/admin to approve \${email}
      You can also approve the account by following this link: \${host}/api/user/admin?email=\${email}`,
    },
    fr: {
      subject: `Un nouveau compte a été verifié sur \${host}`,
      text: `Veuillez vous connecter à votre compte administrateur \${host}/api/user/admin pour approuver \${email}
  		Vous pouvez également l'approuver en suivant ce lien \${host}/api/user/admin?email=\${email}`,
    },
    ja: {
      subject: `\${host}についてアカウントを検証されました`,
      text: `\${email} を承認するには、管理パネル \${host}/api/user/admin にログインしてください
    	このリンクからもアカウントを承認することができます \${host}/api/user/admin?email=\${email}`,
    },
    ko: {
      subject: `새로운 계정이 확인되었습니다. \${host}`,
      text: `\${email} 을 승인하려면 관리자 패널 \${host}/api/user/admin 에 로그인하세요.
      다음의 링크로 또한 계정 승인을 할 수 있습니다. \${host}/api/user/admin?email=\${email}`,
    },
    pl: {
      subject: `Nowe konto zostało zweryfikowane na \${host}`,
      text: `Zaloguj się do panelu administratora \${host}/api/user/admin aby zatwierdzić \${email}
      Możesz też zatwierdzić nowego konto za pomocą tego linku \${host}/api/user/admin?email=\${email}`,
    },
    zh: {
      subject: `新帐户已通过验证 \${host}`,
      text: `请登录管理控制台 \${host}/api/user/admin 批准 \${email}
      You can also approve the account by following this link: \${host}/api/user/admin?email=\${email}`,
    },
  },
  approved_account: {
    en: {
      subject: `This account has been approved on \${host}.`,
      text: `You are now able to log on to \${host}`,
    },
    fr: {
      subject: `Maintenant vous pouvez vous connecter à \${host}`,
      text: `Ce compte a été approuvé sur \${host}.`,
    },
    ja: {
      subject: `アカウントは承認されました \${host}`,
      text: `これで、\${host}にログオンできます。`,
    },
    ko: {
      subject: `계정이 승인되었습니다. \${host}`,
      text: `로그인이 가능합니다. \${host}`,
    },
    pl: {
      subject: `Teraz możesz się zalogować na \${host}`,
      text: `Konto na \${host} zostało zatwierdzone.`,
    },
    zh: {
      subject: `该帐户已得到批准 \${host}`,
      text: `您现在已可登录 \${host}`,
    },
  },
  deleted_account: {
    de: {
      subject: `Diese Benutzerkonto für \${host} wurde entfernt.`,
      text: `Einloggen ist nicht länger möglich \${host}`,
    },
    en: {
      subject: `This \${host} account has been deleted.`,
      text: `You will no longer be able to log in to \${host}`,
    },
    fr: {
      subject: `Ce compte sur \${host} a été supprimé.`,
      text: `Vous ne pouvez plus vous connecter à \${host}`,
    },
    ja: {
      subject: `\${host}のこのアカウントは削除されました`,
      text: `\${host}にログインできなくなります削除されました`,
    },
    ko: {
      subject: `계정이 삭제되었습니다. \${host}`,
      text: `더 이상 로그인이 불가합니다. \${host}`,
    },
    pl: {
      subject: `Konto na \${host} zostało usunięte.`,
      text: `Nie możesz się już logować na \${host}`,
    },
    zh: {
      subject: `此帐户已被删除 \${host}`,
      text: `您将不再能登录 \${host}`,
    },
  },
  failed_login: {
    en: {
      subject: `A failed login attempt was made on \${host}`,
      text: `The failed attempt occured from this remote address \${remote_address}
      This wasn't you? Please let your manager know.`,
    },
    fr: {
      subject: `Une tentative de connexion a échouée sur \${host}`,
      text: `La tentative de connexion échouée a été exécuté par \${remote_address}\n
  	  Vous ne l’avez pas exécuté? Veuillez informer votre directeur.`,
    },
    ja: {
      subject: `ログインに失敗しました \${host}にログインしようとしました`,
      text: `このリモートアドレスから試されましたが失敗しました \${remote_address}
      これがあなたではなかった場合、マネージャーに連絡をして下さい`,
    },
    ko: {
      subject: `잘못된 로그인 시도입니다. \${host}`,
      text: `기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. \${remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`,
    },
    pl: {
      subject: `Nieudana próba logowania na \${host}`,
      text: `Nieudaną próbę logowania rozpoczęto z tego adresu \${remote_address}
      To nie Ty? Zgłoś to osobie odpowiedzialnej.`,
    },
    zh: {
      subject: `尝试登录失败 \${host}`,
      text: `操作失败。该尝试发生于这个远程地址 \${remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`,
    },
  },
  locked_account: {
    en: {
      subject: `Too many failed login attempts occured on \${host}`,
      text: `\${failed_attempts} failed login attempts have been recorded on this account.
      This account has now been locked until verified.
      Please verify that you are the account holder: \${host}/api/user/verify/\${verificationtoken}
      Verifying the account will reset the failed login attempts.
      The failed attempt occured from this remote address \${remote_address}
      This wasn't you? Please let your manager know.`,
    },
    fr: {
      subject: `Trop d'échecs de tentatives de connexions ont été exécutés sur \${host}`,
      text: `\${failed_attempts} échecs de tentatives de connexions ont été exécutés par ce compte.
  		Il a été verrouillé jusqu’à ce qu’il soit vérifié de nouveau.
  		Vérifiez que vous disposez des droits d'accès du compte \${host}/api/user/verify/\${verificationtoken}
  		La vérification du compte réinitialisera des droits d'accès.
  		La tentative de connexion échouée a été exécuté par \${remote_address}\n
  		Vous ne l’avez pas exécuté? Veuillez informer votre directeur.`,
    },
    ja: {
      subject: `\${host}ログインに多数失敗しました`,
      text: `このアカウントによるログインが\${failed_attempts}回失敗しました 
      このアカウントは検証されるまでロックされます 
      アカウントホールダーであることを検証してください \${host}/api/user/verify/\${verificationtoken}
      アカウント検証によりログイン失敗がリセットされます 
      このリモートアドレスから試されましたが失敗しました \${remote_address}
      これがあなたではなかった場合、マネージャーに連絡をして下さい`,
    },
    ko: {
      subject: `다수의 잘못된 로그인 시도가 발생했습니다. \${host}`,
      text: `이 계정에 \${failed_attempts} 번의 잘못된 로그인 시도가 발생했습니다.
      이 계정은 확인될때까지 봉쇄되었습니다.
      계정 소유자임을 확인해주십시오. \${host}/api/user/verify/\${verificationtoken}
      계정 확인은 잘못된 로그인 시도를 재설정합니다.
      기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. \${remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`,
    },
    pl: {
      subject: `Zbyt wiele nieudanych prób logowania na \${host}`,
      text: `Na tym koncie zarejestrowano \${failed_attempts} \${failed_attempts === 1 ? 'nieudaną próbę' : 'nieudane próby'}
      logowania. To konto zostało zablokowane do czasu powtórnej weryfikacji.
      Potwierdź swoje prawa dostępu do \${host}/api/user/verify/\${verificationtoken}
      Powtórna weryfikacja odświeży dozwoloną liczbę nieudanych prób.
      Nieudaną próbę logowania rozpoczęto z tego adresu \${remote_address}
      To nie Ty? Zgłoś to osobie odpowiedzialnej.`,
    },
    zh: {
      subject: `发生太多失败的登录尝试 \${host}`,
      text: `此帐户登录尝试失败已发生\${failed_attempts}次
      此帐户现已锁定，等待通过验证。
      请确认您是帐户持有人：\${host}/api/user/verify/\${verificationtoken}
      验证帐户将重置失败的登录尝试。
      操作失败。该尝试发生于这个远程地址 \${remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`,
    },
  },
  login_incorrect: {
    en: {
      subject: `A failed login attempt was made on \${host}`,
      text: `An incorrect password was entered.
      The failed attempt occured from this remote address \${remote_address}
      This wasn't you? Please let your manager know.`,
    },
    fr: {
      subject: `Une tentative de connexion a échouée sur \${host}`,
      text: `Le mot de passe entré est incorrect.
  		Vous ne l’avez pas exécuté? Veuillez informer votre directeur.`,
    },
    ja: {
      subject: `ログインに失敗しました \${host}にログインしようとしました`,
      text: `間違ったパスワードが入力されました 
      このリモートアドレスから試されましたが失敗しました \${remote_address}
      これがあなたではなかった場合、マネージャーに連絡をして下さい`,
    },
    ko: {
      subject: `잘못된 로그인 시도입니다. \${host}`,
      text: `잘못된 비밀번호입니다.
      기기의 고유주소로부터 잘못된 로그인 시도가 발생했습니다. \${remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`,
    },
    pl: {
      subject: `Nieudana próba logowania na \${host}`,
      text: `Podano błędne hasło.
      Nieudaną próbę logowania rozpoczęto z tego adresu \${remote_address}
      To nie Ty? Zgłoś to osobie odpowiedzialnej.`,
    },
    zh: {
      subject: `尝试登录失败 \${host}`,
      text: `密码输入错误
      操作失败。该尝试发生于这个远程地址 \${remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`,
    },
  },
  verify_account: {
    de: {
      subject: `Bitte verifizieren Sie ihr Benutzerkonto für \${host}`,
      text: `A new account for this email address has been registered with \${host}
      Please verify that you are the account holder: \${link}
      A site administrator must approve the account before you are able to login.
      You will be notified via email once an administrator has approved your account.
      The account was registered from this remote address \${remote_address}\n
      This wasn't you? Do NOT verify the account and let your manager know.`,
    },
    en: {
      subject: `Please verify your account on \${host}`,
      text: `A new account for this email address has been registered with \${host}
      Please verify that you are the account holder: \${link}
      A site administrator must approve the account before you are able to login.
      You will be notified via email once an administrator has approved your account.
      The account was registered from this remote address \${remote_address}\n
      This wasn't you? Do NOT verify the account and let your manager know.`,
    },
    fr: {
      subject: `Vérifiez votre compte sur \${host}`,
      text: `Un nouveau compte a été enregistré sur \${host}.
  		Vérifiez que vous disposez des droits d'accès du compte \${link}
  		L'adminstrateur doit approuver votre compte avant de vous connecter.
  		Vous recevrez un e-mail lorsque votre compte sera approuvé.
  		L'enregistrement a été exécuté par \${remote_address}\n
  		Vous ne l’avez pas demandé? Veuillez informer votre directeur.`,
    },
    ja: {
      subject: `\${host} についてアカウントを検証して下さい`,
      text: `このE-メールアドレスの新規アカウントは\${host}に登録されています
      アカウントホールダーであることを検証してください \${link}
      サイトアドミニストレーター承認後にログインが可能となります
      サイトアドミニストレーターによるアカウント承認後通知メールが送信されます
      アカウントはこのリモートアドレスより登録されました。 \${remote_address}\n
      これがあなたでなかった場合はアカウントの検証は行わずマネージャーに連絡をしてください`,
    },
    ko: {
      subject: `계정 확인바랍니다 \${host}`,
      text: `이 이메일주소의 새로운 계정이 등록되었습니다. \${host}
      계정 소유자임을 확인해주십시오. \${link}
      로그인전에 입지 관리자가 계정을 승인해야만 합니다. 
      관리자가 계정 승인을 하면 공지 이메일을 받게됩니다.
      기기의 고유주소로부터 계정 등록이 되었습니다. \${remote_address}\n
      본인이 아니면 계정 확인을 하지말고 관리자에게 알려주십시오.`,
    },
    pl: {
      subject: `Zweryfikuj konto \${host}`,
      text: `Nowe konto dla tego adresu e-mail zostało zarejestrowane z \${host}
      Potwierdź swoje prawa dostępu do \${link}
      Administrator musi zatwierdzić konto przed logowaniem.
      Otrzymasz powiadomienie na swój adres e-mail.
      Proces rejestracji konta rozpoczęto z tego adresu \${remote_address}\n
      To nie Ty? Zignoruj ten link i zgłoś to osobie odpowiedzialnej.`,
    },
    zh: {
      subject: `请验证您的帐户 \${host}`,
      text: `已为此电子邮件在\${host}上注册了新账户
      请确认您是帐户持有人 \${link}
      等待网站管理员批准该帐户，然后才能登录。
      一旦管理员批准了您的帐户，就会通过电子邮件通知您。
      该帐户是从该远程地址注册的 \${remote_address}\n
      如果这不是您本人的操作，请不要进行验证；同时请告知您的相关负责人`,
    },
  },
  verify_password_reset: {
    en: {
      subject: `Please verify your password reset for \${host}`,
      text: `A new password has been set for this account.
      Please verify that you are the account holder: \${link}
      The reset occured from this remote address \${remote_address}
      This wasn't you? Please let your manager know.`,
    },
    fr: {
      subject: `Vérifiez votre mot de passe réinitialisé sur \${host}.`,
      text: `Le nouveau mot de passe a été défini pour ce compte.
    	Vérifiez que vous disposez des droits d'accès du compte \${link}
    	La réinitialisation a été exécutée par \${remote_address}
    	Vous ne l’avez pas demandé? Veuillez informer votre directeur.`,
    },
    ja: {
      subject: `リセットするパスワードを検証してください \${host}`,
      text: `このアカウントに新規パスワードが設定されました.
      アカウントホールダーであることを検証してください \${link}
      このリモートアドレスによりリセットがされました \${remote_address}
      あなたではなかった場合、マネージャーに連絡をして下さい`,
    },
    ko: {
      subject: `비밀번호 재설정을 확인해주십시오. \${host}`,
      text: `이 계정의 새로운 비밀번호가 설정되었습니다.
      계정 소유자임을 확인해주십시오. \${link}
      기기의 고유주소로부터 재설정이 되었습니다. \${remote_address}
      본인이 아니면 담당매니저에게 알려주십시오.`,
    },
    pl: {
      subject: `Zweryfikuj nowe hasło \${host}.`,
      text: `Dla tego konta ustawiono nowe hasło.
      Potwierdź swoje prawa dostępu do \${link}
      Proces zmiany hasła rozpoczęto z tego adresu \${remote_address}
      To nie Ty? Zgłoś to osobie odpowiedzialnej.`,
    },
    zh: {
      subject: `请验证您的密码重置 \${host}`,
      text: `为此帐户设置了新密码
      请确认您是帐户持有人 \${link}
      账户重置发生于远程地址 \${remote_address}
      如果这不是您本人的操作，请告知您的相关负责人`,
    },
  },
};
