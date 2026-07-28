/**
 * Maya Global Services — API Client
 * Communicates with the Node.js/Express backend API
 */

// Detect if served locally or in production
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
  : 'https://YOUR-BACKEND-URL-HERE.onrender.com/api'; // <--- UPDATE THIS WHEN BACKEND IS LIVE

const API = {
  /**
   * Generic fetch wrapper with error handling
   * @param {string} endpoint
   * @param {object} options
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  // ─── Data Endpoints ───────────────────────────────────────
  async getCompany()    { return this.request('/data/company'); },
  async getServices()   { return this.request('/data/services'); },
  async getIndustries() { return this.request('/data/industries'); },
  async getCoverage()   { return this.request('/data/coverage'); },
  async getValues()     { return this.request('/data/values'); },
  async getTimeline()   { return this.request('/data/timeline'); },
  async getAllData()     { return this.request('/data/all'); },

  // ─── Contact Endpoint ─────────────────────────────────────
  async submitContact(formData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  // ─── Health Check ─────────────────────────────────────────
  async healthCheck() { return this.request('/health'); }
};

window.API = API;
