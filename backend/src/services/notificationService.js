const nodemailer = require('nodemailer');
// const twilio = require('twilio'); // Uncomment when configured

/**
 * NotificationService - Handles all notification operations
 * Follows Single Responsibility Principle
 */
class NotificationService {
  constructor() {
    this.emailTransporter = null;
    // this.smsClient = null; // Uncomment when configured
  }

  /**
   * Creates email transporter (lazy initialization)
   * @returns {Object} - Nodemailer transporter
   */
  getEmailTransporter() {
    // Return existing transporter if already created
    if (this.emailTransporter) {
      return this.emailTransporter;
    }

    // Only create transporter if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        console.log('✅ Email transporter initialized');
      } catch (error) {
        console.warn('⚠️ Email transporter initialization failed:', error.message);
        this.emailTransporter = null;
      }
    } else {
      console.warn('⚠️ Email credentials not configured. Email notifications will be simulated.');
    }

    return this.emailTransporter;
  }

  /**
   * Creates SMS client
   * @returns {Object} - Twilio client
   */
  // getSMSClient() {
  //   if (this.smsClient) {
  //     return this.smsClient;
  //   }
  //   
  //   if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  //     this.smsClient = twilio(
  //       process.env.TWILIO_ACCOUNT_SID,
  //       process.env.TWILIO_AUTH_TOKEN
  //     );
  //   }
  //   
  //   return this.smsClient;
  // }

  /**
   * Send registration confirmation email
   * @param {Object} patientData - Patient information
   * @param {Object} healthCard - Digital health card info
   * @returns {Promise<Object>} - Email result
   */
  async sendRegistrationEmail(patientData, healthCard) {
    try {
      const transporter = this.getEmailTransporter();
      
      // If no transporter available, simulate email
      if (!transporter) {
        console.log('📧 [SIMULATED EMAIL] Registration email would be sent to:', patientData.email);
        console.log('   Subject: Welcome to Smart Healthcare System');
        console.log('   Patient:', patientData.name);
        console.log('   Health Card ID:', healthCard.cardID);
        return { 
          success: true, 
          simulated: true,
          message: 'Email simulated (credentials not configured)' 
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patientData.email,
        subject: 'Welcome to Smart Healthcare System - Registration Successful',
        html: this.getRegistrationEmailTemplate(patientData, healthCard)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Registration email sent to:', patientData.email);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send registration confirmation SMS
   * @param {String} phoneNumber - Patient phone number
   * @param {String} patientID - Patient ID
   * @returns {Promise<Object>} - SMS result
   */
  async sendRegistrationSMS(phoneNumber, patientID) {
    try {
      // Implement SMS sending when Twilio is configured
      const message = `Welcome to Smart Healthcare System! Your Patient ID: ${patientID}. Your digital health card has been created.`;
      
      // const smsClient = this.getSMSClient();
      // if (smsClient) {
      //   const result = await smsClient.messages.create({
      //     body: message,
      //     from: process.env.TWILIO_PHONE_NUMBER,
      //     to: phoneNumber
      //   });
      //   return { success: true, messageId: result.sid };
      // }

      console.log('📱 [SIMULATED SMS] SMS would be sent to:', phoneNumber);
      console.log('   Message:', message);
      return { success: true, simulated: true, message: 'SMS sent (simulated)' };
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email template for registration
   * @param {Object} patientData - Patient information
   * @param {Object} healthCard - Health card info
   * @returns {String} - HTML email template
   */
  getRegistrationEmailTemplate(patientData, healthCard) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+128+Text&display=swap" rel="stylesheet">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .card-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; 
                       border-left: 4px solid #667eea; }
          .qr-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0;
                        text-align: center; border: 2px solid #667eea; }
          .qr-code-img { max-width: 250px; margin: 15px auto; display: block; }
          .barcode-container { background: white; padding: 20px; border: 2px dashed #333; 
                              border-radius: 8px; margin: 15px 0; }
          .barcode-display { font-family: 'Libre Barcode 128 Text', cursive; 
                            font-size: 48px; color: #000; letter-spacing: 0;
                            line-height: 1.2; word-wrap: break-word; }
          .barcode-text { font-family: 'Courier New', monospace; font-size: 12px; 
                          background: #f0f0f0; padding: 8px; border-radius: 4px;
                          letter-spacing: 1px; margin-top: 10px; color: #333; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { color: #667eea; font-weight: bold; }
          .important-note { background: #fff3cd; border-left: 4px solid #ffc107; 
                           padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Welcome to Smart Healthcare System</h1>
          </div>
          <div class="content">
            <h2>Dear ${patientData.name},</h2>
            <p>Your registration has been completed successfully! We're excited to have you as part of our healthcare family.</p>
            
            <div class="card-info">
              <h3>📋 Your Patient Information</h3>
              <p><strong>Patient ID:</strong> <span class="highlight">${patientData._id}</span></p>
              <p><strong>Health Card ID:</strong> <span class="highlight">${healthCard.cardID}</span></p>
              <p><strong>Email:</strong> ${patientData.email}</p>
              <p><strong>Contact:</strong> ${patientData.contactInfo}</p>
              <p><strong>Date of Birth:</strong> ${new Date(patientData.DOB).toLocaleDateString()}</p>
              ${patientData.bloodGroup ? `<p><strong>Blood Group:</strong> <span class="highlight">${patientData.bloodGroup}</span></p>` : ''}
            </div>

            <div class="card-info">
              <h3>💳 Digital Health Card Details</h3>
              <p><strong>Card Issued:</strong> ${new Date(healthCard.issuedDate).toLocaleDateString()}</p>
              <p><strong>Valid Until:</strong> ${new Date(healthCard.expiryDate).toLocaleDateString()}</p>
              <p>Your digital health card is now active and ready to use for all your hospital visits.</p>
            </div>

            ${healthCard.QRCode ? `
            <div class="qr-section">
              <h3>📱 Your Digital Health Card QR Code</h3>
              <p>Show this QR code at the hospital for quick check-in:</p>
              <img src="${healthCard.QRCode}" alt="Health Card QR Code" class="qr-code-img" />
              <p style="color: #666; font-size: 12px; margin-top: 10px;">
                Save this QR code or access it anytime from your patient dashboard
              </p>
              
              ${healthCard.barcode ? `
              <div style="margin-top: 30px;">
                <h4 style="margin-bottom: 15px;"><strong>📊 Barcode ID:</strong></h4>
                <div style="background: white; padding: 20px; border: 2px dashed #333; border-radius: 8px; margin: 15px 0;">
                  ${healthCard.barcodeImage ? `
                    <img src="${healthCard.barcodeImage}" alt="Health Card Barcode" style="max-width: 100%; height: auto; margin: 10px auto; display: block;" />
                  ` : `
                    <p style="font-family: 'Courier New', monospace; font-size: 14px; background: #f0f0f0; padding: 10px; border-radius: 4px; letter-spacing: 2px;">${healthCard.barcode}</p>
                  `}
                  <p style="font-size: 11px; color: #888; margin-top: 10px; text-align: center;">
                    Present this barcode for manual scanning if needed
                  </p>
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <div class="important-note">
              <h4 style="margin-top: 0;">⚠️ Important: First-Time Login</h4>
              <p style="margin-bottom: 0;">A temporary password has been set for your account. Please contact the hospital staff to obtain your login credentials. For security reasons, you'll be required to change your password upon first login.</p>
            </div>

            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Contact hospital staff for your login credentials</li>
              <li>Login to your account to view your digital health card</li>
              <li>Book appointments online through the patient portal</li>
              <li>Access your medical records anytime, anywhere</li>
              <li>Show your QR code or barcode at the hospital for quick check-in</li>
            </ul>

            ${patientData.allergies && patientData.allergies !== 'None' ? `
            <div class="important-note">
              <h4 style="margin-top: 0;">�� Allergy Alert</h4>
              <p style="margin-bottom: 0;"><strong>Recorded Allergies:</strong> ${patientData.allergies}</p>
            </div>
            ` : ''}

            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br/>
            <strong>Smart Healthcare System Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2025 Smart Healthcare System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send batch notifications (email and SMS)
   * @param {Object} patientData - Patient information
   * @param {Object} healthCard - Health card info
   * @returns {Promise<Object>} - Notification results
   */
  async sendPatientRegistrationNotifications(patientData, healthCard) {
    const results = {
      email: { success: false },
      sms: { success: false }
    };

    // Send email
    if (patientData.email) {
      results.email = await this.sendRegistrationEmail(patientData, healthCard);
    }

    // Send SMS
    if (patientData.contactInfo) {
      results.sms = await this.sendRegistrationSMS(
        patientData.contactInfo, 
        patientData._id
      );
    }

    return results;
  }
}

module.exports = new NotificationService();