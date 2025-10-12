// Security utilities for input validation and sanitization

/**
 * Sanitize user input to prevent XSS attacks
 * Only encodes characters that could be used in XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');
    // Removed forward slash encoding as it's not typically needed for XSS protection
    // and causes issues with common text like "5/5" and "N/A"
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate country code (2-letter ISO code)
 */
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Validate experience type
 */
export function isValidExperienceType(type: string): boolean {
  const validTypes = ['Visa Free', 'E-Visa', 'Visa Required', 'Not Recognized'];
  return validTypes.includes(type);
}

/**
 * Validate text length with min/max constraints
 */
export function isValidTextLength(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

/**
 * Comprehensive experience data validation
 */
export function validateExperienceData(data: {
  country_code: string;
  country_name: string;
  experience_type: string;
  title: string;
  description: string;
  author_name?: string;
  author_email?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field validation
  if (!data.country_code || !isValidCountryCode(data.country_code)) {
    errors.push('Invalid country code');
  }

  if (!data.country_name || !isValidTextLength(data.country_name, 2, 100)) {
    errors.push('Country name must be between 2 and 100 characters');
  }

  if (!data.experience_type || !isValidExperienceType(data.experience_type)) {
    errors.push('Invalid experience type');
  }

  if (!data.title || !isValidTextLength(data.title, 5, 200)) {
    errors.push('Title must be between 5 and 200 characters');
  }

  if (!data.description || !isValidTextLength(data.description, 10, 5000)) {
    errors.push('Description must be between 10 and 5000 characters');
  }

  // Optional field validation
  if (data.author_name && !isValidTextLength(data.author_name, 2, 50)) {
    errors.push('Author name must be between 2 and 50 characters');
  }

  if (data.author_email && !isValidEmail(data.author_email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize experience data before saving to database
 */
export function sanitizeExperienceData(data: {
  country_code: string;
  country_name: string;
  experience_type: string;
  title: string;
  description: string;
  author_name?: string;
  author_email?: string;
}) {
  return {
    country_code: data.country_code.toUpperCase(),
    country_name: sanitizeInput(data.country_name),
    experience_type: data.experience_type,
    title: sanitizeInput(data.title),
    description: sanitizeInput(data.description),
    author_name: data.author_name ? sanitizeInput(data.author_name) : null,
    author_email: data.author_email ? sanitizeInput(data.author_email) : null
  };
}
