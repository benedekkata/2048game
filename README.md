# 2048 Game with HTML Canvas

This is a simple 2048 game with HTML Canvas. The game is implemented using JavaScript and HTML Canvas. The purpose of this project was to learn the basics of HTML Canvas.

## Features

- The game is implemented using JavaScript and HTML Canvas.
- The game is responsive and adapts to different screen sizes.
- The game has a simple UI with a score and best score.
- The game has a restart button.
- The game has a main menu with a button to restart the game.
- The game has a game over screen with a score and a text.

## How to Play

To play the game, you can use the arrow keys to move the tiles.

The objective of the game is to slide numbered tiles on a grid to combine them to create a tile with the number 2048.

## Gameplay

The game is played on a grid of 4x4 tiles. Each tile can be either a 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, or 2048.

Each tile can be moved vertically or horizontally. The movement is limited to the grid and cannot go outside of it.

The game begins with two tiles already in the grid, having a value of either 2 or 4, and another such tile appears in a random empty space after each turn. Unlike the original game tiles with a value of 2 and tiles with a value of 4 appear with the same likelihood. Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid. If two tiles of the same number collide while moving, they will merge into a tile with the total value of the two tiles that collided. The resulting tile cannot merge with another tile again in the same move.

If a move causes three consecutive tiles of the same value to slide together, only the two tiles farthest along the direction of motion will combine. If all four spaces in a row or column are filled with tiles of the same value, a move parallel to that row/column will combine the first two and last two. A scoreboard on keeps track of the user's score. The user's score starts at zero, and is increased whenever two tiles combine, by the value of the new tile.

The game is won when a tile with a value of 2048 appears on the board. The game is lost when no tile with a value of 2048 can be found and no move can be made.

Once the game is won or lost, the user can restart the game by clicking the restart button.

## Screenshots

## License

This project is licensed under the MIT License.
