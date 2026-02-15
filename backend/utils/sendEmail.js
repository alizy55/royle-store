const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 * @param {string} html - Email HTML content (optional)
 * @returns {Promise<boolean>} - True if email was sent successfully
 */
const sendEmail = async (to, subject, text, html = null) => {
    try {
        // In development mode, just log the email instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log('\n📧 ===== EMAIL WOULD BE SENT =====');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Text:', text);
            if (html) console.log('HTML:', html.substring(0, 100) + '...');
            console.log('================================\n');
            return true;
        }

        // Send actual email in production
        const mailOptions = {
            from: `"Royal Store" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text, // Use HTML if provided, otherwise use text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);

        // Don't crash the app if email fails, just log it
        // Return true anyway so user registration continues
        return true;
    }
};

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to Royal Store! 👑';
    const text = `Hello ${user.name},\n\nWelcome to Royal Store! Your seller account has been created successfully.\n\nYou can now login and start managing your store.\n\nBest regards,\nRoyal Store Team`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0;">👑 Royal Store</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Seller Dashboard</p>
      </div>
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333;">Welcome ${user.name}! 👋</h2>
        <p>Your Royal Store seller account has been created successfully.</p>
        <p>You can now:</p>
        <ul>
          <li>Login to your seller dashboard</li>
          <li>Add products to your store</li>
          <li>Manage orders and customers</li>
          <li>Track your sales and analytics</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p>Best regards,<br>The Royal Store Team</p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Royal Store. All rights reserved.</p>
      </div>
    </div>
  `;

    return sendEmail(user.email, subject, text, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Password Reset Request - Royal Store';
    const text = `Hello ${user.name},\n\nYou requested a password reset for your Royal Store account.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nRoyal Store Team`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0;">👑 Royal Store</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Password Reset</p>
      </div>
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset for your Royal Store account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Royal Store Team</p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Royal Store. All rights reserved.</p>
      </div>
    </div>
  `;

    return sendEmail(user.email, subject, text, html);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
};