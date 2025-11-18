import path from 'path';

/**
 * Generate secure file URL for user-specific files
 * @param userId - User ID who owns the file
 * @param filename - Name of the file
 * @returns Secure URL path
 */
export const getSecureFileUrl = (userId: number, filename: string): string => {
  return `/files/${userId}/${filename}`;
};

/**
 * Extract filename from full file path
 * @param filePath - Full file path
 * @returns Just the filename
 */
export const getFilenameFromPath = (filePath: string): string => {
  return path.basename(filePath);
};

/**
 * Get user-specific upload directory path
 * @param userId - User ID
 * @returns Absolute path to user's upload directory
 */
export const getUserUploadDir = (userId: number): string => {
  return path.join(process.cwd(), 'uploads', userId.toString());
};
