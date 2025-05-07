import React, { useState, useEffect } from 'react';
import { Image, X, ArrowLeft, ArrowRight, Download, ChevronLeft, ChevronRight, Folder, ChevronUp, FolderOpen } from 'lucide-react';
import { 
  fetchImagesFromDrive, 
  GalleryImage, 
  getImageDownloadUrl, 
  checkFolderAccess,
  getImageViewUrl,
  PaginationOptions,
  DriveFolder
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

// Available page size options
const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];

// Interface for storing folder navigation history with complete context
interface FolderHistoryItem {
  folder: DriveFolder;
  path: string[];
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [configValid, setConfigValid] = useState(true);
  
  // Folder navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string>(GOOGLE_DRIVE_FOLDER_ID);
  const [currentFolder, setCurrentFolder] = useState<DriveFolder | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<FolderHistoryItem[]>([]);
  const [folderPaths, setFolderPaths] = useState<string[]>([]);
  
  // Pagination state
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [pageTokenHistory, setPageTokenHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100); // Default page size of 100 items

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== pageSize) {
      setPageSize(newSize);
      // Reset pagination state and reload with new page size
      setPageToken(undefined);
      setNextPageToken(undefined);
      setPageTokenHistory([]);
      setCurrentPage(1);
      fetchContent({ pageSize: newSize });
    }
  };

  const fetchContent = async (options: PaginationOptions = {}) => {
    try {
      setLoading(true);
      
      // Use provided page size or default to state value
      const size = options.pageSize || pageSize;
      
      // Fetch images with pagination
      const response = await fetchImagesFromDrive(currentFolderId, undefined, {
        pageSize: size,
        pageToken: options.pageToken
      });
      
      setImages(response.images);
      setFolders(response.folders);
      setNextPageToken(response.nextPageToken);
      
      // Update current folder information
      if (response.currentFolder) {
        setCurrentFolder(response.currentFolder);
        
        // Update folder paths based on history
        const paths = folderHistory.map(item => item.folder.name);
        if (response.currentFolder.name) {
          paths.push(response.currentFolder.name);
        }
        setFolderPaths(paths);
      }
      
      // If we're not going back, add the current token to history
      if (!options.isBack) {
        // If we're moving to a new page (not initial load with no token)
        if (pageToken) {
          setPageTokenHistory(prev => [...prev, pageToken]);
        }
      }
      
      console.log(`Fetched ${response.images.length} images and ${response.folders.length} folders. Next page token: ${response.nextPageToken || 'none'}`);
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('אירעה שגיאה בטעינת התמונות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const validateAndFetchContent = async () => {
      try {
        setLoading(true);

        // Log environment variables (redacted for security)
        console.log('API Key configured:', GOOGLE_API_KEY ? 'Yes (length: ' + GOOGLE_API_KEY.length + ')' : 'No');
        console.log('Folder ID:', currentFolderId);

        // Check if API key and folder ID look valid
        if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
          console.error('Invalid or missing API key');
          setConfigValid(false);
          setError('מפתח API חסר או לא תקין. נא להגדיר את משתני הסביבה');
          return;
        }

        if (!currentFolderId) {
          console.error('Invalid or missing folder ID');
          setConfigValid(false);
          setError('מזהה תיקיה חסר או לא תקין.');
          return;
        }

        // Check if we can access the folder
        const folderAccessible = await checkFolderAccess(currentFolderId);
        if (!folderAccessible) {
          setConfigValid(false);
          setError('לא ניתן לגשת לתיקיית Google Drive. אנא ודא שהתיקייה משותפת עם הרשאות מתאימות');
          return;
        }

        // Folder access is valid, now fetch content
        await fetchContent({ pageSize: pageSize });
      } catch (err) {
        console.error('Error in validateAndFetchContent:', err);
        setError('אירעה שגיאה בטעינת התמונות');
      } finally {
        setLoading(false);
      }
    };

    validateAndFetchContent();
  }, [currentFolderId]); // Re-fetch when changing folders

  // Navigate to a subfolder
  const navigateToFolder = (folder: DriveFolder) => {
    // Add current folder to history
    if (currentFolder) {
      const currentPath = [...folderPaths];
      
      setFolderHistory([
        ...folderHistory, 
        { 
          folder: currentFolder,
          path: currentPath
        }
      ]);
    }
    
    // Update current folder and reset pagination
    setCurrentFolderId(folder.id);
    setPageToken(undefined);
    setNextPageToken(undefined);
    setPageTokenHistory([]);
    setCurrentPage(1);
  };

  // Navigate to parent/previous folder
  const navigateBack = () => {
    if (folderHistory.length > 0) {
      // Get the last folder from history
      const previousFolders = [...folderHistory];
      const previousItem = previousFolders.pop()!;
      
      // Update state
      setFolderHistory(previousFolders);
      setCurrentFolderId(previousItem.folder.id);
      setFolderPaths(previousItem.path);
      setPageToken(undefined);
      setNextPageToken(undefined);
      setPageTokenHistory([]);
      setCurrentPage(1);
    }
  };

  // Navigate to root folder
  const navigateToRoot = () => {
    setFolderHistory([]);
    setFolderPaths([]);
    setCurrentFolderId(GOOGLE_DRIVE_FOLDER_ID);
    setPageToken(undefined);
    setNextPageToken(undefined);
    setPageTokenHistory([]);
    setCurrentPage(1);
  };

  // Navigate to a specific folder in the breadcrumb path
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      // Navigate to root
      navigateToRoot();
      return;
    }
    
    // Get the history up to the selected point
    const newHistory = folderHistory.slice(0, index);
    const targetFolder = folderHistory[index];
    
    setFolderHistory(newHistory);
    setCurrentFolderId(targetFolder.folder.id);
    setFolderPaths(targetFolder.path);
    setPageToken(undefined);
    setNextPageToken(undefined);
    setPageTokenHistory([]);
    setCurrentPage(1);
  };

  // Handle navigation to next page
  const handleNextPage = () => {
    if (nextPageToken) {
      setPageToken(nextPageToken);
      setCurrentPage(prev => prev + 1);
      fetchContent({ pageToken: nextPageToken });
    }
  };

  // Handle navigation to previous page
  const handlePrevPage = () => {
    if (pageTokenHistory.length > 0) {
      // Get the previous page token
      const prevTokens = [...pageTokenHistory];
      const prevPageToken = prevTokens.length > 1 ? prevTokens[prevTokens.length - 2] : undefined;
      
      // Remove the last token from history
      prevTokens.pop();
      setPageTokenHistory(prevTokens);
      
      // Go back to the previous page
      setPageToken(prevPageToken);
      setCurrentPage(prev => prev - 1);
      fetchContent({ pageToken: prevPageToken, isBack: true });
    } else if (currentPage > 1) {
      // If there's no history but we're not on the first page, go to first page
      setPageToken(undefined);
      setCurrentPage(1);
      fetchContent({ pageToken: undefined, isBack: true });
    }
  };

  // Handle reset to first page
  const handleFirstPage = () => {
    if (currentPage !== 1) {
      setPageToken(undefined);
      setPageTokenHistory([]);
      setCurrentPage(1);
      fetchContent({ pageToken: undefined });
    }
  };

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

  if (loading && images.length === 0 && folders.length === 0) {
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

  // Render breadcrumb navigation
  const Breadcrumbs = () => {
    if (!currentFolder) return null;
    
    return (
      <div className="flex items-center text-sm mb-4 overflow-x-auto pb-2 whitespace-nowrap">
        <button 
          onClick={navigateToRoot}
          className="flex items-center text-primary-600 hover:text-primary-800 mr-1"
        >
          <FolderOpen className="h-4 w-4 mr-1" />
          <span>תיקייה ראשית</span>
        </button>
        
        {folderHistory.map((item, index) => (
          <React.Fragment key={item.folder.id}>
            <span className="mx-1 text-gray-500">/</span>
            <button 
              onClick={() => navigateToBreadcrumb(index)}
              className="flex items-center text-primary-600 hover:text-primary-800"
            >
              {item.folder.name}
            </button>
          </React.Fragment>
        ))}
        
        {currentFolder && (
          <>
            <span className="mx-1 text-gray-500">/</span>
            <span className="font-semibold text-gray-800">{currentFolder.name}</span>
          </>
        )}
      </div>
    );
  };

  // Render pagination controls
  const PaginationControls = () => (
    <div className="flex flex-wrap justify-center items-center mt-8 mb-4">
      <div className="flex items-center bg-white rounded-lg shadow">
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 text-primary-600 border-r border-gray-200 ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'
          }`}
        >
          <span>ראשון</span>
        </button>
        
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 text-primary-600 border-r border-gray-200 ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'
          }`}
        >
          <ChevronRight className="h-5 w-5 ml-1" />
          <span>הקודם</span>
        </button>
        
        <div className="px-4 py-2 text-gray-700">
          עמוד {currentPage} {nextPageToken ? '...' : ''}
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={!nextPageToken}
          className={`flex items-center px-4 py-2 text-primary-600 border-l border-gray-200 ${
            !nextPageToken ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-50'
          }`}
        >
          <span>הבא</span>
          <ChevronLeft className="h-5 w-5 mr-1" />
        </button>
      </div>
      
      {loading && (
        <div className="ml-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      <div className="ml-4 flex items-center">
        <label htmlFor="page-size" className="mr-2 text-gray-600 text-sm">תמונות בעמוד:</label>
        <select 
          id="page-size" 
          value={pageSize}
          onChange={handlePageSizeChange}
          className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Render folder grid
  const FolderGrid = () => {
    if (folders.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">תיקיות ({folders.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folderHistory.length > 0 && (
            <button
              onClick={navigateBack}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronUp className="h-12 w-12 text-gray-500 mb-2" />
              <span className="text-gray-700">חזור אחורה</span>
            </button>
          )}
          
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => navigateToFolder(folder)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Folder className="h-12 w-12 text-yellow-500 mb-2" />
              <span className="text-gray-800 text-center text-sm truncate w-full">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Image className="h-8 w-8 text-primary-500 mr-3" />
          <h1 className="text-3xl font-bold">גלריית תמונות</h1>
        </div>
        
        <div className="text-sm text-gray-600">
          {images.length > 0 ? (
            <span>מציג {images.length} תמונות מתוך {currentPage > 1 || nextPageToken ? 'יותר מ-' : ''}{(currentPage - 1) * pageSize + images.length}</span>
          ) : null}
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <Breadcrumbs />

      {/* Folder grid */}
      <FolderGrid />

      {images.length === 0 && folders.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl">תיקייה ריקה</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>אין תמונות בתיקייה זו</p>
        </div>
      ) : (
        <>
          {/* Pagination controls - top */}
          <PaginationControls />
        
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

          {/* Pagination controls - bottom */}
          <PaginationControls />

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
                    onError={(e) => {
                      // Fallback to direct URL if proxy fails
                      const target = e.target as HTMLImageElement;
                      if (target.src !== image.thumbnailUrl) {
                        target.src = image.thumbnailUrl;
                      } else {
                        // If both fail, show placeholder
                        target.src = `https://placehold.co/600x400?text=${encodeURIComponent(image.name)}`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-all duration-300">
                    <h3 className="text-lg font-semibold">{image.name}</h3>
                    {image.description && <p className="text-sm">{image.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom pagination for thumbnail view */}
            <PaginationControls />
          </div>
        </>
      )}
    </div>
  );
};

export default Gallery; 