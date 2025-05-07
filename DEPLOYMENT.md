# Deployment Guide

This document explains how to deploy the tournament management application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com/) account
2. [Git](https://git-scm.com/) installed on your computer
3. A Google Cloud account with API key for Google Drive access
4. A shared Google Drive folder with images

## Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

### Required Variables

- `VITE_GOOGLE_API_KEY`: Your Google API key for accessing the Drive API
- `VITE_GOOGLE_DRIVE_FOLDER_ID`: The ID of your shared Google Drive folder containing images

### Setting Environment Variables in Vercel

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add each variable with its corresponding value
4. Make sure to select all appropriate environments (Production, Preview, Development)

## Deployment Steps

### From the Vercel Dashboard

1. Log in to your Vercel account
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add your environment variables (see above)
6. Click "Deploy"

### Using the Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Deploy from the project directory:
   ```
   vercel
   ```

4. Follow the prompts to configure your project
5. Set up environment variables when prompted or add them later in the dashboard

## Updating the Deployment

After making changes to your code:

1. Commit your changes to Git
2. Push to your repository
3. Vercel will automatically deploy the new version

## Troubleshooting

### CORS Issues

If you encounter CORS issues with Google Drive images:

1. Check that your application is using the proxy setup in `vite.config.ts`
2. Verify that your Google API key has the appropriate permissions
3. Make sure the Google Drive folder is properly shared and accessible

### Missing Images

If images aren't displaying:

1. Check your browser console for error messages
2. Verify that the Google Drive Folder ID is correct
3. Make sure the images in the folder are properly accessible

### API Rate Limits

Google Drive API has rate limits. If you exceed them:

1. Implement caching for image information
2. Consider using a content delivery network (CDN) for frequently accessed images 