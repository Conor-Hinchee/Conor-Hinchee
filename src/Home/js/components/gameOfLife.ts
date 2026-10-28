const Cell_Width = 10;
const Cell_Height = 10;
const TickRateMS = 250;
const Seed = 4; // we use to seed the board 2 is 50%. 4 is 25%. 8 is 12.5 % ...

type Cell = {
  alive: boolean;
  age: number;
  domItem: HTMLDivElement | null;
  neighbors: number[];
};

let Game_Board: Cell[] = [];
let gameSimulationInterval: ReturnType<typeof setInterval> | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
let currentColumns = 0;
const ResizeDebounceMS = 200;

const initCells = (totalCells: number) => {
  const array = new Uint8Array(totalCells);
  self.crypto.getRandomValues(array);

  array.forEach((rng) => {
    Game_Board.push({
      alive: rng % Seed === 0,
      age: 0,
      domItem: null,
      neighbors: [],
    });
  });
};

const initNeighbors = (index: number, rows: number, columns: number) => {
  const row = Math.floor(index / columns);
  const col = index % columns;

  const neighbors = [];

  // Check all 8 directions with wrapping
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      // Skip the center cell itself
      if (dRow === 0 && dCol === 0) continue;

      // Calculate neighbor position with wrapping
      const neighborRow = (row + dRow + rows) % rows;
      const neighborCol = (col + dCol + columns) % columns;

      // Convert back to index
      const neighborIndex = neighborRow * columns + neighborCol;
      neighbors.push(neighborIndex);
    }
  }

  return neighbors;
};

const measureGrid = (box: Element) => {
  // Calculate columns first, then derive rows so every row is full-width
  const columns = Math.floor(box.clientWidth / Cell_Width);
  const rows = Math.ceil(box.clientHeight / Cell_Height) + 1;
  return { columns, rows };
};

const drawBoard = () => {
  const box = document.querySelector("#gameOfLife");
  if (!box) return;
  const { columns, rows } = measureGrid(box);
  currentColumns = columns;

  const totalCells = rows * columns;

  initCells(totalCells);

  Game_Board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.style.width = `${Cell_Width}px`;
    div.style.height = `${Cell_Height}px`;
    div.style.backgroundColor = "white";
    div.style.border = "1px solid black";
    div.style.flexGrow = "0";
    div.style.flexShrink = "0";
    div.style.cursor = "pointer";
    div.style.transition = "all 150ms ease";

    const cellClass = cell.alive ? "worm" : "skull";
    div.classList.add(cellClass);

    // Add hover effect
    div.addEventListener("mouseenter", () => {
      div.style.opacity = "0.8";
      div.style.transform = "scale(0.95)";
    });

    div.addEventListener("mouseleave", () => {
      div.style.opacity = "1";
      div.style.transform = "scale(1)";
    });

    // Add click handler to toggle cell
    div.addEventListener("click", () => {
      const currentCell = Game_Board[index];
      if (!currentCell) return;
      currentCell.alive = !currentCell.alive;
      currentCell.age = currentCell.alive ? 0 : -1;
      const newClass = currentCell.alive ? "worm" : "skull";
      const oldClass = currentCell.alive ? "skull" : "worm";
      div.classList.remove(oldClass);
      div.classList.add(newClass);
    });

    cell.domItem = div;
    cell.neighbors = [...initNeighbors(index, rows, columns)];
    box.appendChild(div);
  });

  // Full-width last row fix: append a flex spacer that grows to fill the
  // remaining space in the last (possibly partial) row.
  const lastRowCells = totalCells % columns;
  if (lastRowCells !== 0) {
    const spacer = document.createElement("div");
    spacer.style.flexGrow = "1";
    spacer.style.height = `${Cell_Height}px`;
    spacer.style.pointerEvents = "none";
    box.appendChild(spacer);
  }
};

const totalAliveNeighbors = (neighbors: number[]) => {
  let aliveNeighbors = 0;
  neighbors.forEach((cellIndex) => {
    if (Game_Board[cellIndex]?.alive) {
      aliveNeighbors++;
    }
  });

  return aliveNeighbors;
};

