// Physics constants for grid mesh
const GRID_SPACING = 60;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 40;
const SPRING_STIFFNESS = 0.04;
const DAMPING = 0.88;
const TOUCH_BURST_RADIUS = 100;
const TOUCH_BURST_STRENGTH = 8;
// Below this much total velocity (and, with no cursor, displacement) the loop stops
const REST_THRESHOLD = 0.01;
// Faint 1px lines look the same at 2x as at 3x, for far fewer pixels
const MAX_DPR = 2;
// The canvas covers a band this many viewports tall, not the whole container
const BAND_VIEWPORTS = 2;

type GridPoint = {
  homeX: number;
  homeY: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

/**
 * Initialize interactive spacetime grid canvas background on a container element.
 * The container must have position: relative (or absolute/fixed).
 * The canvas is inserted as the first child and covers a band around the viewport,
 * moving within the container as the page scrolls. It only animates while the mesh
 * is moving, so a settled grid costs nothing per frame.
 * @param {string} selector - CSS selector for the container element
 */
export default function initGridBackground(selector: string) {
  const containerEl = document.querySelector(selector);
  if (!(containerEl instanceof HTMLElement)) return;
  const container = containerEl;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";
  container.insertBefore(canvas, container.firstChild);

  // Make sure content above canvas stays on top
  for (const child of container.children) {
    if (
      child !== canvas &&
      (child instanceof HTMLElement || child instanceof SVGElement) &&
      !child.style.zIndex
    ) {
      child.style.position = "relative";
      child.style.zIndex = "1";
    }
  }

  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;

  let isDarkMode = document.documentElement.classList.contains("dark");
  let points: GridPoint[] = [];
  let cursor: { x: number; y: number } | null = null;
  let cols = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let bandTop = 0;
  let bandHeight = 0;
  let running = false;

  function getLineColor() {
    return isDarkMode
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)";
  }

  function buildGrid() {
    points = [];
    cols = Math.ceil(width / GRID_SPACING) + 2;
    rows = Math.ceil(height / GRID_SPACING) + 2;

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

  /**
   * Move the canvas band so it covers the viewport with some overscan.
   * Returns true when the band moved and needs redrawing.
   */
  function placeBand(force = false) {
    const viewportHeight = window.innerHeight;
    const viewTop = -container.getBoundingClientRect().top;
    const viewBottom = viewTop + viewportHeight;
    const margin = viewportHeight / 4;
    const bandBottom = bandTop + bandHeight;

    const nearTop = bandTop > 0 && viewTop - bandTop < margin;
    const nearBottom = bandBottom < height && bandBottom - viewBottom < margin;
    if (!force && !nearTop && !nearBottom) return false;

    const centered = viewTop - (bandHeight - viewportHeight) / 2;
    bandTop = Math.min(Math.max(centered, 0), Math.max(height - bandHeight, 0));
    canvas.style.top = `${bandTop}px`;
    return true;
  }

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    bandHeight = Math.min(height, window.innerHeight * BAND_VIEWPORTS);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(bandHeight * dpr);
    canvas.style.height = `${bandHeight}px`;
    buildGrid();
    placeBand(true);
    draw();
  }

  function applyTouchBurst(cx: number, cy: number) {
    for (const p of points) {
      const dist = Math.hypot(p.homeX + p.dx - cx, p.homeY + p.dy - cy);
      if (dist < TOUCH_BURST_RADIUS) {
        const factor = 1 - dist / TOUCH_BURST_RADIUS;
        const angle = Math.atan2(p.homeY + p.dy - cy, p.homeX + p.dx - cx);
        p.vx += Math.cos(angle) * factor * TOUCH_BURST_STRENGTH;
        p.vy += Math.sin(angle) * factor * TOUCH_BURST_STRENGTH;
      }
    }
    start();
  }

  function getPoint(r: number, c: number) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    return points[r * cols + c];
  }

  /**
   * Advance the physics one step. Returns how fast and how far the mesh is moving.
   */
  function step() {
    let velocity = 0;
    let offset = 0;
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
      velocity += Math.abs(p.vx) + Math.abs(p.vy);
      offset += Math.abs(p.dx) + Math.abs(p.dy);
    }
    return { velocity, offset };
  }

  function settle() {
    for (const p of points) {
      p.dx = 0; p.dy = 0; p.vx = 0; p.vy = 0;
    }
  }

  function draw() {
    // Draw in container coordinates, shifted so the band's top lands at y = 0
    ctx.setTransform(dpr, 0, 0, dpr, 0, -bandTop * dpr);
    ctx.clearRect(0, bandTop, width, bandHeight);

    // Only the rows that can reach into the band
    const firstRow = Math.max(Math.floor(bandTop / GRID_SPACING) - 1, 0);
    const lastRow = Math.min(Math.ceil((bandTop + bandHeight) / GRID_SPACING) + 2, rows);

    ctx.strokeStyle = getLineColor();
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let r = firstRow; r < lastRow; r++) {
      for (let c = 0; c < cols; c++) {
        const p = getPoint(r, c);
        if (!p) continue;
        const px = p.homeX + p.dx;
        const py = p.homeY + p.dy;

        // Horizontal line to next column
        const right = getPoint(r, c + 1);
        if (right) {
          ctx.moveTo(px, py);
          ctx.lineTo(right.homeX + right.dx, right.homeY + right.dy);
        }

        // Vertical line to next row
        const below = getPoint(r + 1, c);
        if (below) {
          ctx.moveTo(px, py);
          ctx.lineTo(below.homeX + below.dx, below.homeY + below.dy);
        }
      }
    }

    ctx.stroke();
  }

  function animate() {
    const { velocity, offset } = step();
    // A still cursor holds the mesh in a bent pose, which needs no more frames
    if (velocity < REST_THRESHOLD && (cursor || offset < REST_THRESHOLD)) {
      if (!cursor) settle();
      running = false;
    }
    draw();
    if (running) requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(animate);
  }

  resizeCanvas();

  new ResizeObserver(() => resizeCanvas()).observe(container);
  // The viewport can change height without the container resizing (mobile URL bar)
  window.addEventListener("resize", () => resizeCanvas(), { passive: true });

  window.addEventListener("scroll", () => {
    if (placeBand() && !running) draw();
  }, { passive: true });

  new MutationObserver(() => {
    isDarkMode = document.documentElement.classList.contains("dark");
    if (!running) draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // Route mouse events from the container (not canvas, since canvas is pointer-events: none).
  // Mouse pointers only: a tap fires compatibility mouse events that never "leave",
  // which would hold the cursor in place and keep the loop running.
  container.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const rect = container.getBoundingClientRect();
    cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    start();
  });
  container.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    cursor = null;
    start();
  });
  container.addEventListener("touchstart", (e) => {
    const rect = container.getBoundingClientRect();
    for (const touch of e.changedTouches) {
      applyTouchBurst(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }, { passive: true });
}
