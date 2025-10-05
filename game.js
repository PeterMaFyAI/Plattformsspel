const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;

let currentLevel = 0;

// Spelaren
let player = {
    x: 50,
    y: 500,
    width: 50,
    height: 50,
    color: 'red',
    dx: 0,
    dy: 0,
    speed: 5,
    jumpForce: -12,
    onGround: false
};

// Nivåer
const levels = [
    {
        platforms: [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 300, y: 450, width: 200, height: 20}
        ],
        goal: {x: 700, y: 500, width: 50, height: 50}
    },
    {
        platforms: [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 100, y: 450, width: 150, height: 20},
            {x: 400, y: 350, width: 150, height: 20},
            {x: 600, y: 250, width: 150, height: 20}
        ],
        goal: {x: 700, y: 200, width: 50, height: 50}
    }
];

// Kontroll
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Kollisionskontroll
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Uppdatera spelare
function updatePlayer() {
    // Horisontell rörelse
    player.dx = 0;
    if (keys['a']) player.dx = -player.speed;
    if (keys['d']) player.dx = player.speed;

    player.x += player.dx;

    // Vertikal rörelse
    player.dy += GRAVITY;
    player.y += player.dy;

    player.onGround = false;
    const platforms = levels[currentLevel].platforms;
    for (let plat of platforms) {
        // Enkel plattformskollisionslogik
        if (checkCollision(player, plat)) {
            if (player.dy > 0 && player.y + player.height - player.dy <= plat.y) {
                player.y = plat.y - player.height;
                player.dy = 0;
                player.onGround = true;
            }
        }
    }

    // Hoppa
    if (keys['w'] && player.onGround) {
        player.dy = player.jumpForce;
        player.onGround = false;
    }

    // Målkoll
    const goal = levels[currentLevel].goal;
    if (checkCollision(player, goal)) {
        currentLevel++;
        if (currentLevel >= levels.length) {
            alert('Grattis! Du klarade alla nivåer!');
            currentLevel = 0;
        }
        // Återställ spelare position
        player.x = 50;
        player.y = 500;
        player.dy = 0;
    }

    // Håll spelare inom canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
    }
}

// Rita allt
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Plattformar
    ctx.fillStyle = 'green';
    for (let plat of levels[currentLevel].platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Spelare
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Mål
    const goal = levels[currentLevel].goal;
    ctx.fillStyle = 'gold';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
}

// Spelloop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
