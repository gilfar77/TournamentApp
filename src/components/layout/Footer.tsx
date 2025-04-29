import React from 'react';

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
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </div>
            <span className="font-bold text-lg mr-2">יום ספורט סיירת כרמלי</span>
          </div>
          
          <div className="text-sm text-primary-200">
            <p>© {currentYear} כל הזכויות שמורות לסיירת כרמלי</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;