/**
 * PatientValidator - Validates patient registration data
 * Follows Single Responsibility Principle
 */
class PatientValidator {
    /**
     * Validate patient registration data
     * @param {Object} patientData - Patient information
     * @returns {Object} - Validation result
     */
    static validate(patientData) {
      const errors = [];
  
      // Required fields for patients
      const requiredFields = ['name', 'email', 'contactInfo', 'DOB', 'address'];
      
      requiredFields.forEach(field => {
        if (!patientData[field] || patientData[field].toString().trim() === '') {
          errors.push({
            field: field,
            message: `${field} is required`
          });
        }
      });
  
      // Email validation
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (patientData.email && !emailRegex.test(patientData.email)) {
        errors.push({
          field: 'email',
          message: 'Please provide a valid email address'
        });
      }
  
      // DOB validation (must be in the past)
      if (patientData.DOB) {
        const dob = new Date(patientData.DOB);
        if (dob >= new Date()) {
          errors.push({
            field: 'DOB',
            message: 'Date of birth must be in the past'
          });
        }
      }
  
      return {
        valid: errors.length === 0,
        errors: errors
      };
    }
  
    /**
     * Sanitize and prepare patient data
     * @param {Object} requestData - Raw request data
     * @param {String} staffId - Staff member ID
     * @param {String} temporaryPassword - Generated password
     * @returns {Object} - Formatted patient data
     */
    static prepareData(requestData, staffId, temporaryPassword) {
      const {
        name,
        email,
        contactInfo,
        nicNumber,
        DOB,
        address,
        allergies,
        medicalHistory,
        bloodGroup,
        emergencyContact,
        gender
      } = requestData;
  
      return {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: temporaryPassword,
        role: 'patient',
        contactInfo: contactInfo.trim(),
        nicNumber: nicNumber || `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        DOB: new Date(DOB),
        address: address.trim(),
        allergies: allergies || 'None',
        medicalHistory: medicalHistory || 'No significant medical history',
        bloodGroup: bloodGroup || 'Unknown',
        emergencyContact: emergencyContact || contactInfo,
        gender: gender || 'Not specified',
        isSelfRegistered: false,
        createdBy: staffId,
        isActive: true
      };
    }
  }
  
  module.exports = PatientValidator;