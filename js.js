const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Charger les images
const starshipImg = new Image();
starshipImg.src = 'IMG/starship.jpg';

const bulletImg = new Image();
bulletImg.src = 'IMG/bullets.jpg';

const enemyImgs = [new Image(), new Image(), new Image()];
enemyImgs[0].src = 'IMG/enemy.jpg';
enemyImgs[1].src = 'IMG/enemy2.jpg';
enemyImgs[2].src = 'IMG/enemy3.jpg';

const enemyBulletImgs = [new Image(), new Image(), new Image()];
enemyBulletImgs[0].src = 'IMG/bullets2.jpg';
enemyBulletImgs[1].src = 'IMG/bullets3.jpg';
enemyBulletImgs[2].src = 'IMG/bullets4.jpg';

const lifeImg = new Image();
lifeImg.src = 'IMG/lives.jpg';

const powerUpImgs = [new Image(), new Image()];
powerUpImgs[0].src = 'IMG/powerUp.png';
powerUpImgs[1].src = 'IMG/powerUp2.png';

const starship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    bullets: [],
    powerUpLevel: 0
};

let shooting = false;
let enemies = [];
let enemyBullets = [];
let powerUps = [];
let lives = [];
let enemiesKilled = 0;
let playerLives = 3;

// Dessiner le vaisseau
function drawStarship() {
    ctx.drawImage(starshipImg, starship.x, starship.y, starship.width, starship.height);
}

// Dessiner les balles
function drawBullets() {
    starship.bullets = starship.bullets.filter(bullet => bullet.y > 0);
    starship.bullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;
        if (bullet.vx) bullet.x += bullet.vx;
        if (bullet.vy) bullet.y += bullet.vy;
    });
}

// Dessiner les ennemis
function drawEnemies() {
    enemies = enemies.filter(enemy => enemy.y < canvas.height);
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImgs[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Rebondir sur les bords
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
            enemy.vx *= -1;
        }
        if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.height) {
            enemy.vy *= -1;
        }
    });
}

// Dessiner les balles des ennemis
function drawEnemyBullets() {
    enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);
    enemyBullets.forEach(bullet => {
        ctx.drawImage(enemyBulletImgs[bullet.type], bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y += bullet.speed;
    });
}

// Dessiner les power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.drawImage(powerUpImgs[powerUp.type], powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        powerUp.y += powerUp.speed;
    });
}

// Dessiner les vies
function drawLives() {
    lives.forEach(life => {
        ctx.drawImage(lifeImg, life.x, life.y, life.width, life.height);
        life.y += life.speed;
    });
}

// Vérifier les collisions entre les balles du vaisseau et les ennemis
function checkCollisions() {
    starship.bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Supprimer l'ennemi et la balle en cas de collision
                enemies.splice(enemyIndex, 1);
                starship.bullets.splice(bulletIndex, 1);
                enemiesKilled++;
                document.getElementById('enemiesKilledCount').innerText = enemiesKilled;

                // Ajouter des power-ups et des vies après avoir tué 8 ennemis
                if (enemiesKilled % 8 === 0) {
                    if (Math.random() < 0.5) {
                        powerUps.push({
                            x: Math.random() * canvas.width,
                            y: -50,
                            width: 40,
                            height: 40,
                            speed: 2,
                            type: Math.floor(Math.random() * 2)
                        });
                    } else {
                        lives.push({
                            x: Math.random() * canvas.width,
                            y: -50,
                            width: 40,
                            height: 40,
                            speed: 2
                        });
                    }
                }
            }
        });
    });

    // Vérifier les collisions entre le vaisseau et les power-ups
    powerUps.forEach((powerUp, index) => {
        if (
            starship.x < powerUp.x + powerUp.width &&
            starship.x + starship.width > powerUp.x &&
            starship.y < powerUp.y + powerUp.height &&
            starship.y + starship.height > powerUp.y
        ) {
            // Absorber le power-up
            powerUps.splice(index, 1);
            if (powerUp.type === 0) {
                starship.powerUpLevel = 1; // Tirer 3 balles alignées horizontalement
            } else if (powerUp.type === 1) {
                starship.powerUpLevel = 2; // Tirer 6 balles dans toutes les directions
            }
        }
    });

    // Vérifier les collisions entre le vaisseau et les vies
    lives.forEach((life, index) => {
        if (
            starship.x < life.x + life.width &&
            starship.x + starship.width > life.x &&
            starship.y < life.y + life.height &&
            starship.y + starship.height > life.y
        ) {
            // Absorber la vie
            lives.splice(index, 1);
            // Ajouter une vie
            playerLives++;
            document.getElementById('livesCount').innerText = playerLives;
        }
    });

    // Vérifier les collisions entre le vaisseau et les ennemis
    enemies.forEach((enemy, index) => {
        if (
            starship.x < enemy.x + enemy.width &&
            starship.x + starship.width > enemy.x &&
            starship.y < enemy.y + enemy.height &&
            starship.y + starship.height > enemy.y
        ) {
            // Perdre une vie quand un ennemi touche le vaisseau
            playerLives--;
            document.getElementById('livesCount').innerText = playerLives;
            enemies.splice(index, 1); // L'ennemi meurt
            // Si le joueur n'a plus de vies, terminer le jeu
            if (starship.lives <= 0) {
                alert("Game Over");
                // Réinitialiser le jeu (par exemple, recharger la page)
                location.reload();
            }
        }
    });
}
// Vérifier les collisions entre le vaisseau et les balles ennemies
enemyBullets.forEach((bullet, index) => {
    if (
        starship.x < bullet.x + bullet.width &&
        starship.x + starship.width > bullet.x &&
        starship.y < bullet.y + bullet.height &&
        starship.y + starship.height > bullet.y
    ) {
        // Réduire les vies du joueur
        starship.lives--;
        enemyBullets.splice(index, 1); // Supprimer la balle ennemie

        // Si le joueur n'a plus de vies, terminer le jeu
        if (starship.lives <= 0) {
            alert("Game Over");
            // Réinitialiser le jeu
            location.reload();
        }
    }
});

