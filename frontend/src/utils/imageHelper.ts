import { API_CONFIG, STORAGE_KEYS } from './constants';

/**
 * Generates the full URL for an image by appending the base URL and auth token
 * @param imagePath - Relative image path from the backend (e.g., '/v1/files/1/image.jpg')
 * @returns Full image URL with authentication token
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Get base URL
  const baseUrl = API_CONFIG.BASE_URL;
  
  // Get auth token from localStorage
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  // Build URL with token as query parameter for authenticated access
  const url = `${baseUrl}/${cleanPath}`;
  
  if (token) {
    return `${url}?authorization=${encodeURIComponent(token)}`;
  }
  
  return url;
};

/**
 * Generates the full URL for a file
 * Alias for getImageUrl for semantic clarity
 */
export const getFileUrl = getImageUrl;
