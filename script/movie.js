(() => {
  // Add one entry per movie here. title is just display text;
  // src should be the public R2 (or wherever) URL to the file.
  const MOVIES = [
    { title: 'Final Destination (2000)', src: 'https://media.ashura.site/movie-with-subs.mp4' },
    { title: 'Movie 2', src: 'https://media.ashura.site/movie2-with-subs.mp4' }
  ];

  const $ = id => document.getElementById(id);
  const video = $('video'), stage = $('stage'), player = $('player');
  const videoSource = $('videoSource'), playlistEl = $('playlist');
  let currentIndex = 0;

  function renderPlaylist(){
    playlistEl.innerHTML = MOVIES.map((m, i) => `
      <div class="playlist-item${i === currentIndex ? ' active' : ''}" data-index="${i}">
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="title">${m.title}</span>
        <span class="playing-dot"></span>
      </div>
    `).join('');
  }

  function loadMovie(i, autoplay){
    currentIndex = i;
    videoSource.src = MOVIES[i].src;
    video.load();
    if (autoplay) video.play();
    renderPlaylist();
  }

  playlistEl.addEventListener('click', e => {
    const item = e.target.closest('.playlist-item');
    if (!item) return;
    const i = parseInt(item.dataset.index, 10);
    if (i !== currentIndex) loadMovie(i, true);
  });

  loadMovie(0, false);
  const playBtn = $('playBtn'), skipBack = $('skipBack'), skipFwd = $('skipFwd');
  const muteBtn = $('muteBtn'), volume = $('volume');
  const cur = $('cur'), dur = $('dur');
  const scrub = $('scrub'), fill = $('fill'), buffered = $('buffered'), knob = $('knob');
  const speedBtn = $('speedBtn'), speedMenu = $('speedMenu');
  const pipBtn = $('pipBtn'), fullBtn = $('fullBtn');
  const flash = $('flash'), buffering = $('buffering');

  const ICONS = {
    play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    back10:'<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
    fwd10: '<svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>',
    volHi: '<svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volMute:'<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
    pip:   '<svg viewBox="0 0 24 24"><path d="M19 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zm-8 8H6v-4h5v4z"/></svg>',
    fullOpen: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fullClose:'<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
  };

  playBtn.innerHTML = ICONS.play;
  skipBack.innerHTML = ICONS.back10;
  skipFwd.innerHTML = ICONS.fwd10;
  muteBtn.innerHTML = ICONS.volHi;
  pipBtn.innerHTML = ICONS.pip;
  fullBtn.innerHTML = ICONS.fullOpen;

  const fmt = s => {
    if (!isFinite(s)) return '0:00';
    s = Math.max(0, Math.floor(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const mm = h ? String(m).padStart(2, '0') : m;
    return (h ? h + ':' : '') + mm + ':' + String(sec).padStart(2, '0');
  };

  function flashIcon(name){
    flash.innerHTML = ICONS[name];
    flash.classList.remove('show');
    void flash.offsetWidth;
    flash.classList.add('show');
  }

  function togglePlay(){
    if (video.paused) { video.play(); } else { video.pause(); }
  }

  video.addEventListener('play', () => { playBtn.innerHTML = ICONS.pause; flashIcon('play'); });
  video.addEventListener('pause', () => { playBtn.innerHTML = ICONS.play; flashIcon('pause'); });
  playBtn.addEventListener('click', togglePlay);
  stage.addEventListener('click', e => { if (e.target === video || e.target === stage) togglePlay(); });

  skipBack.addEventListener('click', () => video.currentTime = Math.max(0, video.currentTime - 10));
  skipFwd.addEventListener('click', () => video.currentTime = Math.min(video.duration || 0, video.currentTime + 10));

  video.addEventListener('loadedmetadata', () => { dur.textContent = fmt(video.duration); });
  video.addEventListener('timeupdate', () => {
    cur.textContent = fmt(video.currentTime);
    const pct = (video.currentTime / (video.duration || 1)) * 100;
    fill.style.width = pct + '%';
    knob.style.left = pct + '%';
  });
  video.addEventListener('progress', () => {
    if (video.buffered.length) {
      const end = video.buffered.end(video.buffered.length - 1);
      buffered.style.width = ((end / (video.duration || 1)) * 100) + '%';
    }
  });
  video.addEventListener('waiting', () => buffering.classList.add('show'));
  video.addEventListener('playing', () => buffering.classList.remove('show'));
  video.addEventListener('canplay', () => buffering.classList.remove('show'));

  function seekTo(clientX){
    const rect = scrub.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = pct * (video.duration || 0);
  }
  let dragging = false;
  scrub.addEventListener('mousedown', e => { dragging = true; seekTo(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) seekTo(e.clientX); });
  window.addEventListener('mouseup', () => dragging = false);
  scrub.addEventListener('touchstart', e => seekTo(e.touches[0].clientX));
  scrub.addEventListener('touchmove', e => seekTo(e.touches[0].clientX));

  volume.addEventListener('input', () => {
    video.volume = volume.value;
    video.muted = video.volume === 0;
    muteBtn.innerHTML = video.muted ? ICONS.volMute : ICONS.volHi;
  });
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.innerHTML = video.muted ? ICONS.volMute : ICONS.volHi;
    if (!video.muted && video.volume === 0) { video.volume = 1; volume.value = 1; }
  });

  speedBtn.addEventListener('click', () => speedMenu.classList.toggle('open'));
  speedMenu.addEventListener('click', e => {
    const b = e.target.closest('button[data-speed]');
    if (!b) return;
    const rate = parseFloat(b.dataset.speed);
    video.playbackRate = rate;
    speedBtn.textContent = rate + 'x';
    [...speedMenu.children].forEach(c => c.classList.remove('active'));
    b.classList.add('active');
    speedMenu.classList.remove('open');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-wrap')) speedMenu.classList.remove('open');
  });

  pipBtn.addEventListener('click', async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch (err) { console.warn('PiP unavailable:', err); }
  });

  fullBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) player.requestFullscreen();
    else document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    fullBtn.innerHTML = document.fullscreenElement ? ICONS.fullClose : ICONS.fullOpen;
  });

  document.addEventListener('keydown', e => {
    if (!player.contains(document.activeElement) && document.activeElement !== document.body) return;
    switch (e.key) {
      case ' ': case 'k': e.preventDefault(); togglePlay(); break;
      case 'ArrowLeft': video.currentTime = Math.max(0, video.currentTime - 5); break;
      case 'ArrowRight': video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); break;
      case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.05); volume.value = video.volume; break;
      case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.05); volume.value = video.volume; break;
      case 'm': muteBtn.click(); break;
      case 'f': fullBtn.click(); break;
    }
  });
})();
