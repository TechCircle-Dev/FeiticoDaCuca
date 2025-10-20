const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const inventory = document.getElementById("inventory");
const collectibleItems = [
    { name: "olho", src: "./img/olho.png" },
    { name: "lavanda", src: "./img/lavanda.png" },
    { name: "anis", src: "./img/maca.png" }
];

const collectedCounts = {};
let isJumping = false;
let position = 0;
let gameLoopId;
let runAnimationId;
let gameRunning = false; // 🟢 flag para controlar início do jogo

// ------------------- FUNÇÃO DE INÍCIO -------------------
function showStartScreen() {
   // Criar overlay
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.background = "rgba(0,0,0,0.7)";
overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";
overlay.style.flexDirection = "column";
overlay.style.zIndex = "10000";
document.body.appendChild(overlay);

// Criar mensagem
const msg = document.createElement("h1");
msg.textContent = "Clique na tela ou pressione ESPAÇO para começar";
msg.style.color = "white";
msg.style.textAlign = "center";
msg.style.padding = "20px";
msg.style.letterSpacing = "4px"; 
msg.style.fontSize = "70px"

// Aplicar a fonte personalizada
msg.style.fontFamily = "horroroid, sans-serif"; 

overlay.appendChild(msg);


    function startGame() {
        document.removeEventListener("keydown", startListener);
        document.removeEventListener("touchstart", startTouch);
        overlay.remove();
        gameRunning = true;
        moveCactus();
        runAnimation();
    }

    function startListener(e) {
        if (e.code === "Space") startGame();
    }

    function startTouch() {
        startGame();
    }

    document.addEventListener("keydown", startListener);
    document.addEventListener("touchstart", startTouch);
}

// ------------------- PULO -------------------
function jump() {
    if (isJumping) return;
    isJumping = true;

    const foot = document.getElementById("foot");
    foot.style.transform = "rotate(15deg)";

    let upInterval = setInterval(() => {
        if (position >= 250) {
            clearInterval(upInterval);
            foot.style.transform = "rotate(0deg)";

            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                } else {
                    position -= 5;
                    dino.style.bottom = position + "px";
                }
            }, 8);
        } else {
            position += 5;
            dino.style.bottom = position + "px";
        }
    }, 8);
}

// ------------------- ANIMAÇÃO DE CORRIDA -------------------
function runAnimation() {
    const foot = document.getElementById("foot");

    function step() {
        if (!isJumping) {
            foot.style.transform = foot.style.transform === "rotate(8deg)" ? "rotate(0deg)" : "rotate(8deg)";
        }
        runAnimationId = setTimeout(step, 300);
    }
    step();
}

// ------------------- MOVIMENTO DO CACTO -------------------
function moveCactus() {
    const cactus1 = document.getElementById("cactus");
    const cactus2 = document.getElementById("cactus2");
    const cactus3 = document.getElementById("cactus3");

    let cactus1Position = 800;
    let cactus2Position = 1300;
    let speed = 5;
    let speedIncrease = 0;

    cactus1.style.display = "block";
    cactus2.style.display = "block";
    cactus3.style.display = "none";

    const isMobile = window.innerWidth <= 600;
    const hitbox = isMobile
        ? { leftMin: 90, leftMax: 140, heightMax: 30 }
        : { leftMin: 50, leftMax: 230, heightMax: 30 };

    function resetCactus(which) {
        const base = 800 + Math.random() * 400;
        const distance = 250 + Math.random() * 200;

        if (which === 1) {
            cactus1Position = Math.max(base, cactus2Position + distance);
        } else {
            cactus2Position = Math.max(base, cactus1Position + distance);
            const useCactus3 = Math.random() < 0.5;
            cactus2.style.display = useCactus3 ? "none" : "block";
            cactus3.style.display = useCactus3 ? "block" : "none";

            if (useCactus3) cactus3.style.left = cactus2Position + "px";
        }
    }

    function update() {
        if (!gameRunning) return;

        cactus1Position -= speed;
        cactus2Position -= speed;

        cactus1.style.left = cactus1Position + "px";
        cactus2.style.left = cactus2Position + "px";
        cactus3.style.left = cactus2Position + "px";

        if (
            (cactus1Position > hitbox.leftMin && cactus1Position < hitbox.leftMax && position < hitbox.heightMax) ||
            (cactus2Position > hitbox.leftMin && cactus2Position < hitbox.leftMax && position < hitbox.heightMax && cactus2.style.display === "block") ||
            (cactus2Position > hitbox.leftMin && cactus2Position < hitbox.leftMax && position < hitbox.heightMax && cactus3.style.display === "block")
        ) {
            endGame();
            return;
        }

        if (cactus1Position < -100) resetCactus(1);
        if (cactus2Position < -100) resetCactus(2);

        if (speedIncrease < 800) {
            speedIncrease++;
            speed = 5 + speedIncrease * 0.005;
        }

        requestAnimationFrame(update);
    }

    update();
}

