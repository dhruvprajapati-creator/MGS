# Maya Global Services — Full-Stack Company Profile Website

A professional, full-stack company profile website for **Maya Global Services** — India's trusted field verification and risk management company. Built based on the **Maya Veritas Design System** from Stitch.

---

## 📁 Project Structure

```
maya_v2/
├── backend/                    # Node.js / Express REST API
│   ├── src/
│   │   ├── server.js           # Main Express server
│   │   └── routes/
│   │       ├── contact.js      # Contact form API
│   │       └── data.js         # Company data endpoints
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/                   # Static HTML/CSS/JS website
│   ├── index.html              # Homepage
│   ├── services.html           # Services page
│   ├── about.html              # About Us page
│   ├── contact.html            # Contact page
│   ├── coverage.html           # Coverage map page
│   ├── industries.html         # Industries page
│   ├── technology.html         # Technology page
│   │
│   ├── css/
│   │   ├── design-system.css   # Maya Veritas Design System tokens & utilities
│   │   ├── home.css            # Homepage & shared component styles
│   │   └── inner-pages.css     # Inner page styles (services, about, contact…)
│   │
│   └── js/
│       ├── api.js              # Frontend API client (talks to backend)
│       ├── utils.js            # Shared utilities (Toast, ScrollReveal, etc.)
│       └── home.js             # Homepage-specific JS
│
├── Assests/                    # Static assets directory
└── README.md
```

---

## 🎨 Design System

Based on the **Maya Veritas Design System** from the Stitch project:

| Token | Value |
|-------|-------|
| Primary Accent | `#C7E61E` (Lime Vibrant) |
| Background | `#1A252B` (Charcoal Navy) |
| Surface | `#F8FAFB` (Surface Ice) |
| Heading Font | General Sans (700/600) |
| Body Font | Inter (400/500/600) |
| Container Max | 1280px |
| Border Radius | 8–24px |

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev     # Development (nodemon, auto-reload)
# npm start     # Production
```

The API will run on **http://localhost:5000**

### Frontend Setup

Open `frontend/index.html` directly in a browser, or serve with:

```bash
cd frontend
npx serve . -p 3000
```

The site will be at **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/data/company` | Company information |
| GET | `/api/data/services` | All services |
| GET | `/api/data/services/:id` | Single service |
| GET | `/api/data/industries` | Industries served |
| GET | `/api/data/coverage` | District coverage |
| GET | `/api/data/values` | Core values |
| GET | `/api/data/timeline` | Company timeline |
| GET | `/api/data/all` | All data combined |
| POST | `/api/contact` | Submit contact form |

### Contact Form Payload
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@abcbank.com",
  "phone": "+91 98765 43210",
  "company": "ABC Bank Ltd.",
  "service": "field-verification",
  "message": "We need verification services for Jaipur district."
}
```

---

## 📄 Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage — Hero, Stats, Services Overview, Why Maya, Industries, Process |
| `services.html` | Field Verification, Customer Verification (KYC flow), Risk Management |
| `about.html` | Vision/Mission, Timeline, Core Values, Operational Backbone |
| `contact.html` | Contact form (with backend integration), FAQ accordion |
| `coverage.html` | 20+ districts coverage, GPS technology explanation |
| `industries.html` | Banks, NBFCs, FinTechs, Housing Finance, Insurance |
| `technology.html` | GPS, Mobile App, Encryption, MIS Dashboard, API pipeline |

---

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Security**: Helmet, CORS, express-rate-limit
- **Dev**: Nodemon

### Frontend
- **Structure**: Semantic HTML5
- **Styling**: Vanilla CSS (design-system.css)
- **Fonts**: General Sans (via Fontshare CDN), Inter (Google Fonts)
- **Icons**: Google Material Symbols Outlined
- **JS**: Vanilla JavaScript (no framework)

---

## 🏢 About Maya Global Services

Maya Global Services Pvt. Ltd. is a field verification and risk management company serving financial institutions across Rajasthan, India since 2005. They provide:

- **Field Verification** — Residence, Office, Business, Employment
- **Customer Verification** — KYC, Tele Verification, Document Collection
- **Risk Management** — Credit Investigation, Digital Reporting, MIS Analytics

**Coverage**: 20+ districts in Rajasthan | **Team**: 170+ GPS-tracked field executives

---

© 2024 Maya Global Services Pvt. Ltd. — Precision in Verification.
