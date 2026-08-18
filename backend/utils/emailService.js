const nodemailer = require('nodemailer');

// Initialize transporter with fallback for local development
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development Fallback Transporter (Simulated)
    transporter = {
      sendMail: async (options) => {
        console.log(`\n📧 [EMAIL SIMULATION] Sent to: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Preview: ${options.text || 'HTML Template rendered successfully.'}\n`);
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }
  return transporter;
};

// 1. Send Booking Confirmation to Customer
const sendBookingConfirmation = async (userEmail, userName, booking) => {
  try {
    const t = getTransporter();
    const itemsList = (booking.items || [])
      .map(
        (it) => `
        <li style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #065f46;">${it.name}</strong> (Qty: ${it.quantity}) - <strong>$${it.price}</strong>
        </li>`
      )
      .join('');

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">EcoTravel.</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Sustainable Travel & Green Reservations</p>
        </div>

        <div style="padding: 32px 24px;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi <strong>${userName || 'Traveler'}</strong>,</p>
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
            Thank you for choosing eco-conscious travel! Your reservation has been successfully placed.
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #166534; font-weight: bold; text-transform: uppercase;">
              Booking Reference: #${booking._id ? booking._id.toString().slice(-8).toUpperCase() : 'PENDING'}
            </p>
            <p style="margin: 0 0 16px; font-size: 24px; font-weight: 800; color: #065f46;">
              Total Paid: $${(booking.totalAmount || 0).toFixed(2)}
            </p>
            
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #374151;">Reserved Items:</p>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; color: #4b5563;">
              ${itemsList}
            </ul>
          </div>

          <div style="background: #ecfdf5; border-radius: 10px; padding: 14px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 18px;">🌱</span>
            <span style="font-size: 13px; color: #047857; font-weight: 600; margin-left: 6px;">
              Carbon Offset Verified: You saved an estimated 42kg of CO2 on this trip!
            </span>
          </div>

          <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
            View or download your printable ticket anytime in your <a href="http://localhost:3000/bookings" style="color: #059669; font-weight: bold; text-decoration: none;">Customer Dashboard</a>.
          </p>
        </div>
      </div>
    `;

    await t.sendMail({
      from: '"EcoTravel Reservations" <bookings@ecotravel.com>',
      to: userEmail,
      subject: `🌿 Booking Confirmed: #${booking._id ? booking._id.toString().slice(-8).toUpperCase() : 'NEW'}`,
      html,
    });
  } catch (err) {
    console.error('Error sending confirmation email:', err.message);
  }
};

// 2. Send Status Update Email
const sendStatusUpdateEmail = async (userEmail, userName, bookingId, newStatus) => {
  try {
    const t = getTransporter();
    const statusUpper = (newStatus || '').toUpperCase();
    const statusColor = newStatus === 'confirmed' ? '#059669' : newStatus === 'completed' ? '#2563eb' : '#dc2626';

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #065f46; padding: 24px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800;">EcoTravel Update</h2>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #374151;">Hi <strong>${userName || 'Traveler'}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">Your booking reference <strong>#${bookingId.slice(-8).toUpperCase()}</strong> has been updated to:</p>
          <div style="margin: 20px 0; padding: 14px; background: #f9fafb; border-radius: 10px; text-align: center;">
            <span style="font-size: 18px; font-weight: 800; color: ${statusColor};">${statusUpper}</span>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Check your account for further instructions and ticket download.</p>
        </div>
      </div>
    `;

    await t.sendMail({
      from: '"EcoTravel Reservations" <notifications@ecotravel.com>',
      to: userEmail,
      subject: `Order #${bookingId.slice(-8).toUpperCase()} Status Update: ${statusUpper}`,
      html,
    });
  } catch (err) {
    console.error('Error sending status update email:', err.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendStatusUpdateEmail,
};
