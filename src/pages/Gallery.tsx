import React, { useState, useEffect } from 'react';
import { Image, X, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { 
  fetchImagesFromDrive, 
  GalleryImage, 
  getImageDownloadUrl, 
  checkFolderAccess,
  getImageViewUrl
} from '../services/googleDriveService';
import { GOOGLE_API_KEY, GOOGLE_DRIVE_FOLDER_ID } from '../utils/env';
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import Button from '../components/ui/Button';

// You might need to add these CSS imports to override some styles if needed
// @import 'react-image-gallery/styles/css/image-gallery.css';

// Modified function to handle image errors
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const img = e.target as HTMLImageElement;
  const fileId = img.dataset.fileId;
  
  // Check if we've already tried alternative URLs to prevent infinite loops
  if (fileId && !img.dataset.triedFallback) {
    console.log(`Image failed to load, trying placeholder for: ${fileId}`);
    
    // Mark that we've tried a fallback for this image
    img.dataset.triedFallback = 'true';
    
    // Use a placeholder image
    img.src = `https://placehold.co/400x300?text=Image+Unavailable`;
  }
};

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [configValid, setConfigValid] = useState(true);

  useEffect(() => {
    const validateAndFetchImages = async () => {
      try {
        setLoading(true);

        // Log environment variables (redacted for security)
        console.log('API Key configured:', GOOGLE_API_KEY ? 'Yes (length: ' + GOOGLE_API_KEY.length + ')' : 'No');
        console.log('Folder ID configured:', GOOGLE_DRIVE_FOLDER_ID || 'No');

        // Check if API key and folder ID look valid
        if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
          console.error('Invalid or missing API key');
          setConfigValid(false);
          setError('מפתח API חסר או לא תקין. נא להגדיר את משתני הסביבה');
          return;
        }

        if (!GOOGLE_DRIVE_FOLDER_ID || GOOGLE_DRIVE_FOLDER_ID === 'YOUR_SHARED_FOLDER_ID') {
          console.error('Invalid or missing folder ID');
          setConfigValid(false);
          setError('מזהה תיקיה חסר או לא תקין. נא להגדיר את משתני הסביבה');
          return;
        }

        // Check if we can access the folder
        const folderAccessible = await checkFolderAccess();
        if (!folderAccessible) {
          setConfigValid(false);
          setError('לא ניתן לגשת לתיקיית Google Drive. אנא ודא שהתיקייה משותפת עם הרשאות מתאימות');
          return;
        }

        // Folder access is valid, now fetch images
        const driveImages = await fetchImagesFromDrive();
        setImages(driveImages);
        setError(null);
      } catch (err) {
        console.error('Error in validateAndFetchImages:', err);
        setError('אירעה שגיאה בטעינת התמונות');
      } finally {
        setLoading(false);
      }
    };

    validateAndFetchImages();
  }, []);

  const galleryItems = images.map(image => ({
    // Use proxy URLs to avoid CORS issues
    original: image.proxyImageUrl || image.thumbnailLink.replace('=s220', '=s1000'),
    thumbnail: image.proxyThumbnailUrl || image.thumbnailLink,
    description: image.name,
    originalAlt: image.description || image.name,
    thumbnailAlt: image.description || image.name,
    originalTitle: image.name,
    thumbnailTitle: image.name,
    originalHeight: '600px',
    thumbnailHeight: '80px',
    // Add data attributes for error handling
    dataFileId: image.id,
    // Custom data to pass through
    customData: { 
      id: image.id,
      createdTime: image.createdTime,
      description: image.description
    }
  }));

  const openLightbox = (index: number) => {
    setSelectedImage(images[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const downloadImage = (image: GalleryImage) => {
    // Open the image directly in Google Drive for download
    window.open(`https://drive.google.com/file/d/${image.id}/view`, '_blank');
  };

  const handleImageClick = (event: React.MouseEvent) => {
    // Prevent default navigation
    event.preventDefault();
  };

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
          
          {!configValid && (
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
          )}
          
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
          <h1 className="text-3xl font-bold">גלריית תמונות</h1>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl">לא נמצאו תמונות</p>
        </div>
      ) : (
        <div className="relative">
          <ImageGallery
            items={galleryItems}
            showPlayButton={false}
            showFullscreenButton={false}
            showIndex={true}
            renderItem={(item) => (
              <div className="image-gallery-image" style={{ height: '600px', width: '100%', backgroundColor: '#f0f0f0' }}>
                <img
                  src={item.original}
                  alt={item.originalAlt}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '600px' }}
                  data-file-id={item.customData?.id}
                  onError={handleImageError}
                  onClick={handleImageClick}
                />
                {item.description && (
                  <span className="image-gallery-description">{item.description}</span>
                )}
              </div>
            )}
            onScreenChange={(fullScreenEnabled: boolean) => {
              console.log('fullscreen', fullScreenEnabled);
            }}
            onSlide={(currentIndex: number) => {
              console.log('slide to', currentIndex);
              // Update selected image when slide changes
              setSelectedImage(images[currentIndex]);
            }}
            additionalClass="gallery-custom-class"
            renderCustomControls={() => (
              selectedImage && (
                <button 
                  className="image-gallery-custom-action" 
                  onClick={() => downloadImage(selectedImage)}
                >
                  <Download className="h-6 w-6 text-white" />
                </button>
              )
            )}
          />
        </div>
      )}

      {/* Thumbnail Grid View (Alternative) */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">כל התמונות</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg"
              onClick={() => openLightbox(index)}
            >
              <img 
                src={image.proxyThumbnailUrl || image.thumbnailLink}
                alt={image.name}
                className="w-full h-48 object-cover"
                data-file-id={image.id}
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-sm font-semibold truncate">{image.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
            onClick={() => {
              const currentIndex = images.findIndex(img => img.id === selectedImage.id);
              const prevIndex = (currentIndex - 1 + images.length) % images.length;
              setSelectedImage(images[prevIndex]);
            }}
          >
            <ArrowLeft className="h-8 w-8" />
          </button>

          <div className="w-[90vw] h-[80vh] flex items-center justify-center bg-gray-800">
            <img 
              src={selectedImage.proxyImageUrl || selectedImage.thumbnailLink.replace('=s220', '=s1000')}
              alt={selectedImage.description || selectedImage.name}
              className="max-h-[80vh] max-w-[90vw] object-contain"
              data-file-id={selectedImage.id}
              onError={handleImageError}
              onClick={handleImageClick}
            />
          </div>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
            onClick={() => {
              const currentIndex = images.findIndex(img => img.id === selectedImage.id);
              const nextIndex = (currentIndex + 1) % images.length;
              setSelectedImage(images[nextIndex]);
            }}
          >
            <ArrowRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-8 left-0 right-0 text-center text-white">
            <h3 className="text-xl font-bold">{selectedImage.name}</h3>
            {selectedImage.description && (
              <p className="mt-2">{selectedImage.description}</p>
            )}
            <div className="mt-4 flex justify-center space-x-4">
              <a 
                href={`https://drive.google.com/file/d/${selectedImage.id}/view`}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
              >
                פתח ב-Google Drive
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery; 