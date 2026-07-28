const express = require('express');
const router = express.Router();

// ─── Static Data for Maya Global Services ─────────────────────────────────────
const companyData = {
  name: 'Maya Global Services',
  tagline: 'Precision in Verification',
  established: 2005,
  description: 'A modern field verification and risk management company serving Banks, NBFCs, Housing Finance Companies, FinTechs, and Insurance Institutions across India.',
  stats: {
    fieldExecutives: '170+',
    yearsExperience: '20+',
    clientsServed: '50+',
    reportsGenerated: '10L+'
  },
  contact: {
    email: 'info@mayaglobalservices.in',
    phone: '+91-XXX-XXXX-XXX',
    address: 'Jaipur, Rajasthan, India'
  }
};

const services = [
  {
    id: 'field-verification',
    title: 'Field Verification',
    icon: 'location_on',
    description: 'Rigorous on-ground intelligence gathering to ensure the absolute authenticity of physical locations and operational status.',
    subServices: [
      {
        name: 'Residence Verification',
        icon: 'home',
        description: 'Validating physical addresses and occupancy status.'
      },
      {
        name: 'Office & Business Verification',
        icon: 'domain',
        description: 'Confirming commercial operations and infrastructure.'
      },
      {
        name: 'Employment & Loan Verification',
        icon: 'work',
        description: 'Authenticating employment details and asset verification.'
      }
    ]
  },
  {
    id: 'customer-verification',
    title: 'Customer Verification',
    icon: 'person_check',
    description: 'Comprehensive identity validation protocols to protect your institution from fraud and ensure regulatory compliance.',
    subServices: [
      {
        name: 'KYC Verification',
        icon: 'badge',
        description: 'Thorough vetting of Know Your Customer documentation.'
      },
      {
        name: 'Tele Verification',
        icon: 'call',
        description: 'Structured telephonic interviews to confirm applicant details.'
      },
      {
        name: 'Document Collection',
        icon: 'folder_open',
        description: 'Secure retrieval and digital cataloging of sensitive physical documents.'
      }
    ]
  },
  {
    id: 'risk-management',
    title: 'Risk Management Support',
    icon: 'shield',
    description: 'Advanced analytical support to fortify your credit investigation process with actionable intelligence.',
    subServices: [
      {
        name: 'Credit Investigation',
        icon: 'policy',
        description: 'Deep-dive background checks on financial history.'
      },
      {
        name: 'Digital Reporting',
        icon: 'description',
        description: 'Structured, secure, and instantaneous data delivery.'
      }
    ]
  }
];

const industries = [
  { id: 'banks', name: 'Banks', icon: 'account_balance', description: 'Comprehensive verification services for public and private sector banks.' },
  { id: 'nbfc', name: 'NBFCs', icon: 'business', description: 'Tailored solutions for Non-Banking Financial Companies across India.' },
  { id: 'fintech', name: 'FinTechs', icon: 'smartphone', description: 'Digital-first verification APIs and reporting for modern FinTech platforms.' },
  { id: 'housing-finance', name: 'Housing Finance', icon: 'house', description: 'Property and borrower verification for housing finance companies.' },
  { id: 'insurance', name: 'Insurance', icon: 'security', description: 'Field investigations and claim verification for insurance institutions.' }
];

const coverage = {
  state: 'Rajasthan',
  districts: [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
    'Bikaner', 'Alwar', 'Bharatpur', 'Sri Ganganagar', 'Sikar',
    'Pali', 'Nagaur', 'Tonk', 'Dausa', 'Sawai Madhopur',
    'Jhunjhunu', 'Chittorgarh', 'Banswara', 'Dungarpur', 'Baran'
  ],
  totalDistricts: '20+',
  totalExecutives: '170+'
};

const values = [
  { id: 'integrity', name: 'Integrity', icon: 'verified', description: 'We operate with the highest ethical standards in every verification.' },
  { id: 'accuracy', name: 'Accuracy', icon: 'my_location', description: 'Precision-first approach ensures 99%+ accuracy in our reports.' },
  { id: 'commitment', name: 'Customer Commitment', icon: 'handshake', description: 'Long-term partnerships built on trust and consistent delivery.' },
  { id: 'transparency', name: 'Transparency', icon: 'visibility_lock', description: 'Clear, auditable processes with full reporting visibility.' },
  { id: 'accountability', name: 'Accountability', icon: 'assignment_turned_in', description: 'We stand behind every report and take ownership of outcomes.' },
  { id: 'innovation', name: 'Innovation', icon: 'lightbulb', description: 'Continuously adopting technology to improve verification efficiency.' },
  { id: 'security', name: 'Data Security', icon: 'shield', description: 'Bank-grade data security and GDPR-compliant data handling.' },
  { id: 'improvement', name: 'Continuous Improvement', icon: 'trending_up', description: 'Regular audits and training ensure we evolve with industry standards.' }
];

const timeline = [
  { year: '2005', event: 'Maya Global Services Pvt. Ltd. founded, establishing a foundational presence in field operations across Rajasthan.' },
  { year: '2010', event: 'Expanded coverage to 10 districts in Rajasthan with a dedicated team of field executives.' },
  { year: '2015', event: 'Launched digital MIS reporting system, enabling real-time verification status for clients.' },
  { year: '2018', event: 'Onboarded major banking partners; achieved 50+ verified institutional clients.' },
  { year: '2022', event: 'Deployed GPS-enabled mobile tracking for all field agents, significantly reducing TAT.' },
  { year: 'Today', event: 'Focused entirely on delivering accurate, secure, and technology-enabled field verification services across 20+ districts.' }
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/** GET /api/data/company */
router.get('/company', (req, res) => {
  res.json({ success: true, data: companyData });
});

/** GET /api/data/services */
router.get('/services', (req, res) => {
  res.json({ success: true, data: services });
});

/** GET /api/data/services/:id */
router.get('/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, data: service });
});

/** GET /api/data/industries */
router.get('/industries', (req, res) => {
  res.json({ success: true, data: industries });
});

/** GET /api/data/coverage */
router.get('/coverage', (req, res) => {
  res.json({ success: true, data: coverage });
});

/** GET /api/data/values */
router.get('/values', (req, res) => {
  res.json({ success: true, data: values });
});

/** GET /api/data/timeline */
router.get('/timeline', (req, res) => {
  res.json({ success: true, data: timeline });
});

/** GET /api/data/all  — Full page data in one request */
router.get('/all', (req, res) => {
  res.json({
    success: true,
    data: { companyData, services, industries, coverage, values, timeline }
  });
});

module.exports = router;
