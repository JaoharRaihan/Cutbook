/**
 * Validation Utility Functions
 * Input validation helpers
 */

import {VALIDATION} from '@/constants';

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

/**
 * Validate Bangladesh phone number
 * Format: 01XXXXXXXXX (11 digits, starts with 01)
 * @param phone - Phone number string
 * @returns True if valid
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const cleaned = phone.replace(/\s/g, '').trim();
  return VALIDATION.phone.pattern.test(cleaned);
};

/**
 * Get phone validation error message
 * @param phone - Phone number string
 * @returns Error message or null if valid
 */
export const getPhoneError = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }

  const cleaned = phone.replace(/\s/g, '').trim();

  if (cleaned.length !== VALIDATION.phone.minLength) {
    return `Phone number must be ${VALIDATION.phone.minLength} digits`;
  }

  if (!validatePhone(phone)) {
    return 'Invalid phone number format. Use: 01XXXXXXXXX';
  }

  return null;
};

/**
 * Format phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone (e.g., "01712 345678")
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';

  const cleaned = phone.replace(/\s/g, '').trim();

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return cleaned;
};

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate email address
 * @param email - Email string
 * @returns True if valid email
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Get email validation error message
 * @param email - Email string
 * @param required - Whether email is required (default: false)
 * @returns Error message or null if valid
 */
export const getEmailError = (email: string, required: boolean = false): string | null => {
  if (!email || email.trim() === '') {
    return required ? 'Email is required' : null;
  }

  if (!validateEmail(email)) {
    return 'Invalid email address';
  }

  return null;
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validate password
 * @param password - Password string
 * @returns True if valid password
 */
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  return (
    password.length >= VALIDATION.password.minLength &&
    password.length <= VALIDATION.password.maxLength
  );
};

/**
 * Get password validation error message
 * @param password - Password string
 * @returns Error message or null if valid
 */
export const getPasswordError = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'Password is required';
  }

  if (password.length < VALIDATION.password.minLength) {
    return `Password must be at least ${VALIDATION.password.minLength} characters`;
  }

  if (password.length > VALIDATION.password.maxLength) {
    return `Password must be less than ${VALIDATION.password.maxLength} characters`;
  }

  return null;
};

/**
 * Validate password confirmation
 * @param password - Password string
 * @param confirmPassword - Confirm password string
 * @returns Error message or null if valid
 */
export const getPasswordConfirmError = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

// ============================================================================
// NAME VALIDATION
// ============================================================================

/**
 * Validate name
 * @param name - Name string
 * @returns True if valid name
 */
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();
  return trimmed.length >= VALIDATION.name.minLength && trimmed.length <= VALIDATION.name.maxLength;
};

/**
 * Get name validation error message
 * @param name - Name string
 * @param fieldName - Field name for error message (default: 'Name')
 * @returns Error message or null if valid
 */
export const getNameError = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name || name.trim() === '') {
    return `${fieldName} is required`;
  }

  const trimmed = name.trim();

  if (trimmed.length < VALIDATION.name.minLength) {
    return `${fieldName} must be at least ${VALIDATION.name.minLength} characters`;
  }

  if (trimmed.length > VALIDATION.name.maxLength) {
    return `${fieldName} must be less than ${VALIDATION.name.maxLength} characters`;
  }

  return null;
};

// ============================================================================
// PRICE VALIDATION
// ============================================================================

/**
 * Validate price
 * @param price - Price number
 * @returns True if valid price
 */
export const validatePrice = (price: number): boolean => {
  if (typeof price !== 'number' || isNaN(price)) {
    return false;
  }

  return price >= VALIDATION.price.min && price <= VALIDATION.price.max;
};

/**
 * Get price validation error message
 * @param price - Price number or string
 * @returns Error message or null if valid
 */
export const getPriceError = (price: number | string): string | null => {
  if (price === '' || price === null || price === undefined) {
    return 'Price is required';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return 'Invalid price';
  }

  if (numPrice <= VALIDATION.price.min) {
    return 'Price must be greater than 0';
  }

  if (numPrice > VALIDATION.price.max) {
    return `Price must be less than ${VALIDATION.price.max}`;
  }

  return null;
};

// ============================================================================
// COMMISSION VALIDATION
// ============================================================================

/**
 * Validate commission percentage
 * @param percentage - Commission percentage
 * @returns True if valid percentage
 */
export const validateCommissionPercentage = (percentage: number): boolean => {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    return false;
  }

  return (
    percentage >= VALIDATION.commissionPercentage.min &&
    percentage <= VALIDATION.commissionPercentage.max
  );
};

/**
 * Get commission percentage validation error
 * @param percentage - Commission percentage
 * @returns Error message or null if valid
 */
export const getCommissionPercentageError = (percentage: number | string): string | null => {
  if (percentage === '' || percentage === null || percentage === undefined) {
    return 'Commission percentage is required';
  }

  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

  if (isNaN(numPercentage)) {
    return 'Invalid percentage';
  }

  if (numPercentage < VALIDATION.commissionPercentage.min) {
    return `Percentage cannot be less than ${VALIDATION.commissionPercentage.min}`;
  }

  if (numPercentage > VALIDATION.commissionPercentage.max) {
    return `Percentage cannot be more than ${VALIDATION.commissionPercentage.max}`;
  }

  return null;
};

// ============================================================================
// INVITE CODE VALIDATION
// ============================================================================

/**
 * Validate invite code
 * @param code - Invite code string
 * @returns True if valid invite code
 */
export const validateInviteCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const cleaned = code.trim().toUpperCase();
  return (
    cleaned.length === VALIDATION.inviteCode.length && VALIDATION.inviteCode.pattern.test(cleaned)
  );
};

/**
 * Get invite code validation error
 * @param code - Invite code string
 * @returns Error message or null if valid
 */
export const getInviteCodeError = (code: string): string | null => {
  if (!code || code.trim() === '') {
    return 'Invite code is required';
  }

  const cleaned = code.trim().toUpperCase();

  if (cleaned.length !== VALIDATION.inviteCode.length) {
    return `Invite code must be ${VALIDATION.inviteCode.length} characters`;
  }

  if (!validateInviteCode(code)) {
    return 'Invalid invite code format. Use only letters and numbers.';
  }

  return null;
};

/**
 * Format invite code for display
 * @param code - Invite code string
 * @returns Formatted uppercase code
 */
export const formatInviteCode = (code: string): string => {
  if (!code) return '';
  return code.trim().toUpperCase();
};

// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================

/**
 * Validate required field
 * @param value - Field value
 * @returns True if not empty
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
};

/**
 * Get required field error message
 * @param value - Field value
 * @param fieldName - Field name for error message
 * @returns Error message or null if valid
 */
export const getRequiredError = (value: any, fieldName: string): string | null => {
  if (!validateRequired(value)) {
    return `${fieldName} is required`;
  }
  return null;
};

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate multiple fields
 * @param fields - Object with field values and validation functions
 * @returns Object with field errors (empty object if all valid)
 */
export const validateFields = (
  fields: Record<string, {value: any; validator: (value: any) => string | null}>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(fields).forEach(([fieldName, {value, validator}]) => {
    const error = validator(value);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if form has errors
 * @param errors - Errors object
 * @returns True if any errors exist
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize string input (trim and remove extra spaces)
 * @param value - Input string
 * @returns Sanitized string
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize number input
 * @param value - Input value
 * @returns Number or null if invalid
 */
export const sanitizeNumber = (value: string | number): number | null => {
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    return isNaN(parsed) ? null : parsed;
  }

  return null;
};
