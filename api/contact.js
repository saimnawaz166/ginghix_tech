// /api/contact.js
// Vercel serverless function — receives contact form data and emails it
// to your business inbox using Nodemailer over SMTP.

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { first_name, last_name, email, message } = req.body || {};

    // Basic validation
    if (!first_name || !last_name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Very basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Configure SMTP transport using environment variables
    // Set these in Vercel Dashboard -> Project -> Settings -> Environment Variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,       // e.g. smtp.titan.email / smtp.zoho.com / smtp.gmail.com
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,                       // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,      // e.g. info@genghixtech.com
        pass: process.env.SMTP_PASS,      // mailbox password or app-specific password
      },
    });

    await transporter.sendMail({
      from: `"Genghix Tech Website" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL || process.env.SMTP_USER, // where you want to receive leads
      replyTo: email,
      subject: `New Project Inquiry — ${first_name} ${last_name}`,
      text: `Name: ${first_name} ${last_name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New Project Inquiry — Genghix Tech</h2>
        <p><strong>Name:</strong> ${first_name} ${last_name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};