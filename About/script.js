// script.js
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const templateId = "tech";
  const profileMap = {
    minimal: { distanceY: 26, duration: 760, stagger: 40, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    tech: { distanceY: 34, duration: 860, stagger: 58, threshold: 0.08, rootMargin: '0px 0px -4% 0px', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    devops: { distanceY: 30, duration: 800, stagger: 46, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    mobiledev: { distanceY: 28, duration: 780, stagger: 42, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    backend: { distanceY: 32, duration: 840, stagger: 50, threshold: 0.09, rootMargin: '0px 0px -5% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    creative: { distanceY: 42, duration: 980, stagger: 72, threshold: 0.06, rootMargin: '0px 0px -2% 0px', easing: 'cubic-bezier(0.12, 0.9, 0.15, 1)' },
    enterprise: { distanceY: 22, duration: 700, stagger: 34, threshold: 0.11, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    opensource: { distanceY: 34, duration: 860, stagger: 56, threshold: 0.08, rootMargin: '0px 0px -4% 0px', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    analytics: { distanceY: 30, duration: 820, stagger: 44, threshold: 0.1, rootMargin: '0px 0px -5% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    insights: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    architect: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    atelier: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    catalyst: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    research: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    visionary: { distanceY: 24, duration: 760, stagger: 38, threshold: 0.1, rootMargin: '0px 0px -6% 0px', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  };
  const profile = { ...(profileMap[templateId] || profileMap.minimal) };
  if (prefersReducedMotion) {
    profile.distanceY = Math.max(8, Math.round(profile.distanceY * 0.6));
    profile.duration = Math.max(360, Math.round(profile.duration * 0.7));
    profile.stagger = Math.max(10, Math.round(profile.stagger * 0.6));
  }

  // ========== TYPEWRITER ==========
  const parseList = (raw) => (raw || "").split("||").map(item => item.trim()).filter(Boolean);

  const startTypewriter = ({ items, onFrame, typeSpeed = 70, deleteSpeed = 38, pause = 1000, startDelay = 140 }) => {
    const values = (items || []).filter(Boolean);
    if (!values.length) return () => {};

    let valueIndex = 0;
    let current = "";
    let deleting = false;
    let stopped = false;
    let timer = null;

    const tick = () => {
      if (stopped) return;
      const target = values[valueIndex] || values[0] || "";
      const doneTyping = current === target;
      const doneDeleting = current.length === 0;

      let delay = deleting ? deleteSpeed : typeSpeed;
      if (doneTyping && !deleting) delay = pause;
      if (doneDeleting && deleting) delay = 240;

      if (doneTyping && !deleting) {
        deleting = true;
      } else if (doneDeleting && deleting) {
        deleting = false;
        valueIndex = (valueIndex + 1) % values.length;
      } else {
        current = deleting
          ? target.slice(0, Math.max(0, current.length - 1))
          : target.slice(0, current.length + 1);
      }

      onFrame(current);
      timer = window.setTimeout(tick, delay);
    };

    onFrame("");
    timer = window.setTimeout(tick, startDelay);
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  };

  document.querySelectorAll('[data-export-typewriter-role="true"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const roles = parseList(node.getAttribute("data-export-typewriter-roles")) || [node.textContent?.trim() || "Software Developer"];
    const textEl = document.createElement("span");
    const cursorEl = document.createElement("span");
    cursorEl.className = "ml-1 inline-block animate-pulse";
    cursorEl.textContent = "|";
    node.innerHTML = "";
    node.appendChild(textEl);
    node.appendChild(cursorEl);
    startTypewriter({
      items: roles,
      typeSpeed: 85,
      deleteSpeed: 45,
      pause: 1150,
      onFrame: (value) => { textEl.textContent = value || "\u00A0"; }
    });
  });

  document.querySelectorAll('[data-export-typewriter-code="true"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const name = node.getAttribute("data-export-dev-name") || "Developer";
    const roles = parseList(node.getAttribute("data-export-dev-roles"));
    const skills = parseList(node.getAttribute("data-export-dev-skills"));
    const status = node.getAttribute("data-export-dev-status") || "Available for hire";
    const fallbackRole = roles[0] || "Software Developer";
    const roleItems = roles.length ? roles : [fallbackRole];

    const toSnippet = (role) => {
      const skillsBlock = JSON.stringify(skills, null, 4);
      return "const developer = {\n" +
        '  name: "' + name + '",\n' +
        '  title: "' + role + '",\n' +
        "  skills: " + skillsBlock + ",\n" +
        '  status: "' + status + '"\n' +
        "};";
    };

    const snippetItems = roleItems.map(role => toSnippet(role));
    const textEl = document.createElement("span");
    const cursorEl = document.createElement("span");
    cursorEl.className = "animate-pulse";
    cursorEl.textContent = "|";
    node.innerHTML = "";
    node.appendChild(textEl);
    node.appendChild(cursorEl);

    startTypewriter({
      items: snippetItems,
      typeSpeed: 16,
      deleteSpeed: 7,
      pause: 1350,
      onFrame: (value) => { textEl.textContent = value || "\u00A0"; }
    });
  });

  // ========== PROJECTS UI ==========
  const projectDataById = new Map();
  const roots = document.querySelectorAll('[data-export-projects-root="true"]');
  roots.forEach((root) => {
    const limit = Number(root.getAttribute('data-project-limit') || '6');
    const projectDataScript = root.querySelector('[data-export-project-data]');
    if (projectDataScript) {
      try {
        const raw = JSON.parse(projectDataScript.textContent || '[]');
        if (Array.isArray(raw)) {
          raw.forEach(item => { if (item && typeof item.id === 'string') projectDataById.set(item.id, item); });
        }
      } catch (error) { console.warn('Failed to parse project metadata', error); }
    }

    const grid = root.querySelector('[data-export-projects-grid]');
    if (grid) {
      // Render project cards from data
      const projects = Array.from(projectDataById.values());
      grid.innerHTML = '';
      projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 shadow-[0_18px_50px_-30px_rgba(2,6,23,0.5)] ring-1 ring-white/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(2,6,23,0.62)] hover:ring-white/10';
        card.setAttribute('data-project-id', proj.id);
        const firstLetter = proj.title.charAt(0).toUpperCase();
        card.innerHTML = `
          <div class="relative overflow-hidden border-b border-zinc-800/80 h-44">
            <div class="flex h-full w-full items-center justify-center text-5xl font-bold text-zinc-100" style="background:linear-gradient(135deg, #00d4ffbb, #0f172a)">${firstLetter}</div>
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-transparent to-transparent"></div>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                ${proj.featured ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star w-4 h-4" style="color:#00d4ff;fill:#00d4ff"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>' : ''}
                <h3 class="text-lg font-semibold leading-snug tracking-tight text-zinc-100 group-hover:translate-x-1 transition-transform" style="color:#00d4ff">${proj.title}</h3>
              </div>
              <div class="flex gap-2">
                ${proj.github ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github w-4 h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>` : ''}
                ${proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link w-4 h-4"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>` : ''}
              </div>
            </div>
            <p class="text-sm leading-relaxed text-zinc-400/95 line-clamp-3 mb-4">${proj.description}</p>
            <div class="flex flex-wrap gap-2">
              ${proj.tags.map(tag => `<span class="tag text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-full">${tag}</span>`).join('')}
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    }
  });

  // Modal functionality (adapted from original)
  const modal = document.querySelector('[data-export-project-modal="true"]');
  if (modal) {
    const titleEl = modal.querySelector('[data-export-modal-title]');
    const subtitleEl = modal.querySelector('[data-export-modal-subtitle]');
    const descriptionEl = modal.querySelector('[data-export-modal-description]');
    const imageEl = modal.querySelector('[data-export-modal-image]');
    const imageFallbackEl = modal.querySelector('[data-export-modal-image-fallback]');
    const tagsWrapSectionEl = modal.querySelector('[data-export-modal-tags-wrap]');
    const tagsWrapEl = modal.querySelector('[data-export-modal-tags]');
    const liveLinkEls = modal.querySelectorAll('[data-export-modal-live-top], [data-export-modal-live-bottom]');
    const githubLinkEls = modal.querySelectorAll('[data-export-modal-github-top], [data-export-modal-github-bottom]');
    const featuredEl = modal.querySelector('[data-export-modal-featured]');
    const statusEl = modal.querySelector('[data-export-modal-status]');
    const statusDotEl = modal.querySelector('[data-export-modal-status-dot]');
    const featuresWrapEl = modal.querySelector('[data-export-modal-features-wrap]');
    const featuresEl = modal.querySelector('[data-export-modal-features]');

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    };

    modal.querySelectorAll('[data-export-project-modal-close="true"]').forEach(node => node.addEventListener('click', closeModal));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

    document.querySelectorAll('[data-project-id]').forEach(card => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a,button')) return;
        const projectId = card.getAttribute('data-project-id') || '';
        const projectData = projectDataById.get(projectId) || {};
        const title = projectData.title || card.querySelector('h3')?.textContent?.trim() || 'Project';
        const description = projectData.description || card.querySelector('p')?.textContent?.trim() || '';
        const imageSrc = projectData.image || '';
        const githubHref = projectData.github || '';
        const liveHref = projectData.demo || '';
        const isFeatured = projectData.featured === true;
        const tags = projectData.tags || [];

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = title;
        if (descriptionEl) descriptionEl.textContent = description;
        if (featuredEl) isFeatured ? featuredEl.classList.remove('hidden') : featuredEl.classList.add('hidden');
        if (statusEl) statusEl.textContent = liveHref ? 'Live' : 'In Progress';
        if (statusDotEl) statusDotEl.style.backgroundColor = liveHref ? '#34d399' : '#f59e0b';

        if (imageEl && imageFallbackEl) {
          if (imageSrc) {
            imageEl.src = imageSrc;
            imageEl.classList.remove('hidden');
            imageFallbackEl.classList.add('hidden');
          } else {
            imageEl.classList.add('hidden');
            imageFallbackEl.classList.remove('hidden');
            imageFallbackEl.textContent = title.charAt(0) || 'P';
          }
        }

        if (tagsWrapEl) {
          tagsWrapEl.innerHTML = '';
          if (tags.length > 0) {
            tags.forEach(tag => {
              const chip = document.createElement('span');
              chip.className = 'rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300';
              chip.textContent = tag;
              tagsWrapEl.appendChild(chip);
            });
            if (tagsWrapSectionEl) tagsWrapSectionEl.classList.remove('hidden');
          } else {
            if (tagsWrapSectionEl) tagsWrapSectionEl.classList.add('hidden');
          }
        }

        liveLinkEls.forEach(node => {
          if (node instanceof HTMLAnchorElement) {
            if (liveHref) { node.href = liveHref; node.classList.remove('hidden'); }
            else { node.href = '#'; node.classList.add('hidden'); }
          }
        });

        githubLinkEls.forEach(node => {
          if (node instanceof HTMLAnchorElement) {
            if (githubHref) { node.href = githubHref; node.classList.remove('hidden'); }
            else { node.href = '#'; node.classList.add('hidden'); }
          }
        });

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ========== RESUME MODAL ==========
  const setupExportResumeModal = () => {
    const triggers = Array.from(document.querySelectorAll('[data-export-resume-trigger="true"]'));
    if (!triggers.length) return;

    const isSafeUrl = (value) => typeof value === 'string' && value.trim() && !/^javascript:/i.test(value);
    const getResumeFrameUrl = (value) => value ? value + '#toolbar=1&view=FitH' : '';

    let modal = document.querySelector('[data-export-resume-modal]');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[130] hidden items-center justify-center bg-black/70 p-3 sm:p-6';
      modal.setAttribute('data-export-resume-modal', 'true');
      const panel = document.createElement('div');
      panel.className = 'flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950';
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-5';
      const title = document.createElement('p');
      title.className = 'truncate text-sm font-semibold text-zinc-100';
      title.textContent = 'Resume';
      const actionWrap = document.createElement('div');
      actionWrap.className = 'flex items-center gap-2';
      const download = document.createElement('a');
      download.className = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-950';
      download.style.background = 'linear-gradient(135deg, #00d4ff, #a855f7)';
      download.innerHTML = 'Download';
      download.setAttribute('download', 'resume.pdf');
      download.href = '#';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300';
      close.textContent = 'Close';
      const frame = document.createElement('iframe');
      frame.title = 'Resume PDF';
      frame.className = 'h-full w-full';

      actionWrap.appendChild(download);
      actionWrap.appendChild(close);
      header.appendChild(title);
      header.appendChild(actionWrap);
      panel.appendChild(header);
      panel.appendChild(frame);
      modal.appendChild(panel);
      document.body.appendChild(modal);

      let resumeObjectUrl = '';
      const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        if (resumeObjectUrl) { URL.revokeObjectURL(resumeObjectUrl); resumeObjectUrl = ''; }
        frame.src = 'about:blank';
      };
      const openModal = async (url, fileName) => {
        if (!isSafeUrl(url)) return;
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Resume fetch failed');
          const blob = await response.blob();
          resumeObjectUrl = URL.createObjectURL(blob);
          frame.src = resumeObjectUrl;
        } catch {
          frame.src = getResumeFrameUrl(url);
        }
        download.href = url;
        download.setAttribute('download', fileName || 'resume.pdf');
        title.textContent = fileName || 'Resume';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      };
      close.addEventListener('click', closeModal);
      modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });

      triggers.forEach(node => {
        node.addEventListener('click', (event) => {
          event.preventDefault();
          const url = node.getAttribute('data-export-resume-url') || node.getAttribute('href') || '';
          const fileName = node.getAttribute('data-export-resume-name') || 'resume.pdf';
          openModal(url, fileName);
        });
      });
    }
  };
  setupExportResumeModal();

  // ========== BACK TO TOP ==========
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

  // ========== CONTACT FORM ==========
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

  // ========== SCROLL REVEAL ==========
  const revealSelectors = ['section', 'section > div', '.project-card', '.skill-item', '.experience-item', 'article'];
  const nodeSet = new Set();
  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.closest('nav') || el.closest('footer') || el.closest('[data-export-project-modal="true"]')) return;
      nodeSet.add(el);
    });
  });
  const uniqueNodes = Array.from(nodeSet).filter(el => !Array.from(nodeSet).some(other => other !== el && other.contains(el)));

  uniqueNodes.forEach((el, idx) => {
    const stagger = (idx % 10) * profile.stagger;
    el.classList.add('export-reveal');
    el.style.setProperty('--reveal-delay', stagger + 'ms');
    el.style.setProperty('--reveal-distance', profile.distanceY + 'px');
    el.style.setProperty('--reveal-duration', profile.duration + 'ms');
    el.style.setProperty('--reveal-easing', profile.easing);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: profile.threshold, rootMargin: profile.rootMargin }
    );
    uniqueNodes.forEach(el => observer.observe(el));
  } else {
    uniqueNodes.forEach(el => el.classList.add('is-visible'));
  }

  // Add card hover class
  document.querySelectorAll('.project-card, .experience-item, .education-item, article').forEach(node => {
    if (node instanceof HTMLElement && !node.classList.contains('no-export-anim')) {
      node.classList.add('export-card');
    }
  });
})();
