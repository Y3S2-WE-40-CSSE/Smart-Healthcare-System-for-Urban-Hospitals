const mockUsers = {
    patient: {
      name: 'John Patient',
      email: 'patient@test.com',
      password: 'Password123',
      role: 'patient',
      contactInfo: '1234567890',
      DOB: '1990-01-01',
      address: '123 Test St'
    },
    doctor: {
      name: 'Dr. Smith',
      email: 'doctor@test.com',
      password: 'Password123',
      role: 'doctor',
      contactInfo: '0987654321',
      department: 'Cardiology',
      specialization: 'Cardiologist',
      licenseNumber: 'LIC123456'
    },
    admin: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'admin',
      contactInfo: '5555555555',
      department: 'Administration'
    }
  };
  
  const mockAppointments = {
    upcoming: {
      patientId: 'patient-id-123',
      doctorId: 'doctor-id-456',
      date: new Date(Date.now() + 86400000), // Tomorrow
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'scheduled'
    },
    past: {
      patientId: 'patient-id-123',
      doctorId: 'doctor-id-456',
      date: new Date(Date.now() - 86400000), // Yesterday
      timeSlot: '2:00 PM - 2:30 PM',
      status: 'completed'
    }
  };
  
  module.exports = {
    mockUsers,
    mockAppointments
  };