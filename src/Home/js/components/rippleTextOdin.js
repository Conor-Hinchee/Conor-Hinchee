// Physics constants (same as rippleText.js)
const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 80;
const SPRING_STIFFNESS = 0.01;
const DAMPING = 0.96;
const TOUCH_BURST_RADIUS = 60;
const TOUCH_BURST_STRENGTH = 12;

/**
 * Initialize Odin ripple text effect on canvas
 * @returns {void}
 */
export default function initRippleTextOdin() {
  const container = document.querySelector("#ripple-text-odin-container");
  if (!container) return;

  const h1 = container.querySelector("h1");
  if (!h1) return;

  container.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "About Odin: A Discord bot with 50+ tools, persistent memory, Norse-mythology agents, and a nightly self-improvement loop that autonomously patches its own prompts and skills."
  );
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const computedStyle = window.getComputedStyle(h1);
  const baseFontFamily = computedStyle.fontFamily;
  const emojiFontFamily = "\"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\", sans-serif";
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

  const sections = [
    {
      text: "Odin is a self-hosted agent harness with memory, tool orchestration, and a self-improvement loop.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.8,
      marginBottom: 20
    },
    {
      text: "It executes complex workflows autonomously by coordinating tools and maintaining context across tasks.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.8,
      marginBottom: 24
    },
    {
      text: "Odin turns specs into pull requests, runs research tasks, and manages long-running work.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.8,
      marginBottom: 8
    },
    {
      text: "Odin is a self-improving coding agent. It creates and patches its own skills, modifies its own prompts, and refines its behavior based on usage over time.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.8,
      italic: true,
      marginBottom: 20
    }
  ];

  const remToPx = 16;
  let cursor = null;
  let characters = [];

  function getFontSizePixels(remSize) {
    return remSize * remToPx;
  }

  function wrapText(text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  }

  function layoutCharacters() {
    characters = [];
    const pixelWidth = canvas.width / window.devicePixelRatio;
    let y = 24;

    for (const section of sections) {
      const fontPixels = getFontSizePixels(section.fontSize);
      const lineHeight = fontPixels * 1.6;
      const fontStyle = section.italic ? "italic " : "";
      ctx.font = `${fontStyle}${fontPixels}px ${baseFontFamily}`;

      const maxWidth = pixelWidth * (section.widthRatio || 0.8);
      const wrappedLines = wrapText(section.text, maxWidth);

      for (const line of wrappedLines) {
        const lineWidth = ctx.measureText(line).width;
        const x = (pixelWidth - lineWidth) / 2;

        const glyphs = Array.from(line);
        let cx = x;
        for (const char of glyphs) {
          const isEmoji = emojiRegex.test(char);
          if (isEmoji) ctx.font = `${fontStyle}${fontPixels}px ${emojiFontFamily}`;
          const charWidth = ctx.measureText(char).width;
          if (isEmoji) ctx.font = `${fontStyle}${fontPixels}px ${baseFontFamily}`;
          characters.push({
            char, homeX: cx, homeY: y,
            dx: 0, dy: 0, vx: 0, vy: 0,
            fontSize: section.fontSize,
            italic: section.italic || false
          });
          cx += charWidth;
        }
        y += lineHeight;
      }
      y += section.marginBottom || 0;
    }

    container.style.minHeight = `${y + 24}px`;
  }

  function resizeCanvas() {
    canvas.style.display = "none";
    const rect = container.getBoundingClientRect();
    canvas.style.display = "";
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(rect.width, 1) * dpr;
    canvas.height = Math.max(rect.height, 1) * dpr;
    ctx.scale(dpr, dpr);
    layoutCharacters();
  }

  function applyTouchBurst(cx, cy) {
    for (const char of characters) {
      const dist = Math.hypot(char.homeX + char.dx - cx, char.homeY + char.dy - cy);
      if (dist < TOUCH_BURST_RADIUS) {
        const factor = 1 - dist / TOUCH_BURST_RADIUS;
        const angle = Math.atan2(char.homeY + char.dy - cy, char.homeX + char.dx - cx);
        char.vx += Math.cos(angle) * factor * TOUCH_BURST_STRENGTH;
        char.vy += Math.sin(angle) * factor * TOUCH_BURST_STRENGTH;
      }
    }
  }

  function animate() {
    const pixelWidth = canvas.width / window.devicePixelRatio;
    const pixelHeight = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);

    for (const char of characters) {
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
      char.vx += (0 - char.dx) * SPRING_STIFFNESS;
      char.vy += (0 - char.dy) * SPRING_STIFFNESS;
      char.vx *= DAMPING;
      char.vy *= DAMPING;
      char.dx += char.vx;
      char.dy += char.vy;

      const charX = char.homeX + char.dx;
      const charY = char.homeY + char.dy;
      const fontPixels = getFontSizePixels(char.fontSize);
      const isEmoji = emojiRegex.test(char.char);
      const fontStyle = char.italic ? "italic " : "";
      const fontFamily = isEmoji ? emojiFontFamily : baseFontFamily;
      ctx.font = `${fontStyle}${fontPixels}px ${fontFamily}`;
      ctx.fillStyle = "#c8a84e";
      ctx.textBaseline = "top";
      ctx.fillText(char.char, charX, charY);
    }

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  animate();

  new ResizeObserver(() => resizeCanvas()).observe(container);

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });
  canvas.addEventListener("pointerleave", () => { cursor = null; });
  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") {
      const rect = canvas.getBoundingClientRect();
      applyTouchBurst(e.clientX - rect.left, e.clientY - rect.top);
    }
  });
}
