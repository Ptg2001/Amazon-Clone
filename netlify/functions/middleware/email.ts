// @ts-nocheck
export {};
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST;
const SMTP_PORT = process.env.SMTP_PORT || process.env.EMAIL_PORT;
const SMTP_SECURE = (process.env.SMTP_SECURE ?? process.env.EMAIL_SECURE) === 'true';
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(String(SMTP_PORT || 587), 10),
  secure: SMTP_SECURE,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

async function sendMail({ to, subject, html, text, attachments }) {
  if (!SMTP_HOST || (!SMTP_USER && !transporter.options?.auth)) {
    console.warn('Email not configured; skipping sendMail', {
      SMTP_HOST: !!SMTP_HOST,
      SMTP_PORT: !!SMTP_PORT,
      SMTP_USER: !!SMTP_USER,
    });
    return { skipped: true };
  }
  const from = process.env.MAIL_FROM || process.env.EMAIL_FROM || `AmazonVirtua <${SMTP_USER || ''}>`;
  return transporter.sendMail({ from, to, subject, html, text, attachments });
}

function renderWelcomeEmail(user) {
  return {
    subject: 'Welcome to AmazonVirtua',
    html: `<h2>Welcome, ${user.firstName}!</h2><p>Thanks for signing up. Happy shopping!</p>`,
  };
}

function renderOrderEmail(order) {
  const itemsHtml = (order.items || [])
    .map((i) => `<li>${i.quantity} x ${i.product?.title || ''} - ${i.pricing?.total || i.price}</li>`) // fallback
    .join('');
  return {
    subject: `Order Confirmed #${order.orderNumber || order._id}`,
    html: `<h2>Thanks for your order!</h2><p>Your order has been confirmed.</p><ul>${itemsHtml}</ul><p>Total: <strong>${order.pricing?.total}</strong></p>`,
  };
}

function generateInvoicePdf(order) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order: ${order.orderNumber || order._id}`);
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleString()}`);
    if (order.user?.email) doc.text(`Customer: ${order.user.email}`);
    doc.moveDown();

    doc.fontSize(14).text('Items');
    doc.moveDown(0.5);
    (order.items || []).forEach((i) => {
      doc.fontSize(12).text(`${i.quantity} x ${i.product?.title || ''} - ${i.price || i.pricing?.unit || ''}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total: ${order.pricing?.total}`);
    doc.end();
  });
}

module.exports = { sendMail, renderWelcomeEmail, renderOrderEmail, generateInvoicePdf };

// Optional: verify transport on startup
async function initEmail() {
  try {
    await transporter.verify();
    console.log('Email transport verified');
  } catch (e) {
    console.warn('Email transport verify failed:', e?.message || e);
  }
}

module.exports.initEmail = initEmail;


