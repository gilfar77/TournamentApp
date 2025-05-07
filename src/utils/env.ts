// Google Drive API configuration
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY';
export const GOOGLE_DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || 'YOUR_SHARED_FOLDER_ID';

// For testing purposes, you can uncomment and modify these lines 
// (but remember to comment them again before deploying!)
// export const GOOGLE_API_KEY = 'AIza...[your actual API key]';
// export const GOOGLE_DRIVE_FOLDER_ID = '1abc...[your actual folder ID]';

// Instructions for setting up the Google Drive API:
/*
1. Create a project in the Google Cloud Console (https://console.cloud.google.com/)
2. Enable the Google Drive API
3. Create an API key with restrictions:
   - Limit to websites with HTTP referrers
   - Add your deployment domain and localhost for testing
4. Set the API key in your .env file or deployment environment
5. Set the shared folder ID in your .env file or deployment environment

Example .env.local file:
VITE_GOOGLE_API_KEY=AIza...
VITE_GOOGLE_DRIVE_FOLDER_ID=1abc...
*/ 