/**
 * Maya Global Services — Hero Carousel (Premium)
 * Cinematic full-screen carousel with:
 *  - Smooth fade + scale transitions with exiting-slide animation
 *  - Ken Burns background parallax effect
 *  - Auto-advance with pause-on-hover / visibility API
 *  - Canvas-based floating particle system
 *  - Animated counter metrics
 *  - Keyboard + touch / swipe navigation
 */
(function () {
  'use strict';

  // ─── Configuration ────────────────────────────────────────
  const SLIDE_DURATION   = 6500;   // ms per slide
  const TOTAL_SLIDES     = 5;
  const TRANSITION_MS    = 1100;   // must match CSS transition duration

  // ─── State ────────────────────────────────────────────────
  let current       = 0;
  let autoTimer     = null;
  let progressReq   = null;
  let progressStart = null;
  let elapsed       = 0;
  let paused        = false;
  let touchStartX   = 0;
  let touchStartY   = 0;
  let isTransitioning = false;

  // ─── Elements ─────────────────────────────────────────────
  let slides, dots, prevBtn, nextBtn, progressBar, currentLabel;

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;

    slides       = Array.from(document.querySelectorAll('.hc-slide'));
    dots         = Array.from(document.querySelectorAll('.hc-dot'));
    prevBtn      = document.getElementById('hcPrev');
    nextBtn      = document.getElementById('hcNext');
    progressBar  = document.getElementById('hcProgressBar');
    currentLabel = document.getElementById('hcCurrent');

    if (!slides.length) return;

    // Activate first slide immediately (no entry delay)
    activateSlide(0, false);

    // Wire up controls
    prevBtn && prevBtn.addEventListener('click', () => goTo(prev()));
    nextBtn && nextBtn.addEventListener('click', () => goTo(next()));

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.dataset.target, 10);
        goTo(target);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', onKeyDown);

    // Touch / swipe support
    carousel.addEventListener('touchstart', onTouchStart, { passive: true });
    carousel.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // Pause on hover
    carousel.addEventListener('mouseenter', () => { paused = true; });
    carousel.addEventListener('mouseleave', () => { paused = false; });

    // Visibility API — pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      paused = document.hidden;
      if (!paused) resetProgress();
    });

    // Start auto-advance
    startAuto();

    // Animate counters in slide 1
    animateMetrics();

    // Init canvas particle systems for each slide
    initParticleSystems();
  }

  // ─── Slide Activation ─────────────────────────────────────
  function activateSlide(index, animate = true) {
    if (isTransitioning && animate) return;
    isTransitioning = animate;

    const prevIndex = current;
    const prevSlide = slides[prevIndex];

    // Add exiting class to old slide for blur-out effect
    if (animate && prevSlide && index !== prevIndex) {
      prevSlide.classList.add('hc-slide--exiting');
      setTimeout(() => {
        prevSlide.classList.remove('hc-slide--exiting');
      }, TRANSITION_MS);
    }

    // Deactivate all
    slides.forEach(slide => {
      slide.classList.remove('hc-slide--active');
      slide.setAttribute('aria-hidden', 'true');
    });
    dots.forEach(dot => {
      dot.classList.remove('hc-dot--active');
      dot.setAttribute('aria-selected', 'false');
    });

    // Activate target
    const slide = slides[index];
    if (!slide) return;

    slide.classList.add('hc-slide--active');
    slide.setAttribute('aria-hidden', 'false');

    if (dots[index]) {
      dots[index].classList.add('hc-dot--active');
      dots[index].setAttribute('aria-selected', 'true');
    }

    if (currentLabel) {
      currentLabel.textContent = String(index + 1).padStart(2, '0');
    }

    current = index;

    // Reset progress bar
    if (animate) {
      resetProgress();
      setTimeout(() => { isTransitioning = false; }, TRANSITION_MS);
    } else {
      isTransitioning = false;
    }
  }

  // ─── Navigation Helpers ───────────────────────────────────
  function next() {
    return (current + 1) % TOTAL_SLIDES;
  }

  function prev() {
    return (current - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
  }

  function goTo(index) {
    if (index === current || isTransitioning) return;
    clearAuto();
    activateSlide(index);
    startAuto();
  }

  // ─── Auto-Advance ─────────────────────────────────────────
  function startAuto() {
    clearAuto();
    resetProgress();
    autoTimer = setTimeout(function tick() {
      if (!paused) {
        activateSlide(next());
        autoTimer = setTimeout(tick, SLIDE_DURATION);
      } else {
        // retry until not paused
        const poll = setInterval(() => {
          if (!paused) {
            clearInterval(poll);
            activateSlide(next());
            autoTimer = setTimeout(tick, SLIDE_DURATION);
          }
        }, 200);
      }
    }, SLIDE_DURATION);
  }

  function clearAuto() {
    clearTimeout(autoTimer);
    cancelAnimationFrame(progressReq);
    elapsed = 0;
  }

  // ─── Progress Bar Animation ───────────────────────────────
  function resetProgress() {
    elapsed = 0;
    progressStart = null;
    if (progressBar) progressBar.style.width = '0%';
    cancelAnimationFrame(progressReq);
    progressReq = requestAnimationFrame(animateProgress);
  }

  function animateProgress(timestamp) {
    if (!progressStart) progressStart = timestamp;
    if (!paused) {
      elapsed = timestamp - progressStart;
    } else {
      progressStart = timestamp - elapsed;
    }

    const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    if (progressBar) progressBar.style.width = pct + '%';

    if (elapsed < SLIDE_DURATION) {
      progressReq = requestAnimationFrame(animateProgress);
    }
  }

  // ─── Keyboard Navigation ──────────────────────────────────
  function onKeyDown(e) {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    const rect = carousel.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goTo(next());
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goTo(prev());
    }
  }

  // ─── Touch / Swipe ────────────────────────────────────────
  function onTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(next());
      else         goTo(prev());
    }
  }

  // ─── Animate Metric Counters in Slide 1 ───────────────────
  function animateMetrics() {
    const metrics = document.querySelectorAll('.hc-metric__value[data-count]');
    if (!metrics.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          animateCount(el, target, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    metrics.forEach(el => observer.observe(el));
  }

  function animateCount(el, target, suffix) {
    const start    = performance.now();
    const duration = 1800;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4); // quartic ease-out
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─── Canvas Particle System ───────────────────────────────
  function initParticleSystems() {
    slides.forEach((slide, index) => {
      const container = slide.querySelector('.hc-slide__particles');
      if (!container) return;

      const canvas    = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      container.appendChild(canvas);

      const colors = ['rgba(212,175,55,', 'rgba(255,255,255,'];

      startParticleCanvas(canvas, colors);
    });
  }

  function startParticleCanvas(canvas, colors) {
    const ctx    = canvas.getContext('2d');
    let W, H;
    const PARTICLES = 38;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const particles = Array.from({ length: PARTICLES }, () => spawnParticle(W, H, colors, true));

    function spawnParticle(w, h, cols, random) {
      const alpha  = 0.25 + Math.random() * 0.55;
      const color  = cols[Math.floor(Math.random() * cols.length)];
      return {
        x:     random ? Math.random() * w : Math.random() * w,
        y:     random ? Math.random() * h : h + 8,
        r:     1.2 + Math.random() * 2.6,
        vx:    (Math.random() - 0.5) * 0.35,
        vy:    -(0.20 + Math.random() * 0.50),
        alpha,
        maxA:  alpha,
        color: color + alpha + ')',
        pulse: Math.random() * Math.PI * 2,
        pSpeed:0.015 + Math.random() * 0.020
      };
    }

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p, i) => {
        p.x     += p.vx;
        p.y     += p.vy;
        p.pulse += p.pSpeed;

        const aFactor  = 0.75 + 0.25 * Math.sin(p.pulse);
        const curAlpha = p.maxA * aFactor;

        // Fade out near top
        const fadeH = Math.min(1, (H - p.y) / (H * 0.2) );
        const a = curAlpha * fadeH;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, a + ')');
        ctx.fill();

        // Subtle glow
        if (p.r > 2) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grad.addColorStop(0, p.color.replace(/[\d.]+\)$/, (a * 0.4) + ')'));
          grad.addColorStop(1, p.color.replace(/[\d.]+\)$/, '0)'));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Respawn when off-screen
        if (p.y < -10 || p.x < -10 || p.x > W + 10) {
          particles[i] = spawnParticle(W, H, colors, false);
        }
      });

      raf = requestAnimationFrame(draw);
    }

    draw();

    // Clean up if carousel is removed
    const observer = new MutationObserver(() => {
      if (!document.body.contains(canvas)) {
        cancelAnimationFrame(raf);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Bootstrap ────────────────────────────────────────────
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
