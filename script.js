const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const inventory = document.getElementById("inventory");
const collectibleItems = [
    { name: "olho", src: "./img/olho.png" }, // Verifique este caminho
    { name: "lavanda", src: "./img/lavanda.png" }, // Verifique este caminho
    { name: "anis", src: "./img/anis.png" } // Verifique este caminho
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
        if (position >= 180) { // Altura máxima do pulo
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
    let cactusPosition = 600;
    let speed = 10; 
    let speedAdjustment = 0; // Acumulador para o aumento de velocidade

    function updateCactus() {
        // Atualiza a posição do cacto
        cactusPosition -= 5;
        cactus.style.left = cactusPosition + "px";

        // Colisão com o dinossauro
        // O dinossauro está entre 50px e 230px de left (50 + 180)
        // O cacto tem 250px de largura e está 'bottom: -90px'
        // Condição de colisão: quando o cacto estiver na frente do dino e o dino estiver no chão
        if (cactusPosition > 10 && cactusPosition < 130 && position < 40) {
            clearTimeout(gameLoopId);
            clearTimeout(runAnimationId); // Para a animação de corrida
            document.body.innerHTML = "<h1 style='text-align:center; color:white;'>Game Over</h1>";
            return;
        }

        // Resetar o cacto ao sair da tela
        if (cactusPosition < -20) {
            cactusPosition = 700; // Sai do lado direito da tela
        }

        // Acelera o jogo gradualmente
        if (speedAdjustment < 400) { // Limite o aumento de velocidade para não ficar impossível muito rápido
            speedAdjustment++;
            // A velocidade é o tempo (ms) para a próxima iteração. Menor é mais rápido.
            speed = Math.max(7, 10 - (speedAdjustment * 0.005)); 
        }

        // Repetição do movimento
        gameLoopId = setTimeout(updateCactus, speed);
    }

    updateCactus(); // Inicia o loop de movimentação
}

// Iniciar animação do cacto e da corrida
moveCactus();
runAnimation(); 


// Detecção de tecla espaço para pular
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        jump();
    }
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
    collectible.style.bottom = "200px";
    collectible.style.position = "absolute";
    collectible.style.width = "100px";
    collectible.style.height = "100px";
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
                document.body.innerHTML = "<h1 style='text-align:center; color:white;'>PARABÉNS, VOCÊ GANHOU!</h1>";
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
            img.style.width = "100px";
            img.style.height = "100px";

            const countBadge = document.createElement("span");
            countBadge.textContent = "x" + count;
            countBadge.style.position = "absolute";
            countBadge.style.bottom = "0";
            countBadge.style.right = "33px";
            countBadge.style.color = "white"; // Cor branca para contraste com fundo escuro
            countBadge.style.textShadow = "1px 1px 2px black"; // Sombra para legibilidade
            countBadge.style.fontSize = "20px";
            countBadge.style.padding = "2px 6px";
            countBadge.style.borderRadius = "10px";

            container.appendChild(img);
            container.appendChild(countBadge);

            inventory.appendChild(container);
        }
    }
}

// Spawna um novo item colecionável a cada 3 segundos
setInterval(spawnCollectible, 3000);