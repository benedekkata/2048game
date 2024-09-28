# Ideas

- Improve the look of the game over screen
- Implement isValidMoveAvailable() to check if there is a valid merge that can be made
- The recursion should exit after one addition (not null to avoid fully collapsing grid if [2,2,4,8] it is now becomes [0,0,0,16]) --- better but not perfect now it exist after the first addition but that is now causing the following problem [2,2,4,4] should be [0,0,4,8] when moved to right but it is now [0,2,2,8] ---> idea store tile objects not just numbers and store isCombined individually then reset on redraw
- Remove duplicated code
