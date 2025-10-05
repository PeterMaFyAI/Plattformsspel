const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;

let currentLevel = 0;
let score = 0;

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
    onGround: false,
    jumpsLeft: 2 // Dubbelhopp
};

// Nivåer med teman
const levels = [
    {
        name: 'Skog',
        bgColor: '#a0e7a0',
        platformColor: '#228B22',
        enemyColor: 'red',
        hazardColor: 'purple',
        platforms: [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 200, y: 450, width: 150, height: 20}
        ],
        goal: {x: 700, y: 500, width: 50, height: 50},
        enemies: [{x: 250, y: 410, width: 40, height: 40, dx: 2, range: [200, 350]}],
        hazards: [{x: 400, y: 530, width: 50, height: 20, dy: -2, range: [430, 530]}],
        powerUps: [{x: 300, y: 410, width: 20, height: 20, type: 'speed'}]
    },
    {
        name: 'Lava',
        bgColor: '#FF8C00',
        platformColor: '#B22222',
        enemyColor: 'darkred',
        hazardColor: 'orange',
        platforms: [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 100, y: 450, width: 120, height: 20},
            {x: 400, y: 350, width: 120, height: 20}
        ],
        goal: {x: 700, y: 300, width: 50, height: 50},
        enemies: [
            {x: 120, y: 410, width: 40, height: 40, dx: 2, range: [100, 220]},
            {x: 420, y: 310, width: 40, height: 40, dx: 2.5, range: [400, 520]}
        ],
        hazards: [{x: 500, y: 500, width: 50, height: 20, dx: 3, range: [400, 600]}],
        powerUps: [{x: 450, y: 310, width: 20, height: 20, type: 'jump'}]
    },
    {
        name: 'Is',
        bgColor: '#87CEEB',
        platformColor: '#ADD8E6',
        enemyColor: 'blue',
        hazardColor: 'cyan',
        platforms: [
            {x: 0, y: 550, width: 800, height: 50},
            {x: 150, y: 450, width: 100, height: 20},
            {x: 350, y: 350, width: 100, height: 20},
            {x: 600, y: 250, width: 120, height: 20}
        ],
        goal: {x: 700, y: 200, width: 50, height: 50},
        enemies: [
            {x: 160, y: 410, width: 40, height: 40, dx: 2, range: [150, 250]},
            {x: 360, y: 310, width: 40, height: 40, dx: 2, range: [350, 450]}
        ],
        hazards: [
            {x: 500, y: 500, width: 50, height: 20, dx: 2, range: [400, 600]},
            {x: 650, y: 230, width: 50, height: 20, dy: 2, range: [230, 330]}
        ],
        powerUps: [{x: 600, y: 210, width: 20, height: 20, type: 'speed'}]
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
    const level = levels[currentLevel];

    // Horisontell rörelse
    player.dx = 0;
    if (keys['a']) player.dx = -player.speed;
    if (keys['d']) player.dx = player.speed;
    player.x += player.dx;

    // Vertikal rörelse
    player.dy += GRAVITY;
    player.y += player.dy;

    player.onGround = false;
    for (let plat of level.platforms) {
        if (plat.dx) {
            plat.x += plat.dx;
            if (plat.x < plat.range[0] || plat.x + plat.width > plat.range[1]) plat.dx *= -1;
        }
        if (checkCollision(player, plat)) {
            if (player.dy > 0 && player.y + player.height - player.dy <= plat.y) {
                player.y = plat.y - player.height;
                player.dy = 0;
                player.onGround = true;
                player.jumpsLeft = 2; // Återställ dubbelhopp
            }
        }
    }

    // Hoppa
    if (keys['w'] && player.jumpsLeft > 0) {
        player.dy = player.jumpForce;
        player.jumpsLeft--;
        player.onGround = false;
    }

    // Fiender
    for (let enemy of level.enemies) {
        enemy.x += enemy.dx;
        if (enemy.x < enemy.range[0] || enemy.x + enemy.width > enemy.range[1]) enemy.dx *= -1;
        if (checkCollision(player, enemy)) resetLevel();
    }

    // Power-ups
    for (let i = level.powerUps.length - 1; i >= 0; i--) {
        let pu = level.powerUps[i];
        if (checkCollision(player, pu)) {
            if (pu.type === 'speed') player.speed += 2;
            if (pu.type === 'jump') player.jumpForce -= 4;
            score += 10;
            level.powerUps.splice(i, 1);
        }
    }

    // Hinder
    for (let hazard of (level.hazards || [])) {
        if (hazard.dx) {
            hazard.x += hazard.dx;
            if (hazard.x < hazard.range[0] || hazard.x + hazard.width > hazard.range[1]) hazard.dx *= -1;
        }
        if (hazard.dy) {
            hazard.y += hazard.dy;
            if (hazard.y < hazard.range[0] || hazard.y + hazard.height > hazard.range[1]) hazard.dy *= -1;
        }
        if (checkCollision(player, hazard)) resetLevel();
    }

    // Målkoll
    if (checkCollision(player, level.goal)) {
        currentLevel++;
        if (currentLevel >= levels.length) {
            alert('🎉 Grattis! Du klarade alla nivåer! Poäng: ' + score);
            currentLevel = 0;
            score = 0;
        }
        resetPlayer();
    }

    // Canvasgränser
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
    }
}

// Återställ nivå
function resetLevel() {
    resetPlayer();
    player.speed = 5;
    player.jumpForce = -12;
}

// Återställ spelare
function resetPlayer() {
    player.x = 50;
    player.y = 500;
    player.dy = 0;
    player.jumpsLeft = 2;
}

// Rita allt
function draw() {
    const level = levels[currentLevel];

    // Bakgrund
    ctx.fillStyle = level.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Plattformar
    ctx.fillStyle = level.platformColor;
    for (let plat of level.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Spelare
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Fiender
    ctx.fillStyle = level.enemyColor;
    level.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Power-ups
    ctx.fillStyle = 'blue';
    level.powerUps.forEach(pu => {
        ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
    });

    // Hinder
    ctx.fillStyle = level.hazardColor;
    (level.hazards || []).forEach(h => {
        ctx.fillRect(h.x, h.y, h.width, h.height);
    });

    // Mål
    ctx.fillStyle = 'gold';
    ctx.fillRect(level.goal.x, level.goal.y, level.goal.width, level.goal.height);

    // Poäng & nivånamn
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Poäng: ' + score, 10, 30);
    ctx.fillText('Nivå: ' + level.name, 10, 60);
}

// Spelloop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
