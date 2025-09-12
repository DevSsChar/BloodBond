/**
 * Blood Type Compatibility System
 * 
 * This module provides blood type compatibility information for emergency blood requests.
 * It follows medical standards for blood transfusion compatibility.
 */

// Blood type compatibility rules
// Key: Recipient blood type, Value: Array of compatible donor blood types
export const BLOOD_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Can only receive O-, but is universal donor
};

// All valid blood types
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Get compatible blood types for a recipient
 * @param {string} recipientBloodType - The blood type of the person needing blood
 * @returns {string[]} Array of compatible donor blood types
 */
export function getCompatibleBloodTypes(recipientBloodType) {
  if (!recipientBloodType || !BLOOD_COMPATIBILITY[recipientBloodType]) {
    return [];
  }
  return BLOOD_COMPATIBILITY[recipientBloodType];
}

/**
 * Check if a donor blood type is compatible with a recipient blood type
 * @param {string} donorBloodType - The blood type of the donor
 * @param {string} recipientBloodType - The blood type of the recipient
 * @returns {boolean} True if compatible, false otherwise
 */
export function isCompatible(donorBloodType, recipientBloodType) {
  const compatibleTypes = getCompatibleBloodTypes(recipientBloodType);
  return compatibleTypes.includes(donorBloodType);
}

/**
 * Get blood type compatibility information with priority
 * @param {string} recipientBloodType - The blood type of the person needing blood
 * @returns {object} Object containing exact match and compatible alternatives
 */
export function getBloodTypeCompatibilityInfo(recipientBloodType) {
  const compatibleTypes = getCompatibleBloodTypes(recipientBloodType);
  
  return {
    exactMatch: recipientBloodType,
    compatibleTypes: compatibleTypes,
    alternatives: compatibleTypes.filter(type => type !== recipientBloodType),
    isUniversalRecipient: recipientBloodType === 'AB+',
    isUniversalDonor: recipientBloodType === 'O-'
  };
}

/**
 * Format blood type compatibility for display
 * @param {string} recipientBloodType - The blood type of the person needing blood
 * @returns {object} Formatted compatibility information for UI display
 */
export function formatCompatibilityForDisplay(recipientBloodType) {
  const info = getBloodTypeCompatibilityInfo(recipientBloodType);
  
  let description = '';
  if (info.isUniversalRecipient) {
    description = 'Universal recipient - can receive any blood type';
  } else if (info.isUniversalDonor) {
    description = 'Can only receive O- blood';
  } else {
    description = `Can receive: ${info.compatibleTypes.join(', ')}`;
  }
  
  return {
    ...info,
    description,
    compatibilityCount: info.compatibleTypes.length
  };
}

/**
 * Validate blood type format
 * @param {string} bloodType - Blood type to validate
 * @returns {boolean} True if valid blood type format
 */
export function isValidBloodType(bloodType) {
  return BLOOD_TYPES.includes(bloodType);
}

/**
 * Get blood types that can donate to a specific recipient (reverse lookup)
 * @param {string} recipientBloodType - The blood type of the recipient
 * @returns {string[]} Array of blood types that can donate to this recipient
 */
export function getDonorTypesFor(recipientBloodType) {
  return getCompatibleBloodTypes(recipientBloodType);
}

/**
 * Get recipients that can receive from a specific donor blood type
 * @param {string} donorBloodType - The blood type of the donor
 * @returns {string[]} Array of blood types that can receive from this donor
 */
export function getRecipientsFor(donorBloodType) {
  const recipients = [];
  
  Object.keys(BLOOD_COMPATIBILITY).forEach(recipientType => {
    if (BLOOD_COMPATIBILITY[recipientType].includes(donorBloodType)) {
      recipients.push(recipientType);
    }
  });
  
  return recipients;
}