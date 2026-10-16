const BOARD_COLOR = "rgb(0, 0, 0)";
const APPLE_COLOR = "rgb(255, 0, 0)";
const SNAKE_COLOR = "rgb(0, 255, 0)";
const SNAKE_EYES_COLOR = "rgb(0, 0, 0)";
const SNAKE_OUTLINE_COLOR = "rgb(255, 255, 255)";

const FPS = 4;

const BOARD_SIZE = 15;
const BOARD_HEIGHT = 500;
const SEGMENT_HEIGHT = Math.floor(BOARD_HEIGHT / BOARD_SIZE);

const STATUS = {
  READY: "ready",
  PLAYING: "playing",
  OVER: "over",
  WON: "won",
};

const SCREENS = {
  [STATUS.READY]: { title: "Snake", button: "Start Game" },
  [STATUS.OVER]: { title: "Game over", button: "Play again" },
  [STATUS.WON]: { title: "You won!", button: "Play again" },
};

function createInitialState() {
  return {
    status: STATUS.READY,
    score: 0,
    intervalId: null,
    snake: [
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    apple: {
      x: Math.floor(BOARD_SIZE / 2),
      y: Math.floor(BOARD_SIZE / 2),
    },
  };
}

let gameState = createInitialState();

function getCanvas() {
  return document.getElementById("canvas");
}

function getContext(canvas) {
  return canvas.getContext("2d");
}

function initCanvas(canvas, ctx) {
  canvas.width = BOARD_HEIGHT;
  canvas.height = BOARD_HEIGHT;
  ctx.imageSmoothingEnabled = false;
}

function clearBoard(ctx) {
  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, BOARD_HEIGHT, BOARD_HEIGHT);
}

function drawApple(ctx, apple) {
  if (!apple) return;

  const x = apple.x * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
  const y = apple.y * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
  const radius = SEGMENT_HEIGHT / 3;
  const startAngle = 0;
  const endAngle = Math.PI * 2;

  ctx.fillStyle = APPLE_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.fill();
}

function drawSnakeEyes(ctx, head, direction) {
  const radius = SEGMENT_HEIGHT / 10;
  const startAngle = 0;
  const endAngle = Math.PI * 2;
  const offset = SEGMENT_HEIGHT / 5;
  let x1 = head.x * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
  let y1 = head.y * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
  let x2 = x1;
  let y2 = y1;

  if (direction.x !== 0) {
    y1 -= offset;
    y2 += offset;
    const dx = direction.x > 0 ? offset : -offset;
    x1 += dx;
    x2 += dx;
  } else {
    x1 -= offset;
    x2 += offset;
    const dy = direction.y > 0 ? offset : -offset;
    y1 += dy;
    y2 += dy;
  }

  ctx.fillStyle = SNAKE_EYES_COLOR;
  ctx.beginPath();
  ctx.arc(x1, y1, radius, startAngle, endAngle);
  ctx.moveTo(x2 + radius, y2);
  ctx.arc(x2, y2, radius, startAngle, endAngle);
  ctx.fill();
}

function drawSnake(ctx, snake, direction) {
  if (snake.length === 0) return;

  ctx.fillStyle = SNAKE_COLOR;
  ctx.strokeStyle = SNAKE_OUTLINE_COLOR;
  ctx.lineWidth = 2;

  for (const segment of snake) {
    const x = segment.x * SEGMENT_HEIGHT;
    const y = segment.y * SEGMENT_HEIGHT;

    ctx.fillRect(x, y, SEGMENT_HEIGHT, SEGMENT_HEIGHT);
    ctx.strokeRect(x + 1, y + 1, SEGMENT_HEIGHT - 2, SEGMENT_HEIGHT - 2);
  }

  drawSnakeEyes(ctx, snake[0], direction);
}

function renderGame(ctx) {
  clearBoard(ctx);
  drawApple(ctx, gameState.apple);
  drawSnake(ctx, gameState.snake, gameState.direction);
}

function renderScore() {
  document.getElementById("score").textContent = `Score: ${gameState.score}`;
}

function showScreen(status) {
  const screen = document.getElementById("screen");
  const config = SCREENS[status];

  if (!config) {
    screen.hidden = true;
    return;
  }

  const message = status === STATUS.READY ? "" : `Score: ${gameState.score}`;

  document.getElementById("screenTitle").textContent = config.title;
  document.getElementById("screenMessage").textContent = message;
  document.getElementById("playBtn").textContent = config.button;
  screen.hidden = false;
  document.getElementById("playBtn").focus();
}

function setStatus(status) {
  gameState.status = status;
  showScreen(status);
}

function positionsCollides(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function snakeCollidesWithPosition(snake, position) {
  return snake.some((segment) => positionsCollides(position, segment));
}

function snakeCollidesWithItself(snake) {
  const head = snake[0];
  return snake.slice(1).some((segment) => positionsCollides(head, segment));
}

function calculateDirection(direction, nextDirection) {
  const isOpposite =
    direction.x === -nextDirection.x && direction.y === -nextDirection.y;

  return isOpposite ? direction : nextDirection;
}

function generateNewApple(snake) {
  const freeCells = [];

  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const cell = { x, y };
      if (!snakeCollidesWithPosition(snake, cell)) {
        freeCells.push(cell);
      }
    }
  }

  if (freeCells.length === 0) return null;
  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function updateGame() {
  gameState.direction = calculateDirection(
    gameState.direction,
    gameState.nextDirection,
  );

  const head = gameState.snake[0];
  const newHead = {
    x: (head.x + gameState.direction.x + BOARD_SIZE) % BOARD_SIZE,
    y: (head.y + gameState.direction.y + BOARD_SIZE) % BOARD_SIZE,
  };

  const ateApple = positionsCollides(newHead, gameState.apple);
  const newSnake = [newHead, ...gameState.snake];

  if (!ateApple) {
    newSnake.pop();
  }

  gameState.snake = newSnake;

  if (snakeCollidesWithItself(newSnake)) {
    return STATUS.OVER;
  }

  if (ateApple) {
    gameState.score++;
    gameState.apple = generateNewApple(newSnake);

    if (gameState.apple === null) {
      return STATUS.WON;
    }
  }

  return STATUS.PLAYING;
}

function stopLoop() {
  clearInterval(gameState.intervalId);
  gameState.intervalId = null;
}

function loop(ctx) {
  if (gameState.status !== STATUS.PLAYING) {
    stopLoop();
    return;
  }

  const nextStatus = updateGame();
  renderGame(ctx);
  renderScore();

  if (nextStatus !== STATUS.PLAYING) {
    stopLoop();
    setStatus(nextStatus);
  }
}

function startGame() {
  stopLoop();
  gameState = createInitialState();

  const canvas = getCanvas();
  const ctx = getContext(canvas);

  initCanvas(canvas, ctx);
  renderGame(ctx);
  renderScore();

  setStatus(STATUS.PLAYING);
  gameState.intervalId = setInterval(loop, 1000 / FPS, ctx);
}

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowRight: { x: 1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
};

addEventListener("keydown", (event) => {
  const direction = KEY_DIRECTIONS[event.key];

  if (direction) {
    event.preventDefault();
    if (gameState.status === STATUS.PLAYING) {
      gameState.nextDirection = direction;
    }
  }
});

function main() {
  const canvas = getCanvas();
  initCanvas(canvas, getContext(canvas));
  renderGame(getContext(canvas));
  renderScore();

  document.getElementById("playBtn").addEventListener("click", startGame);
  setStatus(STATUS.READY);
}

main();
