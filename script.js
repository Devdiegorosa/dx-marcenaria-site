// =========================================================
// DX Marcenaria - JavaScript organizado
// Funcionalidades:
// - Navbar com scroll
// - Menu mobile
// - Reveal animation
// - Contadores
// - Carrosséis
// - Filtros do portfólio
// - Formulário para WhatsApp
// =========================================================

// DX Marcenaria — script.js
(function () {
  'use strict';

  /* ── Navbar scroll ── */
  const navbar = document.querySelector('.dx-navbar');
  function handleNavbarScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ── Fecha menu mobile ao clicar em link ── */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('#menuPrincipal');
      const bs = bootstrap.Collapse.getInstance(menu);
      if (bs) bs.hide();
    });
  });

  /* ── Scroll reveal (cards, timeline, ig-posts) ── */
  const revealEls = document.querySelectorAll(
    '.premium-card, .environment-card, .timeline-step, .section-title, .section-text, .ig-post'
  );
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const delay = Math.min(siblings.indexOf(entry.target) * 80, 320);
      entry.target.style.transitionDelay = delay + 'ms';
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════════
     CONTADOR ANIMADO — barra de números
  ══════════════════════════════════════ */
  function animateCount(el, target, duration) {
    let start = null;
    const isDecimal = target % 1 !== 0;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = isDecimal ? (eased * target).toFixed(1) : Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.stat-num');
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      if (!isNaN(target)) animateCount(el, target, 1600);
      statsObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statsObs.observe(el));

  /* ══════════════════════════════════════
     FÁBRICA DE CARROSSEL
  ══════════════════════════════════════ */
  function makeCarousel(opts) {
    // opts: { track, prevBtn, nextBtn, dotsEl, slidesPerView, autoplay }
    const { track, prevBtn, nextBtn, dotsEl, getSlidesPerView, autoplay } = opts;
    if (!track) return;

    let current = 0;
    let autoTimer = null;
    let touchStartX = 0;

    function getSlides() {
      return Array.from(track.children).filter(el => !el.classList.contains('pf-hidden'));
    }

    function getPerView() {
      return getSlidesPerView ? getSlidesPerView() : 1;
    }

    function maxIndex() {
      const slides = getSlides();
      return Math.max(0, slides.length - getPerView());
    }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      const total = getSlides().length;
      const perView = getPerView();
      const pages = Math.ceil(total / perView);
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pf-dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', 'Slide ' + (i + 1));
        btn.addEventListener('click', () => goTo(i * perView));
        dotsEl.appendChild(btn);
      }
    }

    function updateDots() {
      if (!dotsEl) return;
      const perView = getPerView();
      const page = Math.floor(current / perView);
      dotsEl.querySelectorAll('.pf-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === page);
      });
    }

    function goTo(idx) {
      const slides = getSlides();
      const perView = getPerView();
      // Calcular deslocamento em pixels para o slide visado
      // Cada slide ocupa track.offsetWidth / perView
      current = Math.max(0, Math.min(idx, slides.length - perView));
      const slideW = track.parentElement.offsetWidth / perView;
      // Encontrar posição do slide atual no DOM completo (incluindo hidden)
      const allSlides = Array.from(track.children);
      const visibleBefore = allSlides.slice(0, allSlides.indexOf(slides[current])).filter(s => !s.classList.contains('pf-hidden')).length;
      track.style.transform = `translateX(-${current * slideW}px)`;
      updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    // Swipe touch
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
    }, { passive: true });

    // Teclado
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { next(); resetAuto(); }
      if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    });

    function startAuto() {
      if (!autoplay) return;
      autoTimer = setInterval(() => next(), autoplay);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Recalcula ao redimensionar
    window.addEventListener('resize', () => goTo(current), { passive: true });

    buildDots();
    goTo(0);
    startAuto();

    return { goTo, rebuild: () => { current = 0; buildDots(); goTo(0); } };
  }

  /* ── Carrossel Portfólio ── */
  const pfTrack  = document.getElementById('pfCarousel');
  const pfPrev   = document.getElementById('pfPrev');
  const pfNext   = document.getElementById('pfNext');
  const pfDotsEl = document.getElementById('pfDots');

  const pfCar = makeCarousel({
    track: pfTrack,
    prevBtn: pfPrev,
    nextBtn: pfNext,
    dotsEl: pfDotsEl,
    getSlidesPerView: () => window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3,
    autoplay: 5000,
  });

  /* ── Filtros portfólio ── */
  const pfFilters = document.querySelectorAll('.pf-filter');
  pfFilters.forEach(btn => {
    btn.addEventListener('click', function () {
      pfFilters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const filter = this.dataset.filter;
      if (pfTrack) {
        pfTrack.querySelectorAll('.pf-slide').forEach(slide => {
          slide.classList.toggle('pf-hidden', filter !== 'all' && slide.dataset.cat !== filter);
        });
      }
      if (pfCar) pfCar.rebuild();
    });
  });

  /* ── Carrossel Avaliações ── */
  const rvTrack  = document.getElementById('reviewsTrack');
  const rvPrev   = document.getElementById('rvPrev');
  const rvNext   = document.getElementById('rvNext');
  const rvDotsEl = document.getElementById('rvDots');

  makeCarousel({
    track: rvTrack,
    prevBtn: rvPrev,
    nextBtn: rvNext,
    dotsEl: rvDotsEl,
    getSlidesPerView: () => window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3,
    autoplay: 6000,
  });

  /* ── Formulário → WhatsApp ── */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields   = form.querySelectorAll('input, textarea');
      const nome     = fields[0]?.value.trim() || '';
      const telefone = fields[1]?.value.trim() || '';
      const ambiente = fields[2]?.value.trim() || '';
      const mensagem = fields[3]?.value.trim() || '';
      const texto = encodeURIComponent(
        `Olá, sou ${nome}. Gostaria de solicitar um projeto com a DX Marcenaria.\n\nWhatsApp: ${telefone}\nAmbiente: ${ambiente}\nDetalhes: ${mensagem}`
      );
      window.open(`https://wa.me/5521999990000?text=${texto}`, '_blank');
    });
  }

})();
