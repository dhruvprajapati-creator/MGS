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
});
