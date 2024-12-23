const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Các chế độ game
const MODES = {
    NORMAL: 'normal',
    MULTI_BALL: 'multi_ball',
};

// Thiết lập chế độ mặc định
let currentMode = MODES.NORMAL;

let ballRadius = 10;
let ballSpeed = { dx: getRandomSpeed(), dy: getRandomSpeed() };  // Tốc độ bóng
let balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: ballSpeed.dx, dy: ballSpeed.dy, color: getRandomColor() }];
let paddleHeight = 10;
let paddleWidth = 200;  // Thanh đỡ dài trong chế độ bình thường
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 10; // Tốc độ thanh đỡ trong chế độ bình thường
let rightPressed = false;
let leftPressed = false;

let brickRowCount = 8;
let brickColumnCount = 10;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

let score = 0;
let lives = 3;
let gameOver = false;
let gameInterval;  // Biến lưu trữ vòng lặp trò chơi

// Khu vực chọn chế độ
const modeButtons = {
    normal: { x: canvas.width / 2 - 120, y: canvas.height / 2, width: 240, height: 40, label: 'Chế Độ Bình Thường' },
    multiBall: { x: canvas.width / 2 - 120, y: canvas.height / 2 + 50, width: 240, height: 40, label: 'Chế Độ Nhiều Bóng' },
};

// Lắng nghe sự kiện chuột
canvas.addEventListener('click', handleClick);

// Lắng nghe sự kiện bàn phím
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function handleClick(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    // Kiểm tra nếu người chơi nhấp vào một trong các nút chế độ
    if (isInside(x, y, modeButtons.normal)) {
        currentMode = MODES.NORMAL;
        startGame();  // Tự động bắt đầu trò chơi khi chọn chế độ
    } else if (isInside(x, y, modeButtons.multiBall)) {
        currentMode = MODES.MULTI_BALL;
        startGame();  // Tự động bắt đầu trò chơi khi chọn chế độ
    }
}

// Kiểm tra xem chuột có nằm trong một nút hay không
function isInside(x, y, button) {
    return x > button.x && x < button.x + button.width && y > button.y && y < button.y + button.height;
}

// Hàm điều khiển di chuyển paddle
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Hàm tạo vận tốc ngẫu nhiên cho bóng
function getRandomSpeed() {
    let speed = 4 + Math.random() * 4;  // Bóng nhanh hơn
    return (Math.random() > 0.5 ? speed : -speed);
}

// Hàm chọn màu ngẫu nhiên cho bóng
function getRandomColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Hàm xử lý va chạm với gạch
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                for (let i = 0; i < balls.length; i++) {
                    let ball = balls[i];
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score++;
                        if (score === brickRowCount * brickColumnCount) {
                            showWin();  // Gọi hàm hiển thị chiến thắng khi tất cả gạch bị phá
                        }
                    }
                }
            }
        }
    }
}

// Tạo bóng mới khi có sự kiện phá gạch
function createNewBall() {
    let newBall = { x: canvas.width / 2, y: canvas.height - 30, dx: getRandomSpeed(), dy: getRandomSpeed(), color: getRandomColor() };
    balls.push(newBall);  // Thêm bóng mới vào mảng balls
}

// Hàm vẽ bóng
function drawBalls() {
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;  // Màu bóng thay đổi
        ctx.fill();
        ctx.closePath();
    }
}

// Vẽ thanh đỡ
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#008000'; // Màu thanh đỡ
    ctx.fill();
    ctx.closePath();
}

// Vẽ các viên gạch
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#000000'; // Màu gạch
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Vẽ điểm số
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Điểm: ' + score, 8, 20);
    ctx.fillText('Mạng: ' + lives, canvas.width - 100, 20);
}

// Hiển thị Game Over
function showGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = '#FF6347';  // Màu đỏ tươi cho thông báo
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFDD00';  // Màu vàng cho hướng dẫn
    ctx.fillText('Nhấn F5 để chơi lại', canvas.width / 2 - 80, canvas.height / 2 + 30);
}

// Hàm hiển thị màn hình "Chúc mừng chiến thắng"
function showWin() {
    cancelAnimationFrame(gameInterval);  // Dừng vòng lặp trò chơi

    // Hiển thị thông báo chiến thắng
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let text = 'Chúc Mừng Bạn Đã Thắng!';
    ctx.font = '30px Arial';
    ctx.fillStyle = '#00FF00'; // Màu xanh lá
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2);
}

// Hàm khởi động lại trò chơi
function startGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    resetBalls();
    gameLoop();
}

// Cập nhật vòng lặp trò chơi
function gameLoop() {
    gameInterval = requestAnimationFrame(gameLoop);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBalls();
    drawScore();

    let ballLost = 0;  // Biến này sẽ đếm số bóng đã rơi xuống

    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        // Cập nhật vị trí bóng
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Kiểm tra va chạm với tường và paddle
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                balls.splice(i, 1);  // Xóa bóng đã rơi xuống
                ballLost++; // Đếm số bóng đã rơi
                i--;  // Điều chỉnh chỉ mục để không bỏ sót các bóng
            }
        }
    }

    if (ballLost > 0 && balls.length === 0) {
        lives--; // Trừ mạng khi tất cả bóng đã rơi xuống
        if (lives === 0) {
            gameOver = true;
            showGameOver();
        } else {
            resetBalls(); // Khởi động lại bóng khi còn mạng
        }
    }

    // Di chuyển paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    // Kiểm tra va chạm với gạch
    collisionDetection();

    if (gameOver) {
        cancelAnimationFrame(gameInterval);
    }
}

// Khởi động lại bóng
function resetBalls() {
    if (currentMode === MODES.NORMAL) {
        balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: getRandomSpeed(), dy: getRandomSpeed(), color: getRandomColor() }];
    } else if (currentMode === MODES.MULTI_BALL) {
        balls = [
            { x: canvas.width / 2, y: canvas.height - 30, dx: getRandomSpeed(), dy: getRandomSpeed(), color: getRandomColor() },
            { x: canvas.width / 2 + 30, y: canvas.height - 30, dx: getRandomSpeed(), dy: getRandomSpeed(), color: getRandomColor() }
        ];
    }
}

// Vẽ menu khi chưa chọn chế độ
function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FF0000';
    ctx.fillText('Chọn Chế Độ:', canvas.width / 2 - 100, canvas.height / 2 - 60);
    ctx.font = '20px Arial';
    ctx.fillStyle = '#0095DD';

    // Vẽ nút chế độ
    ctx.beginPath();
    ctx.rect(modeButtons.normal.x, modeButtons.normal.y, modeButtons.normal.width, modeButtons.normal.height);
    ctx.fillStyle = '#00C000';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fillText(modeButtons.normal.label, modeButtons.normal.x + 10, modeButtons.normal.y + 25);

    ctx.beginPath();
    ctx.rect(modeButtons.multiBall.x, modeButtons.multiBall.y, modeButtons.multiBall.width, modeButtons.multiBall.height);
    ctx.fillStyle = '#C00000';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fillText(modeButtons.multiBall.label, modeButtons.multiBall.x + 10, modeButtons.multiBall.y + 25);
}

// Gọi hàm vẽ menu khi chưa bắt đầu trò chơi
drawMenu();
