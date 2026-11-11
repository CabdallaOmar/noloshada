/* Noloshaada account storage. Supabase is the source of truth. */
(function () {
  const prefix = 'nolosha-data:';
  const pendingPrefix = 'nolosha-pending-cloud:';
  const syncCollections = ['tasks', 'todoTasks', 'habits', 'goals', 'subjects', 'journal', 'studySessions', 'consistencyButtons'];
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
  function toTimestamp(value) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) return number;
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function uniqueById(items) {
    const seen = new Set();
    return items.filter(item => {
      if (typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(item.id) || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }
  function recordId(collection, item) {
    if (typeof item?.id === 'string' && item.id) return item.id;
    return collection === 'journal' && typeof item?.date === 'string' ? item.date : null;
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
    normalized._syncUpdatedAt = toTimestamp(candidate._syncUpdatedAt);
    normalized._syncSettingsUpdatedAt = isRecord(candidate._syncSettingsUpdatedAt)
      ? Object.fromEntries(Object.entries(candidate._syncSettingsUpdatedAt).map(([key, value]) => [key, toTimestamp(value)]).filter(([, value]) => value > 0))
      : {};
    normalized._syncWeeklyReviewUpdatedAt = isRecord(candidate._syncWeeklyReviewUpdatedAt)
      ? Object.fromEntries(Object.entries(candidate._syncWeeklyReviewUpdatedAt).map(([key, value]) => [key, toTimestamp(value)]).filter(([, value]) => value > 0))
      : {};
    for (const key of ['tasks', 'todoTasks', 'habits', 'goals', 'subjects', 'journal', 'studySessions']) {
      normalized[key] = Array.isArray(candidate[key]) ? candidate[key].filter(isRecord) : fresh[key];
    }
    normalized.tasks = normalizeTasks(normalized.tasks);
    normalized.todoTasks = normalizeTasks(normalized.todoTasks);
    normalized.habits = uniqueById(normalized.habits
      .filter(habit => typeof habit.id === 'string' && typeof habit.name === 'string' && habit.name.trim()))
      .map(habit => {
        const days = Array.isArray(habit.days) ? habit.days.filter(isDate) : [];
        const active = typeof habit.active === 'boolean' ? habit.active : days.length > 0;
        return { ...habit, active, days, icon: typeof habit.icon === 'string' ? habit.icon : '✳' };
      });
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
        const active = button.active === true || isDate(button.activeDate);
        return { ...button, name: button.name.trim().slice(0, 60), active, activeDate: '', builtIn: button.builtIn === true };
      }));
    normalized.consistencyButtons = candidate.consistencyButtonsSeeded === true
      ? savedConsistencyButtons
      : uniqueById([...savedConsistencyButtons, ...defaultConsistencyButtons()]);
    normalized.consistencyButtonsSeeded = true;
    const sourceTombstones = isRecord(candidate._syncTombstones) ? candidate._syncTombstones : {};
    normalized._syncTombstones = {};
    for (const key of syncCollections) {
      const deleted = new Map();
      (Array.isArray(sourceTombstones[key]) ? sourceTombstones[key] : []).forEach(entry => {
        if (!isRecord(entry) || typeof entry.id !== 'string') return;
        const updatedAt = toTimestamp(entry.updatedAt);
        if (!updatedAt) return;
        const previous = deleted.get(entry.id);
        if (!previous || updatedAt > previous.updatedAt) deleted.set(entry.id, { id: entry.id, updatedAt });
      });
      normalized._syncTombstones[key] = Array.from(deleted.values());
      normalized[key] = (normalized[key] || []).filter(item => {
        const tombstone = deleted.get(recordId(key, item));
        if (!tombstone) return true;
        const itemUpdatedAt = Math.max(toTimestamp(item._syncUpdatedAt), toTimestamp(item.updatedAt), toTimestamp(item.createdAt));
        return itemUpdatedAt > tombstone.updatedAt;
      });
    }
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
  function mergeData(remoteCandidate, localCandidate, remoteUpdatedAt = 0, localUpdatedAt = 0) {
    const remote = isRecord(remoteCandidate) ? normalize(remoteCandidate) : null;
    const local = isRecord(localCandidate) ? normalize(localCandidate) : null;
    if (!remote) return local || emptyState();
    if (!local) return remote;
    const remoteVersion = Math.max(toTimestamp(remote._syncUpdatedAt), toTimestamp(remoteUpdatedAt));
    const localVersion = Math.max(toTimestamp(local._syncUpdatedAt), toTimestamp(localUpdatedAt));
    const localWins = localVersion >= remoteVersion;
    const preferred = localWins ? local : remote;
    const merged = normalize(localWins ? { ...remote, ...local } : { ...local, ...remote });
    merged.settings = { ...emptyState().settings };
    const settingKeys = new Set([...Object.keys(remote.settings), ...Object.keys(local.settings)]);
    settingKeys.delete('weeklyReviews');
    for (const key of settingKeys) {
      const remoteHas = Object.prototype.hasOwnProperty.call(remote.settings, key);
      const localHas = Object.prototype.hasOwnProperty.call(local.settings, key);
      const remoteFieldVersion = toTimestamp(remote._syncSettingsUpdatedAt[key]) || remoteVersion;
      const localFieldVersion = toTimestamp(local._syncSettingsUpdatedAt[key]) || localVersion;
      const useLocal = localHas && (!remoteHas || localFieldVersion > remoteFieldVersion || (localFieldVersion === remoteFieldVersion && localWins));
      if (useLocal) merged.settings[key] = local.settings[key];
      else if (remoteHas) merged.settings[key] = remote.settings[key];
      else if (localHas) merged.settings[key] = local.settings[key];
    }
    merged._syncSettingsUpdatedAt = { ...remote._syncSettingsUpdatedAt, ...local._syncSettingsUpdatedAt };
    for (const key of settingKeys) {
      merged._syncSettingsUpdatedAt[key] = Math.max(toTimestamp(remote._syncSettingsUpdatedAt[key]), toTimestamp(local._syncSettingsUpdatedAt[key]));
    }
    const weekKeys = new Set([
      ...Object.keys(remote.settings.weeklyReviews || {}),
      ...Object.keys(local.settings.weeklyReviews || {}),
      ...Object.keys(remote._syncWeeklyReviewUpdatedAt),
      ...Object.keys(local._syncWeeklyReviewUpdatedAt)
    ]);
    merged.settings.weeklyReviews = {};
    merged._syncWeeklyReviewUpdatedAt = {};
    for (const key of weekKeys) {
      const remoteHas = Object.prototype.hasOwnProperty.call(remote.settings.weeklyReviews || {}, key);
      const localHas = Object.prototype.hasOwnProperty.call(local.settings.weeklyReviews || {}, key);
      const remoteFieldVersion = toTimestamp(remote._syncWeeklyReviewUpdatedAt[key]) || (remoteHas ? remoteVersion : 0);
      const localFieldVersion = toTimestamp(local._syncWeeklyReviewUpdatedAt[key]) || (localHas ? localVersion : 0);
      const useLocal = localHas && (!remoteHas || localFieldVersion > remoteFieldVersion || (localFieldVersion === remoteFieldVersion && localWins));
      const useRemote = remoteHas && !useLocal && (localHas || remoteFieldVersion >= localFieldVersion);
      if (useLocal) merged.settings.weeklyReviews[key] = local.settings.weeklyReviews[key];
      else if (useRemote) merged.settings.weeklyReviews[key] = remote.settings.weeklyReviews[key];
      merged._syncWeeklyReviewUpdatedAt[key] = Math.max(remoteFieldVersion, localFieldVersion);
    }
    merged.timer = { ...preferred.timer };
    merged._syncUpdatedAt = Math.max(remoteVersion, localVersion);
    merged._syncTombstones = {};
    for (const key of syncCollections) {
      const tombstones = new Map();
      for (const entry of [...(remote._syncTombstones[key] || []), ...(local._syncTombstones[key] || [])]) {
        const previous = tombstones.get(entry.id);
        if (!previous || entry.updatedAt > previous.updatedAt) tombstones.set(entry.id, entry);
      }
      merged._syncTombstones[key] = Array.from(tombstones.values());
      const items = new Map();
      const addItems = (records, sourceVersion) => {
        for (const item of records || []) {
          const id = recordId(key, item);
          if (!id) continue;
          const itemVersion = toTimestamp(item._syncUpdatedAt)
            || toTimestamp(item.updatedAt)
            || toTimestamp(item.createdAt)
            || sourceVersion;
          const previous = items.get(id);
          if (!previous || itemVersion >= previous.version) items.set(id, { item, version: itemVersion });
        }
      };
      addItems(remote[key], remoteVersion);
      addItems(local[key], localVersion);
      merged[key] = Array.from(items.values(), entry => entry.item);
    }
    return normalize(merged);
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
      if (!raw) return null;
      const stored = JSON.parse(raw);
      const isEnvelope = isRecord(stored) && stored.version === 1 && isRecord(stored.data);
      const data = normalize(isEnvelope ? stored.data : stored);
      const snapshot = JSON.stringify(data);
      latestSnapshots.set(key, snapshot);
      return { key, raw: snapshot, data, savedAt: isEnvelope ? toTimestamp(stored.savedAt) : 0 };
    } catch (error) {
      console.warn('Noloshaada unsynced cloud copy could not be read', error);
      return null;
    }
  }
  function writePending(snapshot, session) {
    const key = pendingKey(session);
    if (!key) return false;
    latestSnapshots.set(key, snapshot);
    localStorage.setItem(key, JSON.stringify({ version: 1, savedAt: Date.now(), data: JSON.parse(snapshot) }));
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
  let lastSnapshot = JSON.stringify(state);
  let serverSaveQueue = Promise.resolve();
  let retryTimer = null;
  let retryDelay = 5000;
  const latestSnapshots = new Map();
  function schedulePendingRetry(error) {
    if (error?.authError || error?.status === 401 || !currentSession()?.token || new URLSearchParams(location.search).get('preview') === '1' || retryTimer) return;
    const delay = retryDelay;
    retryDelay = Math.min(retryDelay * 2, 60000);
    retryTimer = setTimeout(() => {
      retryTimer = null;
      retryPending();
    }, delay);
  }
  function comparableRecord(record) {
    const copy = { ...record };
    delete copy._syncUpdatedAt;
    return JSON.stringify(copy);
  }
  function markChanges() {
    let previous;
    try { previous = JSON.parse(lastSnapshot); } catch (_) { previous = emptyState(); }
    const now = Math.max(Date.now(), toTimestamp(state._syncUpdatedAt) + 1);
    const settingsUpdatedAt = { ...(state._syncSettingsUpdatedAt || {}) };
    const weeklyReviewUpdatedAt = { ...(state._syncWeeklyReviewUpdatedAt || {}) };
    const previousSettings = previous.settings || {};
    const currentSettings = state.settings || {};
    for (const key of new Set([...Object.keys(previousSettings), ...Object.keys(currentSettings)])) {
      if (key !== 'weeklyReviews' && JSON.stringify(previousSettings[key]) !== JSON.stringify(currentSettings[key])) settingsUpdatedAt[key] = now;
    }
    const previousReviews = previousSettings.weeklyReviews || {};
    const currentReviews = currentSettings.weeklyReviews || {};
    for (const key of new Set([...Object.keys(previousReviews), ...Object.keys(currentReviews)])) {
      if (JSON.stringify(previousReviews[key]) !== JSON.stringify(currentReviews[key])) weeklyReviewUpdatedAt[key] = now;
    }
    state._syncSettingsUpdatedAt = settingsUpdatedAt;
    state._syncWeeklyReviewUpdatedAt = weeklyReviewUpdatedAt;
    const tombstones = { ...(state._syncTombstones || {}) };
    for (const key of syncCollections) {
      const before = Array.isArray(previous[key]) ? previous[key] : [];
      const current = Array.isArray(state[key]) ? state[key] : [];
      const beforeById = new Map(before.map(item => [recordId(key, item), item]).filter(([id]) => id));
      const currentIds = new Set(current.map(item => recordId(key, item)).filter(Boolean));
      const deletedById = new Map((Array.isArray(tombstones[key]) ? tombstones[key] : []).map(item => [item.id, item]));
      for (const item of current) {
        const id = recordId(key, item);
        if (!id) continue;
        const old = beforeById.get(id);
        if (!old || comparableRecord(old) !== comparableRecord(item)) item._syncUpdatedAt = now;
      }
      for (const old of before) {
        const id = recordId(key, old);
        if (id && !currentIds.has(id)) deletedById.set(id, { id, updatedAt: now });
      }
      tombstones[key] = Array.from(deletedById.values());
    }
    state._syncTombstones = tombstones;
    state._syncUpdatedAt = now;
    lastSnapshot = JSON.stringify(state);
  }
  function queueServerSave(snapshot, session, options = {}) {
    serverSaveQueue = serverSaveQueue.catch(() => {}).then(async () => {
      const localData = JSON.parse(snapshot);
      let merged;
      let saved = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const remote = await window.NoloshaCloud.loadData({ keepalive: options.keepalive === true });
        merged = mergeData(remote.data, localData, remote.updatedAt, options.localUpdatedAt);
        const keepalive = options.keepalive === true && new TextEncoder().encode(JSON.stringify(merged)).length < 60000;
        try {
          await window.NoloshaCloud.saveData(merged, {
            keepalive,
            insertOnly: !remote.data,
            expectedUpdatedAt: remote.data ? remote.updatedAt : ''
          });
          saved = true;
          break;
        } catch (error) {
          if (error.status !== 409 && error.code !== 'sync_conflict') throw error;
        }
      }
      if (!saved) throw Object.assign(new Error('Cloud-ku xog cusub ayuu helay. Isku dayga kaydinta mar kale ayuu u baahan yahay.'), { status: 409, code: 'sync_conflict' });
      if (JSON.stringify(state) === snapshot) {
        state = merged;
        lastSnapshot = JSON.stringify(state);
      }
      const key = pendingKey(session);
      const isLatestSnapshot = !!key && latestSnapshots.get(key) === snapshot;
      clearPending(snapshot, session);
      clearLegacy();
      retryDelay = 5000;
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      if (isLatestSnapshot) document.dispatchEvent(new CustomEvent('nolosha:server-saved'));
      return true;
    }).catch(error => {
      console.warn('Noloshaada local server save failed', error);
      schedulePendingRetry(error);
      document.dispatchEvent(new CustomEvent('nolosha:server-save-error', { detail: { message: error.message, status: error.status || 0, code: error.code || '', authError: error.authError === true } }));
      return false;
    });
    return serverSaveQueue;
  }
  function currentSession() {
    try { return JSON.parse(sessionStorage.getItem('nolosha-session') || 'null'); } catch (_) { return null; }
  }
  function syncServer() {
    if (new URLSearchParams(location.search).get('preview') === '1') {
      localStorage.setItem(userKey(), JSON.stringify(state));
      document.dispatchEvent(new CustomEvent('nolosha:preview-saved'));
      return;
    }
    const session = currentSession();
    if (!session?.token) return;
    const snapshot = JSON.stringify(state);
    try { writePending(snapshot, session); }
    catch (error) {
      document.dispatchEvent(new CustomEvent('nolosha:local-backup-error', { detail: { message: error.message } }));
    }
    document.dispatchEvent(new CustomEvent('nolosha:server-saving'));
    return queueServerSave(snapshot, session, { keepalive: true });
  }
  function save() {
    try {
      markChanges();
      syncServer();
      document.dispatchEvent(new CustomEvent('nolosha:saved'));
      return true;
    } catch (error) {
      console.warn('Noloshaada storage could not be saved', error);
      return false;
    }
  }
  function flush(options = {}) {
    if (new URLSearchParams(location.search).get('preview') === '1') return Promise.resolve(true);
    const session = currentSession();
    if (!session?.token) return Promise.reject(new Error('Fadlan mar kale gal akoonka.'));
    const snapshot = JSON.stringify(state);
    try { writePending(snapshot, session); }
    catch (error) { return Promise.reject(error); }
    return queueServerSave(snapshot, session, options).then(saved => {
      if (!saved) throw new Error('Xogta account-ka cloud-ka lama kaydin.');
      return true;
    });
  }
  function retryPending() {
    const pending = readPending();
    const session = currentSession();
    if (!pending || !session?.token) return Promise.resolve(true);
    return queueServerSave(pending.raw, session, { localUpdatedAt: pending.savedAt });
  }
  window.addEventListener('online', () => {
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
    retryDelay = 5000;
    retryPending();
  });
  window.addEventListener('pagehide', () => {
    const session = currentSession();
    if (!session?.token || new URLSearchParams(location.search).get('preview') === '1') return;
    try {
      writePending(JSON.stringify(state), session);
      flush({ keepalive: true }).catch(error => console.warn('Noloshaada last-chance cloud save failed', error));
    }
    catch (error) { console.warn('Noloshaada last-chance local backup failed', error); }
  });
  function load(next, updatedAt = 0) {
    state = normalize(next);
    state._syncUpdatedAt = Math.max(state._syncUpdatedAt, toTimestamp(updatedAt));
    lastSnapshot = JSON.stringify(state);
    return state;
  }
  function update(mutator) { mutator(state); return save(); }
  function replace(next) {
    const previous = state;
    state = normalize(next);
    if (save()) return true;
    state = previous;
    return false;
  }
  window.NoloshaStore = { get: () => state, save, flush, update, load, replace, legacy: readLegacy, clearLegacy, pending: readPending, clearPending, retryPending, mergeData, emptyState };
})();
