(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  const rippleAt = (event) => {
    const ripple = document.createElement('span');
    ripple.className = 'auth-water-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    document.body.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  };

  document.addEventListener('pointerdown', rippleAt, { passive: true });

  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    if (event.target instanceof Element && event.target.closest('.auth-box, .preview-window, .floating-note')) return;

    const now = performance.now();
    const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
    if (distance < 34 || now - lastTime < 110) return;

    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = now;

    rippleAt(event);
  }, { passive: true });
})();
