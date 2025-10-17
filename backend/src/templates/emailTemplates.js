/**
 * EmailTemplates - Generates email templates
 * Follows Single Responsibility & Open/Closed Principles
 */
class EmailTemplates {
    /**
     * Get registration email template
     * @param {Object} patientData - Patient information
     * @param {Object} healthCard - Health card info
     * @returns {String} - HTML email template
     */
    static getRegistrationTemplate(patientData, healthCard) {
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
            .highlight { color: #667eea; font-weight: bold; }
            .important-note { background: #fff3cd; border-left: 4px solid #ffc107; 
                             padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
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
                <h4 style="margin-top: 0;">⚠️ Allergy Alert</h4>
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
     * Can easily add more templates here without modifying existing code
     */
    static getPasswordResetTemplate(userData, resetLink) {
      // Implementation for password reset
    }
  
    static getAppointmentConfirmationTemplate(appointmentData) {
      // Implementation for appointment confirmation
    }
  }
  
  module.exports = EmailTemplates;