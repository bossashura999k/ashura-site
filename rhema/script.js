(function() {
// Animate stat bars on load
window.addEventListener('load', () => {
    setTimeout(() => {
    document.querySelectorAll('.stat-fill').forEach(bar => {
        const val = bar.dataset.val;
        if (val) bar.style.width = val + '%';
    });
    }, 400);
});

// Subtle parallax + 3D effect on card
const card = document.querySelector('.profile-card');
if (card) {
    document.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    card.style.transform = `perspective(1200px) rotateY(${dx * 1.5}deg) rotateX(${-dy * 1}deg)`;
    });
    document.addEventListener('mouseleave', () => {
    if (card) card.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
    });
}
})();