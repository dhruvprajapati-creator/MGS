/**
 * Maya Global Services — Home Page Script
 */
domReady(async () => {
  // Load company stats from backend API
  try {
    const { data } = await API.getCompany();
    // Update stat numbers if needed
    document.querySelectorAll('[data-backend-stat]').forEach(el => {
      const key = el.dataset.backendStat;
      if (data.stats[key]) el.textContent = data.stats[key];
    });
  } catch (err) {
    // API unavailable — static content already shown
    console.warn('Backend API not available. Using static content.');
  }
  // Services Carousel Logic (Double-Loop Alternating + 5 Dots)
  const grid = document.getElementById('servicesGrid');
  const prev = document.getElementById('serv-prev');
  const next = document.getElementById('serv-next');

  if (grid && prev && next) {
    const originalCards = Array.from(grid.querySelectorAll('.service-card'));
    const N = originalCards.length; // 7 original cards
    let autoScrollTimeout;
    let autoScrollInterval;
    let currentActiveIndex = 0; // tracks active index relative to C1_A (0 to 13)
    let isResetting = false;

    // 1. Duplicate the 7 original cards to make a 14-card loop (ensures even length for alternating colors)
    const duplicatedCards = [];
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-duplicate');
      grid.appendChild(clone);
      duplicatedCards.push(clone);
    });

    const loopCards = [...originalCards, ...duplicatedCards];
    const totalLoopLength = loopCards.length; // 14

    // 2. Clone first 3 cards and append to the end
    for (let i = 0; i < 3; i++) {
      const clone = loopCards[i].cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-clone');
      grid.appendChild(clone);
    }

    // 3. Clone last 3 cards and prepend to the start
    for (let i = totalLoopLength - 3; i < totalLoopLength; i++) {
      const clone = loopCards[i].cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-clone');
      grid.insertBefore(clone, loopCards[0]);
    }

    // 4. Strictly alternate the styles (White, Dark, White, Dark...) for all DOM cards
    const formatCardStyle = (card, isDark) => {
      const link = card.querySelector('.service-card__link');
      const iconWrap = card.querySelector('.service-card__icon-wrap');
      
      if (isDark) {
        card.classList.add('service-card--dark');
        if (link) link.classList.add('service-card__link--lime');
        if (iconWrap) iconWrap.classList.add('service-card__icon-wrap--lime');
      } else {
        card.classList.remove('service-card--dark');
        if (link) link.classList.remove('service-card__link--lime');
        if (iconWrap) iconWrap.classList.remove('service-card__icon-wrap--lime');
      }
    };

    const allDOMCards = Array.from(grid.querySelectorAll('.service-card'));
    allDOMCards.forEach((card, index) => {
      const isDark = index % 2 !== 0;
      formatCardStyle(card, isDark);
    });

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'services-dots';
    dotsContainer.id = 'servicesDots';
    grid.parentNode.appendChild(dotsContainer);

    // Create exactly 5 dots
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('button');
      dot.className = `services-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        scrollToCard(i);
      });
      dotsContainer.appendChild(dot);
    }

    const getCardWidthWithGap = () => {
      const card = grid.querySelector('.service-card');
      if (!card) return 0;
      const style = window.getComputedStyle(grid);
      const gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    };

    const scrollToCard = (idx) => {
      const cardWidthWithGap = getCardWidthWithGap();
      grid.scrollTo({
        left: (3 + idx) * cardWidthWithGap,
        behavior: 'smooth'
      });
    };

    const updateActiveDot = () => {
      if (isResetting) return;

      const cardWidthWithGap = getCardWidthWithGap();
      if (cardWidthWithGap <= 0) return;

      // Scroll position relative to C1_A (index 3)
      const relativeScroll = grid.scrollLeft - (3 * cardWidthWithGap);
      const activeIndex = Math.round(relativeScroll / cardWidthWithGap);
      
      // Update global active tracker (clamp/wrap within 0 to 13 range)
      currentActiveIndex = (activeIndex % 14 + 14) % 14;

      // Map 14 slides to 7 original cards, then to 5 dots (modulo 5)
      const originalCardIndex = currentActiveIndex % N;
      const dotIndex = originalCardIndex % 5;

      const dots = dotsContainer.querySelectorAll('.services-dot');
      dots.forEach((dot, dIdx) => {
        if (dIdx === dotIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    // Jump instantly to prevent hitting scroll boundaries (debounced to scroll end)
    const checkScrollBoundary = () => {
      const cardWidthWithGap = getCardWidthWithGap();
      if (cardWidthWithGap <= 0) return;

      const originalWidth = totalLoopLength * cardWidthWithGap; // 14 cards wide

      // If we settled past 16.5 (index 17 clone)
      if (grid.scrollLeft >= 16.5 * cardWidthWithGap) {
        isResetting = true;
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft -= originalWidth;
        isResetting = false;
        updateActiveDot();
        grid.style.scrollBehavior = 'smooth';
      }
      // If we settled before 2.5 (index 2 clone)
      else if (grid.scrollLeft <= 2.5 * cardWidthWithGap) {
        isResetting = true;
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft += originalWidth;
        isResetting = false;
        updateActiveDot();
        grid.style.scrollBehavior = 'smooth';
      }
    };

    // Listen to scroll events: update dots in real time, debounce boundary checks to scroll end
    let scrollEndTimeout;
    grid.addEventListener('scroll', () => {
      updateActiveDot();
      
      clearTimeout(scrollEndTimeout);
      scrollEndTimeout = setTimeout(() => {
        checkScrollBoundary();
      }, 50);
    }, { passive: true });

    // Initialize position (start at C1, index 3)
    const initScrollPosition = () => {
      const cardWidthWithGap = getCardWidthWithGap();
      grid.style.scrollBehavior = 'auto';
      grid.scrollLeft = 3 * cardWidthWithGap;
      grid.style.scrollBehavior = 'smooth';
    };

    initScrollPosition();
    window.addEventListener('load', initScrollPosition);
    window.addEventListener('resize', () => {
      const cardWidthWithGap = getCardWidthWithGap();
      grid.style.scrollBehavior = 'auto';
      grid.scrollLeft = (3 + currentActiveIndex) * cardWidthWithGap;
      grid.style.scrollBehavior = 'smooth';
    });

    const nextSlide = () => {
      const cardWidthWithGap = getCardWidthWithGap();
      grid.scrollBy({ left: cardWidthWithGap, behavior: 'smooth' });
    };

    const prevSlide = () => {
      const cardWidthWithGap = getCardWidthWithGap();
      grid.scrollBy({ left: -cardWidthWithGap, behavior: 'smooth' });
    };

    const startAutoScroll = (initialDelay = 8000) => {
      stopAutoScroll();
      autoScrollTimeout = setTimeout(() => {
        nextSlide();
        autoScrollInterval = setInterval(nextSlide, 8000);
      }, initialDelay);
    };

    const stopAutoScroll = () => {
      clearTimeout(autoScrollTimeout);
      clearInterval(autoScrollInterval);
    };

    // Wire up buttons
    next.addEventListener('click', () => {
      nextSlide();
      startAutoScroll(10000); // 10s delay after interaction
    });

    prev.addEventListener('click', () => {
      prevSlide();
      startAutoScroll(10000); // 10s delay after interaction
    });

    // Pause auto scroll on hover/touch
    grid.addEventListener('mouseenter', stopAutoScroll);
    grid.addEventListener('mouseleave', () => startAutoScroll(8000));
    grid.addEventListener('touchstart', stopAutoScroll, { passive: true });
    grid.addEventListener('touchend', () => startAutoScroll(10000), { passive: true }); // 10s delay after swipe

    // Initial start
    startAutoScroll(8000);
  }

  // ════════════════════════════════════════════════════════
  // WHY FINANCIAL INSTITUTIONS TRUST MGS CAROUSEL (MOBILE)
  // ════════════════════════════════════════════════════════
  const trustGrid = document.getElementById('trustGrid');
  if (trustGrid) {
    const originalTrustCards = Array.from(trustGrid.querySelectorAll('.service-card'));
    const N_trust = originalTrustCards.length; // 6 original cards
    let trustTimeout;
    let trustInterval;
    let currentTrustActiveIndex = 0;
    let isTrustResetting = false;

    // 1. Duplicate the 6 original cards to make a 12-card loop
    const duplicatedTrustCards = [];
    originalTrustCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-duplicate');
      trustGrid.appendChild(clone);
      duplicatedTrustCards.push(clone);
    });

    const loopTrustCards = [...originalTrustCards, ...duplicatedTrustCards];
    const totalTrustLoopLength = loopTrustCards.length; // 12

    // 2. Clone first 3 cards and append to the end
    for (let i = 0; i < 3; i++) {
      const clone = loopTrustCards[i].cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-clone');
      trustGrid.appendChild(clone);
    }

    // 3. Clone last 3 cards and prepend to the start
    for (let i = totalTrustLoopLength - 3; i < totalTrustLoopLength; i++) {
      const clone = loopTrustCards[i].cloneNode(true);
      clone.classList.remove('reveal', 'visible');
      clone.removeAttribute('style');
      clone.classList.add('is-clone');
      trustGrid.insertBefore(clone, loopTrustCards[0]);
    }

    // Create dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'services-dots';
    dotsContainer.id = 'trustDots';
    dotsContainer.style.marginTop = '24px';
    trustGrid.parentNode.appendChild(dotsContainer);

    // Create exactly 5 dots
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('button');
      dot.className = `services-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          scrollToTrustCard(i);
        }
      });
      dotsContainer.appendChild(dot);
    }

    const getTrustCardWidthWithGap = () => {
      const card = trustGrid.querySelector('.service-card');
      if (!card) return 0;
      const style = window.getComputedStyle(trustGrid);
      const gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    };

    const scrollToTrustCard = (idx) => {
      const cardWidthWithGap = getTrustCardWidthWithGap();
      trustGrid.scrollTo({
        left: (3 + idx) * cardWidthWithGap,
        behavior: 'smooth'
      });
    };

    const updateTrustActiveDot = () => {
      if (isTrustResetting || window.innerWidth > 768) return;

      const cardWidthWithGap = getTrustCardWidthWithGap();
      if (cardWidthWithGap <= 0) return;

      const relativeScroll = trustGrid.scrollLeft - (3 * cardWidthWithGap);
      const activeIndex = Math.round(relativeScroll / cardWidthWithGap);
      
      currentTrustActiveIndex = (activeIndex % 12 + 12) % 12;

      const originalCardIndex = currentTrustActiveIndex % N_trust;
      const dotIndex = originalCardIndex % 5;

      const dots = dotsContainer.querySelectorAll('.services-dot');
      dots.forEach((dot, dIdx) => {
        if (dIdx === dotIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const checkTrustScrollBoundary = () => {
      if (window.innerWidth > 768) return;

      const cardWidthWithGap = getTrustCardWidthWithGap();
      if (cardWidthWithGap <= 0) return;

      const originalWidth = totalTrustLoopLength * cardWidthWithGap;

      if (trustGrid.scrollLeft >= 14.5 * cardWidthWithGap) {
        isTrustResetting = true;
        trustGrid.style.scrollBehavior = 'auto';
        trustGrid.scrollLeft -= originalWidth;
        isTrustResetting = false;
        updateTrustActiveDot();
        trustGrid.style.scrollBehavior = 'smooth';
      }
      else if (trustGrid.scrollLeft <= 2.5 * cardWidthWithGap) {
        isTrustResetting = true;
        trustGrid.style.scrollBehavior = 'auto';
        trustGrid.scrollLeft += originalWidth;
        isTrustResetting = false;
        updateTrustActiveDot();
        trustGrid.style.scrollBehavior = 'smooth';
      }
    };

    let trustScrollEndTimeout;
    trustGrid.addEventListener('scroll', () => {
      if (window.innerWidth > 768) return;
      updateTrustActiveDot();
      
      clearTimeout(trustScrollEndTimeout);
      trustScrollEndTimeout = setTimeout(() => {
        checkTrustScrollBoundary();
      }, 50);
    }, { passive: true });

    const initTrustScrollPosition = () => {
      if (window.innerWidth > 768) return;
      const cardWidthWithGap = getTrustCardWidthWithGap();
      trustGrid.style.scrollBehavior = 'auto';
      trustGrid.scrollLeft = 3 * cardWidthWithGap;
      trustGrid.style.scrollBehavior = 'smooth';
    };

    initTrustScrollPosition();
    window.addEventListener('load', initTrustScrollPosition);
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        trustGrid.removeAttribute('style');
        return;
      }
      const cardWidthWithGap = getTrustCardWidthWithGap();
      trustGrid.style.scrollBehavior = 'auto';
      trustGrid.scrollLeft = (3 + currentTrustActiveIndex) * cardWidthWithGap;
      trustGrid.style.scrollBehavior = 'smooth';
    });

    const nextTrustSlide = () => {
      if (window.innerWidth > 768) return;
      const cardWidthWithGap = getTrustCardWidthWithGap();
      trustGrid.scrollBy({ left: cardWidthWithGap, behavior: 'smooth' });
    };

    const startTrustAutoScroll = (initialDelay = 8000) => {
      stopTrustAutoScroll();
      if (window.innerWidth > 768) return;
      trustTimeout = setTimeout(() => {
        nextTrustSlide();
        trustInterval = setInterval(nextTrustSlide, 8000);
      }, initialDelay);
    };

    const stopTrustAutoScroll = () => {
      clearTimeout(trustTimeout);
      clearInterval(trustInterval);
    };

    // Hover/Touch events
    trustGrid.addEventListener('mouseenter', stopTrustAutoScroll);
    trustGrid.addEventListener('mouseleave', () => startTrustAutoScroll(8000));
    trustGrid.addEventListener('touchstart', stopTrustAutoScroll, { passive: true });
    trustGrid.addEventListener('touchend', () => startTrustAutoScroll(10000), { passive: true });

    // Initial start
    startTrustAutoScroll(8000);
  }
});
