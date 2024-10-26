const CANVAS_SIZE = 800;
const FONT_SIZE = 40;
const canvas = document.getElementById("gameCanvas");

//Setting the singleton context type for the canvas and getting it's reference back. Context is used to draw the things, canvas is the holder box
const context = canvas.getContext("2d");
let grid = [];

canvas.height = CANVAS_SIZE;
canvas.width = CANVAS_SIZE;

const backgroundColor = "#542169";
const blurBackgroundColor = "#54216950";
const cellColor = {
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
const emptyColor = "#E7D7FE";
const textColor = "#FFF";
const gridPadding = 12;
const cellSize = (CANVAS_SIZE - gridPadding * 5) / 4;

let movementBlocked = false;

let score = 0;
let bestScore = localStorage.getItem("bestScore") ?? 0;

/**
 * Draws the colored tiles and the numbers on the canvas
 */
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
        let element = grid[i][j].value;

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

        // Draw the number if the tile is not empty
        if (element !== 0) {
          context.fillStyle = textColor;
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
          context.stroke();
        }

        j++;
      }
      i++;
    }
  }
}

/**
 * Returns a random integer between min and max (inclusive)
 * @param {number} min The minimum value
 * @param {number} max The maximum value
 * @returns {number} A random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects two random coordinates on the grid; ensures that the two coordinates are unique
 * @returns {object} An object with the coordinates of the two tiles
 */
function getStartCoordinates() {
  const coordinates = [
    { x: getRandomInt(0, 3), y: getRandomInt(0, 3) },
    { x: getRandomInt(0, 3), y: getRandomInt(0, 3) },
  ];

  // Ensure the two coordinates are unique
  while (
    coordinates[0].x === coordinates[1].x &&
    coordinates[0].y === coordinates[1].y
  ) {
    coordinates[1] = { x: getRandomInt(0, 3), y: getRandomInt(0, 3) };
  }

  return {
    x1S: coordinates[0].x,
    y1S: coordinates[0].y,
    x2S: coordinates[1].x,
    y2S: coordinates[1].y,
  };
}

/**
 * Initializes the game by creating a grid with two random tiles
 */
function initGame() {
  grid = Array.from({ length: 4 }, () =>
    new Array(4).fill({ value: 0, isCombined: false })
  );
  const { x1S, x2S, y1S, y2S } = getStartCoordinates();

  grid[x1S][y1S] = getRandomInt(0, 1)
    ? { value: 2, isCombined: false }
    : { value: 4, isCombined: false };
  grid[x2S][y2S] = getRandomInt(0, 1)
    ? { value: 2, isCombined: false }
    : { value: 4, isCombined: false };
}

/**
 * Restarts the game by resetting the score and the grid
 */
function restart() {
  score = 0;
  movementBlocked = false;
  document.getElementById("score").innerHTML = score;
  initGame();
  drawState();
}

/**
 * Draws the current state of the game on the canvas
 */
function drawState() {
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawTiles();
}

/**
 * A recursive function to move an element to the left based on the rules of the game
 * @param {number} indexToMove The index of the element to move
 * @param {array} row The row to move the element in
 * @returns
 */
function leftRecursion(indexToMove, row) {
  if (indexToMove - 1 < 0) {
    return row;
  }
  let element = row[indexToMove].value;
  let elementIsCombined = row[indexToMove].isCombined;
  let elementBefore = row[indexToMove - 1].value;
  let elementBeforeIsCombined = row[indexToMove - 1].isCombined;
  if (
    element === elementBefore &&
    !elementIsCombined &&
    !elementBeforeIsCombined
  ) {
    row[indexToMove - 1] = { value: element + elementBefore, isCombined: true };
    row[indexToMove] = { value: 0, isCombined: true };

    score += element + elementBefore;
    return row;
  } else if (elementBefore === 0) {
    row[indexToMove - 1] = {
      value: element + elementBefore,
      isCombined: false,
    };
    row[indexToMove] = { value: 0, isCombined: false };
  }
  return leftRecursion(indexToMove - 1, row);
}

