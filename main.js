const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
let gameRunning = false;

// Game elements
const paddleWidth = 15, paddleHeight = 100, ballRadius = 10;
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: 0,
    speed: 8
};

const ai = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: 0,
    speed: 6
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 7,
    dx: 5,
    dy: 5,
    color: '#FFF'
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = '45px Arial';
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, '#FFF');
    }
}

// Game logic
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 7;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 2 - 1) * 5;
}

function update() {
    if (!gameRunning) return;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision (top/bottom walls)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Ball collision (paddles)
    let paddle = (ball.x < canvas.width / 2) ? player : ai;
    if (collision(ball, paddle)) {
        let collidePoint = (ball.y - (paddle.y + paddle.height / 2));
        collidePoint = collidePoint / (paddle.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        ball.speed += 0.5;
    }

    // Score points
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    // AI movement
    ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.1;

    // Check for winner
    if (player.score === 5 || ai.score === 5) {
        endGame();
    }
}

function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    drawNet();

    // Draw scores
    drawText(player.score, canvas.width / 4, 50, '#FFF');
    drawText(ai.score, 3 * canvas.width / 4, 50, '#FFF');

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Event Listeners
let moveUp = false;
let moveDown = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') moveUp = true;
    if (e.key === 'ArrowDown') moveDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') moveUp = false;
    if (e.key === 'ArrowDown') moveDown = false;
});

function movePlayer() {
    if (moveUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (moveDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    requestAnimationFrame(movePlayer);
}

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const winnerMessage = document.getElementById('winner-message');

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

function startGame() {
    player.score = 0;
    ai.score = 0;
    resetBall();
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameRunning = true;
}

function endGame() {
    gameRunning = false;
    winnerMessage.textContent = `${player.score === 5 ? 'Player' : 'AI'} wins!`;
    gameOverScreen.style.display = 'flex';
}

// Initial setup
render();
movePlayer();
requestAnimationFrame(gameLoop);
