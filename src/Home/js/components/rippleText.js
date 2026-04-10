/* global requestAnimationFrame, ResizeObserver, MutationObserver */

// Physics constants
const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 80;
const SPRING_STIFFNESS = 0.045;
const DAMPING = 0.84;
const TOUCH_BURST_RADIUS = 200;
const TOUCH_BURST_STRENGTH = 120;

/**
 * Initialize ripple text effect on canvas
 * @returns {void}
 */
export default function initRippleText() {
  // Get target container
  const container = document.querySelector('#ripple-text-container');
  if (!container) {
    return;
  }

  // Get existing h1 for font styling
  const h1 = container.querySelector('h1');
  if (!h1) {
    return;
  }

  // Create and insert canvas
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    "I'm Conor Hinchee, a Senior Software Engineer based in Ohio, specializing in building engaging user experiences and transforming complex ideas into seamless, scalable applications."
  );
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Get computed styles for font
  const computedStyle = window.getComputedStyle(h1);
  const baseFontFamily = computedStyle.fontFamily;

  // Text content
  const greetingText = 'OH HI THERE 👋';
  const h1Text = [
    "I'm Conor Hinchee,",
    'a Senior Software Engineer based in Ohio,',
    'specializing in building engaging',
    'user experiences and transforming',
    'complex ideas into seamless,',
    'scalable applications.'
  ];

  // Font sizes (in rem, will convert to px)
  const greetingFontSize = 1.875; // text-3xl
  const bodyFontSize = 1.125; // text-lg
  const remToPx = 16; // 1rem = 16px

  // State
  let cursor = null;
  let isDarkMode = document.documentElement.classList.contains('dark');
  let characters = [];
  let animationId = null;

  /**
   * Get text color based on dark mode
   */
  function getTextColor() {
    return isDarkMode ? '#ffffff' : '#111827';
  }

  /**
   * Calculate font size in pixels
   */
  function getFontSizePixels(remSize) {
    return remSize * remToPx;
  }

  /**
   * Layout characters and create physics objects
   */
  function layoutCharacters() {
    characters = [];
    const pixelWidth = canvas.width / window.devicePixelRatio;
    const pixelHeight = canvas.height / window.devicePixelRatio;

    let y = 40;

    // Greeting text (text-3xl)
    const greetingFontPixels = getFontSizePixels(greetingFontSize);
    const greetingLineHeight = greetingFontPixels * 1.5;
    ctx.font = `${greetingFontPixels}px ${baseFontFamily}`;

    let x = (pixelWidth - ctx.measureText(greetingText).width) / 2;
    for (let i = 0; i < greetingText.length; i++) {
      const char = greetingText[i];
      const charWidth = ctx.measureText(char).width;
      characters.push({
        char,
        homeX: x,
        homeY: y,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0
      });
      x += charWidth;
    }

    y += greetingLineHeight + 20;

    // Body text (text-lg)
    const bodyFontPixels = getFontSizePixels(bodyFontSize);
    const bodyLineHeight = bodyFontPixels * 1.5;
    ctx.font = `${bodyFontPixels}px ${baseFontFamily}`;

    for (let lineIdx = 0; lineIdx < h1Text.length; lineIdx++) {
      const line = h1Text[lineIdx];
      x = (pixelWidth - ctx.measureText(line).width) / 2;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const charWidth = ctx.measureText(char).width;
        characters.push({
          char,
          homeX: x,
          homeY: y,
          dx: 0,
          dy: 0,
          vx: 0,
          vy: 0
        });
        x += charWidth;
      }

      y += bodyLineHeight;
    }
  }

  /**
   * Resize canvas with HiDPI scaling
   */
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    layoutCharacters();
  }

  /**
   * Apply touch burst effect
   */
  function applyTouchBurst(cx, cy) {
    for (const char of characters) {
      const charX = char.homeX + char.dx;
      const charY = char.homeY + char.dy;
      const dist = Math.hypot(charX - cx, charY - cy);

      if (dist < TOUCH_BURST_RADIUS) {
        const factor = 1 - dist / TOUCH_BURST_RADIUS;
        const angle = Math.atan2(charY - cy, charX - cx);
        char.vx += Math.cos(angle) * factor * TOUCH_BURST_STRENGTH;
        char.vy += Math.sin(angle) * factor * TOUCH_BURST_STRENGTH;
      }
    }
  }

  /**
   * Animation loop
   */
  function animate() {
    const pixelWidth = canvas.width / window.devicePixelRatio;
    const pixelHeight = canvas.height / window.devicePixelRatio;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);

    // Physics and rendering
    for (const char of characters) {
      // Repulsion from cursor
      if (cursor) {
        const dx = char.homeX + char.dx - cursor.x;
        const dy = char.homeY + char.dy - cursor.y;
        const dist = Math.hypot(dx, dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = REPEL_STRENGTH / (dist * dist);
          char.vx += (dx / dist) * force;
          char.vy += (dy / dist) * force;
        }
      }

      // Spring toward home
      char.vx += (0 - char.dx) * SPRING_STIFFNESS;
      char.vy += (0 - char.dy) * SPRING_STIFFNESS;

      // Damping
      char.vx *= DAMPING;
      char.vy *= DAMPING;

      // Integration
      char.dx += char.vx;
      char.dy += char.vy;

      // Render character
      const charX = char.homeX + char.dx;
      const charY = char.homeY + char.dy;

      // Determine font size for this character
      const isGreeting = characters.indexOf(char) < greetingText.length;
      const fontSize = isGreeting ? greetingFontSize : bodyFontSize;
      const fontPixels = getFontSizePixels(fontSize);

      ctx.font = `${fontPixels}px ${baseFontFamily}`;
      ctx.fillStyle = getTextColor();
      ctx.textBaseline = 'top';
      ctx.fillText(char.char, charX, charY);
    }

    animationId = requestAnimationFrame(animate);
  }

  /**
   * Pointer move handler
   */
  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cursor = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr
    };
  }

  /**
   * Pointer leave handler
   */
  function handlePointerLeave() {
    cursor = null;
  }

  /**
   * Pointer down handler for touch burst
   */
  function handlePointerDown(e) {
    if (e.pointerType === 'touch') {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const cx = (e.clientX - rect.left) * dpr;
      const cy = (e.clientY - rect.top) * dpr;
      applyTouchBurst(cx, cy);
    }
  }

  /**
   * Dark mode change observer
   */
  function setupDarkModeObserver() {
    const observer = new MutationObserver(() => {
      isDarkMode = document.documentElement.classList.contains('dark');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  /**
   * Resize observer for container changes
   */
  function setupResizeObserver() {
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });

    observer.observe(container);
  }

  // Initialize
  resizeCanvas();
  animate();
  setupDarkModeObserver();
  setupResizeObserver();

  // Event listeners
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointerdown', handlePointerDown);
}
