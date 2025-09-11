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
  const currency = order?.payment?.currency || 'USD';
  const orderNumber = order.orderNumber || String(order._id);
  const orderTotal = (order?.pricing?.total ?? order?.payment?.amount) || 0;
  const estDelivery = order?.estimatedDelivery || null;
  const arrival = estDelivery
    ? new Date(estDelivery).toLocaleDateString()
    : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString();
  const address = order?.shippingAddress || {};
  const addressHtml = [address.name, address.line1, address.line2, `${address.city || ''} ${address.state || ''} ${address.postalCode || ''}`, address.country]
    .filter(Boolean)
    .join('<br/>');

  const itemsRows = (order.items || [])
    .map((i) => {
      const title = i.product?.title || '';
      const qty = i.quantity || 1;
      const price = typeof i.price === 'number' ? i.price : (i.pricing?.price || 0);
      const total = typeof i.total === 'number' ? i.total : (i.pricing?.total || price * qty);
      return `<tr>
        <td style="padding:8px 0;">${qty} × ${title}</td>
        <td style="padding:8px 0; text-align:right;">${currency} ${total.toFixed ? total.toFixed(2) : total}</td>
      </tr>`;
    })
    .join('');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const orderLink = `${frontendUrl}/orders/${order._id}`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111;">
    <div style="max-width:680px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
      <div style="background:#232f3e;color:#fff;padding:16px 20px;">
        <div style="font-size:18px;font-weight:700;">AmazonVirtua</div>
        <div style="font-size:13px;opacity:.9;">Order Confirmation</div>
      </div>

      <div style="padding:20px;">
        <p style="margin:0 0 12px;">Hello ${address?.name || 'Customer'},</p>
        <p style="margin:0 0 12px;">Thanks for shopping with us. We\'d like to let you know that we\'ve received your order and it\'s being prepared.</p>

        <div style="background:#f6f6f6;border:1px solid #e5e5e5;border-radius:8px;padding:14px 16px;margin:14px 0;">
          <div style="font-weight:600;margin-bottom:6px;">Arriving</div>
          <div style="color:#007185;font-weight:600;">${arrival}</div>
          <div style="margin-top:10px;font-size:13px;color:#555;">Shipping speed: Standard Delivery</div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          ${itemsRows}
          <tr><td style="padding-top:8px;border-top:1px solid #eee;font-weight:700;">Order Total</td>
          <td style="padding-top:8px;border-top:1px solid #eee;text-align:right;font-weight:700;">${new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(orderTotal)}</td></tr>
        </table>

        <div style="margin:16px 0 6px;font-weight:600;">Delivery Address</div>
        <div style="font-size:13px;color:#333;">${addressHtml || '—'}</div>

        <div style="margin:20px 0;">
          <a href="${orderLink}" style="background:#ffd814;border:1px solid #fcd200;border-radius:8px;color:#111;padding:10px 14px;text-decoration:none;font-weight:600;">View order details</a>
        </div>

        <p style="font-size:12px;color:#666;margin-top:14px;">If you use a mobile device, you can receive notifications about the delivery of your package from our app.</p>
      </div>
    </div>
  </div>`;

  return {
    subject: `Order Confirmed #${orderNumber}`,
    html,
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

function renderStatusEmail(order, status) {
  const titleMap = {
    pending: 'We received your order',
    confirmed: 'Your order is confirmed',
    processing: 'Your order is being prepared',
    shipped: 'Your order is on the way',
    delivered: 'Your package has been delivered',
    cancelled: 'Your order was cancelled',
    returned: 'Your order was returned',
  };
  const subject = `${titleMap[status] || 'Order update'} #${order.orderNumber || order._id}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const orderLink = `${frontendUrl}/orders/${order._id}`;
  let body = '';
  if (status === 'delivered') {
    body = `<p>Your package has been delivered! Please rate your delivery experience.</p>
      <div style="margin:12px 0;background:#f1a33c;height:44px;border-radius:6px;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;">
        ★ ★ ★ ★ ★
      </div>`;
  } else if (status === 'shipped') {
    body = `<p>Your order has shipped. Track your package in Your Orders.</p>`;
  } else if (status === 'processing' || status === 'confirmed' || status === 'pending') {
    body = `<p>We are preparing your order. You can view or edit details from Your Orders.</p>`;
  } else if (status === 'cancelled') {
    body = `<p>Your order has been cancelled. If this was a mistake, you can reorder from Your Orders.</p>`;
  }
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#111;">
    <div style="max-width:680px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
      <div style="background:#232f3e;color:#fff;padding:16px 20px;">
        <div style="font-size:18px;font-weight:700;">AmazonVirtua</div>
        <div style="font-size:13px;opacity:.9;">Order update</div>
      </div>
      <div style="padding:20px;">
        <h2 style="margin:0 0 8px;">${titleMap[status] || 'Order update'}</h2>
        ${body}
        <div style="margin:16px 0;">
          <a href="${orderLink}" style="background:#ffd814;border:1px solid #fcd200;border-radius:8px;color:#111;padding:10px 14px;text-decoration:none;font-weight:600;">View your order</a>
        </div>
        <div style="font-size:12px;color:#666;">Order #${order.orderNumber || order._id}</div>
      </div>
    </div>
  </div>`;
  return { subject, html };
}

module.exports.renderStatusEmail = renderStatusEmail;

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


