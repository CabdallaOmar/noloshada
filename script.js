 (async () => {
  const previewMode = new URLSearchParams(location.search).get('preview') === '1';
  let session;
  try { session = JSON.parse(sessionStorage.getItem('nolosha-session') || 'null'); } catch (_) { session = null; }
  if (previewMode) session = { email: 'preview@nolosha.app', name: 'Aamina', startedAt: Date.now() };
  if ((!session || !session.email) && !previewMode) { location.replace('login.html'); return; }
  if (!previewMode && (!session.token || !session.userId)) { try { sessionStorage.removeItem('nolosha-session'); } catch (_) {} location.replace('login.html'); return; }

  const store = window.NoloshaStore;
  let accountLoadError = null;
  let recoveredLocalCopy = false;
  if (!previewMode && session?.token) {
    try {
      session = await window.NoloshaCloud.validSession();
      const result = await window.NoloshaCloud.loadData();
      const remoteData = result.data;
      const pending = store.pending();
      const legacyData = store.legacy();
      if (pending) {
        store.load(pending.data);
        await window.NoloshaCloud.saveData(pending.data);
        store.clearPending(pending.raw, session);
        store.clearLegacy();
      }
      else if (remoteData) { store.load(remoteData); store.clearLegacy(); }
      else if (legacyData) {
        const initialData = legacyData;
        await window.NoloshaCloud.saveData(initialData);
        store.load(initialData);
      }
      else {
        const initialData = remoteData || legacyData || store.get();
        await window.NoloshaCloud.saveData(initialData);
        store.load(initialData);
      }
    } catch (error) {
      accountLoadError = error;
      if (error.status === 401) {
        try { sessionStorage.removeItem('nolosha-session'); } catch (_) {}
        location.replace('login.html');
        return;
      }
      const pending = store.pending();
      if (pending) { store.load(pending.data); recoveredLocalCopy = true; }
      else console.warn('Could not load account data from server.', error);
    }
  }
  const app = document.getElementById('app-content');
  if (accountLoadError && !recoveredLocalCopy) {
    app.innerHTML = '<section class="card"><h1>Account data could not be loaded</h1><p>Check your internet connection and Supabase setup. Your cloud data has not been changed.</p><button class="button button-primary" type="button" id="retry-account-load">Retry</button></section>';
    document.getElementById('storage-status').textContent = 'Account data is waiting for the cloud connection.';
    document.getElementById('retry-account-load').addEventListener('click', () => location.reload());
    return;
  }
  if (recoveredLocalCopy) document.getElementById('storage-status').textContent = 'Xogtu qalabkan ayay ku kaydsan tahay; cloud-ku wuxuu sugayaa xiriir.';
  else document.getElementById('storage-status').textContent = 'Xogta account-ka cloud-ka waa la kaydiyey.';
  let state = store.get();
  const modal = document.getElementById('modal-backdrop');
  const taskForm = document.getElementById('task-form');
  const categorySelect = document.getElementById('task-category');
  let view = 'overview';
  let plannerDate = todayISO();
  let monthCursor = new Date(); monthCursor.setDate(1);
  let selectedCalendarDate = todayISO();
  let taskFilter = 'all';
  let searchTerm = '';
  let todoFilter = 'all';
  let todoSearch = '';
  let timerInterval = null;
  let timerDeadline = null;
  const names = { overview: 'Guudmar', daily: 'Qorshaha maanta', tasks: 'To-Do List', weekly: 'Toddobaadka', monthly: 'Bisha', time: 'Waqtiga & diiradda', study: 'Waxbarasho', habits: 'Caadooyinka', consistency: 'Joogtayn', goals: 'Yoolal & qoraal', analytics: 'Horumarka', settings: 'Dejinta' };
  const requestedView = new URLSearchParams(location.search).get('view');
  if (names[requestedView]) view = requestedView;
  let weekdays = localizedWeekdays('long');
  let shortDays = localizedWeekdays('short');

  if (previewMode && !state.previewSeeded) {
    const yesterday = isoForOffset(todayISO(), -1);
    state.tasks = [
      { id: crypto.randomUUID(), title: 'Morning reading', date: todayISO(), start: '08:00', end: '08:30', priority: 'low', category: 'Study', notes: '30 minutes of reading', done: true },
      { id: crypto.randomUUID(), title: 'Project plan', date: todayISO(), start: '10:30', end: '11:30', priority: 'high', category: 'Work', notes: 'Prepare the next steps', done: false },
      { id: crypto.randomUUID(), title: 'Walk and rest', date: todayISO(), start: '13:00', end: '13:30', priority: 'medium', category: 'Health', notes: '', done: false },
      { id: crypto.randomUUID(), title: 'Review the biology lesson', date: yesterday, start: '16:00', priority: 'high', category: 'Study', notes: 'Chapter 4', done: false },
      { id: crypto.randomUUID(), title: 'Plan the week', date: isoForOffset(todayISO(), 1), start: '09:00', priority: 'medium', category: 'Personal', notes: '', done: false }
    ];
    const lastWeek = Array.from({ length: 7 }, (_, i) => isoForOffset(todayISO(), i - 6));
    state.habits = [
      { id: crypto.randomUUID(), name: 'Read for 20 minutes', icon: '⌑', days: lastWeek.filter((_, i) => [0, 1, 3, 4, 6].includes(i)) },
      { id: crypto.randomUUID(), name: 'Drink enough water', icon: '◈', days: lastWeek.filter((_, i) => [0, 1, 2, 4, 5, 6].includes(i)) },
      { id: crypto.randomUUID(), name: 'Walk or exercise', icon: '✳', days: lastWeek.filter((_, i) => [1, 3, 5].includes(i)) }
    ];
    state.subjects = [
      { id: crypto.randomUUID(), name: 'Biology', target: 12, hoursDone: 8.5 },
      { id: crypto.randomUUID(), name: 'English', target: 8, hoursDone: 5.5 },
      { id: crypto.randomUUID(), name: 'Mathematics', target: 10, hoursDone: 4 }
    ];
    state.goals = [
      { id: crypto.randomUUID(), title: 'Finish the project', deadline: isoForOffset(todayISO(), 12), progress: 65, milestone: 'Next step: review' },
      { id: crypto.randomUUID(), title: 'Read two books this month', deadline: isoForOffset(todayISO(), 25), progress: 40, milestone: 'First book: 80%' }
    ];
    state.journal = [{ id: crypto.randomUUID(), date: yesterday, text: 'I finished my important tasks today. Tomorrow, I want to set aside more time for studying.' }];
    state.studySessions = [
      { id: crypto.randomUUID(), date: todayISO(), minutes: 25, subject: 'Biology', label: 'Focus Pomodoro', createdAt: Date.now() - 7200000 },
      { id: crypto.randomUUID(), date: todayISO(), minutes: 25, subject: 'English', label: 'Reading and writing', createdAt: Date.now() - 3600000 }
    ];
    state.settings.name = 'Aamina'; state.settings.theme = 'dark'; state.timer.cycles = 2; state.previewSeeded = true;
    save();
  }

  function todayISO(date = new Date()) { const y = date.getFullYear(); const m = `${date.getMonth() + 1}`.padStart(2, '0'); const d = `${date.getDate()}`.padStart(2, '0'); return `${y}-${m}-${d}`; }
  function parseDate(value) { const [y, m, d] = (value || todayISO()).split('-').map(Number); return new Date(y, m - 1, d, 12); }
  function currentLocale() { return window.NoloshaI18n ? window.NoloshaI18n.getLocale() : 'so-SO'; }
  function localizedText(somali, english) { return window.NoloshaI18n?.getLanguage() === 'en' ? english : somali; }
  function localizedWeekdays(style) {
    const offset = state.settings.weekStart === 'sunday' ? 6 : 0;
    const firstDay = new Date(2024, 0, 1 + offset, 12);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(firstDay); date.setDate(firstDay.getDate() + index);
      return date.toLocaleDateString(currentLocale(), { weekday: style });
    });
  }
  function dateLabel(value, options = { weekday: 'long', month: 'long', day: 'numeric' }) { return parseDate(value).toLocaleDateString(currentLocale(), options); }
  function isoForOffset(value, offset) { const d = parseDate(value); d.setDate(d.getDate() + offset); return todayISO(d); }
  function weekDayIndex(date) {
    const firstDay = state.settings.weekStart === 'sunday' ? 0 : 1;
    return (date.getDay() - firstDay + 7) % 7;
  }
  function weekStart(value) { const d = parseDate(value); d.setDate(d.getDate() - weekDayIndex(d)); return todayISO(d); }
  function esc(value = '') { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function save() { const ok = store.save(); if (!ok) toast('Kaydintu way fashilantay. Hubi booska browser-ka.', true); state = store.get(); }
  function getName() { return state.settings.name || session.name || 'Saaxiib'; }
  function greeting() { const hour = new Date().getHours(); return hour < 12 ? 'Subax wanaagsan' : hour < 17 ? 'Galab wanaagsan' : 'Fiid wanaagsan'; }
  function taskDone(task) { return !!task.done; }
  function isOverdue(task) { return !task.done && task.date < todayISO(); }
  function formatTime(value) {
    if (!value || state.settings.timeFormat !== '12h' || !/^\d{2}:\d{2}$/.test(value)) return value || '';
    const [hour, minute] = value.split(':').map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(currentLocale(), { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  function dueText(task) { return task.start ? formatTime(task.start) : (task.date === todayISO() ? 'Maanta' : dateLabel(task.date, { month: 'short', day: 'numeric' })); }
  function priorityLabel(p) { return p === 'high' ? 'Sare' : p === 'low' ? 'Hoose' : 'Dhexdhexaad'; }
  function priorityClass(p) { return p === 'high' ? 'high' : p === 'low' ? 'low' : 'medium'; }
  function taskStats(items = state.tasks) { const total = items.length; const completed = items.filter(taskDone).length; const overdue = items.filter(isOverdue).length; return { total, completed, pending: total - completed - overdue, overdue, pct: total ? Math.round(completed / total * 100) : 0 }; }
  function goalProgress(goal) {
    const value = Number(goal.progress);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  }
  function sessionMinutes(session) {
    const value = Number(session.minutes);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  function empty(title, note, icon = '✳') { return `<div class="empty-state"><span>${icon}</span><b>${esc(title)}</b>${esc(note)}</div>`; }
  function setTopbar() {
    document.getElementById('crumb-label').textContent = names[view] || names.overview;
    document.getElementById('top-date').textContent = new Date().toLocaleDateString(currentLocale(), { weekday: 'short', month: 'short', day: 'numeric' });
    document.getElementById('sidebar-name').textContent = getName();
    const initial = getName().trim().charAt(0).toUpperCase() || 'N';
    document.getElementById('sidebar-avatar').textContent = initial;
    document.getElementById('top-avatar').textContent = initial;
    document.body.dataset.activeView = view;
    document.body.classList.toggle('light-theme', state.settings.theme === 'light');
    document.getElementById('theme-toggle').textContent = state.settings.theme === 'light' ? '☾' : '☼';
    document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  }
  function render() {
    state = store.get(); setTopbar();
    const templates = { overview: renderOverview, daily: renderDaily, tasks: renderTodos, weekly: renderWeekly, monthly: renderMonthly, time: renderTime, study: renderStudy, habits: renderHabits, consistency: renderConsistency, goals: renderGoals, analytics: renderAnalytics, settings: renderSettings };
    app.innerHTML = (templates[view] || renderOverview)();
    bindViewForms();
    refreshTimerDisplays();
  }
  function changeView(next) {
    if (!names[next]) return;
    view = next; document.getElementById('sidebar').classList.remove('open'); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function pageHead(kicker, title, description, right = '') {
    return `<div class="page-head"><div><span class="section-kicker">${esc(kicker)}</span><h1>${title}</h1><p>${description}</p></div>${right}</div>`;
  }
  function statCard(title, number, note, icon, color = '') { return `<article class="card stat-card"><div class="stat-head"><span>${title}</span><span class="stat-icon ${color}">${icon}</span></div><div class="stat-number">${number}</div><div class="stat-note">${note}</div><span class="stat-spark"><i></i><i></i><i></i><i></i><i></i><i></i></span></article>`; }
  function renderOverview() {
    const dayTasks = state.tasks.filter(t => t.date === todayISO()).sort((a, b) => (a.start || '99:99').localeCompare(b.start || '99:99'));
    const stats = taskStats(); const dayStats = taskStats(dayTasks);
    const weekStartDate = weekStart(todayISO());
    const weekDays = Array.from({ length: 7 }, (_, i) => isoForOffset(weekStartDate, i));
    const habitCount = state.habits.length; const doneHabits = state.habits.filter(h => (h.days || []).includes(todayISO())).length;
    const timer = state.timer; const mins = Math.floor((timer.secondsLeft || 0) / 60); const secs = (timer.secondsLeft || 0) % 60;
    const weekDone = state.tasks.filter(t => t.done && t.date >= weekStartDate && t.date <= isoForOffset(weekStartDate, 6)).length;
    const taskHtml = dayTasks.length ? dayTasks.slice(0, 5).map(t => `<div class="task-row ${t.done ? 'is-done' : ''}"><button class="task-check ${t.done ? 'checked' : ''}" data-action="task-toggle" data-id="${esc(t.id)}" aria-label="Calaamadee">${t.done ? '✓' : ''}</button><div class="task-copy"><b>${esc(t.title)}</b><small>${esc(t.category || 'Shakhsi')} · ${esc(t.notes || priorityLabel(t.priority))}</small></div><span class="task-time">${esc(dueText(t))}</span><span class="priority ${priorityClass(t.priority)}">${priorityLabel(t.priority)}</span></div>`).join('') : empty('Qorshe weli ma jiro', 'Ku dar hawshaada ugu horreysa si aad u bilowdo.', '＋');
    const weekHtml = weekDays.map((d, i) => { const count = state.tasks.filter(t => t.date === d).length; const isToday = d === todayISO(); return `<button class="week-day ${isToday ? 'today' : ''}" data-action="open-day" data-date="${d}"><small>${shortDays[i]}</small><b>${parseDate(d).getDate()}</b>${Array.from({ length: Math.min(count, 3) }, () => '<i></i>').join('')}</button>`; }).join('');
    return `${pageHead(`MAALINTAADA · ${new Date().getFullYear()}`, `${greeting()}, ${esc(getName().split(' ')[0])}.`, `Waa ${dateLabel(todayISO())}. Aan si deggan ku bilowno.`, `<span class="date-pill">◷ &nbsp;<span id="live-clock">--:--</span></span>`)}
      <section class="grid stats-grid">${statCard('Hawlaha oo dhan', stats.total, `<strong>${stats.completed} waa dhammaatay</strong> ilaa hadda`, '☷')}${statCard('La dhammeeyey', stats.completed, `<strong>${stats.pct}%</strong> heerka dhammeystirka`, '✓', 'blue')}${statCard('Harsan', stats.pending, `${stats.overdue ? `<strong style="color:var(--rose)">${stats.overdue} dib u dhacay</strong>` : 'Wax dib u dhacay ma jiro'}`, '◷', 'orange')}${statCard('Horumarka maanta', `${dayStats.pct}<span style="font:500 12px var(--font);color:var(--muted)">%</span>`, `${dayStats.completed} ka mid ah ${dayStats.total} hawlood`, '↗', 'rose')}</section>
      <section class="grid overview-grid"><article class="card"><div class="card-title"><div><h2>Qorshaha maanta</h2><p>${dateLabel(todayISO(), { weekday: 'long', month: 'long', day: 'numeric' })}</p></div><button class="subtle-link" data-action="switch-view" data-view="daily">Eeg dhammaan →</button></div><div class="task-list">${taskHtml}</div></article>
      <article class="card progress-card"><div class="card-title"><div><h2>Horumarkaaga maanta</h2><p>Tallaabo kasta waa horumar.</p></div><span class="pill-label">MAANTA</span></div><div class="progress-main"><div class="progress-ring" style="--progress:${dayStats.pct}%"><div><b>${dayStats.pct}%</b><small>dhammaystir</small></div></div><div class="progress-meta"><b>${dayStats.completed} / ${dayStats.total} hawlood</b><p>${dayStats.pct >= 70 ? 'Si fiican ayaad u socotaa. Sii wad!' : 'Hawl yar oo dhammaatayba waa guul.'}</p><span class="accent-text">${habitCount ? `${doneHabits} caado oo maanta la qabtay` : 'Ku dar caado kuu muhiim ah'}</span></div></div><div class="habit-mini">${weekDays.map(d => `<span class="${state.habits.some(h => (h.days || []).includes(d)) ? 'done' : ''}">${state.habits.some(h => (h.days || []).includes(d)) ? '✓' : '·'}</span>`).join('')}</div><div class="habit-days">${shortDays.map(d => `<span>${d}</span>`).join('')}</div></article></section>
      <section class="grid bottom-grid"><article class="card"><div class="card-title"><div><h2>Toddobaadkaaga</h2><p>${weekDone} hawlood oo dhammaatay usbuucan</p></div><button class="subtle-link" data-action="switch-view" data-view="weekly">Qorshee usbuuca →</button></div><div class="week-strip">${weekHtml}</div></article><article class="card"><div class="card-title"><div><h2>Waqtiga diiradda</h2><p>Wareegga xiga: ${timer.mode === 'focus' ? 'diirad' : 'nasasho'}</p></div><span class="pill-label">POMODORO</span></div><div class="focus-widget"><div class="focus-time" id="focus-time">${`${mins}`.padStart(2, '0')}:${`${secs}`.padStart(2, '0')}</div><div class="focus-copy"><p>${timer.cycles || 0} wareeg ayaa la dhammaystiray</p><div class="focus-controls"><button class="round-control" data-action="timer-toggle" aria-label="Bilow ama hakad geli">${timer.running ? 'Ⅱ' : '▶'}</button><button class="round-control" data-action="timer-reset" aria-label="Dib u bilow">↺</button><button class="subtle-link" data-action="switch-view" data-view="time">Faahfaahin</button></div></div></div></article></section>`;
  }

  function renderDaily() {
    const current = state.tasks.filter(t => t.date === plannerDate).sort((a, b) => (Number(b.updatedAt || b.createdAt) || 0) - (Number(a.updatedAt || a.createdAt) || 0));
    const visible = current;
    const search = `<label class="search-box">&#x2315; <input id="task-search" value="${esc(searchTerm)}" placeholder="Raadi hawlaha..." aria-label="Raadi hawlaha"></label>`;
    const actions = `<button class="button button-primary button-small" data-action="add-task" data-date="${plannerDate}">&#xFF0B; &nbsp; Hawl cusub</button>`;
    const rows = visible.map(task => {
      const status = task.done ? 'completed' : isOverdue(task) ? 'overdue' : 'pending';
      return `<article class="todo-item ${task.done ? 'is-done' : ''}" data-task-id="${esc(task.id)}" data-status="${status}" data-search="${esc((task.title + ' ' + (task.category || '') + ' ' + (task.notes || '')).toLowerCase())}"><button class="task-check ${task.done ? 'checked' : ''}" data-action="task-toggle" data-id="${esc(task.id)}" aria-label="Calaamadee hawsha inay dhammaatay">${task.done ? '&#x2713;' : ''}</button><div class="task-copy todo-item-copy"><b>${esc(task.title)}</b><small>${esc(task.category || 'Shakhsi')}${task.notes ? ` &#xB7; ${esc(task.notes)}` : ''}</small><div class="todo-item-meta"><span class="todo-date">${esc(task.start ? formatTime(task.start) : 'Waqti lama cayimin')}${task.end ? ` &#x2013; ${esc(formatTime(task.end))}` : ''}</span><span class="priority ${priorityClass(task.priority)}">${priorityLabel(task.priority)}</span><span class="task-completion ${task.done ? 'completed' : 'pending'}">${task.done ? localizedText('La dhamaystiray', 'Completed') : localizedText('Weli dhiman', 'Pending')}</span></div></div><span class="task-actions"><button class="mini-action" data-action="edit-task" data-id="${esc(task.id)}" title="Wax ka beddel">&#x270E;</button><button class="mini-action" data-action="delete-task" data-id="${esc(task.id)}" title="Tirtir">&#x00D7;</button></span></article>`;
    }).join('');
    const table = visible.length ? `<div class="todo-layout todo-list-flat">${rows}<div id="task-search-empty" class="empty-state search-empty" hidden><span>&#x2315;</span><b>Wax natiijo ah lama helin</b><small>Raadintaadu hawl ma helin.</small></div></div>` : empty(current.length ? 'Wax natiijo ah lama helin' : 'Maalintaadu way bannaan tahay', current.length ? 'Beddel raadinta ama shaandhaynta.' : 'Ku dar hawshaada koowaad si aad u qorshayso maalinta.', '&#x2637;');
    return `${pageHead('QORSHE MAALINLE', 'Qorshahaaga maanta', 'Hawsha kasta si cad u qor, si deggan u dhammee.', actions)}<div class="toolbar"><button class="icon-button" data-action="date-shift" data-days="-1" aria-label="Maalintii hore">&#x2039;</button><span class="date-pill">${dateLabel(plannerDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span><button class="icon-button" data-action="date-shift" data-days="1" aria-label="Maalinta xigta">&#x203A;</button><button class="button button-quiet button-small" data-action="date-today">Maanta</button>${search}</div><article class="card task-table">${table}</article>`;
  }
  function taskTableRow(t) { return `<div class="task-table-row" data-task-id="${esc(t.id)}" data-search="${esc((t.title + ' ' + (t.category || '') + ' ' + (t.notes || '')).toLowerCase())}"><div class="task-row ${t.done ? 'is-done' : ''}" style="padding:0;border:0"><button class="task-check ${t.done ? 'checked' : ''}" data-action="task-toggle" data-id="${esc(t.id)}">${t.done ? '✓' : ''}</button><div class="task-copy"><b>${esc(t.title)}</b><small>${esc(t.category || 'Shakhsi')}${t.notes ? ` · ${esc(t.notes)}` : ''}</small></div></div><span class="task-time">${esc(t.start ? formatTime(t.start) : 'Waqti lama cayimin')}${t.end ? `–${esc(formatTime(t.end))}` : ''}</span><span class="priority ${priorityClass(t.priority)}">${priorityLabel(t.priority)}</span><span class="task-time">${t.done ? 'Dhammaatay' : isOverdue(t) ? '<span style="color:var(--rose)">Dib u dhac</span>' : 'Harsan'}</span><span class="task-actions"><button class="mini-action" data-action="edit-task" data-id="${esc(t.id)}" title="Wax ka beddel">✎</button><button class="mini-action" data-action="delete-task" data-id="${esc(t.id)}" title="Tirtir">×</button></span></div>`; }

  function filterDropdown(id, value, options) {
    const selected = options.find(option => option.value === value) || options[0];
    return `<div class="filter-dropdown"><select class="filter-select-native" id="${id}" tabindex="-1" aria-hidden="true">${options.map(option => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}</select><button type="button" class="filter-trigger" aria-haspopup="listbox" aria-expanded="false"><span>${esc(selected.label)}</span><i aria-hidden="true"></i></button><div class="filter-menu" role="listbox" aria-label="${esc(selected.label)}" hidden>${options.map(option => `<button type="button" class="filter-option" role="option" data-filter-value="${option.value}" aria-selected="${option.value === value}">${esc(option.label)}</button>`).join('')}</div></div>`;
  }
  document.addEventListener('click', event => {
    const current = event.target.closest('.filter-dropdown');
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      if (dropdown !== current) { dropdown.querySelector('.filter-menu').hidden = true; dropdown.querySelector('.filter-trigger').setAttribute('aria-expanded', 'false'); }
    });
    const option = event.target.closest('.filter-option[data-filter-value]');
    if (!option) return;
    const dropdown = option.closest('.filter-dropdown');
    const select = dropdown.querySelector('.filter-select-native');
    select.value = option.dataset.filterValue;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  function renderTodos() {
    const allTasks = state.todoTasks.slice().sort((a, b) => a.date.localeCompare(b.date) || (a.start || '').localeCompare(b.start || ''));
    const visible = allTasks;
    const stats = taskStats(allTasks);
    const rows = visible.map(task => {
      const status = task.done ? 'completed' : isOverdue(task) ? 'overdue' : 'pending';
      const search = `${task.title} ${task.category || ''} ${task.notes || ''}`.toLowerCase();
      return `<article class="todo-item ${task.done ? 'is-done' : ''}" data-task-id="${esc(task.id)}" data-status="${status}" data-search="${esc(search)}"><button class="task-check ${task.done ? 'checked' : ''}" data-action="task-toggle" data-list="todo" data-id="${esc(task.id)}" aria-label="Mark task complete">${task.done ? '&#x2713;' : ''}</button><div class="task-copy todo-item-copy"><b>${esc(task.title)}</b><small>${esc(task.category || 'Personal')}${task.notes ? ` &#xB7; ${esc(task.notes)}` : ''}</small><div class="todo-item-meta"><span class="todo-date">${esc(dateLabel(task.date, { month: 'short', day: 'numeric', year: 'numeric' }))}${task.start ? ` &#xB7; ${esc(formatTime(task.start))}` : ''}</span><span class="priority ${priorityClass(task.priority)}">${priorityLabel(task.priority)}</span><span class="task-completion ${task.done ? 'completed' : 'pending'}">${task.done ? localizedText('La dhamaystiray', 'Completed') : localizedText('Weli dhiman', 'Pending')}</span></div></div><span class="task-actions"><button class="mini-action" data-action="edit-task" data-list="todo" data-id="${esc(task.id)}" title="Edit task">&#x270E;</button><button class="mini-action" data-action="delete-task" data-list="todo" data-id="${esc(task.id)}" title="Delete task">&#x00D7;</button></span></article>`;
    }).join('');
    const content = visible.length ? `<div class="todo-layout todo-list-flat">${rows}<div id="todo-search-empty" class="empty-state search-empty" hidden><span>&#x2315;</span><b>No matching tasks</b><small>Try a different search.</small></div></div>` : empty(allTasks.length ? 'No matching tasks' : 'Your list is empty', allTasks.length ? 'Try a different search.' : 'Add your first task to get started.', '&#x2713;');
    return `${pageHead('ALL TASKS', 'To-Do List', 'Manage every task across your schedule.', `<button class="button button-primary button-small" data-action="add-task" data-list="todo" data-date="${todayISO()}">&#xFF0B; &nbsp; Add task</button>`)}<div class="todo-summary"><div><span>All tasks</span><b>${stats.total}</b></div><div><span>To do</span><b>${stats.pending}</b></div><div><span>Completed</span><b>${stats.completed}</b></div><div><span>Overdue</span><b>${stats.overdue}</b></div></div><div class="toolbar"><label class="search-box">&#x2315; <input id="todo-search" value="${esc(todoSearch)}" placeholder="Search tasks or categories&#x2026;" aria-label="Search To-Do List"></label></div>${content}`;
  }

  function renderWeekly() {
    const first = weekStart(plannerDate);
    const days = Array.from({ length: 7 }, (_, i) => isoForOffset(first, i));
    const reviewText = state.settings.weeklyReviews?.[first] ?? (first === weekStart(todayISO()) ? state.settings.weeklyReview : '');
    const board = days.map((date, i) => {
      const tasks = state.tasks.filter(t => t.date === date).sort((a, b) => (a.start || '99:99').localeCompare(b.start || '99:99'));
      return `<div class="week-column ${date === todayISO() ? 'today' : ''}"><div class="week-column-head"><div><b>${weekdays[i]}</b><small>${parseDate(date).getDate()} ${parseDate(date).toLocaleDateString(currentLocale(), { month: 'short' })}</small></div><button class="mini-action" data-action="add-task" data-date="${date}" title="Hawl ku dar">＋</button></div>${tasks.length ? tasks.map(t => `<div class="week-task ${t.priority === 'high' ? 'high' : ''}" data-action="edit-task" data-id="${esc(t.id)}"><b>${esc(t.title)}</b><small>${t.start ? esc(formatTime(t.start)) + ' · ' : ''}${t.done ? '✓ Dhammaatay' : esc(t.category || 'Hawl')}</small></div>`).join('') : `<button class="subtle-link" data-action="open-day" data-date="${date}">+ hawl ku dar</button>`}</div>`;
    }).join('');
    const total = state.tasks.filter(t => t.date >= first && t.date <= isoForOffset(first, 6)); const stats = taskStats(total);
    return `${pageHead('QORSHE TODDOBAADLE', 'Toddobaad si fiican loo qorsheeyey', `${dateLabel(first, { month: 'short', day: 'numeric' })} — ${dateLabel(isoForOffset(first, 6), { month: 'short', day: 'numeric', year: 'numeric' })}`, `<div class="toolbar" style="margin:0"><button class="icon-button" data-action="week-shift" data-weeks="-1">‹</button><button class="button button-quiet button-small" data-action="week-today">Toddobaadkan</button><button class="icon-button" data-action="week-shift" data-weeks="1">›</button></div>`)}<div class="day-tabs"><span class="date-pill">${total.length} hawlood</span><span class="date-pill">${stats.completed} dhammaatay</span><span class="date-pill">${stats.pending} harsan</span><span class="date-pill">${stats.overdue} dib u dhacay</span></div><div class="week-board">${board}</div><article class="card" style="margin-top:14px"><div class="card-title"><div><h2>Dib-u-eegista toddobaadka</h2><p>Qor waxa shaqeeyey iyo waxa aad rabto inaad hagaajiso.</p></div></div><textarea class="field" id="weekly-review" maxlength="5000" style="width:100%;min-height:82px;resize:vertical" placeholder="Maxaa kuu qabsoomay toddobaadkan?">${esc(reviewText || '')}</textarea><div style="text-align:right;margin-top:8px"><button class="button button-primary button-small" data-action="save-week-review">Kaydi dib-u-eegista</button></div></article>`;
  }

  function renderMonthly() {
    const y = monthCursor.getFullYear(), m = monthCursor.getMonth();
    const first = new Date(y, m, 1, 12); const startOffset = weekDayIndex(first); const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: Math.ceil((startOffset + daysInMonth) / 7) * 7 }, (_, index) => {
      const dayNum = index - startOffset + 1; const d = new Date(y, m, dayNum, 12); const iso = todayISO(d); const currentMonth = d.getMonth() === m;
      const tasks = state.tasks.filter(t => t.date === iso).slice(0, 2);
      return `<div class="calendar-cell ${currentMonth ? '' : 'other'} ${iso === todayISO() ? 'today' : ''} ${iso === selectedCalendarDate ? 'selected' : ''}" data-action="calendar-select" data-date="${iso}" role="button" tabindex="0"><span>${d.getDate()}</span>${tasks.map(t => `<i class="calendar-mark ${t.priority === 'high' ? 'high' : ''}">${esc(t.title)}</i>`).join('')}</div>`;
    }).join('');
    const monthName = monthCursor.toLocaleDateString(currentLocale(), { month: 'long', year: 'numeric' });
    const monthTasks = state.tasks.filter(t => t.date.slice(0, 7) === `${y}-${`${m + 1}`.padStart(2, '0')}`);
    const monthlyDone = monthTasks.filter(taskDone).length;
    const monthGoals = state.goals.filter(g => !g.deadline || g.deadline.slice(0, 7) === `${y}-${`${m + 1}`.padStart(2, '0')}`);
    const selectedTasks = state.tasks.filter(t => t.date === selectedCalendarDate);
    return `${pageHead('QORSHE BILLE', 'Bishaada, aragti fog', 'La soco waqtiyada muhiimka ah iyo yoolasha bisha.', `<button class="button button-primary button-small" data-action="add-task" data-date="${selectedCalendarDate}">＋ &nbsp; Hawl ku dar</button>`)}<div class="calendar-side"><article class="card"><div class="calendar-head"><h2>${monthName}</h2><div class="calendar-nav"><button class="icon-button" data-action="month-shift" data-months="-1">‹</button><button class="icon-button" data-action="month-shift" data-months="1">›</button></div></div><div class="calendar-grid">${shortDays.map(d => `<div class="calendar-dow">${d}</div>`).join('')}${cells}</div><div class="chart-legend"><span>${monthTasks.length} hawlood bishan</span><b>${monthlyDone} dhammaatay</b></div></article><aside class="card"><div class="card-title"><div><h2>${dateLabel(selectedCalendarDate, { weekday: 'long', month: 'long', day: 'numeric' })}</h2><p>Hawlaha maalintan loo qorsheeyey</p></div></div>${selectedTasks.length ? `<div class="task-list">${selectedTasks.map(t => `<div class="task-row ${t.done ? 'is-done' : ''}"><button class="task-check ${t.done ? 'checked' : ''}" data-action="task-toggle" data-id="${esc(t.id)}">${t.done ? '✓' : ''}</button><div class="task-copy"><b>${esc(t.title)}</b><small>${esc(t.start ? formatTime(t.start) : 'Waqti furan')} · ${esc(t.category || 'Hawl')}</small></div></div>`).join('')}</div>` : empty('Maalintan waxba ma jiraan', 'Dooro maalin kale ama hawl cusub ku dar.', '◷')}<div class="card-title" style="margin-top:19px"><div><h2>Hadafyada bisha</h2><p>${monthGoals.length} yool ayaa lala socdaa</p></div></div>${monthGoals.length ? `<div class="month-goals">${monthGoals.slice(0, 5).map(g => `<div class="month-goal"><span>${esc(g.title)}</span><small>${goalProgress(g)}%</small></div>`).join('')}</div>` : `<p class="stat-note">Yoolal bisha ma jiraan weli.</p>`}</aside></div>`;
  }

  function shiftMonth(months) {
    if (!Number.isInteger(months) || months === 0) return false;
    const selectedDay = parseDate(selectedCalendarDate).getDate();
    monthCursor.setMonth(monthCursor.getMonth() + months);
    const daysInTargetMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    selectedCalendarDate = todayISO(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), Math.min(selectedDay, daysInTargetMonth), 12));
    return true;
  }

  function formatTimer() { const left = Math.max(0, state.timer.secondsLeft || 0); return `${`${Math.floor(left / 60)}`.padStart(2, '0')}:${`${left % 60}`.padStart(2, '0')}`; }
  function renderTime() {
    const t = state.timer; const focusMin = t.focusMinutes || 25; const breakMin = t.breakMinutes || 5;
    const sessions = (state.studySessions || []).filter(s => s.date === todayISO()).sort((a, b) => b.createdAt - a.createdAt);
    const mins = sessions.reduce((sum, s) => sum + sessionMinutes(s), 0);
    return `${pageHead('WAQTIGA & MAAREYNTA', 'Waqtiga si xikmad leh u isticmaal', 'Diirad saar hal hawl, dabadeed naftaada nasasho sii.')}
      <div class="time-layout"><article class="card timer-card"><div class="timer-tabs"><button class="timer-tab ${t.mode === 'focus' ? 'active' : ''}" data-action="timer-mode" data-mode="focus">Diirad</button><button class="timer-tab ${t.mode === 'break' ? 'active' : ''}" data-action="timer-mode" data-mode="break">Nasasho</button></div><div class="timer-clock" id="timer-clock">${formatTimer()}</div><div class="timer-caption" id="timer-caption">${t.mode === 'focus' ? 'Waqtigaaga diiradda saar' : 'Nasasho yar qaado oo neefso'}</div><div class="timer-progress"><span style="width:${Math.min(100, Math.round((1 - (t.secondsLeft / ((t.mode === 'focus' ? focusMin : breakMin) * 60))) * 100))}%"></span></div><div class="timer-buttons"><button class="button button-primary" data-action="timer-toggle" aria-label="${t.running ? 'Hakad geli' : 'Bilow diiradda'}"><span aria-hidden="true">${t.running ? 'Ⅱ' : '▶'}</span><span class="timer-button-label">${t.running ? 'Hakad geli' : 'Bilow diiradda'}</span></button><button class="button button-quiet" data-action="timer-reset">Dib u bilow</button></div><div class="timer-settings"><label>Diirad <input id="focus-minutes" type="number" min="5" max="90" value="${focusMin}" ${t.running ? 'disabled' : ''}> daqiiqo</label><label>Nasasho <input id="break-minutes" type="number" min="1" max="30" value="${breakMin}" ${t.running ? 'disabled' : ''}> daqiiqo</label></div></article>
      <div class="grid"><article class="card"><div class="card-title"><div><h2>Waqtiga waxbarashada maanta</h2><p>Waqti aad si ula kac ah ugu qoondeysay</p></div><span class="stat-icon blue">⌑</span></div><div class="stat-number">${Math.floor(mins / 60)}<span style="font:500 12px var(--font);color:var(--muted)"> saac</span> ${mins % 60}<span style="font:500 12px var(--font);color:var(--muted)"> daqiiqo</span></div><div class="stat-note">${sessions.length} kulan oo maanta la qabtay</div><button class="button button-quiet button-small" style="margin-top:14px" data-action="log-study">+ Diiwaangeli 25 daqiiqo</button></article><article class="card"><div class="card-title"><div><h2>Kulammadii maanta</h2><p>Diirad iyo waqti waxbarasho</p></div></div>${sessions.length ? `<div class="session-list">${sessions.slice(0, 5).map(s => `<div class="session-item"><div><b>${esc(s.label || 'Kulan diirad')}</b><small> &#xB7; ${esc(s.subject || 'Waqti guud')}</small></div><div class="session-item-actions"><small>${sessionMinutes(s)} daqiiqo</small><button type="button" class="mini-action" data-action="study-session-delete" data-id="${esc(s.id)}" title="Kulankan tirtir" aria-label="Kulankan tirtir">&#x00D7;</button></div></div>`).join('')}</div>` : empty('Kulan weli ma jiro', 'Diiwaangeli kulan markaad dhammayso.', '◷')}</article></div></div>`;
  }

  function renderStudy() {
    const subjects = state.subjects || [];
    const totalTarget = subjects.reduce((n, s) => n + Number(s.target || 0), 0); const totalDone = subjects.reduce((n, s) => n + Number(s.hoursDone || 0), 0);
    const subjectCards = subjects.length ? subjects.map((s, index) => { const pct = s.target ? Math.min(100, Math.round((s.hoursDone || 0) / s.target * 100)) : 0; return `<article class="subject-card"><div class="subject-top"><span class="subject-icon">${['⌑', '⌘', '✳', '◈'][index % 4]}</span><button class="mini-action" data-action="subject-delete" data-id="${esc(s.id)}" title="Tirtir">×</button></div><h3>${esc(s.name)}</h3><p>${Number(s.hoursDone || 0).toFixed(1)} / ${Number(s.target || 0)} saac oo la qorsheeyey</p><div class="progress-line ${index % 2 ? 'blue' : ''}"><span style="width:${pct}%"></span></div><div class="subject-foot"><span>${pct}% la gaaray</span><button class="subtle-link" data-action="subject-session" data-id="${esc(s.id)}">+ 25 daqiiqo</button></div></article>`; }).join('') : empty('Maaddo weli lama darin', 'Ku dar maaddo si aad waqtiga waxbarashada ula socoto.', '⌑');
    return `${pageHead('WAXBARASHO & KORRIIN', 'Waxbarashadaada', 'La soco maaddooyinka, waqtiga iyo horumarkaaga.', `<span class="date-pill">${totalDone.toFixed(1)} / ${totalTarget.toFixed(1)} saac</span>`)}<div class="toolbar"><form id="subject-form" class="toolbar" style="margin:0;flex:1"><input class="field" name="subject" required maxlength="50" placeholder="Magaca maaddada" style="flex:1;min-width:150px"><input class="field" name="target" type="number" min="1" max="1000" step="1" value="10" aria-label="Saacadaha yoolka" style="width:125px"><button class="button button-primary button-small" type="submit">＋ Ku dar maaddo</button></form></div><div class="subject-grid">${subjectCards}</div><article class="card" style="margin-top:14px"><div class="card-title"><div><h2>Diiwaanka waxbarashada</h2><p>Kulan kasta wuxuu ku darsamaa waqtiga maaddada aad doorato.</p></div><button class="button button-quiet button-small study-focus-link" data-action="switch-view" data-view="time">Fur saacadda diiradda →</button></div><p class="stat-note">Casharrada iyo imtixaannada waxaad ku dari kartaa qaybta hawlaha adigoo dooranaya “Waxbarasho”.</p></article>`;
  }

  function streak(habit) { const days = new Set(habit.days || []); let cursor = parseDate(todayISO()); if (!days.has(todayISO())) cursor.setDate(cursor.getDate() - 1); let count = 0; while (days.has(todayISO(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); } return count; }
  function renderHabits() {
    const dates = Array.from({ length: 7 }, (_, i) => isoForOffset(todayISO(), i - 6));
    const habits = state.habits || [];
    const cards = habits.length ? habits.map(h => { const days = h.days || []; const doneToday = days.includes(todayISO()); return `<article class="habit-card"><div class="habit-top"><div class="subject-top" style="justify-content:flex-start"><span class="habit-icon">${esc(h.icon || '✳')}</span><div><h3 style="margin:0 0 3px">${esc(h.name)}</h3><p>${doneToday ? 'Maanta waa la qabtay' : 'Caado maalinle ah'}</p></div></div><button class="mini-action" data-action="habit-delete" data-id="${esc(h.id)}" title="Tirtir">×</button></div><div class="habit-week">${dates.map(d => `<button class="habit-day ${days.includes(d) ? 'done' : ''} ${d === todayISO() ? 'today' : ''}" data-action="habit-toggle" data-id="${esc(h.id)}" data-date="${d}" title="${dateLabel(d)}">${days.includes(d) ? '✓' : parseDate(d).getDate()}</button>`).join('')}</div><div class="habit-foot"><span>7-dii maalmood ee u dambeeyey</span><span class="habit-streak">🔥 ${streak(h)} maalmood</span></div></article>`; }).join('') : empty('Caado cusub ku dar', 'Caadooyinka yaryar ee joogtada ahi waxay keenaan isbeddel weyn.', '✳');
    return `${pageHead('JOOGTEYN & CAADO', 'Caadooyinkaaga', 'Maalin kasta calaamadee caadooyinka aad qabatay.', `<span class="date-pill">${habits.filter(h => (h.days || []).includes(todayISO())).length} / ${habits.length} maanta</span>`)}<div class="toolbar"><form id="habit-form" class="toolbar" style="margin:0;width:100%"><input class="field" name="habit" required maxlength="48" placeholder="Caado cusub, tusaale: Socod 20 daqiiqo" style="flex:1;min-width:180px"><button class="button button-primary button-small" type="submit">＋ Ku dar caado</button></form></div><div class="habit-grid">${cards}</div>`;
  }

  function renderConsistency() {
    const buttons = state.consistencyButtons || [];
    const activeToday = button => button.activeDate ? button.activeDate === todayISO() : !!button.active;
    const activeCount = buttons.filter(activeToday).length;
    const cards = buttons.length ? buttons.map(button => { const active = activeToday(button); return `<article class="consistency-card ${active ? 'is-active' : ''} ${button.builtIn ? 'is-default' : ''}"><button type="button" class="consistency-toggle" data-action="consistency-toggle" data-id="${esc(button.id)}" aria-pressed="${active ? 'true' : 'false'}"><span class="consistency-number">${esc(button.name)}</span><span class="consistency-status">${active ? '&#10003; Firfircoon' : '&#9675; Damsan'}</span></button><button type="button" class="mini-action consistency-delete" data-action="consistency-delete" data-id="${esc(button.id)}" aria-label="Adigu tirtir button-kan" title="Adigu tirtir">&times;</button></article>`; }).join('') : empty('Button weli ma jiro', 'Foomka kore ku dar buttons-kaaga gaarka ah.', '&#8635;');
    return `${pageHead('JOOGTEYN', 'Joogtayntaada', 'Maalin kasta dib u bilow, kadibna calaamadee waxa aad qabatay.', `<span class="date-pill">${activeCount} / ${buttons.length} active maanta</span>`)}<section class="card consistency-builder"><form id="consistency-form"><label for="consistency-label">Magaca button-ka gaarka ah</label><div class="consistency-add-row"><input class="field" id="consistency-label" name="button" required maxlength="60" placeholder="Tusaale: Akhri 10 bog"><button class="button button-primary button-small" type="submit">+ Ku dar button</button></div></form><p class="stat-note">Buttons-kaaga gaarka ah waxaad ku calaamadin kartaa waxyaabaha aad qabatay.</p></section><section class="consistency-grid" aria-label="Buttons-ka joogtaynta">${cards}</section>`;
  }

  function renderGoals() {
    const goals = state.goals || [];
    const cards = goals.length ? goals.map(g => { const pct = goalProgress(g); return `<article class="goal-card"><div class="goal-top"><span class="goal-mark">◎</span><button class="mini-action" data-action="goal-delete" data-id="${esc(g.id)}" title="Tirtir">×</button></div><h3>${esc(g.title)}</h3><p>${g.deadline ? `Wakhtiga kama dambaysta ah: ${dateLabel(g.deadline, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Yool shakhsi ah'}</p><div class="goal-progress"><div class="progress-line"><span style="width:${pct}%"></span></div><b>${pct}%</b></div><div class="goal-foot"><span>${g.milestone ? esc(g.milestone) : 'Hal tallaabo mar kasta'}</span><button class="subtle-link" data-action="goal-progress" data-id="${esc(g.id)}">+10%</button></div></article>`; }).join('') : empty('Yoolkaaga ugu horreeya ku dar', 'Qor waxa aad rabto inaad gaadho, dabadeed la soco horumarka.', '◎');
    const entries = (state.journal || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    return `${pageHead('YOOLAL & ISMILICSIGA', 'Yoolal iyo fikirro', 'Horumarkaaga qor, guulahaagana la soco.', `<span class="date-pill">${goals.filter(g => Number(goalProgress(g)) >= 100).length} yool oo la gaaray</span>`)}<div class="toolbar"><form id="goal-form" class="toolbar" style="margin:0;width:100%"><input class="field" name="goal" required maxlength="70" placeholder="Yool cusub, tusaale: Buug akhri" style="flex:1;min-width:170px"><input class="field" name="deadline" type="date" aria-label="Taariikhda yoolka"><button class="button button-primary button-small" type="submit">＋ Ku dar yool</button></form></div><div class="goal-grid">${cards}</div><div class="grid bottom-grid" style="margin-top:14px"><article class="card journal-box"><div class="card-title"><div><h2>Qoraalka maanta</h2><p>Maxaad baratay ama ku faraxsan tahay maanta?</p></div><span class="stat-icon">✎</span></div><form id="journal-form"><textarea name="entry" maxlength="1200" placeholder="Wax kasta oo maskaxdaada ku jira halkan ku qor..."></textarea><div style="display:flex;justify-content:flex-end;margin-top:8px"><button type="submit" class="button button-primary button-small">Kaydi qoraalka</button></div></form></article><article class="card"><div class="card-title"><div><h2>Qoraalladii hore</h2><p>Milicsigaaga maalinlaha ah</p></div></div>${entries.length ? entries.map(e => `<div class="journal-entry"><div class="journal-entry-head"><time>${dateLabel(e.date, { weekday: 'short', month: 'short', day: 'numeric' })}</time><button type="button" class="mini-action journal-delete" data-action="journal-delete" data-id="${esc(e.id || e.date)}" title="Tirtir qoraalkan" aria-label="Tirtir qoraalkan">×</button></div><p>${esc(e.text)}</p></div>`).join('') : empty('Qoraal weli ma jiro', 'Milicsigaaga koowaad halkan ayuu ka muuqan doonaa.', '✎')}</article></div>`;
  }

  function renderAnalytics() {
    const monday = weekStart(todayISO()); const days = Array.from({ length: 7 }, (_, i) => isoForOffset(monday, i));
    const counts = days.map(d => state.tasks.filter(t => t.date === d && t.done).length); const max = Math.max(1, ...counts);
    const bars = days.map((d, i) => `<div class="bar-column"><i style="height:${Math.max(4, Math.round(counts[i] / max * 100))}%" title="${counts[i]} hawlood"></i><span>${shortDays[i]}</span></div>`).join('');
    const stats = taskStats(); const categories = ['Shaqo', 'Waxbarasho', 'Caafimaad', 'Shakhsi', 'Qoys'];
    const rows = categories.map((cat, i) => { const count = state.tasks.filter(t => (t.category || 'Shakhsi') === cat).length; const pct = stats.total ? count / stats.total * 100 : 0; return `<div class="category-row"><span>${cat}</span><div class="progress-line ${i % 2 ? 'blue' : ''}"><span style="width:${pct}%"></span></div><b>${count}</b></div>`; }).join('');
    const sessions = state.studySessions || []; const minutes = sessions.reduce((n, s) => n + sessionMinutes(s), 0);
    return `${pageHead('HORUMAR & FALANQAYN', 'Waxaad samaysay horumar.', 'Xogta toddobaadkaaga iyo guulaha ilaa hadda.', `<button class="button button-quiet button-small" data-action="export">↓ &nbsp; Soo dejiso warbixinta</button>`)}<section class="grid stats-grid">${statCard('Hawlaha guud', stats.total, 'dhammaan hawlaha la qorsheeyey', '☷')}${statCard('La dhammeeyey', stats.completed, `${stats.pct}% heerka dhammaystirka`, '✓', 'blue')}${statCard('Caadooyinka', state.habits.length, 'caado oo aad la socoto', '✳', 'orange')}${statCard('Waqtiga waxbarasho', `${Math.round(minutes / 60 * 10) / 10}<span style="font:500 11px var(--font)"> saac</span>`, `${sessions.length} kulan oo la diiwaangeliyey`, '⌑', 'rose')}</section><section class="grid analytics-grid"><article class="card chart-card"><div class="card-title"><div><h2>Wax-soo-saarka toddobaadkan</h2><p>Hawlaha aad dhamaysay maalin kasta</p></div><span class="pill-label">7 MAALMOOD</span></div><div class="bar-chart">${bars}</div><div class="chart-legend"><span>Wadarta hawlaha dhammaaday</span><b>${counts.reduce((a, b) => a + b, 0)}</b></div></article><article class="card chart-card"><div class="card-title"><div><h2>Hawlaha qayb kasta</h2><p>Meesha aad wakhtiga gelisay</p></div></div><div class="category-bars">${rows}</div><div class="chart-legend"><span>Hawlo dib u dhacay</span><b style="color:var(--rose)">${stats.overdue}</b></div></article></section><section class="grid bottom-grid" style="margin-top:14px"><article class="card"><div class="card-title"><div><h2>Yoolashaada</h2><p>Horumarka la raadinayo</p></div><button class="subtle-link" data-action="switch-view" data-view="goals">Maamul yoolasha →</button></div>${state.goals.length ? state.goals.slice(0, 4).map(g => `<div class="goal-progress"><span style="font-size:9px;min-width:100px">${esc(g.title)}</span><div class="progress-line"><span style="width:${Math.min(100, goalProgress(g))}%"></span></div><b>${goalProgress(g)}%</b></div>`).join('') : empty('Yoolal lama darin', 'Ku dar yoolal si aad u cabbirto horumarkaaga.', '◎')}</article><article class="card"><div class="card-title"><div><h2>Joogteynta caadooyinka</h2><p>Caadooyinka maanta la qabtay</p></div></div>${state.habits.length ? `<div class="stat-number">${state.habits.filter(h => (h.days || []).includes(todayISO())).length}<span style="font:500 11px var(--font);color:var(--muted)"> / ${state.habits.length}</span></div><div class="stat-note">${Math.round(state.habits.filter(h => (h.days || []).includes(todayISO())).length / state.habits.length * 100)}% caadooyinka maanta</div>` : empty('Caadooyin lama darin', 'Ku dar tracker-ka caadooyinka.', '✳')}</article></section>`;
  }

  function renderSettings() {
    const settings = state.settings;
    return `${pageHead('AKOON & DOORASHOOYIN', 'Dejintaada', 'Habee dashboard-ka oo ilaali xogtaada.', `<span class="date-pill">⌂ &nbsp; Kaydka server-ka</span>`)}<div class="settings-grid"><article class="card"><div class="card-title"><div><h2>Profile-ka</h2><p>Magaca dashboard-ku kuugu yeedhayo</p></div><span class="stat-icon blue">♙</span></div><form id="profile-form"><div class="setting-row"><div><b>Magacaaga</b><small>Iimayl: ${esc(session.email)}</small></div><input name="name" type="text" value="${esc(settings.name || session.name || '')}" maxlength="45" required></div><div class="setting-row"><div><b>Qaabka saacadda</b><small>Muujinta waqtiga hawlaha</small></div><select name="timeFormat"><option value="24h" ${settings.timeFormat === '24h' ? 'selected' : ''}>24-saac</option><option value="12h" ${settings.timeFormat === '12h' ? 'selected' : ''}>12-saac</option></select></div><div class="setting-row"><div><b>Maalinta koowaad ee usbuuca</b><small>Qaabka qorshaha toddobaadka</small></div><select name="weekStart"><option value="monday">Isniin</option><option value="sunday" ${settings.weekStart === 'sunday' ? 'selected' : ''}>Axad</option></select></div><button class="button button-primary button-small" type="submit">Kaydi profile-ka</button></form></article><article class="card"><div class="card-title"><div><h2>Muuqaalka</h2><p>Dooro sida dashboard-ku u ekaanayo</p></div><span class="stat-icon orange">☼</span></div><div class="setting-row"><div><b>Dark mode</b><small>${settings.theme === 'dark' ? 'Hadda waa la doortay' : 'Muuqaalka mugdiga ah'}</small></div><button class="switch ${settings.theme === 'dark' ? 'on' : ''}" data-theme="dark" data-action="setting-theme" aria-label="Beddel dark mode"></button></div><div class="setting-row"><div><b>Light mode</b><small>${settings.theme === 'light' ? 'Hadda waa la doortay' : 'Muuqaalka iftiinka ah'}</small></div><button class="switch ${settings.theme === 'light' ? 'on' : ''}" data-theme="light" data-action="setting-theme" aria-label="Beddel light mode"></button></div><div class="setting-row"><div><b>Kaydinta</b><small>Xogta server-ka account-ka ayaa lagu kaydiyaa</small></div><span class="pill-label">SERVER</span></div></article><article class="card"><div class="card-title"><div><h2>Kaydso ama soo celi</h2><p>Nuqul ka samee xogta qorshahaaga.</p></div><span class="stat-icon">↓</span></div><div class="setting-row"><div><b>Soo dejiso xogtaada</b><small>JSON backup buuxa</small></div><button class="button button-quiet button-small" data-action="export">↓ Soo deji</button></div><div class="setting-row"><div><b>Soo geli xog hore</b><small>Ka soo celi JSON backup</small></div><button class="button button-quiet button-small" data-action="import">↑ Soo geli</button></div></article><article class="card"><div class="card-title"><div><h2>Maareynta akoonka</h2><p>Ficillada xogta iyo kalfadhiga</p></div><span class="stat-icon rose">⚙</span></div><div class="setting-row"><div><b>Tirtir dhammaan xogta</b><small>Hawlo, yoolal, caadooyin iyo qoraallo</small></div><button class="button button-danger button-small" data-action="clear-data">Tirtir xogta</button></div><div class="setting-row"><div><b>Ka bax</b><small>Kalfadhigan browser-ka ka xir</small></div><button class="button button-quiet button-small" data-action="logout">Ka bax ↗</button></div></article></div><p class="stat-note" style="margin-top:14px;line-height:1.8">Xogta qorshaha waxaa backend-ka loogu kaydiyaa account kasta si gaar ah. Isticmaal export haddii aad rabto nuqul backup ah.</p>`;
  }

  function openTask(id = '', date = plannerDate, list = 'tasks') {
    taskForm.reset(); document.getElementById('task-id').value = '';
    taskForm.dataset.list = list === 'todo' ? 'todo' : 'tasks';
    document.getElementById('modal-title').textContent = id ? 'Wax ka beddel hawsha' : 'Hawl cusub';
    document.getElementById('task-date').value = date || todayISO();
    if (id) {
      const collection = taskForm.dataset.list === 'todo' ? state.todoTasks : state.tasks;
      const task = collection.find(t => t.id === id); if (!task) return;
      document.getElementById('task-id').value = task.id; document.getElementById('task-title').value = task.title;
      document.getElementById('task-date').value = task.date; document.getElementById('task-priority').value = task.priority || 'medium';
      document.getElementById('task-start').value = task.start || ''; document.getElementById('task-end').value = task.end || '';
      document.getElementById('task-category').value = task.category || 'Shakhsi'; document.getElementById('task-notes').value = task.notes || '';
    }
    modal.hidden = false; setTimeout(() => document.getElementById('task-title').focus(), 30);
  }
  function closeModal() { modal.hidden = true; }
  function toast(text, error = false) { const region = document.getElementById('toast-region'); const item = document.createElement('div'); item.className = `toast${error ? ' error' : ''}`; item.textContent = text; region.append(item); setTimeout(() => item.remove(), 3200); }
  document.addEventListener('nolosha:server-save-error', event => {
    const status = document.getElementById('storage-status');
    const authExpired = event.detail?.authError === true;
    if (status) status.textContent = authExpired ? 'Galitaanku wuu dhacay; xogta cloud-ka lama sync-gareyn.' : 'Xogtu cloud-ka lama sync-gareyn.';
    toast(authExpired ? 'Galitaanku wuu dhacay. Dib u gal account-ka si xogta server-ka loo sync-gareeyo.' : (event.detail?.message || 'Xogta account-ka server-ka lama sync-gareyn. Hubi in server-ku shaqaynayo.'), true);
  });
  document.addEventListener('nolosha:server-saving', () => {
    const status = document.getElementById('storage-status');
    if (status) status.textContent = 'Xogta account-ka cloud-ka waa la kaydinayaa...';
  });
  document.addEventListener('nolosha:local-backup-error', () => {
    const status = document.getElementById('storage-status');
    if (status) status.textContent = 'Browser-ku ma kaydin karo nuqulka ku meel gaarka ah; sug inta cloud-ka laga xaqiijinayo.';
  });
  document.addEventListener('nolosha:server-saved', () => {
    const status = document.getElementById('storage-status');
    if (status) status.textContent = 'Xogta account-ka server-ka waa la kaydiyey.';
  });
  function addTaskFromForm(event) {
    event.preventDefault(); if (!taskForm.reportValidity()) return;
    const collectionKey = taskForm.dataset.list === 'todo' ? 'todoTasks' : 'tasks';
    const id = document.getElementById('task-id').value;
    const collection = state[collectionKey];
    const old = collection.find(t => t.id === id);
    const titleInput = document.getElementById('task-title');
    const title = titleInput.value.trim();
    if (!title) { titleInput.setCustomValidity(localizedText('Geli cinwaan hawleed oo aan bannaanayn.', 'Enter a task title.')); titleInput.reportValidity(); titleInput.setCustomValidity(''); return; }
    const start = document.getElementById('task-start').value;
    const endInput = document.getElementById('task-end');
    const end = endInput.value;
    if (end && (!start || end <= start)) {
      endInput.setCustomValidity(start ? localizedText('Dhammaadku waa inuu ka dambeeyaa bilowga.', 'End time must be after start time.') : localizedText('Geli waqtiga bilowga ka hor dhammaadka.', 'Enter a start time before the end time.'));
      endInput.reportValidity(); endInput.setCustomValidity(''); return;
    }
    const taskDate = document.getElementById('task-date').value;
    const now = Date.now();
    const item = { id: id || crypto.randomUUID(), title, date: taskDate, priority: document.getElementById('task-priority').value, start, end, category: document.getElementById('task-category').value.trim(), notes: document.getElementById('task-notes').value.trim(), done: old?.done || false, createdAt: old?.createdAt || now, updatedAt: now };
    if (id) state[collectionKey] = collection.map(t => t.id === id ? item : t); else state[collectionKey].push(item);
    save(); closeModal();
    plannerDate = taskDate; searchTerm = ''; todoSearch = '';
    if (collectionKey === 'todoTasks') { view = 'tasks'; todoFilter = 'all'; }
    else { view = 'daily'; taskFilter = 'all'; }
    render();
    requestAnimationFrame(() => {
      const savedRow = [...app.querySelectorAll('[data-task-id]')].find(row => row.dataset.taskId === item.id);
      if (!savedRow) return;
      savedRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
      savedRow.classList.add('task-save-highlight');
      setTimeout(() => savedRow.classList.remove('task-save-highlight'), 1800);
    });
    toast(id ? 'Hawsha waa la cusboonaysiiyey.' : 'Hawsha waa la kaydiyey.');
  }
  function toggleTask(id, list = 'tasks') { const collectionKey = list === 'todo' ? 'todoTasks' : 'tasks'; state[collectionKey] = state[collectionKey].map(t => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t); save(); render(); }
  function deleteTask(id, list = 'tasks') { const collectionKey = list === 'todo' ? 'todoTasks' : 'tasks'; const task = state[collectionKey].find(t => t.id === id); if (!task) return; if (!confirm(localizedText('Ma tirtirtaa hawsha ', 'Delete task ') + task.title + '?')) return; state[collectionKey] = state[collectionKey].filter(t => t.id !== id); save(); render(); toast('Hawsha waa la tirtiray.'); }
  function addStudySession(subjectId = '') {
    const subject = state.subjects.find(s => s.id === subjectId);
    const entry = { id: crypto.randomUUID(), date: todayISO(), minutes: 25, subjectId: subjectId || '', subject: subject?.name || '', label: 'Kulan diirad', createdAt: Date.now() };
    state.studySessions.push(entry); if (subject) subject.hoursDone = Number(subject.hoursDone || 0) + 25 / 60;
    save(); render(); toast('25 daqiiqo ayaa lagu daray diiwaankaaga.');
  }
  function timerSetMode(mode) {
    if (!['focus', 'break'].includes(mode)) return;
    clearInterval(timerInterval); timerInterval = null;
    timerDeadline = null;
    state.timer.mode = mode; state.timer.running = false;
    state.timer.secondsLeft = (mode === 'focus' ? state.timer.focusMinutes : state.timer.breakMinutes) * 60;
    save(); render();
  }
  function completeTimer() {
    clearInterval(timerInterval); timerInterval = null; timerDeadline = null;
    state.timer.secondsLeft = 0; state.timer.running = false;
    if (state.timer.mode === 'focus') {
      state.timer.cycles = (state.timer.cycles || 0) + 1;
      state.studySessions.push({ id: crypto.randomUUID(), date: todayISO(), minutes: Number(state.timer.focusMinutes), subject: '', label: 'Pomodoro diirad', createdAt: Date.now() });
      state.timer.mode = 'break'; state.timer.secondsLeft = state.timer.breakMinutes * 60;
      toast('Waqtigii diiraddu wuu dhammaaday. Nasasho yar qaado!');
    } else {
      state.timer.mode = 'focus'; state.timer.secondsLeft = state.timer.focusMinutes * 60;
      toast('Nasashadu way dhammaatay. Diyaar ma u tahay wareeg kale?');
    }
    save(); render();
  }
  function timerTick() {
    if (!state.timer.running || timerDeadline === null) return;
    state.timer.secondsLeft = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    if (state.timer.secondsLeft === 0) { completeTimer(); return; }
    if (state.timer.secondsLeft % 10 === 0) store.save();
    refreshTimerDisplays();
  }
  function timerToggle() {
    if (state.timer.running) {
      if (timerDeadline !== null && timerDeadline <= Date.now()) { completeTimer(); return; }
      if (timerDeadline !== null) state.timer.secondsLeft = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
      state.timer.running = false; timerDeadline = null; clearInterval(timerInterval); timerInterval = null; save(); render(); return;
    }
    timerDeadline = Date.now() + Math.max(0, Number(state.timer.secondsLeft) || 0) * 1000;
    state.timer.running = true; save(); render();
    clearInterval(timerInterval); timerInterval = setInterval(timerTick, 1000);
  }
  function timerReset() { clearInterval(timerInterval); timerInterval = null; timerDeadline = null; state.timer.running = false; state.timer.secondsLeft = (state.timer.mode === 'focus' ? state.timer.focusMinutes : state.timer.breakMinutes) * 60; save(); render(); }
  function refreshTimerDisplays() {
    const text = formatTimer(); const focus = document.getElementById('focus-time'); const clock = document.getElementById('timer-clock');
    if (focus) focus.textContent = text; if (clock) clock.textContent = text;
    const progress = document.querySelector('.timer-progress span'); if (progress) { const base = (state.timer.mode === 'focus' ? state.timer.focusMinutes : state.timer.breakMinutes) * 60; progress.style.width = `${Math.min(100, Math.round((1 - state.timer.secondsLeft / base) * 100))}%`; }
  }
  function exportData() {
    const payload = { app: 'Noloshaada', version: 2, exportedAt: new Date().toISOString(), data: state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `noloshaada-${todayISO()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Nuqulka xogtaada waa la soo dejiyey.');
  }
  function validImportData(value) {
    const isRecord = item => item !== null && typeof item === 'object' && !Array.isArray(item);
    const validDate = item => typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item) && todayISO(parseDate(item)) === item;
    const validTime = item => typeof item === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(item);
    const validOptionalNumber = (item, key) => item[key] === undefined || (typeof item[key] === 'number' && Number.isFinite(item[key]));
    const uniqueIds = items => {
      const ids = new Set();
      for (const item of items) {
        if (!isRecord(item) || typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(item.id) || ids.has(item.id)) return false;
        ids.add(item.id);
      }
      return true;
    };
    if (!isRecord(value) || !Array.isArray(value.tasks)) return false;
    const arrays = ['todoTasks', 'habits', 'goals', 'subjects', 'journal', 'studySessions', 'consistencyButtons'];
    if (arrays.some(key => value[key] !== undefined && !Array.isArray(value[key]))) return false;
    if (!uniqueIds(value.tasks) || !uniqueIds(value.todoTasks || []) || ['habits', 'goals', 'subjects', 'consistencyButtons'].some(key => !uniqueIds(value[key] || []))) return false;
    const validTask = task => typeof task.title === 'string' && !!task.title.trim() && validDate(task.date) && ['start', 'end'].every(key => task[key] === undefined || task[key] === '' || validTime(task[key])) && !(task.end && (!task.start || task.end <= task.start)) && (task.done === undefined || typeof task.done === 'boolean');
    if ([...value.tasks, ...(value.todoTasks || [])].some(task => !validTask(task))) return false;
    if ((value.habits || []).some(habit => !isRecord(habit) || typeof habit.id !== 'string' || typeof habit.name !== 'string' || !habit.name.trim() || (habit.days !== undefined && (!Array.isArray(habit.days) || habit.days.some(day => !validDate(day)))))) return false;
    if ((value.goals || []).some(goal => !isRecord(goal) || typeof goal.id !== 'string' || typeof goal.title !== 'string' || !goal.title.trim() || (goal.deadline !== undefined && goal.deadline !== '' && !validDate(goal.deadline)) || !validOptionalNumber(goal, 'progress') || (goal.milestone !== undefined && typeof goal.milestone !== 'string'))) return false;
    if ((value.subjects || []).some(subject => !isRecord(subject) || typeof subject.id !== 'string' || typeof subject.name !== 'string' || !subject.name.trim() || !validOptionalNumber(subject, 'target') || !validOptionalNumber(subject, 'hoursDone') || (subject.target !== undefined && subject.target < 0) || (subject.hoursDone !== undefined && subject.hoursDone < 0))) return false;
    if ((value.journal || []).some(entry => !isRecord(entry) || !validDate(entry.date) || typeof entry.text !== 'string')) return false;
    if ((value.studySessions || []).some(entry => !isRecord(entry) || !validDate(entry.date))) return false;
    if ((value.consistencyButtons || []).some(button => !isRecord(button) || typeof button.name !== 'string' || !button.name.trim() || (button.active !== undefined && typeof button.active !== 'boolean'))) return false;
    return true;
  }
  function importData(file) {
    if (!file) return; const reader = new FileReader();
    reader.onload = () => { try { const parsed = JSON.parse(reader.result); const next = parsed.data || parsed; if (!validImportData(next)) throw new Error('invalid'); if (!confirm(localizedText('Xogta la soo gelinayo ma beddeshaa xogta hadda jirta?', 'Replace your current data with the imported backup?'))) return; if (!store.replace(next)) { state = store.get(); toast('Kaydintu way fashilantay; xogtii hore waa la hayey.', true); return; } state = store.get(); render(); toast('Xogtii waa la soo geliyey.'); } catch (_) { toast('Faylka JSON-ka lama akhrin karo.', true); } };
    reader.readAsText(file);
  }
  function bindViewForms() {
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.filter-trigger');
      trigger.addEventListener('click', () => {
        const menu = dropdown.querySelector('.filter-menu');
        menu.hidden = !menu.hidden;
        trigger.setAttribute('aria-expanded', String(!menu.hidden));
      });
    });
    const consistencyForm = document.getElementById('consistency-form'); if (consistencyForm) consistencyForm.addEventListener('submit', e => { e.preventDefault(); const name = String(new FormData(consistencyForm).get('button') || '').trim(); if (!name) return toast('Geli magaca button-ka.', true); state.consistencyButtons ||= []; if (state.consistencyButtons.filter(button => !button.builtIn).length >= 100) return toast('Waxaad ku dari kartaa ugu badnaan 100 button oo gaar ah.', true); state.consistencyButtons.push({ id: crypto.randomUUID(), name: name.slice(0, 60), active: false, builtIn: false }); save(); render(); toast('Button-ka waa lagu daray.'); });
    const subjectForm = document.getElementById('subject-form'); if (subjectForm) subjectForm.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(subjectForm); const name = String(fd.get('subject') || '').trim(); if (!name) return toast('Geli magaca maaddada.', true); state.subjects.push({ id: crypto.randomUUID(), name, target: Number(fd.get('target')) || 10, hoursDone: 0 }); save(); render(); toast('Maaddada waa lagu daray.'); });
    const habitForm = document.getElementById('habit-form'); if (habitForm) habitForm.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(habitForm); const name = String(fd.get('habit') || '').trim(); if (!name) return toast('Geli magaca caadada.', true); state.habits.push({ id: crypto.randomUUID(), name, icon: '✳', days: [] }); save(); render(); toast('Caadada cusub waa la kaydiyey.'); });
    const goalForm = document.getElementById('goal-form'); if (goalForm) goalForm.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(goalForm); const title = String(fd.get('goal') || '').trim(); if (!title) return toast('Geli magaca yoolka.', true); state.goals.push({ id: crypto.randomUUID(), title, deadline: String(fd.get('deadline') || ''), progress: 0, milestone: '' }); save(); render(); toast('Yoolka waa lagu daray.'); });
    const journalForm = document.getElementById('journal-form'); if (journalForm) journalForm.addEventListener('submit', e => { e.preventDefault(); const text = new FormData(journalForm).get('entry').toString().trim(); if (!text) return toast('Qor wax yar ka hor intaadan kaydin.', true); const existing = state.journal.find(j => j.date === todayISO()); if (existing) existing.text = text; else state.journal.push({ id: crypto.randomUUID(), date: todayISO(), text }); save(); render(); toast('Qoraalka maanta waa la kaydiyey.'); });
    const profileForm = document.getElementById('profile-form'); if (profileForm) profileForm.addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(profileForm); const name = String(fd.get('name') || '').trim(); if (!name) return toast('Geli magacaaga.', true); state.settings.name = name; state.settings.timeFormat = String(fd.get('timeFormat')); migrateWeeklyReviews(String(fd.get('weekStart'))); weekdays = localizedWeekdays('long'); shortDays = localizedWeekdays('short'); const nextSession = { ...session, name: state.settings.name }; sessionStorage.setItem('nolosha-session', JSON.stringify(nextSession)); session = nextSession; save(); render(); toast('Profile-ka waa la cusboonaysiiyey.'); });
    const search = document.getElementById('task-search'); if (search) search.addEventListener('input', () => { searchTerm = search.value.trim(); const q = searchTerm.toLowerCase(); const rows = [...document.querySelectorAll('.todo-list-flat .todo-item[data-search]')]; const noResults = document.getElementById('task-search-empty'); if (!q) { rows.forEach(row => { row.hidden = false; }); if (noResults) noResults.hidden = true; return; } let matches = 0; rows.forEach(row => { row.hidden = !row.dataset.search.includes(q); if (!row.hidden) matches++; }); if (noResults) noResults.hidden = matches > 0; });
    const todoInput = document.getElementById('todo-search'); if (todoInput) { todoInput.addEventListener('input', () => { todoSearch = todoInput.value.trim(); applyTodoFilters(); }); applyTodoFilters(); }
    const review = document.getElementById('weekly-review'); if (review) review.addEventListener('change', () => saveWeeklyReview(review.value, false));
    const focusMinutes = document.getElementById('focus-minutes'); const breakMinutes = document.getElementById('break-minutes');
    if (focusMinutes) focusMinutes.addEventListener('change', () => { if (state.timer.running) return; state.timer.focusMinutes = Math.min(90, Math.max(5, Number(focusMinutes.value) || 25)); if (state.timer.mode === 'focus') state.timer.secondsLeft = state.timer.focusMinutes * 60; save(); render(); });
    if (breakMinutes) breakMinutes.addEventListener('change', () => { if (state.timer.running) return; state.timer.breakMinutes = Math.min(30, Math.max(1, Number(breakMinutes.value) || 5)); if (state.timer.mode === 'break') state.timer.secondsLeft = state.timer.breakMinutes * 60; save(); render(); });
  }

  function saveWeeklyReview(value = document.getElementById('weekly-review')?.value || '', notify = true) {
    state.settings.weeklyReviews ||= {};
    const key = weekStart(plannerDate);
    state.settings.weeklyReviews[key] = value;
    if (key === weekStart(todayISO())) state.settings.weeklyReview = value;
    save();
    if (notify) toast('Dib-u-eegista waa la kaydiyey.');
  }

  function migrateWeeklyReviews(nextWeekStart) {
    const previousWeekStart = state.settings.weekStart;
    if (!['monday', 'sunday'].includes(nextWeekStart) || nextWeekStart === previousWeekStart) return;
    const offset = nextWeekStart === 'sunday' ? -1 : 1;
    const shifted = {};
    Object.entries(state.settings.weeklyReviews || {}).forEach(([date, text]) => {
      shifted[isoForOffset(date, offset)] = text;
    });
    state.settings.weekStart = nextWeekStart;
    const currentWeek = weekStart(todayISO());
    if (typeof state.settings.weeklyReview === 'string' && !Object.prototype.hasOwnProperty.call(shifted, currentWeek)) {
      shifted[currentWeek] = state.settings.weeklyReview;
    }
    state.settings.weeklyReviews = shifted;
  }

  function applyTodoFilters() {
    const query = todoSearch.toLowerCase();
    const rows = [...document.querySelectorAll('.todo-item[data-status]')];
    const noResults = document.getElementById('todo-search-empty');
    if (!query) {
      rows.forEach(row => { row.hidden = false; });
      if (noResults) noResults.hidden = true;
      return;
    }
    let matches = 0;
    rows.forEach(row => {
      const matchesText = row.dataset.search.includes(query);
      const matchesStatus = todoFilter === 'all' || row.dataset.status === todoFilter;
      row.hidden = !(matchesText && matchesStatus);
      if (!row.hidden) matches++;
    });
    if (noResults) noResults.hidden = !query || matches > 0;
  }

  document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => changeView(item.dataset.view)));
  document.getElementById('menu-toggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('theme-toggle').addEventListener('click', () => { state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark'; save(); render(); });
  document.getElementById('profile-button').addEventListener('click', () => changeView('settings'));
  document.getElementById('top-avatar').addEventListener('click', () => changeView('settings'));
  document.getElementById('modal-close').addEventListener('click', closeModal); document.getElementById('modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); }); taskForm.addEventListener('submit', addTaskFromForm);
  document.getElementById('import-file').addEventListener('change', e => { importData(e.target.files[0]); e.target.value = ''; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.calendar-cell')) { e.preventDefault(); e.target.click(); }
  });
  app.addEventListener('click', event => {
    const target = event.target.closest('[data-action]'); if (!target) return;
    const action = target.dataset.action; const id = target.dataset.id; const date = target.dataset.date;
    const list = target.dataset.list === 'todo' ? 'todo' : 'tasks';
    if (['switch-view'].includes(action)) return changeView(target.dataset.view);
    if (action === 'add-task') return openTask('', date || plannerDate, list);
    if (action === 'edit-task') return openTask(id, plannerDate, list);
    if (action === 'task-toggle') return toggleTask(id, list);
    if (action === 'delete-task') return deleteTask(id, list);
    if (action === 'open-day') { plannerDate = date; changeView('daily'); return; }
    if (action === 'date-shift') { plannerDate = isoForOffset(plannerDate, Number(target.dataset.days)); return render(); }
    if (action === 'date-today') { plannerDate = todayISO(); return render(); }
    if (action === 'week-shift') { plannerDate = isoForOffset(weekStart(plannerDate), Number(target.dataset.weeks) * 7); return render(); }
    if (action === 'week-today') { plannerDate = todayISO(); return render(); }
    if (action === 'month-shift') {
      if (!shiftMonth(Number(target.dataset.months))) return;
      return render();
    }
    if (action === 'calendar-select') { selectedCalendarDate = date; return render(); }
    if (action === 'timer-toggle') return timerToggle();
    if (action === 'timer-reset') return timerReset();
    if (action === 'timer-mode') return timerSetMode(target.dataset.mode);
    if (action === 'log-study') return addStudySession();
    if (action === 'subject-session') return addStudySession(id);
    if (action === 'study-session-delete') {
      const entry = (state.studySessions || []).find(session => session.id === id);
      if (!entry || !confirm(localizedText('Ma tirtirtaa kulankan maanta?', 'Delete today’s session?'))) return;
      state.studySessions = state.studySessions.filter(session => session.id !== id);
      if (entry.subjectId) {
        const subject = state.subjects.find(item => item.id === entry.subjectId);
        if (subject) subject.hoursDone = Math.max(0, Number(subject.hoursDone || 0) - sessionMinutes(entry) / 60);
      }
      save(); render(); toast('Kulanka waa la tirtiray.'); return;
    }
    if (action === 'subject-delete') { if (confirm(localizedText('Ma tirtirtaa maaddadan?', 'Delete this subject?'))) { state.subjects = state.subjects.filter(s => s.id !== id); save(); render(); toast('Maaddada waa la tirtiray.'); } return; }
    if (action === 'habit-toggle') { const habit = state.habits.find(h => h.id === id); if (!habit) return; habit.days ||= []; habit.days = habit.days.includes(date) ? habit.days.filter(d => d !== date) : [...habit.days, date].sort(); save(); render(); return; }
    if (action === 'habit-delete') { if (confirm(localizedText('Ma tirtirtaa caadadan iyo diiwaankeeda?', 'Delete this habit and its history?'))) { state.habits = state.habits.filter(h => h.id !== id); save(); render(); toast('Caadada waa la tirtiray.'); } return; }
    if (action === 'consistency-toggle') { const button = (state.consistencyButtons || []).find(item => item.id === id); if (!button) return; const isActive = button.activeDate ? button.activeDate === todayISO() : !!button.active; button.activeDate = isActive ? '' : todayISO(); button.active = false; save(); render(); return; }
    if (action === 'consistency-delete') { if (confirm(localizedText('Ma tirtirtaa button-kan?', 'Delete this button?'))) { state.consistencyButtons = (state.consistencyButtons || []).filter(item => item.id !== id); save(); render(); toast('Button-ka waa la tirtiray.'); } return; }
    if (action === 'goal-progress') { const goal = state.goals.find(g => g.id === id); if (!goal) return; goal.progress = Math.min(100, goalProgress(goal) + 10); save(); render(); toast(goal.progress >= 100 ? 'Hambalyo, yoolka waa la gaaray!' : 'Horumarka yoolka waa la cusboonaysiiyey.'); return; }
    if (action === 'goal-delete') { if (confirm(localizedText('Ma tirtirtaa yoolkan?', 'Delete this goal?'))) { state.goals = state.goals.filter(g => g.id !== id); save(); render(); toast('Yoolka waa la tirtiray.'); } return; }
    if (action === 'journal-delete') { if (!confirm(localizedText('Ma tirtirtaa qoraalkan hore?', 'Delete this past note?'))) return; state.journal = state.journal.filter(entry => entry.id ? entry.id !== id : entry.date !== id); save(); render(); toast('Qoraalka waa la tirtiray.'); return; }
    if (action === 'setting-theme') { state.settings.theme = target.dataset.theme === 'dark' ? 'dark' : 'light'; save(); render(); return; }
    if (action === 'export') return exportData();
    if (action === 'import') return document.getElementById('import-file').click();
    if (action === 'clear-data') { if (!confirm(localizedText('Tani waxay tirtiraysaa hawlaha, caadooyinka, yoolasha iyo qoraallada akoonkan. Ma sii wadaysaa?', 'This will delete the tasks, habits, goals, and notes in this account. Continue?'))) return; if (!store.replace(store.emptyState())) { state = store.get(); toast('Kaydintu way fashilantay; xogta lama tirtirin.', true); return; } state = store.get(); state.settings.name = session.name || ''; save(); render(); toast('Xogta qorshaha waa la nadiifiyey.'); return; }
    if (action === 'logout') { clearInterval(timerInterval); sessionStorage.removeItem('nolosha-session'); location.href = 'login.html'; return; }
    if (action === 'save-week-review') saveWeeklyReview();
  });

  if (!state.settings.name && session.name) { state.settings.name = session.name; save(); }
  if (state.timer.running) { state.timer.running = false; save(); }
  render();
  let refreshingAccountData = false;
  async function refreshAccountData() {
    if (previewMode || !session?.token || store.pending() || refreshingAccountData || !modal.hidden) return;
    const focusedField = document.activeElement?.matches?.('input, textarea, select, [contenteditable="true"]');
    if (focusedField) return;
    refreshingAccountData = true;
    try {
      await window.NoloshaCloud.validSession();
      const result = await window.NoloshaCloud.loadData();
      if (!result.data || store.pending()) return;
      const before = JSON.stringify(store.get());
      store.load(result.data);
      state = store.get();
      if (JSON.stringify(state) !== before) render();
      document.getElementById('storage-status').textContent = 'Xogta account-ka cloud-ka waa la kaydiyey.';
    } catch (error) {
      console.warn('Could not refresh account data from server.', error);
    } finally {
      refreshingAccountData = false;
    }
  }
  window.addEventListener('focus', refreshAccountData);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshAccountData();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') refreshAccountData();
  }, 15000);
  function tickClock() { const clock = document.getElementById('live-clock'); if (clock) clock.textContent = new Date().toLocaleTimeString(currentLocale(), { hour: '2-digit', minute: '2-digit', hour12: state.settings.timeFormat === '12h' }); }
  tickClock(); setInterval(tickClock, 15000);
})();
