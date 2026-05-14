// Configuración de fecha para el contador (AÑO, MES (0-11), DÍA)
// Cambia esta fecha por la fecha en la que empezó su relación
const startDate = new Date(2026, 2, 14); // 14 de Marzo de 2026 (Hace exactamente 2 meses)

const canvas = document.getElementById('tree-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// Ajustar tamaño del canvas
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Elementos del DOM
const startScreen = document.getElementById('start-screen');
const mainScreen = document.getElementById('main-screen');
const bgMusic = document.getElementById('bg-music');
const contentContainer = document.getElementById('content-container');
const photoContainer = document.getElementById('photo-container');

// Estado de la animación
let animationState = 'waiting'; // waiting, falling, growing, blooming, finished
let seedY = 0;
let flowers = [];

// Iniciar al tocar
startScreen.addEventListener('click', () => {
    startScreen.classList.remove('active');
    setTimeout(() => {
        startScreen.style.display = 'none';
        mainScreen.classList.add('active');
        bgMusic.play().catch(e => console.log("Audio autoplay bloqueado:", e));
        startAnimation();
    }, 1000);
});

function startAnimation() {
    animationState = 'falling';
    seedY = -20;
    requestAnimationFrame(animateSeed);
}

// 1. Animación de la Semilla cayendo
function animateSeed() {
    ctx.clearRect(0, 0, width, height);
    
    // Suelo
    ctx.fillStyle = '#5C4A3D';
    ctx.fillRect(0, height - 50, width, 50);

    // Semilla
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(width / 2 + (window.innerWidth > 768 ? 200 : 0), seedY, 5, 0, Math.PI * 2);
    ctx.fill();

    seedY += 5; // Velocidad de caída

    if (seedY >= height - 50) {
        animationState = 'growing';
        let startX = window.innerWidth > 768 ? width * 0.70 : width / 2;
        let startLength = window.innerWidth > 768 ? 130 : 80;
        let startWidth = window.innerWidth > 768 ? 20 : 12;
        growTree(startX, height - 50, -Math.PI / 2, startLength, startWidth);
    } else {
        requestAnimationFrame(animateSeed);
    }
}

// 2. Crecimiento del árbol fractal
let branchesToDraw = [];

function growTree(x, y, angle, length, branchWidth) {
    branchesToDraw.push({x, y, angle, length, branchWidth, currentLength: 0, finished: false});
    if (branchesToDraw.length === 1) {
        requestAnimationFrame(animateTree);
    }
}

function animateTree() {
    let allFinished = true;
    let newBranches = [];

    ctx.clearRect(0, 0, width, height);
    
    // Suelo
    ctx.fillStyle = '#5C4A3D';
    ctx.fillRect(0, height - 50, width, 50);

    // Dibujar todas las ramas terminadas
    for (let branch of branchesToDraw) {
        ctx.beginPath();
        ctx.moveTo(branch.x, branch.y);
        let endX = branch.x + Math.cos(branch.angle) * branch.currentLength;
        let endY = branch.y + Math.sin(branch.angle) * branch.currentLength;
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#5C4A3D'; // Color del tronco
        ctx.lineWidth = branch.branchWidth;
        ctx.stroke();

        if (!branch.finished) {
            allFinished = false;
            branch.currentLength += 2; // Velocidad de crecimiento

            if (branch.currentLength >= branch.length) {
                branch.finished = true;
                branch.currentLength = branch.length;
                
                // Si es suficientemente ancha, seguir dividiendo
                if (branch.branchWidth > 1.5) {
                    let angle1 = branch.angle - Math.PI / 6 + (Math.random() * 0.2 - 0.1);
                    let angle2 = branch.angle + Math.PI / 6 + (Math.random() * 0.2 - 0.1);
                    let len = branch.length * 0.78;
                    let width = branch.branchWidth * 0.72;
                    
                    newBranches.push({x: endX, y: endY, angle: angle1, length: len, branchWidth: width, currentLength: 0, finished: false});
                    newBranches.push({x: endX, y: endY, angle: angle2, length: len, branchWidth: width, currentLength: 0, finished: false});
                } else {
                    // Guardar posiciones para las flores
                    flowers.push({x: endX, y: endY, scale: 0, maxScale: Math.random() * 5 + 3});
                }
            }
        }
    }

    branchesToDraw = branchesToDraw.concat(newBranches);

    if (!allFinished || newBranches.length > 0) {
        requestAnimationFrame(animateTree);
    } else {
        animationState = 'blooming';
        requestAnimationFrame(animateFlowers);
    }
}

// 3. Florecimiento
function animateFlowers() {
    let allBloomed = true;

    for (let flower of flowers) {
        if (flower.scale < flower.maxScale) {
            allBloomed = false;
            flower.scale += 0.1;
        }
        
        // Dibujar flor (simulando cerezos rosados)
        ctx.beginPath();
        ctx.arc(flower.x, flower.y, flower.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 183, 197, 0.9)'; // Rosado claro
        ctx.fill();
        
        // Centro de la flor
        if (flower.scale > 2) {
            ctx.beginPath();
            ctx.arc(flower.x, flower.y, flower.scale * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b8b'; // Rosado oscuro
            ctx.fill();
        }
    }

    if (!allBloomed) {
        requestAnimationFrame(animateFlowers);
    } else {
        animationState = 'finished';
        showContent();
    }
}

// 4. Mostrar Texto y Foto
function showContent() {
    contentContainer.classList.remove('hidden');
    setTimeout(() => {
        photoContainer.classList.remove('hidden');
        photoContainer.style.opacity = '1';
        photoContainer.style.visibility = 'visible';
    }, 2000);
}

// 5. Lógica del Contador
function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}

setInterval(updateCounter, 1000);
updateCounter();
