// script.js
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const templateId = "tech";
  const profileMap = {
    minimal: { distanceY: 26, duration: 760, stagger: 40, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    tech: { distanceY: 34, duration: 860, stagger: 58, threshold: 0.08, rootMargin: '0px 0px -4% 0px', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    // ... (keep all profiles from your original script)
  };
  const profile = { ...(profileMap[templateId] || profileMap.minimal) };
  if (prefersReducedMotion) {
    profile.distanceY = Math.max(8, Math.round(profile.distanceY * 0.6));
    profile.duration = Math.max(360, Math.round(profile.duration * 0.7));
    profile.stagger = Math.max(10, Math.round(profile.stagger * 0.6));
  }

  // ===== TYPEWRITER ===== (keep your original implementation)
  const parseList = (raw) => (raw || "").split("||").map(item => item.trim()).filter(Boolean);
  const startTypewriter = ({ items, onFrame, typeSpeed = 70, deleteSpeed = 38, pause = 1000, startDelay = 140 }) => {
    // ... (your existing code, unchanged)
  };
  // ... (typewriter initialisation as in your script)

  // ===== PROJECTS ===== (keep your original project grid + modal logic)
  // ... (all projectDataById, rendering, modal handling)

  // ===== RESUME MODAL (PNG) =====
  const resumeModalHTML = `
    <div id="resumeModal" role="dialog" aria-modal="true" aria-label="Resume viewer">
      <div class="modal-box">
        <div class="modal-header">
          <h3>📄 <span>Resume</span> · Obire Israel</h3>
          <button class="modal-close" id="resumeModalClose" aria-label="Close resume">&times;</button>
        </div>
        <div class="modal-body" id="resumeModalBody">
          <img src="resume/resume.png" alt="Obire Israel Resume" id="resumeModalImg" />
        </div>
        <div class="modal-footer">
          <a href="resume/resume.png" download="Obire_Israel_Resume.png" class="btn-download">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PNG
          </a>
          <button class="btn-close" id="resumeModalCloseBtn">Close</button>
        </div>
      </div>
    </div>
  `;

  // Insert modal into the DOM (if not already present)
  if (!document.getElementById('resumeModal')) {
    document.body.insertAdjacentHTML('beforeend', resumeModalHTML);
  }

  const modal = document.getElementById('resumeModal');
  const openBtns = document.querySelectorAll('#resumeNavBtn, #resumeMobileBtn');
  const closeBtns = document.querySelectorAll('#resumeModalClose, #resumeModalCloseBtn');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // ESC to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    });
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.add('hidden'), 5000);
      }
    });
  }

  // ===== SCROLL REVEAL =====
  // ... (your existing IntersectionObserver and reveal logic, unchanged)
})();