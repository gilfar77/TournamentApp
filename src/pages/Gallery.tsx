import React, { useState, useEffect } from 'react';
import { Image, AlertCircle } from 'lucide-react';
import { GOOGLE_API_KEY, GOOGLE_DRIVE_FOLDER_ID } from '../utils/env';
import Button from '../components/ui/Button';

const Gallery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log environment variables (redacted for security)
    console.log('API Key configured:', GOOGLE_API_KEY ? 'Yes (length: ' + GOOGLE_API_KEY.length + ')' : 'No');
    console.log('Folder ID configured:', GOOGLE_DRIVE_FOLDER_ID || 'No');

    // Check if API key and folder ID look valid
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
      console.error('Invalid or missing API key');
      setError('מפתח API חסר או לא תקין. נא להגדיר את משתני הסביבה');
      return;
    }

    if (!GOOGLE_DRIVE_FOLDER_ID || GOOGLE_DRIVE_FOLDER_ID === 'YOUR_SHARED_FOLDER_ID') {
      console.error('Invalid or missing folder ID');
      setError('מזהה תיקיה חסר או לא תקין. נא להגדיר את משתני הסביבה');
      return;
    }
  }, []);

  // Placeholder dummy images for testing
  const dummyImages = [
    {
      id: '1',
      title: 'Test Image 1',
      url: 'https://placehold.co/600x400?text=Test+Image+1'
    },
    {
      id: '2',
      title: 'Test Image 2',
      url: 'https://placehold.co/600x400?text=Test+Image+2'
    },
    {
      id: '3',
      title: 'Test Image 3',
      url: 'https://placehold.co/600x400?text=Test+Image+3'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Image className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">גלריית תמונות</h1>
        </div>
        
        <div className="bg-error-100 text-error-700 p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">שגיאה בטעינת הגלריה</h2>
          <p className="mb-4">{error}</p>
          
          <div className="bg-gray-100 p-4 rounded-md mt-4 mb-4 text-gray-700 text-sm font-mono">
            <h3 className="font-bold mb-2">הגדרת קונפיגורציה:</h3>
            <p className="mb-2">וודא שהקובץ <code>.env.local</code> קיים בתיקיית הפרויקט הראשית עם הערכים הבאים:</p>
            <pre className="bg-gray-800 text-gray-200 p-3 rounded overflow-x-auto">
              VITE_GOOGLE_API_KEY=המפתח_שלך_כאן<br/>
              VITE_GOOGLE_DRIVE_FOLDER_ID=מזהה_התיקייה_שלך_כאן
            </pre>
            <p className="mt-2">הסבר:</p>
            <ul className="list-disc list-inside ml-2">
              <li>מפתח API: צור במסוף Google Cloud</li>
              <li>מזהה התיקייה: המחרוזת האלפאנומרית בכתובת URL של התיקייה</li>
            </ul>
          </div>
          
          <div className="flex mt-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="mr-4"
            >
              נסה שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Image className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">גלריית תמונות פשוטה</h1>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
          <div>
            <h3 className="text-lg font-semibold text-blue-700">גרסת בדיקה</h3>
            <p className="text-blue-600">
              זוהי גרסת בדיקה של הגלריה עם תמונות פשוטות. 
              משתני הסביבה: 
              API Key: {GOOGLE_API_KEY ? (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY' ? 'לא הוגדר' : 'הוגדר') : 'לא הוגדר'}, 
              Folder ID: {GOOGLE_DRIVE_FOLDER_ID ? (GOOGLE_DRIVE_FOLDER_ID === 'YOUR_SHARED_FOLDER_ID' ? 'לא הוגדר' : 'הוגדר') : 'לא הוגדר'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dummyImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={image.url} 
              alt={image.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
              <p className="text-gray-600">תמונת בדיקה פשוטה</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery; 