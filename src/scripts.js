var Snake = Snake || {};
(function() {
  const [RIGHT, DOWN, LEFT, UP] = [0, 1, 2, 3];

  Snake = function(elementID) {
    if (!elementID || !this.getId(elementID)) {
      throw new Error("Missing argument or element.");
    }

    this.init(elementID);
  };

  // onReset use default values
  Snake.prototype.default = {
    snakeLen: 3,
    direction: 0,
    limits: {
      right: [],
      down: [],
      left: [],
      up: []
    },
    colors: {
      snake: "green"
    }
  };

  Snake.prototype.setup = {
    totalCells: 121, // should be square number: 100, 121, 400
    side: 0, //  square of totalCells
    cellWidth: 15, // change also css definision for .cell
    direction: 0, // right, down, left, up
    snakeLen: 3,
    tickerDelay: 500, // milliseconds
    colors: {
      snake: "green",
      food: "LightGreen",
      fail: "Crimson"
    }
  };

  // MAIN ARRAY - Hold information for SNAKE cells
  Snake.prototype.cells = [];
  Snake.prototype.limits = {
    right: [],
    down: [],
    left: [],
    up: []
  };
  Snake.prototype.foods = [];

  Snake.prototype.init = function(elemID) {
    this.el = this.getId(elemID);

    this.calculate();
    this.render();
    this.bindKeys();
    this.startTicker();
  };

  // calculate limit values
  // calculate snake cells/points
  Snake.prototype.calculate = function() {
    const side = Math.sqrt(this.setup.totalCells);
    if (side !== parseInt(side, 10)) {
      throw new Error("Total cells should be square number.");
    }

    this.setup.side = side;

    this.calcLimits()
      .calcLimits(1)
      .calcLimits(2)
      .calcLimits(3);

    this.calcSnake();
  };

  Snake.prototype.render = function() {
    this.renderBoard();

    this.renderSnake();

    this.renderFood();
  };

  Snake.prototype.renderBoard = function() {
    let html = "";
    for (let ind = 1; ind <= this.setup.totalCells; ind++) {
      html += `<div class='cell' id='cell-${ind}'></div>`;
    }

    this.el.innerHTML = html;

    //set explicit width for proper rending
    let totalWidth = this.setup.side * this.setup.cellWidth;
    totalWidth += this.setup.side + 1; // borders
    this.el.style.width = `${totalWidth}px`;
  };

  Snake.prototype.renderSnake = function() {
    this.cells.forEach(v => {
      this.getId(`cell-${v}`).style.backgroundColor = this.setup.colors.snake;
    });
  };

  Snake.prototype.renderFood = function() {
    const cell = this.getRand();
    if (this.cells.indexOf(cell) !== -1) {
      return this.renderFood();
    }

    this.foods.push(cell);
    this.getId(`cell-${cell}`).style.backgroundColor = this.setup.colors.food;
  };

  Snake.prototype.renderFail = function() {
    this.setup.colors.snake = this.setup.colors.fail;
    this.cells.forEach(v => {
      this.getId(`cell-${v}`).style.backgroundColor = this.setup.colors.fail;
    });
    // console.log(".: FAIL - Game OVER ...");
  };

  // store in limits [right, left, down , up]
  Snake.prototype.calcLimits = function(type = 0) {
    let limit;
    const direction = ["right", "down", "left", "up"];

    for (let ind = 1; ind <= this.setup.side; ind++) {
      switch (type) {
        case RIGHT:
          limit = this.setup.side * ind + 1;
          break;
        case DOWN:
          limit = this.setup.totalCells + ind;
          break;
        case LEFT:
          limit = this.setup.side * ind;
          break;
        case UP:
          limit = 0 - ind;
          break;
      }

      this.limits[direction[type]].push(limit);
    }

    return this;
  };

  // initialize cells - which hold snake cells
  // [1,2,3 .... snakeLen]
  Snake.prototype.calcSnake = function() {
    let cells = [...Array(this.setup.snakeLen)];

    cells.forEach((val, k) => {
      this.cells.push(k + 1);
    });
  };

  Snake.prototype.nextStep = function() {
    if (this.cells.length === this.setup.snakeLen) {
      this.clearCell(this.cells[0]);
      this.cells.shift();
    }

    //get last from snake cells/steps
    let nextStep = this.cells[this.cells.length - 1];
    switch (this.setup.direction) {
      case RIGHT:
        nextStep += 1;
        break;
      case DOWN:
        nextStep += this.setup.side;
        break;
      case LEFT:
        nextStep -= 1;
        break;
      case UP:
        nextStep -= this.setup.side;
        break;
    }

    if (this.checkStep(nextStep)) {
      this.checkFood(nextStep);
      this.cells.push(nextStep);
    } else {
      this.stopTicker();
      this.renderFail();
    }
  };

  Snake.prototype.checkStep = function(step) {
    const direction = ["right", "down", "left", "up"];
    const check = this.limits[direction[this.setup.direction]].indexOf(step);

    return check === -1;
  };

  Snake.prototype.checkFood = function(step) {
    const check = this.foods.indexOf(step);

    if (check !== -1) {
      this.foods.shift();
      this.setup.snakeLen++;
      this.renderFood();
    }
  };

  Snake.prototype.move = function() {
    this.nextStep();
    this.renderSnake();
  };

  Snake.prototype.changeDirection = function(newDirection) {
    this.setup.direction = newDirection;
  };

  Snake.prototype.clearCell = function(cellID) {
    this.getId(`cell-${cellID}`).style.backgroundColor = "#fff";
  };

  Snake.prototype.startTicker = function() {
    this.ticker = setInterval(() => {
      this.move();
    }, this.setup.tickerDelay);
  };

  Snake.prototype.stopTicker = function() {
    clearInterval(this.ticker);
  };

  Snake.prototype.newGame = function(ev) {
    ev.preventDefault();
    this.reset();
    this.init(this.el.id);
  };

  Snake.prototype.startGame = function(ev) {
    ev.preventDefault();
    this.startTicker();
  };

  Snake.prototype.stopGame = function(ev) {
    ev.preventDefault();
    this.stopTicker();
  };

  Snake.prototype.reset = function() {
    this.cells = [];
    this.foods = [];
    this.stopTicker();

    // reset snake Length, direction & limits
    this.setup.snakeLen = this.default.snakeLen;
    this.setup.direction = this.default.direction;
    this.setup.colors.snake = this.default.colors.snake;
    this.limits = this.default.limits;
  };

  Snake.prototype.bindKeys = function() {
    let self = this;
    document.onkeydown = function(e) {
      e = e || window.event;
      switch (e.which) {
        case 37:
          self.changeDirection(2);
          break;
        case 38:
          self.changeDirection(3);
          break;
        case 39:
          self.changeDirection(0);
          break;
        case 40:
          self.changeDirection(1);
          break;
      }
    };
  };

  Snake.prototype.getRand = () => Math.floor(Math.random() * 101);

  Snake.prototype.getId = elementID =>
    document.getElementById(elementID) || false;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Snake;
}
