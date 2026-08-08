const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const router = express.Router();

/**
 * Escapes special characters to prevent HTML/XSS injection in emails
 * @param {string} text 
 * @returns {string}
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Checks if SMTP settings are fully configured in the environment
 */
const isSmtpConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

/**
 * Creates and returns a Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * POST /api/contact
 * Handles contact form submissions and triggers notifications
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

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = phone ? escapeHtml(phone.trim()) : 'N/A';
    const safeCompany = company ? escapeHtml(company.trim()) : 'N/A';
    const safeService = service ? escapeHtml(service.trim()) : 'N/A';
    const safeMessage = escapeHtml(message.trim());
    const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)';

    // ─── HTML Email Template 1: Admin Notification ───────────────────────────
    const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333333; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #eaeaec; }
        .header { padding: 30px; text-align: left; border-bottom: 1px solid #eaeaec; }
        .logo-text { color: #333333; font-size: 22px; font-weight: bold; margin: 0; }
        .logo-sub { color: #666666; font-size: 12px; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }
        .content { padding: 30px; }
        .title { font-size: 18px; font-weight: 600; color: #333333; margin-top: 0; margin-bottom: 20px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table th, .data-table td { padding: 12px 0; text-align: left; border-bottom: 1px solid #f0f0f0; }
        .data-table th { font-weight: 600; color: #555555; width: 35%; }
        .data-table td { color: #333333; }
        .message-box { background: #f9f9f9; border-left: 3px solid #cccccc; padding: 15px; margin-top: 10px; white-space: pre-line; color: #444444; }
        .footer { padding: 20px 30px; text-align: left; font-size: 12px; color: #888888; border-top: 1px solid #eaeaec; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width: 70px; padding-right: 15px; vertical-align: middle;">
                <img src="cid:logo" alt="Maya Global Services" style="width: 65px; max-width: 65px; height: auto; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <div class="logo-text">MAYA GLOBAL SERVICES</div>
                <div class="logo-sub">Precision in Verification</div>
              </td>
            </tr>
          </table>
        </div>
        <div class="content">
          <h2 class="title">New Inquiry Received</h2>
          <table class="data-table">
            <tr><th>Name</th><td>${safeName}</td></tr>
            <tr><th>Email</th><td><a href="mailto:${safeEmail}" style="color: #0066cc;">${safeEmail}</a></td></tr>
            <tr><th>Phone</th><td>${safePhone}</td></tr>
            <tr><th>Company</th><td>${safeCompany}</td></tr>
            <tr><th>Requested Service</th><td>${safeService}</td></tr>
            <tr><th>Submitted At</th><td>${submittedAt}</td></tr>
          </table>
          <div style="font-weight: 600; color: #555555;">Message Details:</div>
          <div class="message-box">${safeMessage}</div>
        </div>
        <div class="footer">
          This notification was generated automatically by the Maya Global Services website backend.
        </div>
      </div>
    </body>
    </html>
    `;

    // ─── HTML Email Template 2: User Confirmation Autoreply ─────────────────
    const userHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333333; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #eaeaec; }
        .header { padding: 30px; text-align: left; border-bottom: 1px solid #eaeaec; }
        .logo-text { color: #333333; font-size: 22px; font-weight: bold; margin: 0; }
        .logo-sub { color: #666666; font-size: 12px; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }
        .content { padding: 30px; line-height: 1.6; }
        .title { font-size: 18px; font-weight: 600; color: #333333; margin-top: 0; margin-bottom: 20px; }
        .body-text { color: #444444; font-size: 14px; margin-bottom: 25px; }
        .summary-box { background: #f9f9f9; border: 1px solid #eaeaec; padding: 20px; margin-bottom: 25px; }
        .summary-title { font-size: 13px; font-weight: 600; color: #555555; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-item { font-size: 14px; margin-bottom: 8px; color: #444444; }
        .summary-item strong { color: #333333; }
        .signature { font-size: 14px; color: #333333; padding-top: 20px; margin-top: 30px; }
        .footer { padding: 30px; text-align: left; font-size: 12px; color: #888888; border-top: 1px solid #eaeaec; background-color: #fafafa; }
        .footer a { color: #0066cc; text-decoration: none; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width: 70px; padding-right: 15px; vertical-align: middle;">
                <img src="cid:logo" alt="Maya Global Services" style="width: 65px; max-width: 65px; height: auto; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <div class="logo-text">MAYA GLOBAL SERVICES</div>
                <div class="logo-sub">Precision in Verification</div>
              </td>
            </tr>
          </table>
        </div>
        <div class="content">
          <h2 class="title">Hello ${safeName},</h2>
          <p class="body-text">
            Thank you for reaching out to Maya Global Services. We have successfully received your inquiry, and our verification and risk management specialists are currently reviewing the details.
          </p>
          <p class="body-text">
            As India's trusted field verification partner for premier banks, NBFCs, and fintech companies, we operate with maximum precision and urgency. An MGS representative will get in touch with you within the next 24 hours to address your requirements.
          </p>
          
          <div class="summary-box">
            <div class="summary-title">Summary of Your Inquiry</div>
            <div class="summary-item"><strong>Service Interest:</strong> ${safeService}</div>
            <div class="summary-item"><strong>Your Company:</strong> ${safeCompany}</div>
            <div class="summary-item"><strong>Your Message:</strong></div>
            <div style="color: #666666; font-size: 14px; margin-top: 5px; white-space: pre-line;">"${safeMessage}"</div>
          </div>

          <div class="signature">
            Warm regards,<br>
            <strong>Client Relations Team</strong><br>
            <img src="cid:logo" alt="Maya Global Services" style="width: 100px; max-width: 100px; height: auto; margin-top: 15px; margin-bottom: 10px; display: block;" />
            Maya Global Services
          </div>
        </div>
        <div class="footer">
          <p><strong>Maya Global Services Pvt. Ltd.</strong></p>
          <p>Jaipur, Rajasthan, India</p>
          <p>Email: <a href="mailto:info@mayaglobalservices.in">info@mayaglobalservices.in</a> | Web: <a href="https://mayaglobalservices.in">mayaglobalservices.in</a></p>
          <p style="margin-top: 15px; font-size: 11px; color: #aaaaaa;">This is an automated confirmation of receipt. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // ─── Send Process ────────────────────────────────────────────────────────
    if (isSmtpConfigured()) {
      const transporter = createTransporter();
      const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
      
      const logoAttachment = {
        filename: 'logo.png',
        path: path.join(__dirname, '../../../frontend/assets/logo.png'),
        cid: 'logo'
      };

      // Send to Admin
      await transporter.sendMail({
        from: `"MGS Website" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `🔔 New Contact Submission: ${safeName} (${safeService})`,
        text: `New Contact Submission:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nCompany: ${company || 'N/A'}\nService: ${service || 'N/A'}\nMessage: ${message}`,
        html: adminHtml,
        attachments: [logoAttachment]
      });

      // Send auto-reply to user
      try {
        await transporter.sendMail({
          from: `"Maya Global Services" <${process.env.SMTP_USER}>`,
          to: email.trim(),
          subject: `We've received your inquiry - Maya Global Services`,
          text: `Hello ${name},\n\nThank you for reaching out to Maya Global Services. We have received your inquiry regarding "${service}". An MGS representative will get in touch with you within the next 24 hours.\n\nWarm regards,\nClient Relations Team\nMaya Global Services`,
          html: userHtml,
          attachments: [logoAttachment]
        });
      } catch (autoreplyError) {
        console.error('Failed to send auto-reply to user:', autoreplyError);
        // We do not crash the request if just the user autoreply fails
      }

      console.log(`📧 Email sent successfully for contact submission from: ${email}`);
    } else {
      // Fallback: development log mode
      console.log('\n📧 --- Mockup Contact Form Submission (SMTP not configured) ---');
      console.log(`  Name:      ${name.trim()}`);
      console.log(`  Email:     ${email.trim()}`);
      console.log(`  Phone:     ${phone || 'N/A'}`);
      console.log(`  Company:   ${company || 'N/A'}`);
      console.log(`  Service:   ${service || 'N/A'}`);
      console.log(`  Message:   ${message.trim()}`);
      console.log(`  Time:      ${submittedAt}`);
      console.log('------------------------------------------------------------\n');
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! Our team will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or call us directly.'
    });
  }
});

module.exports = router;
