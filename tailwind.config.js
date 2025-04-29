/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF2F0',
          100: '#D9E0DB',
          200: '#B3C1B7',
          300: '#8DA293',
          400: '#678370',
          500: '#4D5D53', // Main primary
          600: '#3E4A42',
          700: '#2E3832',
          800: '#1F2521',
          900: '#0F1311',
        },
        secondary: {
          50: '#F9F8F5',
          100: '#F2F0EB',
          200: '#E9E5DD',
          300: '#E0DACF',
          400: '#D5CDB6', // Main secondary
          500: '#C7BC9E',
          600: '#B9AB86',
          700: '#A8976C',
          800: '#8D7F5C',
          900: '#73674B',
        },
        accent: {
          50: '#F1F2F2',
          100: '#E3E5E6',
          200: '#C7CBCD',
          300: '#ABB1B4',
          400: '#8F979B',
          500: '#71797E', // Main accent
          600: '#5B6165',
          700: '#45494C',
          800: '#2E3032',
          900: '#171819',
        },
        success: {
          100: '#D3EFDA',
          500: '#2E7D32',
          700: '#1B5E20',
        },
        warning: {
          100: '#FFF3CD',
          500: '#F57C00',
          700: '#E65100',
        },
        error: {
          100: '#F8D7DA',
          500: '#D32F2F',
          700: '#B71C1C',
        },
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', '1.125rem'],    // 12px with 18px line height (150%)
        sm: ['0.875rem', '1.3125rem'],  // 14px with 21px line height (150%)
        base: ['1rem', '1.5rem'],       // 16px with 24px line height (150%)
        lg: ['1.125rem', '1.6875rem'],  // 18px with 27px line height (150%)
        xl: ['1.25rem', '1.875rem'],    // 20px with 30px line height (150%)
        '2xl': ['1.5rem', '1.8rem'],    // 24px with 28.8px line height (120%)
        '3xl': ['1.875rem', '2.25rem'], // 30px with 36px line height (120%)
        '4xl': ['2.25rem', '2.7rem'],   // 36px with 43.2px line height (120%)
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        header: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};