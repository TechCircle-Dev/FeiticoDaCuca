const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const inventory = document.getElementById("inventory");
const collectibleItems = [
  { name: "olho", src: "./img/olho.png" },
  { name: "lavanda", src: "./img/lavanda.png" },
  { name: "anis", src: "./img/anis.png" }
];
const collectedTypes = new Set();

let isJumping = false;
let gravity = 0.9;
let position = 0;

// Movimento de pulo
function jump() {
    if (isJumping) return;
    isJumping = true;

    let upInterval = setInterval(() => {
        if (position >= 150) {
            clearInterval(upInterval);

            // Queda
            let downInterval = setInterval(() => {
                if (position <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                } else {
                    position -= 5;
                    dino.style.bottom = position + "px";
                }
            }, 10);
        } else {
            position += 5;
            dino.style.bottom = position + "px";
        }
    }, 10);
}

// Animação do cacto
function moveCactus() {
    let cactusPosition = 600;
    let speed = 15; // Começa com 15ms
    let timerId;

    function updateCactus() {
        // Atualiza a posição do cacto
        cactusPosition -= 5;
        cactus.style.left = cactusPosition + "px";

        // Colisão com o dinossauro
        if (cactusPosition > 50 && cactusPosition < 90 && position < 40) {
            clearTimeout(timerId);
            document.body.innerHTML = "<h1 style='text-align:center;'>Game Over</h1>";
            return;
        }

        // Resetar o cacto ao sair da tela
        if (cactusPosition < -20) {
            cactusPosition = 600;
        }

        // Reduz a velocidade gradualmente (acelera o jogo)
        if (speed > 8) {
            speed -= 0.1;
        }

        // Repetição do movimento
        timerId = setTimeout(updateCactus, speed);
    }

    updateCactus(); // Inicia o loop de movimentação
}

// Detectar tecla espaço para pular
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        jump();
    }
});

// Iniciar movimentação do cacto
moveCactus();



function spawnCollectible() {
    const collectible = document.createElement("img");
    collectible.classList.add("collectible");

    // Escolhe um item aleatório
    const itemData = collectibleItems[Math.floor(Math.random() * collectibleItems.length)];
    collectible.src = itemData.src;
    collectible.dataset.name = itemData.name;

    let collectiblePosition = Math.floor(Math.random() * 300) + 600;
    collectible.style.left = collectiblePosition + "px";
    collectible.style.bottom = "100px";
    collectible.style.position = "absolute";
    collectible.style.width = "100px";
    collectible.style.height = "100px";

    const gameArea = document.querySelector(".game");
    gameArea.appendChild(collectible);

    let speed = 20;
    let timerId;

function moveCollectible() {
    collectiblePosition -= 5;
    collectible.style.left = collectiblePosition + "px";

    // Posições relativas ao container (mesmo contexto)
    const dinoLeft = dino.offsetLeft;
    const dinoRight = dinoLeft + dino.offsetWidth;
    const collectibleLeft = collectiblePosition;
    const collectibleRight = collectibleLeft + collectible.offsetWidth;

    // Condições para coletar
    if (
        isJumping &&
        position >= 140 && position <= 160 && // altura do pulo perto do topo
        collectibleRight > dinoLeft + 40 && // coletável mais próximo do meio do dino (ajuste)
        collectibleLeft < dinoRight - 40
    ) {
        clearTimeout(timerId);
        collectible.remove();

        // Adiciona ao inventário
        const inventoryItem = document.createElement("img");
        inventoryItem.src = itemData.src;
        inventoryItem.style.width = "100px";
        inventoryItem.style.height = "100px";
        inventory.appendChild(inventoryItem);

        // Marca como coletado
        collectedTypes.add(itemData.name);

        // Verifica vitória
        if (collectedTypes.size === collectibleItems.length) {
            document.body.innerHTML = "<h1 style='text-align:center;'>PARABÉNS, VOCÊ GANHOU!</h1>";
        }

        return;
    }

    timerId = setTimeout(moveCollectible, speed);
}


    moveCollectible();

    // Remove se não for coletado em 5s
    setTimeout(() => {
        clearTimeout(timerId);
        if (collectible.parentNode) collectible.remove();
    }, 5000);
}


setInterval(spawnCollectible, 3000);