const BOARD_COLOR = "rgb(0, 0, 0)";
const SNAKE_COLOR = "rgb(0, 255, 0)";
const APPLE_COLOR = "rgb(255, 0, 0)";

const FPS = 4;

const BOARD_SIZE = 15;
const BOARD_HEIGHT = 500;
const SEGMENT_HEIGHT = Math.floor(BOARD_HEIGHT / BOARD_SIZE);

// TODO: README, start game, game over, game won

const gameState = {
  gameOver: false,
  score: 0,
  intervalId: null,
  snake: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
  ],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  apple: {
    x: Math.floor(BOARD_SIZE / 2),
    y: Math.floor(BOARD_SIZE / 2),
  },
};

function getCanvas() {
  return document.getElementById("canvas");
}

function getContext(canvas) {
  return canvas.getContext("2d");
}

function initCanvas(canvas) {
  canvas.width = BOARD_HEIGHT;
  canvas.height = BOARD_HEIGHT;
}

function clearBoard(ctx) {
  ctx.fillStyle = BOARD_COLOR;
  ctx.fillRect(0, 0, BOARD_HEIGHT, BOARD_HEIGHT);
}

function drawApple(ctx, apple) {
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

function drawSnake(ctx, snake) {
  ctx.fillStyle = SNAKE_COLOR;

  for (const segment of snake) {
    const x = segment.x * SEGMENT_HEIGHT;
    const y = segment.y * SEGMENT_HEIGHT;
    const width = SEGMENT_HEIGHT;
    const height = SEGMENT_HEIGHT;

    ctx.fillRect(x, y, width, height);
  }
}

function renderGame(ctx) {
  clearBoard(ctx);
  drawApple(ctx, gameState.apple);
  drawSnake(ctx, gameState.snake);
}

function positionsCollides(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function snakeCollidesWithApple(snake, apple) {
  return snake.some((segment) => positionsCollides(apple, segment));
}

function snakeCollidesWithItself(snake) {
  const head = snake[0];
  return snake.slice(1).some((segment) => positionsCollides(head, segment));
}

function calculateDirection(direction, nextDirection) {
  const isOpposite =
    direction.x === -nextDirection.x && direction.y === -nextDirection.y;

  if (isOpposite) {
    return direction;
  } else {
    return nextDirection;
  }
}

function generateNewApple(snake) {
  while (true) {
    const newPosition = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };

    if (!snakeCollidesWithApple(snake, newPosition)) {
      return newPosition;
    }
  }
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

  const newSnake = [newHead, ...gameState.snake];

  if (positionsCollides(newHead, gameState.apple)) {
    gameState.score++;
    gameState.apple = generateNewApple(newSnake);
  } else {
    newSnake.pop();
  }

  if (snakeCollidesWithItself(newSnake)) {
    gameState.gameOver = true;
  }

  gameState.snake = newSnake;
}

function loop(ctx) {
  if (gameState.gameOver) {
    clearInterval(gameState.intervalId);
    return;
  }

  updateGame();
  renderGame(ctx);
}

function runGame() {
  const canvas = getCanvas();
  initCanvas(canvas);

  const ctx = getContext(canvas);

  loop(ctx);
  gameState.intervalId = setInterval(loop, 1000 / FPS, ctx);
}

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      gameState.nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      gameState.nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowRight":
      gameState.nextDirection = { x: 1, y: 0 };
      break;
    case "ArrowLeft":
      gameState.nextDirection = { x: -1, y: 0 };
  }
});

runGame();
