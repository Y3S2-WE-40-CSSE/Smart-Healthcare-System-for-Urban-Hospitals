const MedicalRecordRepository = require('../repositories/medicalRecordRepository');
const PatientRepository = require('../repositories/patientRepository');
const HealthCardRepository = require('../repositories/healthCardRepository');

/**
 * MedicalRecordService - Business logic for medical records
 */
class MedicalRecordService {
  /**
   * Verify and retrieve patient by health card (QR/Barcode scan)
   */
  async verifyHealthCard(cardID) {
    try {
      // Find health card by cardID
      const healthCard = await HealthCardRepository.findByCardId(cardID);
      
      if (!healthCard) {
        return {
          success: false,
          message: 'Invalid or unreadable card. Please verify card details.'
        };
      }

      // Check if card is expired
      if (new Date(healthCard.expiryDate) < new Date()) {
        return {
          success: false,
          message: 'Health card has expired. Please renew the card.'
        };
      }

      // Get patient details
      const patient = await PatientRepository.findById(healthCard.patientID);
      
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found in system. Card may be invalid.'
        };
      }

      return {
        success: true,
        message: 'Patient verified successfully',
        data: {
          patient: patient.getPublicProfile(),
          healthCard: {
            cardID: healthCard.cardID,
            issuedDate: healthCard.issuedDate,
            expiryDate: healthCard.expiryDate
          }
        }
      };
    } catch (error) {
      console.error('❌ Error verifying health card:', error);
      return {
        success: false,
        message: 'Error verifying health card',
        error: error.message
      };
    }
  }

  /**
   * Get patient's complete medical history
   */
  async getPatientMedicalHistory(patientId) {
    try {
      // Get patient details
      const patient = await PatientRepository.findById(patientId);
      
      if (!patient || patient.role !== 'patient') {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Get all medical records
      const medicalRecords = await MedicalRecordRepository.findByPatientId(patientId);

      return {
        success: true,
        message: 'Medical history retrieved successfully',
        data: {
          demographics: {
            name: patient.name,
            DOB: patient.DOB,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            contactInfo: patient.contactInfo,
            address: patient.address,
            emergencyContact: patient.emergencyContact
          },
          medicalInfo: {
            allergies: patient.allergies || [],
            medicalHistory: patient.medicalHistory || [],
            totalVisits: medicalRecords.length
          },
          records: medicalRecords
        }
      };
    } catch (error) {
      console.error('❌ Error retrieving medical history:', error);
      return {
        success: false,
        message: 'Error retrieving medical history',
        error: error.message
      };
    }
  }

  /**
   * Add new visit record
   */
  async addVisitRecord(visitData, doctorId) {
    try {
      const { patientID, diagnosis, prescriptions, treatmentNotes, symptoms } = visitData;

      // Verify patient exists
      const patient = await PatientRepository.findById(patientID);
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found'
        };
      }

      // Verify doctor exists
      const doctor = await PatientRepository.findById(doctorId);
      if (!doctor || (doctor.role !== 'doctor' && doctor.role !== 'admin')) {
        return {
          success: false,
          message: 'Unauthorized: Only doctors can add medical records'
        };
      }

      // Create medical record
      const recordData = {
        patientID,
        doctorID: doctorId,
        diagnosis,
        prescriptions: prescriptions || [],
        treatmentNotes,
        symptoms: symptoms || '',
        visitDate: new Date()
      };

      const medicalRecord = await MedicalRecordRepository.create(recordData);

      return {
        success: true,
        message: 'Visit record added successfully',
        data: { medicalRecord }
      };
    } catch (error) {
      console.error('❌ Error adding visit record:', error);
      return {
        success: false,
        message: 'Error adding visit record',
        error: error.message
      };
    }
  }

  /**
   * Search patient by NIC/Passport (for manual search when card can't be scanned)
   */
  async searchPatientByNIC(nicNumber) {
    try {
      // Trim and clean the NIC number
      const cleanNIC = nicNumber.trim();
      console.log('🔍 Searching for patient with NIC:', cleanNIC);
      
      const patient = await PatientRepository.findByNIC(cleanNIC);
      
      if (!patient) {
        console.log('❌ No patient found with NIC:', cleanNIC);
        return {
          success: false,
          message: 'No patient found with provided NIC/Passport number'
        };
      }

      console.log('✅ Patient found:', patient._id);
      const publicProfile = patient.getPublicProfile();
      console.log('✅ Public profile:', publicProfile);

      return {
        success: true,
        message: 'Patient found',
        data: { patient: publicProfile }
      };
    } catch (error) {
      console.error('❌ Error searching patient:', error);
      return {
        success: false,
        message: 'Error searching patient',
        error: error.message
      };
    }
  }
}

module.exports = new MedicalRecordService();