/**
 * A recursive function to move an element to the right based on the rules of the game
 * @param {number} indexToMove The index of the element to move
 * @param {array} row The row to move the element in
 * @returns
 */
function rightRecursion(indexToMove, row) {
  if (indexToMove + 1 >= row.length) {
    return row;
  }
  let element = row[indexToMove].value;
  let elementIsCombined = row[indexToMove].isCombined;
  let elementAfter = row[indexToMove + 1].value;
  let elementAfterIsCombined = row[indexToMove + 1].isCombined;
  if (
    element === elementAfter &&
    !elementIsCombined &&
    !elementAfterIsCombined
  ) {
    row[indexToMove + 1] = { value: element + elementAfter, isCombined: true };
    row[indexToMove] = { value: 0, isCombined: true };

    score += element + elementAfter;
    return row;
  } else if (elementAfter === 0) {
    row[indexToMove + 1] = { value: element + elementAfter, isCombined: false };
    row[indexToMove] = { value: 0, isCombined: false };
  }
  return rightRecursion(indexToMove + 1, row);
}

/**
 * Transposes a matrix
 * @param {array} matrix
 * @returns {array} The transposed matrix
 */
function transposeMatrix(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

/**
 * Moves the tiles vertically
 * @param {number} dir The direction to move (1 for up, -1 for down)
 */
function moveVertical(dir) {
  const transposedGrid = transposeMatrix(grid);

  for (let i = 0; i < 4; i++) {
    const row = transposedGrid[i];
    const start = dir === 1 ? 3 : 0;
    const end = dir === 1 ? -1 : 4;
    const step = dir === 1 ? -1 : 1;

    for (let j = start; j !== end; j += step) {
      if (row[j].value !== 0) {
        dir === 1 ? rightRecursion(j, row) : leftRecursion(j, row);
      }
    }
  }

  grid = transposeMatrix(transposedGrid);
}

/**
 * Moves the tiles horizontally
 * @param {number} dir The direction to move (1 for left, -1 for right)
 */
function moveHorizontal(dir) {
  for (let i = 0; i < 4; i++) {
    const row = grid[i];
    const start = dir === 1 ? 3 : 0;
    const end = dir === 1 ? -1 : 4;
    const step = dir === 1 ? -1 : 1;

    for (let j = start; j !== end; j += step) {
      if (row[j].value !== 0) {
        dir === 1 ? rightRecursion(j, row) : leftRecursion(j, row);
      }
    }
  }
}

/**
 * Returns an array of empty field indexes
 * @returns {array} An array of empty field indexes
 */
function getEmptyFieldIndexes() {
  return grid
    .flatMap((row, i) =>
      row.map((cell, j) => (cell.value === 0 ? { x: i, y: j } : null))
    )
    .filter(Boolean);
}

/**
 * Checks if there is a valid move available
 * @returns {boolean} True if there is a valid move available, false otherwise
 */
function isValidMoveAvailable() {
  return grid.some((row, i) =>
    row.some(
      (cell, j) =>
        (j < 3 && cell.value === row[j + 1].value) || // Horizontal check
        (i < 3 && cell.value === grid[i + 1][j].value) // Vertical check
    )
  );
}

/**
 * Checks if the game is over and returns the appropriate game state
 * @returns {object} An object with the game state
 */
function getGameState() {
  if (grid.some((row) => row.some((el) => el.value === 2048))) {
    return { gameOver: true, gameOverText: "You Win" };
  }

  const emptyFieldIndexes = getEmptyFieldIndexes();
  if (emptyFieldIndexes.length === 0 && !isValidMoveAvailable()) {
    return { gameOver: true, gameOverText: "Game Over - You Lose" };
  }

  return { gameOver: false, gameOverText: "" };
}

/**
 * Adds a random element to the grid
 */
function addRandomElement() {
  const randomElement = {
    value: getRandomInt(0, 1) ? 2 : 4,
    isCombined: false,
  };
  const emptyFields = getEmptyFieldIndexes();

  if (emptyFields.length) {
    const { x, y } = emptyFields[getRandomInt(0, emptyFields.length - 1)];
    grid[x][y] = randomElement;
  }
}

/**
 * Checks if the grid has changed
 * @param {array} gridBefore The grid before the change
 * @param {array} gridAfter The grid after the change
 * @returns {boolean} True if the grid has changed, false otherwise
 */
function isGridChanged(gridBefore, gridAfter) {
  return gridBefore.some((row, i) =>
    row.some((cell, j) => cell.value !== gridAfter[i][j].value)
  );
}

/**
 * Copies the grid to a new array
 * @param {array} grid The grid to copy
 * @returns {array} A new array with the copied grid
 */
function copyGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

/**
 * Resets the combined property of all cells
 */
function resetCombined() {
  grid.forEach((row) => row.forEach((cell) => (cell.isCombined = false)));
}

/**
 * Main event handler for keyboard events and game logic
 * @param {KeyboardEvent} event
 * @returns
 */
function keyPressed(event) {
  if (movementBlocked) return;

  const directions = {
    ArrowUp: () => moveVertical(-1),
    ArrowDown: () => moveVertical(1),
    ArrowLeft: () => moveHorizontal(-1),
    ArrowRight: () => moveHorizontal(1),
  };

  const moveAction = directions[event.code];
  if (moveAction) {
    const gridBefore = copyGrid(grid);
    moveAction();
    updateScore();
    drawState();

    if (isGridChanged(gridBefore, grid)) {
      movementBlocked = true;
      delay(250).then(() => {
        addRandomElement();
        checkGameState();
      });
    }
  }
}

/**
 * Updates  score and best score
 */
function updateScore() {
  document.getElementById("score").innerHTML = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", score);
    document.getElementById("bestScore").innerHTML = score;
  }
}

