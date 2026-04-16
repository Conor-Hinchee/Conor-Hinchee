const Cell_Width = 10;
const Cell_Height = 10;
const TickRateMS = 250;
const Seed = 4; // we use to seed the board 2 is 50%. 4 is 25%. 8 is 12.5 % ...
let Game_Board = [];
let gameSimulationInterval = null;
let isSimulationPaused = false;
let intersectionObserver = null;

const initCells = (totalCells) => {
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

const initNeighbors = (index, rows, columns) => {
  const row = Math.floor(index / columns);
  const col = index % columns;
  
  const neighbors = [];
  
  // Check all 8 directions with wrapping
  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      // Skip the center cell itself
      if (dRow === 0 && dCol === 0) continue;
      
      // Calculate neighbor position with wrapping
      let neighborRow = (row + dRow + rows) % rows;
      let neighborCol = (col + dCol + columns) % columns;
      
      // Convert back to index
      const neighborIndex = neighborRow * columns + neighborCol;
      neighbors.push(neighborIndex);
    }
  }
  
  return neighbors;
};

const drawBoard = () => {
  const box = document.querySelector("#gameOfLife");
  const boxHeight = box.clientHeight;
  const boxWidth = box.clientWidth;

  const rows = Math.floor(boxHeight / Cell_Height + 2);
  const columns = Math.floor(boxWidth / Cell_Width);

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
};

const totalAliveNeighbors = (neighbors) => {
  let aliveNeighbors = 0;
  neighbors.forEach((cellIndex) => {
    if (Game_Board[cellIndex].alive) {
      aliveNeighbors++;
    }
  });

  return aliveNeighbors;
};

const paintBoard = () => {
  console.log("painting board");
  Game_Board.forEach((cell) => {
    const { alive, age, domItem } = cell;

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

    if (alive) {
      if (aliveNeighbors < 2) {
        // Underpopulation
        gameBoardCopy[i].alive = false;
        gameBoardCopy[i].age = -1;
      } else if (aliveNeighbors > 3) {
        // Overpopulation
        gameBoardCopy[i].alive = false;
        gameBoardCopy[i].age = -1;
      } else {
        // Survival (2 or 3 neighbors)
        gameBoardCopy[i].age = age + 1;
      }
    } else {
      if (aliveNeighbors === 3) {
        // Reproduction
        gameBoardCopy[i].alive = true;
        gameBoardCopy[i].age = 0;
      } else if (age === -1) {
        gameBoardCopy[i].age = 0;
      }
    }
  });

  Game_Board = gameBoardCopy;
  paintBoard();
};

const pauseSimulation = () => {
  if (!isSimulationPaused && gameSimulationInterval !== null) {
    clearInterval(gameSimulationInterval);
    isSimulationPaused = true;
  }
};

const resumeSimulation = () => {
  if (isSimulationPaused) {
    gameSimulationInterval = setInterval(play, TickRateMS);
    isSimulationPaused = false;
  }
};

const resetGame = () => {
  const box = document.querySelector("#gameOfLife");

  // Stop any running simulation
  if (gameSimulationInterval !== null) {
    clearInterval(gameSimulationInterval);
    gameSimulationInterval = null;
  }
  isSimulationPaused = false;

  // Clear the board
  Game_Board = [];
  box.innerHTML = "<div class=\"sr-only\">Conway's Game Of Life</div>";

  // Reinitialize the game
  drawBoard();
  gameSimulationInterval = setInterval(play, TickRateMS);
};

const initIntersectionObserver = () => {
  const box = document.querySelector("#gameOfLife");
  if (!box) return;

  // Configure observer to detect when element enters/leaves viewport
  const observerOptions = {
    root: null, // Use viewport as root
    threshold: 0, // Trigger when any part of the element is visible
  };

  // Create observer callback
  const observerCallback = (entries) => {
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

  // Start the simulation
  gameSimulationInterval = setInterval(play, TickRateMS);

  // Initialize viewport detection
  initIntersectionObserver();

  // Attach reset button handler
  const resetButton = document.querySelector("#gameOfLifeReset");
  if (resetButton) {
    resetButton.addEventListener("click", resetGame);
  }
};

export default initGameOfLife;
export { cleanupIntersectionObserver, pauseSimulation, resumeSimulation };