const paintBoard = () => {
  Game_Board.forEach((cell) => {
    const { alive, age, domItem } = cell;
    if (!domItem) return;

    if (!alive && age === -1) {
      domItem.classList.remove("worm");
      domItem.classList.add("skull");
    }

    if (!alive && age !== -1) {
      domItem.classList.remove("skull");
    }

    if (alive) {
      domItem.classList.remove("skull");
      domItem.classList.add("worm");
    }
  });
};

const play = () => {
  // Create a deep copy of the board state
  const gameBoardCopy = Game_Board.map(cell => ({...cell}));

  Game_Board.forEach((cell, i) => {
    const { alive, age, neighbors } = cell;
    const aliveNeighbors = totalAliveNeighbors(neighbors);
    const nextCell = gameBoardCopy[i];
    if (!nextCell) return;

    if (alive) {
      if (aliveNeighbors < 2) {
        // Underpopulation
        nextCell.alive = false;
        nextCell.age = -1;
      } else if (aliveNeighbors > 3) {
        // Overpopulation
        nextCell.alive = false;
        nextCell.age = -1;
      } else {
        // Survival (2 or 3 neighbors)
        nextCell.age = age + 1;
      }
    } else {
      if (aliveNeighbors === 3) {
        // Reproduction
        nextCell.alive = true;
        nextCell.age = 0;
      } else if (age === -1) {
        nextCell.age = 0;
      }
    }
  });

  Game_Board = gameBoardCopy;
  paintBoard();
};

const pauseSimulation = () => {
  if (gameSimulationInterval !== null) {
    clearInterval(gameSimulationInterval);
    gameSimulationInterval = null;
  }
};

const resumeSimulation = () => {
  if (gameSimulationInterval === null) {
    gameSimulationInterval = setInterval(play, TickRateMS);
  }
};

const rebuildBoard = () => {
  const box = document.querySelector("#gameOfLife");

  // Clear the board
  Game_Board = [];
  if (!box) return;
  box.innerHTML = "<div class=\"sr-only\">Conway's Game Of Life</div>";

  drawBoard();
};

const resetGame = () => {
  pauseSimulation();
  rebuildBoard();
  // Resume (IntersectionObserver already watching)
  resumeSimulation();
};

const initResizeObserver = (box: Element) => {
  resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Width only: the box's height follows its own rows of cells, so
      // comparing rows would rebuild once more after every draw.
      // Also absorbs the initial callback on observe().
      const { columns } = measureGrid(box);
      if (columns === currentColumns) return;

      // Only resume if it was running; off-screen boards stay paused
      const wasRunning = gameSimulationInterval !== null;
      pauseSimulation();
      rebuildBoard();
      if (wasRunning) resumeSimulation();
    }, ResizeDebounceMS);
  });
  resizeObserver.observe(box);
};

const cleanupResizeObserver = () => {
  clearTimeout(resizeTimer);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
};

const initIntersectionObserver = () => {
  const box = document.querySelector("#gameOfLife");
  if (!box) return;

  // Configure observer to detect when element enters/leaves viewport
  const observerOptions = {
    root: null, // Use viewport as root
    threshold: 0.1, // Trigger when 10% of the element is visible
  };

  // Create observer callback
  const observerCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Element is now visible in viewport
        resumeSimulation();
      } else {
        // Element is no longer visible in viewport
        pauseSimulation();
      }
    });
  };

  // Create and start observing
  intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
  intersectionObserver.observe(box);
};

const cleanupIntersectionObserver = () => {
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
};

const initGameOfLife = () => {
  const box = document.querySelector("#gameOfLife");

  if (!box) return;
  drawBoard();

  // Don't start the simulation yet — IntersectionObserver will start it
  // only when the board enters the viewport, and pause it when it leaves.
  initIntersectionObserver();
  initResizeObserver(box);

  // Attach reset button handler
  const resetButton = document.querySelector("#gameOfLifeReset");
  if (resetButton) {
    resetButton.addEventListener("click", resetGame);
  }

  // Pause/resume is controlled by the IntersectionObserver only.
};

export default initGameOfLife;
export { cleanupIntersectionObserver, cleanupResizeObserver, pauseSimulation, resumeSimulation };
