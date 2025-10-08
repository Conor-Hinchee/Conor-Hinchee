const Cell_Width = 10;
const Cell_Height = 10;
const TickRateMS = 250;
const Seed = 4; // we use to seed the board 2 is 50%. 4 is 25%. 8 is 12.5 % ...
let Game_Board = [];

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

    const cellClass = cell.alive ? "worm" : "skull";
    div.classList.add(cellClass);

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

const initGameOfLife = () => {
  const box = document.querySelector("#gameOfLife");

  if (!box) return;
  drawBoard();
  setInterval(play, TickRateMS);
};

export default initGameOfLife;
