/**
 * Centralized Environment Validation
 * Validates critical environment variables immediately on use.
 */

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Environment variable ${key} is missing.`);
  }
  return value;
};

export const validateStorageEnvironment = () => {
  const requiredKeys = [
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_TOKEN_ENCRYPTION_KEY',
  ];
  
  const missing = requiredKeys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Missing required storage environment variables: ${missing.join(', ')}`);
  }
};
