import { useMemo } from 'react';

/**
 * Custom hook for role configuration
 * Centralizes role-based UI logic
 * Following Single Responsibility Principle
 */
export const useRoleConfig = () => {
  const roleOptions = useMemo(() => [
    { value: 'patient', label: 'Patient', description: 'Register as a patient' },
    { value: 'staff', label: 'Hospital Staff', description: 'Register as hospital staff' },
    { value: 'doctor', label: 'Doctor', description: 'Register as a doctor' },
    { value: 'admin', label: 'Administrator', description: 'Register as an administrator' }
  ], []);

  const getRoleFields = (role) => {
    const fieldsConfig = {
      patient: ['DOB', 'address', 'allergies', 'medicalHistory'],
      staff: ['department'],
      doctor: ['department', 'specialization', 'licenseNumber'],
      admin: ['department']
    };

    return fieldsConfig[role] || [];
  };

  const getRoleRequiredFields = (role) => {
    const requiredConfig = {
      patient: ['name', 'email', 'password', 'contactInfo', 'DOB', 'address'],
      staff: ['name', 'email', 'password', 'contactInfo', 'department'],
      doctor: ['name', 'email', 'password', 'contactInfo', 'department', 'specialization', 'licenseNumber'],
      admin: ['name', 'email', 'password', 'contactInfo', 'department']
    };

    return requiredConfig[role] || requiredConfig.patient;
  };

  const shouldShowField = (fieldName, currentRole) => {
    const roleFields = getRoleFields(currentRole);
    return roleFields.includes(fieldName);
  };

  const isFieldRequired = (fieldName, currentRole) => {
    const requiredFields = getRoleRequiredFields(currentRole);
    return requiredFields.includes(fieldName);
  };

  return {
    roleOptions,
    getRoleFields,
    getRoleRequiredFields,
    shouldShowField,
    isFieldRequired
  };
};
