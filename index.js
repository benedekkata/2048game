var CANVAS_SIZE = 800;
var FONT_SIZE = 40;
var canvas = document.getElementById("gameCanvas");

//Setting the singleton context type for the canvas and getting it's reference back. Context is used to draw the things, canvas is the holder box
var context = canvas.getContext("2d");
var grid = [];

canvas.height = CANVAS_SIZE;
canvas.width = CANVAS_SIZE;

var backgroundColor = "#542169";
var gridLineColor = "#BD8CF5";
var cellColor = {
  2: "#BD8CF5",
  4: "#E9C46A",
  8: "#F4A261",
  16: "#DAA1D3",
  32: "#F7B7A3",
  64: "#C08497",
  128: "#D291BC",
  256: "#E5989B",
  512: "#9D8189",
  1024: "#BD93D8",
  2048: "#A078C4",
};
var emptyColor = "#E7D7FE";
var textColor = "#FFF";
var gridPadding = 12;
var cellSize = (CANVAS_SIZE - gridPadding * 5) / 4;

var movementBlocked = false;

var numbersAdded = false;

var score = 0;
var bestScore = localStorage.getItem("bestScore") ?? 0;

function drawTiles() {
  let i = 0;
  let j = 0;
  if (context) {
    for (
      let y = gridPadding;
      y <= CANVAS_SIZE - cellSize;
      y += cellSize + gridPadding
    ) {
      j = 0; // Reset j for each row
      for (
        let x = gridPadding;
        x <= CANVAS_SIZE - cellSize;
        x += cellSize + gridPadding
      ) {
        let element = grid[i][j];

        // Set the fill color based on the element value
        if (element === 0) {
          context.fillStyle = emptyColor;
        } else {
          context.fillStyle = cellColor[element];
        }

        // Draw the tile
        context.beginPath(); // Start a new path for each tile
        context.roundRect(x, y, cellSize, cellSize, 12);
        context.fill(); // Fill the tile with the current fillStyle

        j++;
      }
      i++;
    }
  }
}

function drawNumbers() {
  context.fillStyle = textColor;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let element = grid[i][j];
      if (element !== 0) {
        context.beginPath();
        context.font = `${FONT_SIZE}px sans-serif`;
        const textWidth = context.measureText(element).width;
        context.fillText(
          element,
          j * (cellSize + gridPadding) +
            (cellSize / 2 + gridPadding - textWidth / 2),
          i * (cellSize + gridPadding) +
            cellSize / 2 +
            FONT_SIZE / 2 +
            FONT_SIZE / 10
        );
      }
    }
  }
  context.stroke();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStartCoordinates() {
  let x1S = getRandomInt(0, 3);
  let y1S = getRandomInt(0, 3);
  let x2S = getRandomInt(0, 3);
  let y2S = getRandomInt(0, 3);

  while (x1S === x2S && y1S === y2S) {
    console.log("Same coordinate, recalculating...");
    x1S = getRandomInt(0, 3);
    y1S = getRandomInt(0, 3);
    x2S = getRandomInt(0, 3);
    y2S = getRandomInt(0, 3);
  }

  return { x1S, x2S, y1S, y2S };
}

function initGame() {
  grid = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const { x1S, x2S, y1S, y2S } = getStartCoordinates();

  grid[x1S][y1S] = getRandomInt(0, 1) ? 2 : 4;
  grid[x2S][y2S] = getRandomInt(0, 1) ? 2 : 4;
}

function restart() {
  score = 0;
  document.getElementById("score").innerHTML = score;
  initGame();
  drawState();
}

function drawState() {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawTiles();
  drawNumbers();
}

function leftRecursion(indexToMove, row) {
  if (indexToMove - 1 < 0) {
    return row;
  }
  let element = row[indexToMove];
  let elementBefore = row[indexToMove - 1];
  if (element === elementBefore && !numbersAdded) {
    row[indexToMove - 1] = element + elementBefore;
    row[indexToMove] = 0;
    score += element + elementBefore;
    numbersAdded = true;
    return row;
  } else if (elementBefore === 0) {
    row[indexToMove - 1] = element + elementBefore;
    row[indexToMove] = 0;
  }
  return leftRecursion(indexToMove - 1, row);
}

function rightRecursion(indexToMove, row) {
  if (indexToMove + 1 >= row.length) {
    return row;
  }
  let element = row[indexToMove];
  let elementAfter = row[indexToMove + 1];
  if (element === elementAfter && !numbersAdded) {
    row[indexToMove + 1] = element + elementAfter;
    row[indexToMove] = 0;
    score += element + elementAfter;
    numbersAdded = true;
    return row;
  } else if (elementAfter === 0) {
    row[indexToMove + 1] = element + elementAfter;
    row[indexToMove] = 0;
  }
  return rightRecursion(indexToMove + 1, row);
}

