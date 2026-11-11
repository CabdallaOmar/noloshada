(() => {
  const form = document.getElementById('auth-form');
  const password = form?.querySelector('input[type="password"]');
  if (!form || !password) return;

  const mascot = document.createElement('div');
  mascot.className = 'auth-mascot';
  mascot.setAttribute('aria-hidden', 'true');
  mascot.innerHTML = `
    <svg viewBox="0 0 130 110" role="presentation" focusable="false">
      <ellipse cx="65" cy="103" rx="30" ry="4" fill="#172a40" opacity=".12" />
      <path d="M37 42 27 8q17 4 30 20 8-3 16 0 13-16 30-20L93 42q10 13 5 31-6 19-24 27l-9 5-9-5q-18-8-24-27-5-18 5-31z" fill="#f8fbff" stroke="#aebbd0" stroke-width="2" stroke-linejoin="round" />
      <path d="m34 34-5-19q12 5 21 17-9 4-16 12zm62 0 5-19q-12 5-21 17 9 4 16 12z" fill="#dbe3ef" />
      <path d="M39 41q12-13 26-13t26 13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" />
      <path d="M42 45q8-5 16 0m14 0q8-5 16 0" fill="none" stroke="#566276" stroke-linecap="round" stroke-width="2.5" />
      <g class="wolf-eyes">
        <circle cx="51" cy="55" r="12.5" fill="#fff" stroke="#aab8cd" stroke-width="1.3" />
        <circle cx="79" cy="55" r="12.5" fill="#fff" stroke="#aab8cd" stroke-width="1.3" />
        <g class="wolf-pupil" data-eye-x="51" data-eye-y="55">
          <circle cx="51" cy="55" r="5.9" fill="#5aa8f0" stroke="#2863aa" stroke-width=".8" />
          <circle cx="51" cy="55" r="3.5" fill="#14243e" />
          <circle cx="53" cy="52.8" r="1.6" fill="#fff" />
        </g>
        <g class="wolf-pupil" data-eye-x="79" data-eye-y="55">
          <circle cx="79" cy="55" r="5.9" fill="#5aa8f0" stroke="#2863aa" stroke-width=".8" />
          <circle cx="79" cy="55" r="3.5" fill="#14243e" />
          <circle cx="81" cy="52.8" r="1.6" fill="#fff" />
        </g>
      </g>
      <path d="M48 69q17-9 34 0l-5 11q-12 9-24 0z" fill="#fff" stroke="#c3cedc" stroke-width="1.2" />
      <path d="m59 69 6-4 6 4-2 5q-4 3-8 0z" fill="#26334a" />
      <path d="M65 74v5q-4 6-9 1m9-1q4 6 9 1" fill="none" stroke="#596579" stroke-linecap="round" stroke-width="1.5" />
      <path d="M38 78q7 3 13 0m28 0q6 3 13 0" fill="none" stroke="#d4dce7" stroke-linecap="round" stroke-width="2" />
      <g class="wolf-paw wolf-paw--left">
        <path d="M29 69c-4-6-3-14 1-18 3-3 7-1 8 3l1-5c1-4 6-4 7 0l1 4c2-4 7-2 7 2v4c4-2 7 2 5 7l-4 8c-4 6-12 8-19 5-4-2-6-5-7-10z" fill="#f8fbff" stroke="#aebbd0" stroke-linejoin="round" stroke-width="1.5" />
        <path d="M36 69q2-3 4 0m5 0q2-3 4 0" fill="none" stroke="#c1cad8" stroke-linecap="round" stroke-width="1.5" />
      </g>
      <g class="wolf-paw wolf-paw--right"><g transform="translate(130 0) scale(-1 1)">
        <path d="M29 69c-4-6-3-14 1-18 3-3 7-1 8 3l1-5c1-4 6-4 7 0l1 4c2-4 7-2 7 2v4c4-2 7 2 5 7l-4 8c-4 6-12 8-19 5-4-2-6-5-7-10z" fill="#f8fbff" stroke="#aebbd0" stroke-linejoin="round" stroke-width="1.5" />
        <path d="M36 69q2-3 4 0m5 0q2-3 4 0" fill="none" stroke="#c1cad8" stroke-linecap="round" stroke-width="1.5" />
      </g></g>
    </svg>`;

  const authBox = form.closest('.auth-box');
  if (!authBox) return;
  authBox.insertBefore(mascot, authBox.firstElementChild);

  let shakeTimer;
  const shakeHead = () => {
    mascot.classList.remove('is-shaking');
    void mascot.offsetWidth;
    mascot.classList.add('is-shaking');
    clearTimeout(shakeTimer);
    shakeTimer = setTimeout(() => mascot.classList.remove('is-shaking'), 850);
  };
  form.addEventListener('invalid', event => {
    if (event.target.matches('input[required]') && !event.target.value.trim()) shakeHead();
  }, true);

  let correctTimer;
  const sayCorrect = () => {
    clearTimeout(correctTimer);
    mascot.classList.remove('is-covering');
    mascot.classList.remove('is-correct');
    void mascot.offsetWidth;
    mascot.classList.add('is-correct');
    correctTimer = setTimeout(() => mascot.classList.remove('is-correct'), 1150);
  };
  form.addEventListener('auth:correct-credentials', sayCorrect);

  let passwordContextActive = false;
  const setCovering = covering => mascot.classList.toggle('is-covering', covering);
  const updateExpression = () => {
    setCovering(passwordContextActive && password.type === 'password');
  };
  document.addEventListener('focusin', event => {
    const target = event.target;
    if (target === password) passwordContextActive = true;
    else if (!(target instanceof Element && target.closest('.show-password'))) passwordContextActive = false;
    updateExpression();
  }, true);
  password.addEventListener('blur', event => {
    if (event.relatedTarget instanceof Element && event.relatedTarget.closest('.show-password')) return;
    passwordContextActive = false;
    updateExpression();
  });
  document.addEventListener('pointerdown', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('#password, .show-password')) return;
    passwordContextActive = false;
    updateExpression();
  }, { capture: true, passive: true });
  form.addEventListener('auth:password-visibility', updateExpression);

  const svg = mascot.querySelector('svg');
  const pupils = [...mascot.querySelectorAll('.wolf-pupil')];
  const followPointer = event => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * 130;
    const y = ((event.clientY - rect.top) / rect.height) * 110;
    pupils.forEach(pupil => {
      const towardX = x - Number(pupil.dataset.eyeX);
      const towardY = y - Number(pupil.dataset.eyeY);
      const distance = Math.hypot(towardX, towardY) || 1;
      const look = Math.min(5.9, distance * .15);
      const dx = towardX / distance * look;
      const dy = towardY / distance * look;
      pupil.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    });
  };
  document.addEventListener('pointermove', followPointer, { capture: true, passive: true });
  document.addEventListener('pointerdown', followPointer, { capture: true, passive: true });
  updateExpression();
})();