// Mettre à jour le canvas
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStarship();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawPowerUps();
    drawLives();
    checkCollisions();
    requestAnimationFrame(update);
}

// Déplacer le vaisseau avec la souris
function moveStarship(event) {
    starship.x = event.clientX - starship.width / 2;
    starship.y = event.clientY - starship.height / 2 + 20;
}

// Tirer des balles en continu
function shootBullet() {
    if (shooting) {
        if (starship.powerUpLevel === 0) {
            starship.bullets.push({
                x: starship.x + starship.width / 2 - 2.5,
                y: starship.y,
                width: 5,
                height: 10,
                speed: 20
            });
        } else if (starship.powerUpLevel === 1) {
            starship.bullets.push(
                { x: starship.x + starship.width / 2 - 15, y: starship.y, width: 5, height: 10, speed: 7 },
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7 },
                { x: starship.x + starship.width / 2 + 10, y: starship.y, width: 5, height: 10, speed: 7 }
            );
        } else if (starship.powerUpLevel === 2) {
            starship.bullets.push(
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7 },
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7, vx: 5, vy: 0 },
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7, vx: -5, vy: 0 },
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7, vx: 5, vy: 5 },
                { x: starship.x + starship.width / 2 - 2.5, y: starship.y, width: 5, height: 10, speed: 7, vx: -5, vy: 5 }
            );
        }
    }
}

// Générer des vagues d'ennemis
function generateEnemies() {
    for (let i = 0; i < 7; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            width: 50,
            height: 50,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            type: Math.floor(Math.random() * 3)
        });
    }
}

// Tirer des balles des ennemis
function shootEnemyBullets() {
    enemies.forEach(enemy => {
        enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 2.5,
            y: enemy.y + enemy.height,
            width: 10,
            height: 15,
            speed: 3,
            type: Math.floor(Math.random() * 3)
        });
    });
}

// Écouteurs d'événements
window.addEventListener('mousemove', moveStarship);
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) shooting = true;
});
window.addEventListener('mouseup', (event) => {
    if (event.button === 0) shooting = false;
});

starshipImg.onload = () => {
    bulletImg.onload = () => {
        enemyImgs[0].onload = () => {
            enemyImgs[1].onload = () => {
                enemyImgs[2].onload = () => {
                    enemyBulletImgs[0].onload = () => {
                        enemyBulletImgs[1].onload = () => {
                            enemyBulletImgs[2].onload = () => {
                                lifeImg.onload = () => {
                                    powerUpImgs[0].onload = () => {
                                        powerUpImgs[1].onload = () => {
                                            update();
                                            setInterval(shootBullet, 100);
                                            setInterval(generateEnemies, 5000);
                                            setInterval(shootEnemyBullets, 1000);
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};