/**
 * Checks if the game is over and draws the game over screen if it is
 */
function checkGameState() {
  // Drawing game state under the transparent game over screen
  drawState();
  const gameState = getGameState();
  if (gameState.gameOver) {
    drawGameOver(gameState.gameOverText, score);
  } else {
    movementBlocked = false;
  }
  resetCombined();
}

/**
 * Draws the game over screen
 * @param {string} text The text to display
 * @param {number} score The score to display
 */
function drawGameOver(text, score) {
  const textWidth = context.measureText(text).width;
  const scoreText = `+ ${score}`;
  const scoreWidth = context.measureText(scoreText).width;
  context.beginPath();
  context.fillStyle = blurBackgroundColor;
  context.roundRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, 12);
  context.fill();

  context.beginPath();
  context.fillStyle = backgroundColor;
  context.roundRect(
    CANVAS_SIZE / 2 - textWidth / 2 - gridPadding,
    CANVAS_SIZE / 2 - FONT_SIZE / 2 - gridPadding / 2,
    textWidth + gridPadding * 2,
    FONT_SIZE + gridPadding * 2,
    12
  );
  context.fill();
  context.fillStyle = textColor;
  context.font = `${FONT_SIZE}px sans-serif`;
  context.fillText(
    text,
    CANVAS_SIZE / 2 - textWidth / 2,
    CANVAS_SIZE / 2 + FONT_SIZE / 2
  );

  //Draw score
  context.beginPath();
  context.fillStyle = backgroundColor;
  context.roundRect(
    CANVAS_SIZE / 2 - scoreWidth / 2 - gridPadding,
    CANVAS_SIZE / 2 -
      FONT_SIZE / 2 -
      gridPadding / 2 +
      FONT_SIZE +
      gridPadding * 4,
    scoreWidth + gridPadding * 2,
    FONT_SIZE + gridPadding * 2,
    12
  );
  context.fill();
  context.fillStyle = textColor;
  context.font = `${FONT_SIZE}px sans-serif`;
  context.fillText(
    scoreText,
    CANVAS_SIZE / 2 - scoreWidth / 2,
    CANVAS_SIZE / 2 + FONT_SIZE / 2 + FONT_SIZE + gridPadding * 4
  );
}

/**
 * Waits for the specified number of milliseconds
 * @param {number} milliseconds
 * @returns
 */
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

document.onkeydown = keyPressed;

restart();
document.getElementById("bestScore").innerHTML = bestScore;
