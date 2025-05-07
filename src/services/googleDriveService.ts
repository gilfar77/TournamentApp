import { GOOGLE_API_KEY, GOOGLE_DRIVE_FOLDER_ID } from '../utils/env';

// Define the structure for image items
export interface GalleryImage {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl: string;
  thumbnailLink: string; // Direct Google Drive thumbnail link
  imageUrl: string;
  webContentLink: string; // Direct Google Drive content link
  createdTime: Date;
  // Add proxy-friendly URLs
  proxyThumbnailUrl: string;
  proxyImageUrl: string;
}

// Create a config interface
export interface GoogleDriveConfig {
  apiKey: string;
  sharedFolderId: string;
}

// Default configuration - use environment variables
const defaultConfig: GoogleDriveConfig = {
  apiKey: GOOGLE_API_KEY,
  sharedFolderId: GOOGLE_DRIVE_FOLDER_ID,
};

/**
 * Convert a Google Drive image URL to a proxy URL to avoid CORS issues
 */
export const convertToProxyUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle Google Drive storage URLs (lh3.googleusercontent.com)
  if (url.includes('lh3.googleusercontent.com/drive-storage/')) {
    // Extract the path part after drive-storage/
    const pathMatch = url.match(/drive-storage\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      return `/api/image-proxy/drive-storage/${pathMatch[1]}`;
    }
  }
  
  // For other Google URLs, return the original since we can't easily proxy them
  return url;
};

/**
 * Fetch images from a shared Google Drive folder using direct REST API
 */
export const fetchImagesFromDrive = async (
  config: GoogleDriveConfig = defaultConfig
): Promise<GalleryImage[]> => {
  try {
    console.log('Fetching images with config:', {
      folderId: config.sharedFolderId,
      apiKeyLength: config.apiKey ? config.apiKey.length : 0
    });
    
    // Need to properly encode query parameters for Google Drive API
    const query = encodeURIComponent(`'${config.sharedFolderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const fields = encodeURIComponent("files(id,name,description,thumbnailLink,webContentLink,createdTime)");
    const orderBy = encodeURIComponent("createdTime desc");
    
    // Build the properly encoded URL - use proxy for Google APIs
    const url = `/api/drive-proxy/drive/v3/files?q=${query}&fields=${fields}&orderBy=${orderBy}&key=${config.apiKey}`;
    
    console.log('Requesting URL (without key):', url.replace(config.apiKey, '[REDACTED]'));
    
    // Try to fetch with CORS headers to help with debugging
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);

    if (!data.files || data.files.length === 0) {
      console.log('No images found');
      return [];
    }

    return data.files.map((file: any) => {
      // Get the high-res version of the thumbnail by modifying the URL
      // Replace =s220 with =s1000 for higher resolution
      const highResThumbnail = file.thumbnailLink ? file.thumbnailLink.replace('=s220', '=s1000') : null;
      
      // Create proxy URLs for the thumbnails
      const proxyThumbnail = file.thumbnailLink ? convertToProxyUrl(file.thumbnailLink) : '';
      const proxyHighResThumbnail = highResThumbnail ? convertToProxyUrl(highResThumbnail) : '';
      
      return {
        id: file.id || '',
        name: file.name || 'Untitled',
        description: file.description || undefined,
        // For thumbnails, use the thumbnailLink directly
        thumbnailUrl: file.thumbnailLink || `https://placehold.co/200x200?text=${encodeURIComponent(file.name || 'Image')}`,
        thumbnailLink: file.thumbnailLink || `https://placehold.co/200x200?text=${encodeURIComponent(file.name || 'Image')}`,
        // For full images, use the high-res thumbnail or file viewer link
        imageUrl: highResThumbnail || getImageViewUrl(file.id),
        webContentLink: file.webContentLink || getImageViewUrl(file.id),
        createdTime: new Date(file.createdTime || ''),
        // Add proxy URLs
        proxyThumbnailUrl: proxyThumbnail || `https://placehold.co/200x200?text=${encodeURIComponent(file.name || 'Image')}`,
        proxyImageUrl: proxyHighResThumbnail || `https://placehold.co/800x600?text=${encodeURIComponent(file.name || 'Image')}`,
      };
    });
  } catch (error) {
    console.error('Error fetching images from Drive:', error);
    throw error;
  }
};

/**
 * Get optimized image URL for different sizes
 */
export const getOptimizedImageUrl = (fileId: string, size: number = 800): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

/**
 * Get a direct view URL for a Google Drive file
 */
export const getImageViewUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

/**
 * Get a direct embed URL for a Google Drive file
 * This is another alternative for displaying images
 */
export const getImageEmbedUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

/**
 * Get a direct download link for a Google Drive file
 */
export const getImageDownloadUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Transforms a Google Drive webContentLink to be more compatible with direct image loading
 * This helps avoid CORS and redirect issues
 */
export const transformWebContentLink = (webContentLink: string): string => {
  // Convert "https://drive.google.com/uc?id=FILE_ID&export=download"
  // to "https://drive.google.com/uc?export=view&id=FILE_ID"
  // This helps with direct loading instead of triggering a download
  if (webContentLink) {
    // Extract the file ID from the URL
    const match = webContentLink.match(/id=([^&]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return webContentLink;
};

/**
 * Check if the folder exists and is accessible
 */
export const checkFolderAccess = async (
  config: GoogleDriveConfig = defaultConfig
): Promise<boolean> => {
  try {
    const fields = encodeURIComponent("id,name,mimeType,capabilities");
    const url = `/api/drive-proxy/drive/v3/files/${config.sharedFolderId}?fields=${fields}&key=${config.apiKey}`;
    
    console.log('Checking folder access (without key):', url.replace(config.apiKey, '[REDACTED]'));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Folder check response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Folder access check error:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('Folder metadata:', data);
    
    // Check if it's actually a folder
    if (data.mimeType !== 'application/vnd.google-apps.folder') {
      console.error('The ID provided is not a folder');
      return false;
    }
    
    // If we got this far, we have access to the folder
    // No need to check specific capabilities as we clearly have read access
    // (the API returned the folder metadata)
    return true;
  } catch (error) {
    console.error('Error checking folder access:', error);
    return false;
  }
}; 