// Physics constants
const REPEL_RADIUS = 150;
const REPEL_STRENGTH = 80;
const SPRING_STIFFNESS = 0.01;
const DAMPING = 0.96;
const TOUCH_BURST_RADIUS = 60;
const TOUCH_BURST_STRENGTH = 12;

/**
 * Initialize ripple text effect on canvas
 * @returns {void}
 */
export default function initRippleText() {
  // Get target container
  const container = document.querySelector("#ripple-text-container");
  if (!container) {
    return;
  }

  // Get existing h1 for font styling
  const h1 = container.querySelector("h1");
  if (!h1) {
    return;
  }

  // Create and insert canvas
  // Style container for absolute positioning of canvas
  container.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "About Conor Hinchee: Senior Software Engineer based in Ohio, specializing in building engaging user experiences, with 3+ years e-commerce and 6+ years development experience. Currently architecting AI-powered systems and multi-agent orchestration platforms."
  );
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  // Get computed styles for font
  const computedStyle = window.getComputedStyle(h1);
  const baseFontFamily = computedStyle.fontFamily;
  const emojiFontFamily = "\"Apple Color Emoji\", \"Segoe UI Emoji\", \"Noto Color Emoji\", sans-serif";
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;

  // Text sections with styling metadata
  // widthRatio controls how much of the canvas width text can fill (like CSS w-3/4, w-1/2)
  const sections = [
    {
      text: "OH HI THERE 👋!",
      fontSize: 1.875, // text-3xl
      align: "center",
      widthRatio: 1,
      marginBottom: 20
    },
    {
      text: "I'm Conor Hinchee, a Senior Software Engineer based in Ohio, specializing in building engaging user experiences and transforming complex ideas into seamless, scalable applications.",
      fontSize: 1.125, // text-lg
      align: "center",
      widthRatio: 0.75,
      marginBottom: 24
    },
    {
      text: "Bringing 3+ years of experience in e-commerce engineering and over 6 years of development experience, I have a proven track record of delivering innovative, performance-driven web applications.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.75,
      marginBottom: 24
    },
    {
      text: "What Sets Me Apart:",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.5,
      bold: true,
      underline: true,
      marginBottom: 12
    },
    {
      text: "• Proven experience in leading projects, mentoring engineers, and contributing to open-source software.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.5,
      marginBottom: 16
    },
    {
      text: "• Collaborative, with strong communication skills, and a history of delivering projects on time.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.5,
      marginBottom: 16
    },
    {
      text: "• Committed to delivering accessible solutions, efficient code, and test driven development.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.5,
      marginBottom: 24
    },
    {
      text: "I'm currently architecting AI-powered systems and building multi-agent orchestration platforms 🤖, with persistent memory and autonomous task execution 🚀.",
      fontSize: 1.125,
      align: "center",
      widthRatio: 0.75,
      marginBottom: 20
    }
  ];

  // Font sizes
  const remToPx = 16;

  // State
  let cursor = null;
  let isDarkMode = document.documentElement.classList.contains("dark");
  let characters = [];

  /**
   * Get text color based on dark mode
   */
  function getTextColor() {
    return isDarkMode ? "#ffffff" : "#111827";
  }

  /**
   * Calculate font size in pixels
   */
  function getFontSizePixels(remSize) {
    return remSize * remToPx;
  }

  /**
   * Word-wrap text into lines that fit within maxWidth
   */
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

  /**
   * Layout characters and create physics objects
   */
  function layoutCharacters() {
    characters = [];
    const pixelWidth = canvas.width / window.devicePixelRatio;

    let y = 40;

    for (const section of sections) {
      const fontPixels = getFontSizePixels(section.fontSize);
      const lineHeight = fontPixels * 1.5;
      const fontWeight = section.bold ? "bold " : "";
      ctx.font = `${fontWeight}${fontPixels}px ${baseFontFamily}`;

      const maxWidth = pixelWidth * (section.widthRatio || 0.75);
      const wrappedLines = wrapText(section.text, maxWidth);

      for (const line of wrappedLines) {
        const lineWidth = ctx.measureText(line).width;
        let x;
        if (section.align === "center") {
          x = (pixelWidth - lineWidth) / 2;
        } else {
          x = (pixelWidth - maxWidth) / 2;
        }

        const glyphs = Array.from(line);
        for (const char of glyphs) {
          const isEmoji = emojiRegex.test(char);
          if (isEmoji) {
            ctx.font = `${fontWeight}${fontPixels}px ${emojiFontFamily}`;
          }
          const charWidth = ctx.measureText(char).width;
          if (isEmoji) {
            ctx.font = `${fontWeight}${fontPixels}px ${baseFontFamily}`;
          }
          characters.push({
            char,
            homeX: x,
            homeY: y,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0,
            fontSize: section.fontSize,
            bold: section.bold || false,
            underline: section.underline || false
          });
          x += charWidth;
        }

        y += lineHeight;
      }

      y += section.marginBottom || 0;
    }

    // Set container height based on text layout
    container.style.minHeight = `${y + 20}px`;
  }

  /**
   * Resize canvas with HiDPI scaling
   */
  function resizeCanvas() {
    // Collapse canvas before measuring to prevent feedback loop
    canvas.style.display = "none";
    const rect = container.getBoundingClientRect();
    canvas.style.display = "";

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    canvas.width = width * dpr;
    canvas.height = height * dpr;

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
    ctx.fillStyle = "transparent";
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

      // Use per-character font info
      const fontWeight = char.bold ? "bold " : "";
      const fontPixels = getFontSizePixels(char.fontSize);
      const isEmoji = emojiRegex.test(char.char);
      const fontFamily = isEmoji ? emojiFontFamily : baseFontFamily;

      ctx.font = `${fontWeight}${fontPixels}px ${fontFamily}`;
      ctx.fillStyle = getTextColor();
      ctx.textBaseline = "top";
      ctx.fillText(char.char, charX, charY);

      // Draw underline if needed
      if (char.underline) {
        const charWidth = ctx.measureText(char.char).width;
        ctx.strokeStyle = getTextColor();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(charX, charY + fontPixels + 2);
        ctx.lineTo(charX + charWidth, charY + fontPixels + 2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(animate);
  }

  /**
   * Pointer move handler
   */
  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    cursor = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
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
    if (e.pointerType === "touch") {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      applyTouchBurst(cx, cy);
    }
  }

  /**
   * Dark mode change observer
   */
  function setupDarkModeObserver() {
    const observer = new MutationObserver(() => {
      isDarkMode = document.documentElement.classList.contains("dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
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
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerleave", handlePointerLeave);
  canvas.addEventListener("pointerdown", handlePointerDown);
}
