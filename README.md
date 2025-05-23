# Sayeret Carmeli Tournament System

A tournament management system for Sayeret Carmeli, enabling the creation and management of tournaments, teams, and matches.

## Key Features

- Google Authentication with admin privileges
- Tournament creation and management
- Team and participant management
- Match scheduling and result tracking
- Admin dashboard
- Player roster management
- Image Gallery connected to Google Drive

## Firebase Setup Instructions

### 1. Create a New Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "carmeli-tournament")
4. Follow the prompts to complete project creation

### 2. Set Up Google Authentication

1. In the Firebase Console, navigate to "Authentication" in the sidebar
2. Click "Get Started"
3. Under "Sign-in method", enable Google authentication
4. Add your authorized domain (provided by your deployment platform)

### 3. Create Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" for development
4. Select the closest location to your users
5. Click "Enable"

### 4. Set Up Firebase Security Rules

Add these security rules in the Firebase Console under "Rules" in Firestore:

\`\`\`js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Allow authenticated users to read tournament data
    match /tournaments/{tournamentId} {
      allow read: if isAuthenticated();
      // Only admins can write/delete tournaments
      allow write, delete: if isAdmin();
      
      // Teams can be read by authenticated users
      match /teams/{teamId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
      
      // Matches can be read by authenticated users
      match /matches/{matchId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
      }
    }
    
    // User documents
    match /users/{userId} {
      // Users can read/write only their own data
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Players collection
    match /players/{playerId} {
      // All authenticated users can read player data
      allow read: if isAuthenticated();
      // Only admins can write player data
      allow create, update, delete: if isAdmin();
    }
  }
}
\`\`\`

### 5. Configure Web Application

1. In the Firebase Console, click the web icon (\`</>\`) on the project overview page
2. Register your app with a nickname
3. Copy the Firebase configuration values

### 6. Set Environment Variables

1. Copy \`.env.example\` to a new file named \`.env\`
2. Fill in the environment variables with your Firebase configuration:

\`\`\`
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

### 7. Configure Admin Access

Update the admin emails list in \`.env\`:

\`\`\`
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
\`\`\`

### 8. Run the Application

Install dependencies and start the development server:

\`\`\`bash
npm install
npm run dev
\`\`\`

### 9. Player Import Format

To import players in bulk, prepare a CSV file with the following columns:

- \`firstName\`: Player's first name
- \`lastName\`: Player's last name
- \`platoon\`: One of: palsar, palchan, palnat, mafgad, paltaz, mesayaat
- \`sportBranch\`: Comma-separated list of sports: basketball, soccer, volleyball, tug_of_war, running
- \`isRunner\`: true/false indicating participation in 100m run

Example template is provided in \`public/player_import_template.csv\`

## Google Drive Gallery Setup

The application includes a gallery feature that displays images from a shared Google Drive folder.

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API for your project

### 2. Create API Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. (Optional but recommended) Restrict the API key to only the Google Drive API

### 3. Create a Shared Google Drive Folder

1. Create a folder in Google Drive
2. Upload your tournament images to this folder
3. Make sure the folder is shared with appropriate permissions (typically "Anyone with the link can view")
4. Copy the folder ID from the URL (the long alphanumeric string)

### 4. Set Environment Variables

Add these variables to your `.env` file:

```
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### 5. CORS and Proxy Configuration

The application uses a proxy server to bypass CORS restrictions on Google Drive images. This is configured in:

- `vite.config.ts` for local development
- `vercel.json` for production deployment on Vercel

## Technologies Used

- React + TypeScript
- Firebase Authentication
- Firebase Firestore
- Google Drive API
- TailwindCSS
- React Router
- React Hook Form
- React Image Gallery
- Zustand (state management)

## Project Structure

- \`/src/components\`: React components
- \`/src/context\`: Context providers
- \`/src/services\`: Firebase and API services
- \`/src/types\`: TypeScript type definitions
- \`/src/pages\`: Page components