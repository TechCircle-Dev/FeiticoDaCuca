const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const inventory = document.getElementById("inventory");
const collectibleItems = [
    { name: "olho", src: "./img/olho.png" }, // Verifique este caminho
    { name: "lavanda", src: "./img/lavanda.png" }, // Verifique este caminho
    { name: "anis", src: "./img/maca.png" } // Verifique este caminho
];

const collectedCounts = {};

let isJumping = false;
let position = 0; // Posição vertical do dino (bottom CSS)
let gameLoopId; // ID para o loop principal do jogo (colisão do cacto)
let runAnimationId; // ID para o loop da animação de corrida

// Movimento de pulo
function jump() {
    if (isJumping) return;
    isJumping = true;

    const foot = document.getElementById("foot");
    // Animação de pulo: pé levanta
    foot.style.transform = "rotate(15deg)";

    let upInterval = setInterval(() => {
        if (position >= 250) { // Altura máxima do pulo
            clearInterval(upInterval);

            // Pé volta ao normal no topo do pulo
            foot.style.transform = "rotate(0deg)";

            // Queda
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


// Animação de corrida (Simula o movimento fixo)
function runAnimation() {
    const foot = document.getElementById("foot");

    function step() {
        if (!isJumping) {
            // Alterna a rotação do pé para simular a corrida
            if (foot.style.transform === "rotate(8deg)") {
                foot.style.transform = "rotate(0deg)"; // Pé no chão
            } else {
                foot.style.transform = "rotate(8deg)"; // Pé levantado (para trás)
            }
        }
        // Repete a cada 300ms
        runAnimationId = setTimeout(step, 300);
    }
    step(); // Inicia o loop da animação
}


// Movimento do cacto (Cria a ilusão de que o dinossauro avança)
function moveCactus() {
    const cactus1 = document.getElementById("cactus");
    const cactus2 = document.getElementById("cactus2");

    let cactus1Position = 800;
    let cactus2Position = 1300;
    let speed = 5;
    let speedIncrease = 0;
    let gameRunning = true;

    cactus1.style.display = "block";
    cactus2.style.display = "block";

    // 🔥 Detecta se é mobile
    const isMobile = window.innerWidth <= 600;

    // 🔥 Define raio de colisão diferente
    const hitbox = isMobile
        ? { leftMin: 30, leftMax: 120, heightMax: 30 } // área menor no celular
        : { leftMin: 20, leftMax: 200, heightMax: 40 }; // padrão no desktop

    function resetCactus(which) {
        const base = 800 + Math.random() * 400;
        const distance = 250 + Math.random() * 200;

        if (which === 1) {
            cactus1Position = Math.max(base, cactus2Position + distance);
        } else {
            cactus2Position = Math.max(base, cactus1Position + distance);
            if (Math.random() < 0.5) {
                cactus2.src = "./img/pedra.png";
            } else {
                cactus2.src = "./img/mato.png";
            }
        }
    }

    function update() {
        if (!gameRunning) return;

        cactus1Position -= speed;
        cactus2Position -= speed;

        cactus1.style.left = cactus1Position + "px";
        cactus2.style.left = cactus2Position + "px";

        // ✅ Colisão adaptada ao tamanho da tela
        if (
            (cactus1Position > hitbox.leftMin &&
                cactus1Position < hitbox.leftMax &&
                position < hitbox.heightMax) ||
            (cactus2Position > hitbox.leftMin &&
                cactus2Position < hitbox.leftMax &&
                position < hitbox.heightMax)
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

    function endGame() {
        gameRunning = false;
        clearTimeout(runAnimationId);

        // Cria overlay para congelar tela
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.5)"; // escurece um pouco
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.flexDirection = "column";
        overlay.style.zIndex = "1000"; // acima de tudo
        document.body.appendChild(overlay);

        // Mensagem Game Over
        const msg = document.createElement("h1");
        msg.textContent = "Game Over";
        msg.style.color = "white";
        overlay.appendChild(msg);

        // Seta para voltar
        const arrow = document.createElement("div");
        arrow.innerHTML = "&#8592;"; // seta para esquerda
        arrow.style.fontSize = "50px";
        arrow.style.color = "white";
        arrow.style.marginTop = "-10px";
        overlay.appendChild(arrow);

        // Flag para permitir reinício
        let canRestart = false;

        setTimeout(() => {
            canRestart = true; // após 0,5s habilita space
        }, 500);

        // Detecta space para reiniciar
        document.addEventListener("keydown", function restartListener(event) {
            if (event.code === "Space" && canRestart) {
                document.removeEventListener("keydown", restartListener);
                location.reload(); // reinicia jogo
            }
        });

        document.addEventListener("touchstart", function restartTouch() {
            if (canRestart) {
                document.removeEventListener("touchstart", restartTouch);
                location.reload(); // reinicia o jogo
            }
        });


    }

}

// Iniciar animação do cacto e da corrida
moveCactus();
runAnimation();


// Detecção de tecla espaço para pular
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        jump();
    }
});

// 👉 Detecta toque na tela (Celular)
document.addEventListener("touchstart", (event) => {
    jump();
});

// 👉 (opcional) clique também funciona — útil em desktop com mouse
document.addEventListener("click", (event) => {
    jump();
});


// Funções de Coleta e Inventário
function spawnCollectible() {
    // Se o jogo acabou, não spawna mais
    if (document.body.innerHTML.includes("Game Over") || document.body.innerHTML.includes("PARABÉNS")) return;

    const collectible = document.createElement("img");
    collectible.classList.add("collectible");

    // Escolhe um item aleatório
    const itemData = collectibleItems[Math.floor(Math.random() * collectibleItems.length)];
    collectible.src = itemData.src;
    collectible.dataset.name = itemData.name;

    // Posição inicial fora da tela e altura fixa (para serem alcançáveis)
    let collectiblePosition = 700;
    collectible.style.left = collectiblePosition + "px";
    collectible.style.bottom = "400px";
    collectible.style.position = "absolute";
    collectible.style.width = "45px";
    collectible.style.height = "45px";
    collectible.style.zIndex = "15"; // Fica acima do cacto

    const gameArea = document.querySelector(".game");
    gameArea.appendChild(collectible);

    let speed = 20; // Velocidade de movimento do item (pode ser ajustada)
    let timerId;

    function moveCollectible() {
        collectiblePosition -= 5;
        collectible.style.left = collectiblePosition + "px";

        // Posições para detecção de colisão/coleta
        const dinoLeft = dino.offsetLeft;
        const dinoRight = dinoLeft + dino.offsetWidth;
        const collectibleLeft = collectiblePosition;
        const collectibleRight = collectibleLeft + collectible.offsetWidth;

        // Condição para coletar: Pulo e intersecção horizontal
        if (
            isJumping &&
            position >= 140 && // Coleta na subida ou ápice do pulo
            collectibleRight > dinoLeft + 40 && // Margem de colisão (ajuste fino)
            collectibleLeft < dinoRight - 40
        ) {
            clearTimeout(timerId);
            collectible.remove();

            // Adiciona ao inventário
            collectedCounts[itemData.name] = (collectedCounts[itemData.name] || 0) + 1;

            // Atualiza o inventário
            updateInventory();

            // Checa a condição de vitória
            const uniqueCollectedCount = Object.keys(collectedCounts).length;
            if (uniqueCollectedCount === collectibleItems.length) {
                clearTimeout(gameLoopId); // Para o cacto
                clearTimeout(runAnimationId); // Para a animação de corrida
                window.location.href = "parabens.html";
            }

            return;
        }

        // Remove se sair da tela sem ser coletado
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
    inventory.innerHTML = ""; // limpa inventário

    for (const itemName in collectedCounts) {
        const count = collectedCounts[itemName];
        if (count > 0) {
            // Procura os dados do item (src)
            const itemData = collectibleItems.find(item => item.name === itemName);

            // Cria um container pra imagem + contador
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
            countBadge.style.padding = "6px 6px 6px 6px";
            countBadge.style.borderRadius = "10px";

            container.appendChild(img);
            container.appendChild(countBadge);

            inventory.appendChild(container);
        }
    }
}

// Spawna um novo item colecionável a cada 3 segundos
setInterval(spawnCollectible, 3000);