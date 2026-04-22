// Physics constants for grid mesh
const GRID_SPACING = 60;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 40;
const SPRING_STIFFNESS = 0.04;
const DAMPING = 0.88;
const TOUCH_BURST_RADIUS = 100;
const TOUCH_BURST_STRENGTH = 8;

/**
 * Initialize interactive spacetime grid canvas background on a container element.
 * The container must have position: relative (or absolute/fixed).
 * The canvas is inserted as the first child, absolutely positioned to fill the container.
 * @param {string} selector - CSS selector for the container element
 */
export default function initGridBackground(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";
  container.insertBefore(canvas, container.firstChild);

  // Make sure content above canvas stays on top
  for (const child of container.children) {
    if (child !== canvas && !child.style.zIndex) {
      child.style.position = "relative";
      child.style.zIndex = "1";
    }
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let isDarkMode = document.documentElement.classList.contains("dark");
  let points = [];
  let cursor = null;
  let cols = 0;
  let rows = 0;

  function getLineColor() {
    return isDarkMode
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)";
  }

  function buildGrid() {
    points = [];
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    cols = Math.ceil(w / GRID_SPACING) + 2;
    rows = Math.ceil(h / GRID_SPACING) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        points.push({
          homeX: (c - 0.5) * GRID_SPACING,
          homeY: (r - 0.5) * GRID_SPACING,
          dx: 0, dy: 0, vx: 0, vy: 0
        });
      }
    }
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(rect.width, 1) * dpr;
    canvas.height = Math.max(rect.height, 1) * dpr;
    ctx.scale(dpr, dpr);
    buildGrid();
  }

  function applyTouchBurst(cx, cy) {
    for (const p of points) {
      const dist = Math.hypot(p.homeX + p.dx - cx, p.homeY + p.dy - cy);
      if (dist < TOUCH_BURST_RADIUS) {
        const factor = 1 - dist / TOUCH_BURST_RADIUS;
        const angle = Math.atan2(p.homeY + p.dy - cy, p.homeX + p.dx - cx);
        p.vx += Math.cos(angle) * factor * TOUCH_BURST_STRENGTH;
        p.vy += Math.sin(angle) * factor * TOUCH_BURST_STRENGTH;
      }
    }
  }

  function getPoint(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    return points[r * cols + c];
  }

  function animate() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    // Update physics
    for (const p of points) {
      if (cursor) {
        const dx = p.homeX + p.dx - cursor.x;
        const dy = p.homeY + p.dy - cursor.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = REPEL_STRENGTH / (dist * dist);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
      p.vx += (0 - p.dx) * SPRING_STIFFNESS;
      p.vy += (0 - p.dy) * SPRING_STIFFNESS;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.dx += p.vx;
      p.dy += p.vy;
    }

    // Draw grid lines
    ctx.strokeStyle = getLineColor();
    ctx.lineWidth = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = getPoint(r, c);
        if (!p) continue;
        const px = p.homeX + p.dx;
        const py = p.homeY + p.dy;

        // Horizontal line to next column
        const right = getPoint(r, c + 1);
        if (right) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(right.homeX + right.dx, right.homeY + right.dy);
          ctx.stroke();
        }

        // Vertical line to next row
        const below = getPoint(r + 1, c);
        if (below) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(below.homeX + below.dx, below.homeY + below.dy);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  animate();

  new ResizeObserver(() => resizeCanvas()).observe(container);

  new MutationObserver(() => {
    isDarkMode = document.documentElement.classList.contains("dark");
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // Route mouse events from the container (not canvas, since canvas is pointer-events: none)
  container.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });
  container.addEventListener("mouseleave", () => { cursor = null; });
  container.addEventListener("touchstart", (e) => {
    const rect = canvas.getBoundingClientRect();
    for (const touch of e.changedTouches) {
      applyTouchBurst(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }, { passive: true });
}
