/**
 * Maya Global Services — API Client
 * Communicates with the Node.js/Express backend API
 */

// Detect if served locally or in production
const _isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
// NOTE: Update BACKEND_URL below when production backend is deployed.
// Leave as null to disable API calls in production (static content is shown as fallback).
const BACKEND_URL = null; // e.g. 'https://maya-backend.onrender.com'
const API_BASE = _isLocal
  ? (window.location.port === '5000' ? '/api' : 'http://localhost:5000/api')
  : (BACKEND_URL ? BACKEND_URL + '/api' : null);

const API = {
  /**
   * Generic fetch wrapper with error handling
   * @param {string} endpoint
   * @param {object} options
   */
  async request(endpoint, options = {}) {
    if (!API_BASE) return null; // Backend not configured — skip silently
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
      console.warn(`API [${endpoint}] unavailable:`, error.message);
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
