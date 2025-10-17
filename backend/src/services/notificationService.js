const nodemailer = require('nodemailer');
const EmailTemplates = require('../templates/emailTemplates');

/**
 * NotificationService - Handles notification delivery only
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
        html: EmailTemplates.getRegistrationTemplate(patientData, healthCard)
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