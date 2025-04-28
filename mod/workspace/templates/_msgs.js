/**
@module /workspace/templates/msgs
*/

export default {
  account_approved_no_admin: {
    en: `The account has been verified but there is no administrator to approve the account.`,
  },
  account_await_approval: {
    en: `This account has been verified but requires administrator approval.`,
    fr: `Le compte a été verifié mais il doit être approuvé par l'administrateur. `,
    ja: `本アカウント検証完了。アドミニストレーター承認が必要となります`,
    ko: `이 계정은 확인되었으나 관리자의 승인이 필요합니다.`,
    pl: `Konto zostało zweryfikowane i musi zostać zatwierdzone przez administratora.`,
    zh: `此帐户已通过验证，但需要管理员批准。`,
  },
  admin_approved: {
    en: `The account has been approved by you. An email has been sent to the account holder.`,
    fr: `Vous avez approuvé ce compte. Un e-mail a été xyzEnvoyé au propriétaire du compte.`,
    ja: `アカウントはあなたによって承認されました。 メールをアカウント所有者に送信しました。`,
    ko: `귀하에 의해서 계정이 승인되었습니다. 계정 사용자에게 이메일이 발송되었습니다.`,
    pl: `Konto zostało zatwierdzone. Wysłano wiadomość na zarejestrowany adres e-mail.`,
    zh: `此帐户已被您批准。电子邮件已发送给帐户持有人`,
  },
  admin_required: {
    en: `Admin priviliges required.`,
  },
  auth_failed: {
    de: `Anmeldung gescheitert.`,
    en: `Authentication failed.`,
  },
  failed_query: {
    en: `Failed to query PostGIS table.`,
  },
  login_required: {
    en: `Login required.`,
  },
  missing_email: {
    en: `Missing email`,
    fr: `E-mail manquant`,
    pl: `Nie podano adresu e-mail.`,
  },
  missing_password: {
    en: `Missing password`,
    fr: `Mot de passe manquant`,
    pl: `Nie podano hasła.`,
  },
  new_account_registered: {
    en: `A new account has been registered and is awaiting email verification.`,
    fr: `Un nouveau compte a été enregistré et il attend la vérification par e-mail.`,
    ja: `新規アカウントの登録完了にてE-メール検証待ち`,
    ko: `새로운 계정이 등록되었고 이메일 확인을 기다리고 있습니다.`,
    pl: `Nowe konto zostało zarejestrowane i czeka na weryfikację przez wiadomość email.`,
    zh: `已注册一个新帐户，正在等待电子邮件验证。`,
  },
  no_cookie_found: {
    en: `No cookie relating to this application found on request`,
  },
  no_locale: {
    en: `Locale not accessible.`,
  },
  no_locales: {
    de: `Keine Locale zugreifbar fuer den User.`,
    en: `No accessible locales for user account.`,
  },
  password_reset_ok: {
    en: `Password has been reset.`,
    fr: `Le mot de passe a été réinitialisé.`,
    ja: `パスワードがリセットされました`,
    ko: `비밀번호가 재설정되었습니다.`,
    pl: `Ustawiono nowe hasło.`,
    zh: `密码已重设`,
  },
  password_reset_verification: {
    en: `Password will be reset after email verification.`,
    fr: `Le mot de passe sera réinitialisé après la vérification par e-mail.`,
    ja: `E-メール検証完了後にパスワードはリセットされます`,
    ko: `이메일 확인 후 비밀번호가 재설정됩니다`,
    pl: `Hasło zostanie ustawione po weryfikacji konta przez wiadomości e-mail.`,
    zh: `电子邮件验证后，密码将被重置。`,
  },
  token_not_found: {
    en: `Token not found. The token has probably been resolved already.`,
    fr: `Token n’a pas été trouvé. Il a probablement déjà été utilisé.`,
    ja: `トークンが見つかりません。 トークンはおそらくすでに解決されています。`,
    ko: `토근이 발견되지 않았습니다. 이미 해결된 것 같습니다.`,
    pl: `Token wygasł. Prawdopodobnie został już wykorzystany.`,
    zh: `未找到相关令牌， 该令牌可能已解析`,
  },
  update_ok: {
    en: `Update successful`,
    fr: `Cette mise à jour a réussi.`,
    ja: `アップデートに成功しました`,
    ko: `업데이트가 성공적으로 진행되었습니다.`,
    pl: `Uaktualniono.`,
    zh: `更新成功`,
  },
  user_blocked: {
    en: `User blocked`,
    fr: `Cet utilisateur est bloqué.`,
    ja: `ユーザーがブロックされました`,
    ko: `사용자 봉쇄`,
    pl: `Konto zostało zablokowane.`,
    zh: `用户被阻止`,
  },
  user_expired: {
    en: `User approval has expired. Please re-register.`,
    fr: `Les droits d'accès ont expiré. Veuillez vous réenregistrer.`,
    ja: `ユーザーの承認は期限切れです。 再登録してください。`,
    ko: `사용자 승인이 만료되었습니다. 다시 등록하십시오.`,
    pl: `Prawo dostępu wygasło. Zarejestruj się poownie.`,
    zh: `用戶批准已過期。 請重新註冊。`,
  },
  user_locked: {
    de: `Benutzerkonto gesperrt.`,
    en: `User account has been locked due to failed login attempts.`,
  },
  user_not_verified: {
    en: `User not verified or approved`,
    fr: `L’utilisateur n’a pas été vérifié ou approuvé.`,
    ja: `ユーザーは確認または承認されていません`,
    ko: `사용자 미확인 또는 미승인`,
    pl: `Konto niezweryfikowane ani zatwierdzone.`,
    zh: `用户未经验证或批准`,
  },
};
