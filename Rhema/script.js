
// Animate stat bars on load
window.addEventListener('load', () => {
setTimeout(() => {
    document.querySelectorAll('.stat-fill').forEach(bar => {
    const val = bar.dataset.val;
    bar.style.width = val + '%';
    });
}, 900);
});

// Subtle parallax on card
document.addEventListener('mousemove', (e) => {
const card = document.querySelector('.profile-card');
if (!card) return;
const rect = card.getBoundingClientRect();
const cx = rect.left + rect.width / 2;
const cy = rect.top + rect.height / 2;
const dx = (e.clientX - cx) / window.innerWidth;
const dy = (e.clientY - cy) / window.innerHeight;
card.style.transform = `perspective(1200px) rotateY(${dx * 1.5}deg) rotateX(${-dy * 1}deg)`;
});

document.addEventListener('mouseleave', () => {
const card = document.querySelector('.profile-card');
if (card) card.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
});
