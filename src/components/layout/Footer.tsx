import React from 'react';
import { APP_VERSION_WITH_DATE } from '../../utils/version';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/logo_sport.png" 
                alt="סיירת כרמלי" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-lg mr-2">יום ספורט סיירת כרמלי</span>
          </div>
          
          <div className="text-sm text-primary-200">
            <p className="relative group">
              © {currentYear} כל הזכויות שמורות לגיל פרטוק - סיירת כרמלי
              <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                bg-primary-900 text-white text-xs rounded py-1 px-2 -mt-16 md:mt-0 md:-mr-24 right-0 bottom-full mb-2">
                {APP_VERSION_WITH_DATE}
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer