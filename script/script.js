(function() {
    // Hamburger menu functionality: appears when hamburger icon clicked, closes on link click / outside click
    const hamburgerBtn = document.getElementById('hamburgerToggleBtn');
    const mobileNav = document.getElementById('mobileNavPanel');
    const overlay = document.getElementById('menuOverlay');
    const navLinks = document.querySelectorAll('.nav-menu-link');
    
    let isMenuOpen = false;

    function toggleMenu(forceState) {
        const newState = (forceState !== undefined) ? forceState : !isMenuOpen;
        if (newState) {
            mobileNav.classList.add('open');
            overlay.classList.add('active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            hamburgerBtn.innerHTML = '✕';
            isMenuOpen = true;
        } else {
            mobileNav.classList.remove('open');
            overlay.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            hamburgerBtn.innerHTML = '☰';
            isMenuOpen = false;
        }
    }

    function closeMenu() {
        if (isMenuOpen) toggleMenu(false);
    }

    // Toggle on button click
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu when clicking on any navigation link (smooth scroll plus close)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // allow default anchor navigation (smooth scroll)
            // but close menu afterwards
            setTimeout(() => {
                closeMenu();
            }, 120); // small delay ensures scroll doesn't conflict
            // if it's a hash link we keep smooth scroll, else if it's external link (index.html) close menu anyway
        });
    });

    // Click outside: close when clicking on overlay or if click outside both button and panel
    document.addEventListener('click', (event) => {
        const isClickInsideNav = mobileNav.contains(event.target);
        const isClickOnButton = hamburgerBtn.contains(event.target);
        if (!isClickInsideNav && !isClickOnButton && isMenuOpen) {
            closeMenu();
        }
    });

    // Prevent overlay click propagation
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeMenu();
        });
    }

    // Optional: close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // ensure that any anchor with class nav-menu-link works smoothly with offset for sticky headers (no persistent bar, but scroll-margin covers)
    // also we manually ensure close after anchor navigation
    const allInternalAnchors = document.querySelectorAll('.nav-menu-link[href^="#"]');
    allInternalAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - offset,
                    behavior: 'smooth'
                });
                // Close menu after navigation
                closeMenu();
            }
        });
    });

    // fix for Homepage link (index.html) keep standard behavior, menu will close anyway
    const homepageLink = document.querySelector('.nav-menu-link[href="index.html"]');
    if (homepageLink) {
        homepageLink.addEventListener('click', () => {
            closeMenu();
        });
    }
})();