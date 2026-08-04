const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');
const colorBtns = document.querySelectorAll('.color-btn');

let isDrawing = false;
let currentColor = '#000000';

// 1. Resize canvas to perfectly fill the screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Set smooth drawing defaults
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = currentColor;
}

// 2. Extract coordinates based on event type (Mouse vs Touch)
function getCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

// 3. Drawing Logic Functions
function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Single tap dot support
    ctx.lineTo(x, y);
    ctx.stroke();
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault(); // Stop screen from scrolling on mobile
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

// 4. Desktop Mouse Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

// 5. Mobile Finger Touch Event Listeners
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
window.addEventListener('touchend', stopDrawing);

// 6. Color Selection Setup
colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active styling from previous selection
        document.querySelector('.color-btn.active').classList.remove('active');
        
        // Set new active button and stroke color
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
        ctx.strokeStyle = currentColor;
    });
});

// 7. Clear Screen Setup
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 8. Initialize and handle screen rotation
window.addEventListener('resize', resizeCanvas);
resizeCanvas();