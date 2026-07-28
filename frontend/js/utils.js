/**
 * Maya Global Services — Shared Utilities & UI Components
 */

// ─── Toast Notification System ────────────────────────────
const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'success', duration = 4000) {
    if (!this.container) this.init();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'check_circle' : 'error';
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:20px">${icon}</span>
      <span>${message}</span>
    `;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ─── Scroll Reveal ────────────────────────────────────────
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
};

// ─── Animated Counter ─────────────────────────────────────
const AnimCounter = {
  animate(el, target, duration = 1500) {
    const startTime = performance.now();
    const isFloat = target.toString().includes('.');
    const numTarget = parseFloat(target);
    const suffix = el.dataset.suffix || '';

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = numTarget * eased;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.dataset.count;
          this.animate(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  }
};

// ─── Mobile Navigation ────────────────────────────────────
const MobileNav = {
  init() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay    = document.getElementById('mobile-overlay');
    if (!menuToggle || !mobileMenu) return;

    const open = () => {
      mobileMenu.classList.add('open');
      overlay?.classList.add('active');
      menuToggle.querySelector('.material-symbols-outlined').textContent = 'close';
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      mobileMenu.classList.remove('open');
      overlay?.classList.remove('active');
      menuToggle.querySelector('.material-symbols-outlined').textContent = 'menu';
      document.body.style.overflow = '';
    };

    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? close() : open();
    });
    overlay?.addEventListener('click', close);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }
};

// ─── Sticky Navigation ────────────────────────────────────
const StickyNav = {
  init() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }
};

// ─── Active Nav Link ──────────────────────────────────────
const ActiveNav = {
  init() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a[data-page]').forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add('nav-active');
      }
    });
  }
};

// ─── Accordion ────────────────────────────────────────────
const Accordion = {
  init(selector = '.accordion-item') {
    document.querySelectorAll(selector).forEach(item => {
      const header = item.querySelector('.accordion-header');
      const body   = item.querySelector('.accordion-body');
      if (!header || !body) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll(selector).forEach(i => {
          i.classList.remove('open');
          const b = i.querySelector('.accordion-body');
          if (b) b.style.maxHeight = '0';
        });
        if (!isOpen) {
          item.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }
};

// ─── DOM Ready Helper ─────────────────────────────────────
function domReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

// ─── Global Init ─────────────────────────────────────────
domReady(() => {
  Toast.init();
  ScrollReveal.init();
  AnimCounter.init();
  MobileNav.init();
  StickyNav.init();
  ActiveNav.init();
});

window.Toast = Toast;
window.domReady = domReady;
