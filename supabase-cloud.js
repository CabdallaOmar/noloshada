(() => {
  const config = window.NoloshaSupabaseConfig;
  if (!config?.url || !config?.key) throw new Error('Supabase configuration is missing.');
  const base = config.url.replace(/\/$/, '');
  const headers = (token, extra = {}) => ({ apikey: config.key, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra });
  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${base}${path}`, { ...options, headers: headers(options.token, { ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }), body: options.body === undefined ? undefined : JSON.stringify(options.body) });
    } catch (_) { throw new Error('Supabase lama lala xiriiri karo. Hubi internet-ka.'); }
    let result = {};
    try { result = await response.json(); } catch (_) {}
    if (!response.ok) {
      const error = new Error(result.msg || result.message || result.error_description || result.error || `Codsigu wuu fashilmay (${response.status}).`);
      error.status = response.status;
      error.code = result.code || result.error_code || '';
      error.authError = ['PGRST301', 'invalid_token', 'session_not_found'].includes(error.code);
      error.retryAfter = Number(response.headers.get('Retry-After')) || 0;
      if (error.code === 'PGRST205' && /nolosha_account_data/.test(path)) error.message = 'Supabase planner table is missing. Run supabase/schema.sql in the Supabase SQL Editor.';
      throw error;
    }
    return result;
  }
  const auth = (path, body) => request(`/auth/v1/${path}`, { method: 'POST', body });
  function account(result) {
    const user = result.user || result;
    const metadata = user.user_metadata || {};
    return { email: user.email, name: metadata.name || metadata.full_name || user.email?.split('@')[0] || '', token: result.access_token || '', refreshToken: result.refresh_token || '', expiresAt: result.expires_at || (Date.now() / 1000 + (result.expires_in || 3600)), userId: user.id };
  }
  function requireSessionTokens(session) {
    if (!session?.token || !session.refreshToken || !session.userId || !session.email) throw Object.assign(new Error('Kalfadhiga account-ka oo dhamaystiran lama helin. Mar kale gal.'), { status: 401 });
    return session;
  }
  async function signUp(email, password, name) {
    const result = await auth('signup', { email, password, data: { name } });
    const user = result.user || result;
    if (Array.isArray(user.identities) && user.identities.length === 0) throw Object.assign(new Error('This email is already registered. Sign in or use another email address.'), { status: 409, code: 'user_already_registered' });
    return account(result);
  }
  async function resendSignup(email) { return auth('resend', { email, type: 'signup' }); }
  async function verifyCode(email, code) { return requireSessionTokens(account(await auth('verify', { email, token: code, type: 'signup' }))); }
  async function signIn(email, password) { return requireSessionTokens(account(await auth('token?grant_type=password', { email, password }))); }
  async function recover(email) { return auth('recover', { email, redirect_to: `${location.origin}${location.pathname.replace(/[^/]*$/, 'login.html')}` }); }
  async function refresh(session) {
    if (!session?.refreshToken) throw Object.assign(new Error('Kalfadhigu wuu dhammaaday. Mar kale gal.'), { status: 401 });
    const updated = requireSessionTokens(account(await auth('token?grant_type=refresh_token', { refresh_token: session.refreshToken })));
    sessionStorage.setItem('nolosha-session', JSON.stringify(updated));
    return updated;
  }
  async function validSession() {
    let session;
    try { session = JSON.parse(sessionStorage.getItem('nolosha-session') || 'null'); } catch (_) {}
    requireSessionTokens(session);
    if (Number(session.expiresAt || 0) < Date.now() / 1000 + 90) session = await refresh(session);
    return session;
  }
  async function loadData(options = {}) {
    const session = await validSession();
    const rows = await request(`/rest/v1/nolosha_account_data?select=data,updated_at&user_id=eq.${encodeURIComponent(session.userId)}`, { token: session.token, keepalive: options.keepalive === true });
    return { data: Array.isArray(rows) && rows.length ? rows[0].data : null, updatedAt: Array.isArray(rows) && rows.length ? rows[0].updated_at : '' };
  }
  async function saveData(data, options = {}) {
    const session = await validSession();
    const previousUpdatedAt = Date.parse(options.expectedUpdatedAt || '');
    const nextUpdatedAt = Math.max(Date.now(), Number.isFinite(previousUpdatedAt) ? previousUpdatedAt + 1 : 0);
    const body = { user_id: session.userId, data, updated_at: new Date(nextUpdatedAt).toISOString() };
    let path = '/rest/v1/nolosha_account_data?on_conflict=user_id';
    let method = 'POST';
    let prefer = 'resolution=merge-duplicates,return=minimal';
    if (options.insertOnly) {
      path = '/rest/v1/nolosha_account_data';
      prefer = 'return=representation';
    } else if (options.expectedUpdatedAt) {
      path = `/rest/v1/nolosha_account_data?user_id=eq.${encodeURIComponent(session.userId)}&updated_at=eq.${encodeURIComponent(options.expectedUpdatedAt)}`;
      method = 'PATCH';
      prefer = 'return=representation';
    }
    const result = await request(path, { method, token: session.token, keepalive: options.keepalive === true, headers: { Prefer: prefer }, body });
    if ((options.insertOnly || options.expectedUpdatedAt) && (!Array.isArray(result) || !result.length)) {
      throw Object.assign(new Error('Cloud-ku xog ayuu beddelay intii kaydintu socotay.'), { status: 409, code: 'sync_conflict' });
    }
    return { ok: true };
  }
  window.NoloshaCloud = { signUp, resendSignup, verifyCode, signIn, recover, loadData, saveData, validSession };
})();
