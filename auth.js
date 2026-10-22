(() => {
  const form = document.getElementById('auth-form');
  if (!form) return;
  const isRegister = location.pathname.toLowerCase().endsWith('register.html');
  const message = document.getElementById('form-message');
  const submit = form.querySelector('[type="submit"]');
  const verificationPanel = document.getElementById('verification-card');
  const verificationForm = document.getElementById('verification-form');
  const verificationMessage = document.getElementById('verification-message');
  const resendButton = document.getElementById('resend-code');
  const verificationInput = document.getElementById('verification-code');
  const verificationDigits = [...document.querySelectorAll('.verification-digit')];
  function syncVerificationCode() {
    const code = verificationDigits.map(input => input.value).join('');
    if (verificationInput) verificationInput.value = code;
    const wrap = verificationDigits[0]?.closest('.verification-input');
    if (!wrap) return;
    wrap.classList.remove('otp-typing', 'otp-complete');
    if (!code) return;
    void wrap.offsetWidth;
    wrap.classList.add(code.length === 8 ? 'otp-complete' : 'otp-typing');
  }
  verificationDigits.forEach((input, index) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length > 1) {
        digits.slice(0, verificationDigits.length - index).split('').forEach((digit, offset) => {
          verificationDigits[index + offset].value = digit;
        });
        verificationDigits[Math.min(index + digits.length, verificationDigits.length - 1)].focus();
      } else {
        input.value = digits;
        if (digits && index < verificationDigits.length - 1) verificationDigits[index + 1].focus();
      }
      syncVerificationCode();
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && index > 0) verificationDigits[index - 1].focus();
      if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); verificationDigits[index - 1].focus(); }
      if (event.key === 'ArrowRight' && index < verificationDigits.length - 1) { event.preventDefault(); verificationDigits[index + 1].focus(); }
    });
    input.addEventListener('paste', event => {
      const digits = event.clipboardData?.getData('text').replace(/\D/g, '') || '';
      if (!digits) return;
      event.preventDefault();
      digits.slice(0, verificationDigits.length - index).split('').forEach((digit, offset) => {
        verificationDigits[index + offset].value = digit;
      });
      verificationDigits[Math.min(index + digits.length, verificationDigits.length - 1)].focus();
      syncVerificationCode();
    });
  });
  let pendingRegistration = null;
  let resendInterval = null;
  const english = () => window.NoloshaI18n?.getLanguage() === 'en';
  function say(text, type = 'error') { message.textContent = text; message.className = `form-message ${type}`; }
  function sayVerification(text, type = 'error') { if (verificationMessage) { verificationMessage.textContent = text; verificationMessage.className = `form-message ${type}`; } }
  function emailRateLimited(error) { return ['over_email_send_rate_limit', 'email_rate_limit_exceeded'].includes(error.code) || /too many email requests|email.*rate.?limit/i.test(error.message || ''); }
  function errorText(error) {
    if (error.code === 'user_already_registered') return english() ? 'This email already has an account. Sign in instead, or register with a different email.' : 'Email-kan akoon ayuu leeyahay. Gal akoonkaaga ama isticmaal email kale.';
    if (error.code === 'email_address_not_authorized' || /email address not authorized/i.test(error.message || '')) return english() ? 'Supabase is blocking this address because custom SMTP is not configured. The default email service only sends to project team members.' : 'Supabase ayaa email-kan diiday: custom SMTP lama diyaarin. Adeegga email-ka caadiga ahi wuxuu u diraa oo keliya xubnaha kooxda project-ka.';
    if (emailRateLimited(error)) return english() ? 'Supabase has blocked more signup emails for now. No OTP was sent. Its default email service is limited; configure custom SMTP in Supabase Auth, or wait for the email limit to reset before resending.' : 'Supabase ayaa hadda xannibay emailo kale oo signup ah; OTP lama dirin. Adeegga email-ka caadiga ahi xad buu leeyahay. Ku xidh custom SMTP gudaha Supabase Auth, ama sug inta xadku dib u furmayo ka hor Resend code.';
    if (error.status === 429 || /rate.?limit|too many requests/i.test(error.message || '')) return english() ? 'Too many requests. Wait a minute before trying again.' : 'Codsiyo badan ayaa dhacay. Sug hal daqiiqo ka hor intaadan mar kale isku dayin.';
    if (error.status === 401) return english() ? 'Email or password is incorrect.' : 'Iimaylka ama password-ku sax ma aha.';
    if (/failed to fetch|networkerror|load failed|supabase/i.test(error.message || '')) return english() ? 'Could not reach the online service. Check your internet connection and try again.' : 'Adeegga online-ka lama xiriiri karo. Hubi internet-ka oo mar kale isku day.';
    return error.message || (english() ? 'Please try again.' : 'Mar kale isku day.');
  }
  function startSession(result) {
    sessionStorage.removeItem('nolosha-pending-registration-v1');
    if (!result?.token || !result.refreshToken || !result.email || !result.userId) throw new Error(english() ? 'The online service returned an incomplete account session. Please try again.' : 'Adeegga online-ku wuxuu soo celiyey xog session oo dhiman. Mar kale isku day.');
    sessionStorage.setItem('nolosha-session', JSON.stringify({ ...result, startedAt: Date.now() }));
    location.href = 'dashboard.html';
  }
  function showVerification(email) {
    if (!verificationPanel) return;
    form.hidden = true;
    const intro = document.querySelector('.auth-intro'); if (intro) intro.hidden = true;
    verificationPanel.hidden = false;
    const target = document.getElementById('verification-email'); if (target) target.textContent = email;
    sayVerification('');
    verificationDigits[0]?.focus();
  }
  function showRegistration() {
    if (verificationPanel) verificationPanel.hidden = true;
    form.hidden = false;
    const intro = document.querySelector('.auth-intro'); if (intro) intro.hidden = false;
    say('');
  }
  function cooldown(seconds = 60) {
    if (!resendButton) return;
    clearInterval(resendInterval);
    let left = Math.max(1, seconds);
    resendButton.disabled = true;
    const tick = () => { resendButton.textContent = `Resend code in ${left}s`; if (--left < 0) { clearInterval(resendInterval); resendButton.disabled = false; resendButton.textContent = 'Resend code'; } };
    tick(); resendInterval = setInterval(tick, 1000);
  }
  function readPendingRegistration() {
    try { return JSON.parse(sessionStorage.getItem('nolosha-pending-registration-v1') || 'null'); }
    catch (_) { try { sessionStorage.removeItem('nolosha-pending-registration-v1'); } catch (_) {} return null; }
  }
  document.querySelectorAll('.show-password').forEach(button => button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(input.type === 'text'));
    button.textContent = english() ? (input.type === 'text' ? 'Hide' : 'Show') : (input.type === 'text' ? 'Qari' : 'Muuji');
  }));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const name = form.querySelector('#name')?.value.trim() || '';
    if (isRegister && name.length < 2) return say(english() ? 'Enter a name with at least two characters.' : 'Geli magac ugu yaraan laba xaraf ah.');
    if (!window.NoloshaCloud) return say(english() ? 'The online service is not configured. Please contact the site owner.' : 'Adeegga online-ka lama diyaarin. La xiriir qofka maamula website-ka.');
    submit.disabled = true;
    try {
      if (isRegister) {
        pendingRegistration = { email, name, password };
        const result = await window.NoloshaCloud.signUp(email, password, name);
        if (result.token) return say(english() ? 'Supabase created this account without sending an OTP. Turn on Confirm email in Supabase Auth settings; this account is already created, so sign in.' : 'Supabase akoonka ayuu sameeyey isaga oo aan OTP dirin. Daar Confirm email ee Supabase Auth; akoonkan waa jiraa, sidaas darteed hadda gal.');
        sessionStorage.setItem('nolosha-pending-registration-v1', JSON.stringify({ email, name }));
        showVerification(email); cooldown();
        sayVerification(english() ? 'Supabase accepted the signup request. Check your inbox and spam folder for the verification code.' : 'Supabase wuu aqbalay codsiga diiwaangelinta. Ka eeg inbox-ka iyo spam-ka koodhka xaqiijinta.', 'success');
      } else startSession(await window.NoloshaCloud.signIn(email, password));
    } catch (error) {
      if (isRegister && error.status === 429) { sessionStorage.setItem('nolosha-pending-registration-v1', JSON.stringify({ email, name })); showVerification(email); cooldown(error.retryAfter || (emailRateLimited(error) ? 3600 : 60)); sayVerification(errorText(error)); }
      else say(errorText(error));
    } finally { submit.disabled = false; }
  });
  if (isRegister && verificationForm) {
    const saved = readPendingRegistration();
    if (saved?.email) {
      pendingRegistration = { email: String(saved.email), name: '', password: '' };
      showVerification(pendingRegistration.email);
      sayVerification(english() ? 'Enter your verification code. If it has expired, start registration again to request a new one.' : 'Geli koodhka xaqiijinta. Haddii uu dhacay, dib u bilow diiwaangelinta si koodh cusub loo codsado.');
    }
    verificationForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!verificationForm.reportValidity()) return;
      if (!pendingRegistration?.email) { sayVerification(english() ? 'Registration details expired. Start again to request a new code.' : 'Xogtii diiwaangelintu way dhammaatay. Dib u bilow si koodh cusub loo codsado.'); showRegistration(); return; }
      const button = verificationForm.querySelector('[type="submit"]'); button.disabled = true;
      try { startSession(await window.NoloshaCloud.verifyCode(pendingRegistration.email, verificationInput.value.trim())); }
      catch (error) {
        const invalidCode = error.status === 400 || error.status === 401 || error.status === 422;
        sayVerification(invalidCode ? (english() ? 'That verification code is incorrect or has expired. Check it or start registration again for a new code.' : 'Koodhka xaqiijintu waa khaldan yahay ama wuu dhacay. Hubi koodhka ama dib u bilow diiwaangelinta si koodh cusub loo helo.') : errorText(error));
      }
      finally { button.disabled = false; }
    });
    resendButton?.addEventListener('click', async () => {
      if (!pendingRegistration?.email) return sayVerification(english() ? 'Start registration again to request a new code.' : 'Dib u bilow diiwaangelinta si koodh cusub loo codsado.');
      resendButton.disabled = true;
      try { await window.NoloshaCloud.resendSignup(pendingRegistration.email); cooldown(); sayVerification(english() ? 'Supabase accepted the resend request. Check your inbox and spam folder.' : 'Supabase wuu aqbalay codsiga dib-u-dirista. Ka eeg inbox-ka iyo spam-ka.', 'success'); }
      catch (error) { if (error.status === 429) cooldown(error.retryAfter || (emailRateLimited(error) ? 3600 : 60)); else resendButton.disabled = false; sayVerification(errorText(error)); }
    });
    document.getElementById('change-email')?.addEventListener('click', () => { clearInterval(resendInterval); pendingRegistration = null; sessionStorage.removeItem('nolosha-pending-registration-v1'); verificationForm.reset(); syncVerificationCode(); showRegistration(); });
  }
})();
