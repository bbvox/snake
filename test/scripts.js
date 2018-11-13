if (typeof require !== "undefined") {
  var expect = require("chai").expect;
  var sinon = require("sinon");
  var Snake = require("../src/scripts");
}

let testData = {
  elemId: "elemId",
  limitsDown: [122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132],
  cells: [1, 2, 3],
  cells5: [1, 2, 3, 4, 5],
  cells2: [2, 3, 4],
  cellsDown: [2, 3, 14]
};

describe("Constructor initialization", () => {
  let snake;

  it("should throw Error w/o argument", () => {
    expect(() => {
      snake = new Snake();
    }).to.throw(Error);
  });

  it("should throw Error with missing element", () => {
    sinon.stub(Snake.prototype, "getId").returns(false);

    expect(() => {
      snake = new Snake(testData.elemId);
    }).to.throw(Error);
  });

  it("should be OK and call init method with same argument", () => {
    sinon.stub(Snake.prototype, "getId").returns(true);
    let initStub = sinon.stub(Snake.prototype, "init").returns(true);

    snake = new Snake(testData.elemId);

    expect(initStub.called).to.be.true;
    expect(initStub.calledWith(testData.elemId)).to.be.true;
    initStub.restore();
  });

  it("should be OK and instanceof Snake", () => {
    sinon.stub(Snake.prototype, "getId").returns(true);
    sinon.stub(Snake.prototype, "init").returns(true);

    snake = new Snake(testData.elemId);
    expect(snake).to.be.an.instanceof(Snake);
  });

  afterEach(() => {
    if (Snake.prototype.getId.restore) {
      Snake.prototype.getId.restore();
    }
    if (Snake.prototype.init.restore) {
      Snake.prototype.init.restore();
    }
  });
});

describe("Initialize method (init)", () => {
  let stubs = {},
    _stubs = {},
    snake;

  let stubMethods = methodsArray => {
    methodsArray.forEach(val => {
      _stubs[val] = sinon.stub(Snake.prototype, val).returns(true);
    });
  };

  let restoreMethods = methodsArray => {
    methodsArray.forEach(val => {
      _stubs[val].restore();
    });
  };

  beforeEach(() => {
    stubs.getId = sinon.stub(Snake.prototype, "getId");
    stubs.getId.returns(true);
  });

  it("should call all initialize methods", () => {
    const _initMethods = ["calculate", "render", "bindKeys", "startTicker"];
    stubMethods(_initMethods);
    snake = new Snake(testData.elemId);

    Object.keys(_stubs).map(keyValue => {
      expect(_stubs[keyValue].calledOnce).to.be.true;
    });

    restoreMethods(_initMethods);
  });

  it("calculate method, should throw error on wrong totalCells", () => {
    const _initMethods = ["render", "bindKeys", "startTicker"];
    stubMethods(_initMethods);
    Snake.prototype.setup.totalCells = 105;

    expect(function() {
      snake = new Snake(testData.elemId);
    }).to.throw("Total cells should be square number.");

    restoreMethods(_initMethods);
  });

  it("calculate should fill limits & cells", () => {
    const _initMethods = ["render", "bindKeys", "startTicker"];
    stubMethods(_initMethods);
    Snake.prototype.setup.totalCells = 121;

    snake = new Snake(testData.elemId);

    expect(snake.limits.right).to.have.lengthOf(snake.setup.side);
    expect(snake.limits.down).to.have.lengthOf(snake.setup.side);
    expect(snake.limits.left).to.have.lengthOf(snake.setup.side);
    expect(snake.limits.up).to.have.lengthOf(snake.setup.side);
    // exact values
    expect(snake.limits.down).to.deep.equals(testData.limitsDown);

    expect(snake.cells).to.have.lengthOf(snake.setup.snakeLen);

    restoreMethods(_initMethods);
  });

  it("render should render boards, Snake & foods", () => {
    const _initMethods = ["calculate", "bindKeys", "startTicker"];
    const _renderMethods = ["renderBoard", "renderSnake", "renderFood"];
    stubMethods(_initMethods);
    stubMethods(_renderMethods);

    snake = new Snake(testData.elemId);

    _renderMethods.forEach(val => {
      expect(_stubs[val].calledOnce).to.be.true;
    });

    restoreMethods(_initMethods);
    restoreMethods(_renderMethods);
  });

  afterEach(() => {
    stubs.getId.restore();
    snake.reset();
  });
});

describe("NextStep & ChangeDirection", () => {
  let snake,
    stubs = {},
    _inits = ["render", "bindKeys", "startTicker", "clearCell"];

  beforeEach(() => {
    stubs.getId = sinon.stub(Snake.prototype, "getId");
    stubs.getId.returns(true);
    Snake.prototype.cells = [];
    _inits.forEach(method => {
      stubs[method] = sinon.stub(Snake.prototype, method).returns(true);
    });
    snake = new Snake(testData.elemId);
  });

  it("init snake cells length and steps should be equal", () => {
    expect(snake.cells).to.deep.equals(testData.cells);
  });

  it("validate snake cells length after calculate on higher snakeLen", () => {
    snake.reset();
    snake.setup.snakeLen = 5;
    snake.calculate();
    expect(snake.cells).to.deep.equals(testData.cells5);
  });

  it("check cells on nextStep with right direction", () => {
    snake.reset();
    snake.setup.snakeLen = 3;
    snake.calculate();
    snake.nextStep();
    expect(snake.cells).to.deep.equals(testData.cells2);
  });

  it("check cells on nextStep with down direction", () => {
    snake.reset();
    snake.setup.snakeLen = 3;
    snake.calculate();
    snake.changeDirection(1);
    snake.nextStep();
    expect(snake.cells).to.deep.equals(testData.cellsDown);
  });

  afterEach(() => {
    stubs.getId.restore();
    _inits.forEach(method => {
      stubs[method].restore();
    });
  });
});
