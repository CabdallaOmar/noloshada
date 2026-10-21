/* Noloshaada account storage. Supabase is the source of truth. */
(function () {
  const prefix = 'nolosha-data:';
  const pendingPrefix = 'nolosha-pending-cloud:';
  function userKey() {
    let email = new URLSearchParams(location.search).get('preview') === '1' ? 'preview@nolosha.app' : '';
    try { email = email || JSON.parse(sessionStorage.getItem('nolosha-session') || '{}').email || 'preview@nolosha.app'; } catch (_) { email ||= 'preview@nolosha.app'; }
    return prefix + email.toLowerCase();
  }
  function defaultConsistencyButtons() {
    return Array.from({ length: 100 }, (_, index) => ({ id: `consistency-${index + 1}`, name: String(index + 1), active: false, builtIn: true }));
  }
  function emptyState() {
    return { tasks: [], todoTasks: [], habits: [], goals: [], subjects: [], journal: [], consistencyButtons: defaultConsistencyButtons(), consistencyButtonsSeeded: true, settings: { theme: 'dark', name: '', weekStart: 'monday', timeFormat: '24h', weeklyReview: '', weeklyReviews: {} }, timer: { mode: 'focus', focusMinutes: 25, breakMinutes: 5, secondsLeft: 1500, running: false, cycles: 0 }, studySessions: [] };
  }
  function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
  function isDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function isTime(value) { return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
  function boundedInteger(value, min, max, fallback) {
    const number = Number(value);
    return Number.isInteger(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }
  function uniqueById(items) {
    const seen = new Set();
    return items.filter(item => {
      if (typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(item.id) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }
  function normalizeTasks(items) {
    return uniqueById(items
      .filter(task => typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim() && isDate(task.date)))
      .map(task => {
        const start = isTime(task.start) ? task.start : '';
        const candidateEnd = isTime(task.end) ? task.end : '';
        const end = candidateEnd && start && candidateEnd > start ? candidateEnd : '';
        const normalizedTask = { ...task };
        delete normalizedTask.emailReminder;
        delete normalizedTask.reminderAt;
        delete normalizedTask.timeZone;
        return {
          ...normalizedTask,
          start,
          end,
          priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
          done: task.done === true,
          category: typeof task.category === 'string' ? task.category : 'Shakhsi',
          notes: typeof task.notes === 'string' ? task.notes : ''
        };
      });
  }
  function normalize(candidate) {
    const fresh = emptyState();
    if (!isRecord(candidate)) return fresh;
    const settings = isRecord(candidate.settings) ? { ...candidate.settings } : {};
    delete settings.taskCategories;
    delete settings.consistencyEmailEnabled;
    delete settings.consistencyEmailTime;
    delete settings.timeZone;
    const timer = isRecord(candidate.timer) ? candidate.timer : {};
    const normalized = { ...fresh, ...candidate };
    for (const key of ['tasks', 'todoTasks', 'habits', 'goals', 'subjects', 'journal', 'studySessions']) {
      normalized[key] = Array.isArray(candidate[key]) ? candidate[key].filter(isRecord) : fresh[key];
    }
    normalized.tasks = normalizeTasks(normalized.tasks);
    normalized.todoTasks = normalizeTasks(normalized.todoTasks);
    normalized.habits = uniqueById(normalized.habits
      .filter(habit => typeof habit.id === 'string' && typeof habit.name === 'string' && habit.name.trim()))
      .map(habit => ({ ...habit, days: Array.isArray(habit.days) ? habit.days.filter(isDate) : [], icon: typeof habit.icon === 'string' ? habit.icon : '✳' }));
    normalized.goals = uniqueById(normalized.goals
      .filter(goal => typeof goal.id === 'string' && typeof goal.title === 'string' && goal.title.trim()))
      .map(goal => {
        const progress = Number(goal.progress);
        return {
          ...goal,
          deadline: isDate(goal.deadline) ? goal.deadline : '',
          progress: Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0,
          milestone: typeof goal.milestone === 'string' ? goal.milestone : ''
        };
      });
    normalized.subjects = uniqueById(normalized.subjects
      .filter(subject => typeof subject.id === 'string' && typeof subject.name === 'string' && subject.name.trim()))
      .map(subject => {
      const target = Number(subject.target);
      const hoursDone = Number(subject.hoursDone);
      return {
        ...subject,
        target: Number.isFinite(target) ? Math.min(1000, Math.max(0, target)) : 10,
        hoursDone: Number.isFinite(hoursDone) ? Math.min(1_000_000, Math.max(0, hoursDone)) : 0
      };
    });
    normalized.journal = normalized.journal.filter(entry => isDate(entry.date) && typeof entry.text === 'string');
    normalized.studySessions = normalized.studySessions
      .filter(entry => isDate(entry.date))
      .map(entry => {
        const minutes = Number(entry.minutes);
        const createdAt = Number(entry.createdAt);
        return {
          ...entry,
          minutes: Number.isFinite(minutes) ? Math.min(1440, Math.max(0, minutes)) : 0,
          createdAt: Number.isFinite(createdAt) ? createdAt : 0,
          subject: typeof entry.subject === 'string' ? entry.subject : '',
          label: typeof entry.label === 'string' ? entry.label : ''
        };
      });
    const savedConsistencyButtons = uniqueById((Array.isArray(candidate.consistencyButtons) ? candidate.consistencyButtons : [])
      .filter(button => isRecord(button) && typeof button.name === 'string' && button.name.trim())
      .map(button => {
        const now = new Date();
        const today = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
        return { ...button, name: button.name.trim().slice(0, 60), active: button.active === true, activeDate: isDate(button.activeDate) ? button.activeDate : (button.active === true ? today : ''), builtIn: button.builtIn === true };
      }));
    normalized.consistencyButtons = candidate.consistencyButtonsSeeded === true
      ? savedConsistencyButtons
      : uniqueById([...defaultConsistencyButtons(), ...savedConsistencyButtons]);
    normalized.consistencyButtonsSeeded = true;
    normalized.settings = {
      ...fresh.settings,
      ...settings,
      name: typeof settings.name === 'string' ? settings.name.slice(0, 45) : '',
      theme: settings.theme === 'light' ? 'light' : 'dark',
      weekStart: settings.weekStart === 'sunday' ? 'sunday' : 'monday',
      timeFormat: settings.timeFormat === '12h' ? '12h' : '24h',
      weeklyReview: typeof settings.weeklyReview === 'string' ? settings.weeklyReview : '',
      weeklyReviews: isRecord(settings.weeklyReviews)
        ? Object.fromEntries(Object.entries(settings.weeklyReviews).filter(([date, text]) => isDate(date) && typeof text === 'string'))
        : {}
    };
    const focusMinutes = boundedInteger(timer.focusMinutes, 5, 90, fresh.timer.focusMinutes);
    const breakMinutes = boundedInteger(timer.breakMinutes, 1, 30, fresh.timer.breakMinutes);
    const mode = timer.mode === 'break' ? 'break' : 'focus';
    const modeSeconds = (mode === 'break' ? breakMinutes : focusMinutes) * 60;
    normalized.timer = {
      ...fresh.timer,
      ...timer,
      mode,
      focusMinutes,
      breakMinutes,
      secondsLeft: boundedInteger(timer.secondsLeft, 0, modeSeconds, modeSeconds),
      running: false,
      cycles: boundedInteger(timer.cycles, 0, Number.MAX_SAFE_INTEGER, fresh.timer.cycles)
    };
    return normalized;
  }
  function readLegacy() {
    try {
      const saved = localStorage.getItem(userKey());
      if (!saved) return null;
      return normalize(JSON.parse(saved));
    } catch (error) {
      console.warn('Noloshaada legacy browser copy could not be read', error);
      return null;
    }
  }
  function clearLegacy() {
    try { localStorage.removeItem(userKey()); } catch (error) { console.warn('Noloshaada legacy browser copy could not be removed', error); }
  }
  function pendingKey(session = currentSession()) {
    const owner = session?.userId || session?.email;
    return owner ? pendingPrefix + String(owner).toLowerCase() : null;
  }
  function readPending() {
    const key = pendingKey();
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) latestSnapshots.set(key, raw);
      return raw ? { key, raw, data: normalize(JSON.parse(raw)) } : null;
    } catch (error) {
      console.warn('Noloshaada unsynced cloud copy could not be read', error);
      return null;
    }
  }
  function writePending(snapshot, session) {
    const key = pendingKey(session);
    if (!key) return false;
    latestSnapshots.set(key, snapshot);
    localStorage.setItem(key, snapshot);
    return true;
  }
  function clearPending(snapshot, session) {
    const key = pendingKey(session);
    if (!key) return;
    try {
      if (latestSnapshots.get(key) !== snapshot) return;
      localStorage.removeItem(key);
      latestSnapshots.delete(key);
    }
    catch (error) { console.warn('Noloshaada synced local copy could not be cleared', error); }
  }
  let state = emptyState();
  let serverSaveTimer = null;
  let serverSaveQueue = Promise.resolve();
  const latestSnapshots = new Map();
  function queueServerSave(snapshot, session) {
    serverSaveQueue = serverSaveQueue.catch(() => {}).then(async () => {
      await window.NoloshaCloud.saveData(JSON.parse(snapshot));
      clearPending(snapshot, session);
      clearLegacy();
      document.dispatchEvent(new CustomEvent('nolosha:server-saved'));
      return true;
    }).catch(error => {
      console.warn('Noloshaada local server save failed', error);
      document.dispatchEvent(new CustomEvent('nolosha:server-save-error', { detail: { message: error.message, status: error.status || 0, code: error.code || '', authError: error.authError === true } }));
      return false;
    });
    return serverSaveQueue;
  }
  function currentSession() {
    try { return JSON.parse(sessionStorage.getItem('nolosha-session') || 'null'); } catch (_) { return null; }
  }
  function syncServer() {
    const session = currentSession();
    if (!session?.token || new URLSearchParams(location.search).get('preview') === '1') return;
    const snapshot = JSON.stringify(state);
    try { writePending(snapshot, session); }
    catch (error) {
      document.dispatchEvent(new CustomEvent('nolosha:local-backup-error', { detail: { message: error.message } }));
    }
    document.dispatchEvent(new CustomEvent('nolosha:server-saving'));
    clearTimeout(serverSaveTimer);
    serverSaveTimer = setTimeout(() => { serverSaveTimer = null; queueServerSave(snapshot, session); }, 450);
  }
  function save() {
    try {
      syncServer();
      document.dispatchEvent(new CustomEvent('nolosha:saved'));
      return true;
    } catch (error) {
      console.warn('Noloshaada storage could not be saved', error);
      return false;
    }
  }
  function flush() {
    if (new URLSearchParams(location.search).get('preview') === '1') return Promise.resolve(true);
    const session = currentSession();
    if (!session?.token) return Promise.reject(new Error('Fadlan mar kale gal akoonka.'));
    const snapshot = JSON.stringify(state);
    try { writePending(snapshot, session); }
    catch (error) { return Promise.reject(error); }
    clearTimeout(serverSaveTimer);
    serverSaveTimer = null;
    return queueServerSave(snapshot, session).then(saved => {
      if (!saved) throw new Error('Xogta account-ka cloud-ka lama kaydin.');
      return true;
    });
  }
  function retryPending() {
    const pending = readPending();
    const session = currentSession();
    if (!pending || !session?.token) return Promise.resolve(true);
    return queueServerSave(pending.raw, session);
  }
  window.addEventListener('online', () => { retryPending(); });
  window.addEventListener('pagehide', () => {
    const session = currentSession();
    if (!session?.token || new URLSearchParams(location.search).get('preview') === '1') return;
    try { writePending(JSON.stringify(state), session); }
    catch (error) { console.warn('Noloshaada last-chance local backup failed', error); }
  });
  function load(next) { state = normalize(next); return state; }
  function update(mutator) { mutator(state); return save(); }
  function replace(next) {
    const previous = state;
    state = normalize(next);
    if (save()) return true;
    state = previous;
    return false;
  }
  window.NoloshaStore = { get: () => state, save, flush, update, load, replace, legacy: readLegacy, clearLegacy, pending: readPending, clearPending, retryPending, emptyState };
})();
