const express = require('express');
const router = express.Router();

/**
 * POST /api/contact
 * Handles contact form submissions from the Maya Global Services website
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;

    // ─── Validation ───────────────────────────────────────────────────────────
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
    if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');
    if (phone && !/^[+\d\s\-()]{7,20}$/.test(phone)) errors.push('Please provide a valid phone number.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ─── In production: send email via nodemailer ──────────────────────────────
    // const transporter = nodemailer.createTransporter({ ... });
    // await transporter.sendMail({ ... });

    // ─── Log submission (replace with DB insert in production) ────────────────
    console.log('📧 New Contact Form Submission:');
    console.log(`  Name:    ${name.trim()}`);
    console.log(`  Email:   ${email.trim()}`);
    console.log(`  Phone:   ${phone || 'N/A'}`);
    console.log(`  Company: ${company || 'N/A'}`);
    console.log(`  Service: ${service || 'N/A'}`);
    console.log(`  Message: ${message.trim().substring(0, 100)}...`);
    console.log(`  Time:    ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! Our team will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or call us directly.'
    });
  }
});

module.exports = router;
