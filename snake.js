const BOARD_SIZE = 9;
const BOARD_HEIGHT = 250;
const SEGMENT_HEIGHT = Math.floor(BOARD_HEIGHT / BOARD_SIZE);

const BOARD_COLOR = "rgb(0, 0, 0)";
const SNAKE_COLOR = "rgb(0, 255, 0)";
const APPLE_COLOR = "rgb(255, 0, 0)";

const gameState = {
  gameOver: false,
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

function positionsCollides(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

function snakeCollidesWithApple(snake, apple) {
  return snake.some((segment) => {
    return positionsCollides(apple, segment);
  });
}

function snakeCollidesWithItself(snake) {
  const head = snake[0];
  return snake.some((segment, idx) => {
    return idx !== 0 && positionsCollides(head, segment);
  });
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

function generateNewApplePosition(snake) {
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

function moveSnake(snake, apple) {
  const head = snake[0];
  const newHead = {
    x: (head.x + gameState.direction.x + BOARD_SIZE) % BOARD_SIZE,
    y: (head.y + gameState.direction.y + BOARD_SIZE) % BOARD_SIZE,
  };

  const newSnake = [newHead, ...snake];

  if (positionsCollides(newHead, apple)) {
    appleCollisionFlag = true;
  } else if (snakeCollidesWithItself(snake)) {
    snakeCollistionFlag = true;
  } else {
    newSnake.pop();
  }

  return newSnake;
}

function renderGame(ctx) {
  clearBoard(ctx);
  drawApple(ctx, gameState.apple);
  drawSnake(ctx, gameState.snake);
}

function draw(ctx) {
  if (gameState.gameOver) {
    return;
  }

  // if (appleCollisionFlag) {
  //   applePos = generateNewApplePosition(snake);
  //   appleCollisionFlag = false;
  // }

  gameState.direction = calculateDirection(
    gameState.direction,
    gameState.nextDirection,
  );
  gameState.snake = moveSnake(gameState.snake, gameState.apple);

  renderGame(ctx);
}

function runGame() {
  const canvas = getCanvas();
  initCanvas(canvas);

  const ctx = getContext(canvas);
  draw(ctx);

  setInterval(draw, 500, ctx);
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
