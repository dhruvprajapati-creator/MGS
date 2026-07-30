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
  // Services Carousel Logic
  const servicesGrid = document.getElementById('services-grid-container');
  const btnPrev = document.getElementById('services-prev');
  const btnNext = document.getElementById('services-next');

  if (servicesGrid && btnPrev && btnNext) {
    let scrollInterval;
    const getScrollAmount = () => {
      const card = servicesGrid.querySelector('.service-card');
      if (!card) return 350;
      const style = window.getComputedStyle(servicesGrid);
      const gap = parseInt(style.gap) || 24;
      return card.offsetWidth + gap;
    };

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (servicesGrid.scrollLeft + servicesGrid.clientWidth >= servicesGrid.scrollWidth - 10) {
          servicesGrid.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          servicesGrid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        }
      }, 3000);
    };

    const stopAutoScroll = () => {
      clearInterval(scrollInterval);
    };

    btnNext.addEventListener('click', () => {
      servicesGrid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      stopAutoScroll();
      startAutoScroll();
    });

    btnPrev.addEventListener('click', () => {
      servicesGrid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      stopAutoScroll();
      startAutoScroll();
    });

    servicesGrid.addEventListener('mouseenter', stopAutoScroll);
    servicesGrid.addEventListener('mouseleave', startAutoScroll);

    startAutoScroll();
  }
});