function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Create an empty matrix for the transposed result
  let transposedMatrix = Array.from({ length: cols }, () =>
    Array(rows).fill(0)
  );

  // Iterate over the matrix and swap rows with columns
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposedMatrix[j][i] = matrix[i][j];
    }
  }

  return transposedMatrix;
}

function moveVertical(dir) {
  let transposedGrid = transposeMatrix(grid);
  if (dir === 1) {
    for (let i = 0; i < 4; i++) {
      numbersAdded = false;
      for (let j = 3; j >= 0; j--) {
        let element = transposedGrid[i][j];
        if (element !== 0) {
          rightRecursion(j, transposedGrid[i]);
        }
      }
    }
  } else {
    for (let i = 0; i < 4; i++) {
      numbersAdded = false;
      for (let j = 0; j < 4; j++) {
        let element = transposedGrid[i][j];
        if (element !== 0) {
          leftRecursion(j, transposedGrid[i]);
        }
      }
    }
  }
  grid = transposeMatrix(transposedGrid);
}

function moveHorizontal(dir) {
  if (dir === 1) {
    for (let i = 0; i < 4; i++) {
      numbersAdded = false;
      for (let j = 3; j >= 0; j--) {
        let element = grid[i][j];
        if (element !== 0) {
          rightRecursion(j, grid[i]);
        }
      }
    }
  } else {
    for (let i = 0; i < 4; i++) {
      numbersAdded = false;
      for (let j = 0; j < 4; j++) {
        let element = grid[i][j];
        if (element !== 0) {
          leftRecursion(j, grid[i]);
        }
      }
    }
  }
}

function getEmptyFieldIndexes() {
  let emptyFieldIndexes = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyFieldIndexes.push({ x: i, y: j });
      }
    }
  }
  return emptyFieldIndexes;
}

function isValidMoveAvailable() {
  // Check if there is a valid merge that can be made
  return true;
}

function getGameState() {
  if (grid.some((row) => row.some((el) => el === 2048))) {
    return { gameOver: true, gameOverText: "You Win" };
  }

  const emptyFieldIndexes = getEmptyFieldIndexes();
  if (emptyFieldIndexes.length === 0 && !isValidMoveAvailable()) {
    return { gameOver: true, gameOverText: "Game Over - You Lose" };
  }

  return { gameOver: false, gameOverText: "" };
}

function addRandomElement() {
  let randomElement = getRandomInt(0, 1) ? 2 : 4;
  //Find all empty field indexes and use that to randomly select one
  const emptyFieldIndexes = getEmptyFieldIndexes();

  const randomIndex = getRandomInt(0, emptyFieldIndexes.length - 1);
  grid[emptyFieldIndexes[randomIndex].x][emptyFieldIndexes[randomIndex].y] =
    randomElement;
}

function isGridChanged(gridBefore, gridAfter) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (gridBefore[i][j] !== gridAfter[i][j]) {
        return true;
      }
    }
  }
  return false;
}

//Copy the grid to a new array
function copyGrid(grid) {
  return grid.map((row) => row.slice());
}

function keyPressed(event) {
  if (movementBlocked) {
    return;
  }
  const gridBefore = copyGrid(grid);
  switch (event.code) {
    case "ArrowUp":
      moveVertical(-1);
      break;
    case "ArrowDown":
      moveVertical(1);
      break;
    case "ArrowLeft":
      moveHorizontal(-1);
      break;
    case "ArrowRight":
      moveHorizontal(1);
      break;
    default:
      break;
  }

  document.getElementById("score").innerHTML = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", score);
    document.getElementById("bestScore").innerHTML = score;
  }
  // Draw the new state (before adding a new element)
  drawState();

  // Check if the grid has changed, if so, add a new element and check for win or lose
  if (isGridChanged(gridBefore, grid)) {
    movementBlocked = true;
    delay(250).then(() => {
      // Add a new element to the grid
      addRandomElement();
      const gameSate = getGameState();
      console.log(gameSate);
      if (gameSate.gameOver) {
        drawGameOver(gameSate.gameOverText);
      } else {
        drawState();
      }
      movementBlocked = false;
    });
  }
}

function drawGameOver(text) {
  console.log(text);
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.fillStyle = textColor;
  context.font = `${FONT_SIZE}px sans-serif`;
  const textWidth = context.measureText(text).width;
  context.fillText(
    text,
    CANVAS_SIZE / 2 - textWidth / 2,
    CANVAS_SIZE / 2 + FONT_SIZE / 2
  );
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

document.onkeydown = keyPressed;

restart();
document.getElementById("bestScore").innerHTML = bestScore;