// ------------------- GAME OVER -------------------
function endGame() {
    gameRunning = false;
    clearTimeout(runAnimationId);

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.flexDirection = "column";
    overlay.style.zIndex = "100000";
    document.body.appendChild(overlay);

    const msg = document.createElement("h1");
    msg.textContent = "Game Over";
    msg.style.color = "white";
    overlay.appendChild(msg);
    msg.style.letterSpacing = "4px"; 
msg.style.fontSize = "70px"

// Aplicar a fonte personalizada
msg.style.fontFamily = "horroroid, sans-serif"; 

    const arrow = document.createElement("div");
    arrow.innerHTML = "&#8592;";
    arrow.style.fontSize = "50px";
    arrow.style.color = "white";
    arrow.style.marginTop = "-10px";
    overlay.appendChild(arrow);

    let canRestart = false;
    setTimeout(() => (canRestart = true), 500);

    document.addEventListener("keydown", function restartListener(event) {
        if (event.code === "Space" && canRestart) {
            document.removeEventListener("keydown", restartListener);
            location.reload();
        }
    });

    document.addEventListener("touchstart", function restartTouch() {
        if (canRestart) {
            document.removeEventListener("touchstart", restartTouch);
            location.reload();
        }
    });
}

// ------------------- INÍCIO -------------------
showStartScreen();

// ------------------- CONTROLES DE PULO -------------------
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") jump();
});

document.addEventListener("touchstart", () => jump());
document.addEventListener("click", () => jump());

// ------------------- FUNÇÕES DE COLETA -------------------
function spawnCollectible() {
    if (!gameRunning) return;

    const collectible = document.createElement("img");
    collectible.classList.add("collectible");
    const itemData = collectibleItems[Math.floor(Math.random() * collectibleItems.length)];
    collectible.src = itemData.src;
    collectible.dataset.name = itemData.name;

    let collectiblePosition = 700;
    collectible.style.left = collectiblePosition + "px";
    collectible.style.bottom = "400px";
    collectible.style.position = "absolute";
    collectible.style.width = "45px";
    collectible.style.height = "45px";
    collectible.style.zIndex = "150000000000";

    const gameArea = document.querySelector(".game");
    gameArea.appendChild(collectible);

    let speed = 20;
    let timerId;

    function moveCollectible() {
        collectiblePosition -= 5;
        collectible.style.left = collectiblePosition + "px";

        const dinoLeft = dino.offsetLeft;
        const dinoRight = dinoLeft + dino.offsetWidth;
        const collectibleLeft = collectiblePosition;
        const collectibleRight = collectibleLeft + collectible.offsetWidth;

        if (isJumping && position >= 140 && collectibleRight > dinoLeft + 40 && collectibleLeft < dinoRight - 40) {
            clearTimeout(timerId);
            collectible.remove();

            collectedCounts[itemData.name] = (collectedCounts[itemData.name] || 0) + 1;
            updateInventory();

            if (Object.keys(collectedCounts).length === collectibleItems.length) {
                clearTimeout(gameLoopId);
                clearTimeout(runAnimationId);
                window.location.href = "parabens.html";
            }
            return;
        }

        if (collectiblePosition < -100) {
            clearTimeout(timerId);
            collectible.remove();
            return;
        }

        timerId = setTimeout(moveCollectible, speed);
    }

    moveCollectible();
}

function updateInventory() {
    inventory.innerHTML = "";
    for (const itemName in collectedCounts) {
        const count = collectedCounts[itemName];
        if (count > 0) {
            const itemData = collectibleItems.find(item => item.name === itemName);

            const container = document.createElement("div");
            container.style.position = "relative";
            container.style.display = "inline-block";

            const img = document.createElement("img");
            img.src = itemData.src;
            img.style.width = "45px";
            img.style.height = "45px";

            const countBadge = document.createElement("span");
            countBadge.textContent = "x" + count;
            countBadge.style.position = "absolute";
            countBadge.style.bottom = "0";
            countBadge.style.right = "33px";
            countBadge.style.color = "white";
            countBadge.style.textShadow = "1px 1px 2px black";
            countBadge.style.fontSize = "20px";
            countBadge.style.padding = "6px";
            countBadge.style.borderRadius = "10px";

            container.appendChild(img);
            container.appendChild(countBadge);
            inventory.appendChild(container);
        }
    }
}

// Spawna itens a cada 3s
setInterval(spawnCollectible, 3000);
