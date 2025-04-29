import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      setError('אירעה שגיאה בהתחברות. אנא נסה שוב מאוחר יותר.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-secondary-50">
      <Card className="max-w-md w-full space-y-8 p-8 animate-in-up">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-primary-500" />
          <h2 className="mt-6 text-3xl font-bold text-accent-800">מערכת טורנירים</h2>
          <p className="mt-2 text-sm text-accent-600">סיירת כרמלי</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">
              ברוכים הבאים למערכת הטורנירים של סיירת כרמלי
            </p>
            <p className="text-sm text-accent-600 mb-6">
              המערכת מיועדת לחברי היחידה בלבד. יש להתחבר באמצעות חשבון גוגל.
            </p>
          </div>
          
          {error && (
            <div className="rounded-md bg-error-100 p-4">
              <div className="text-sm text-error-700">{error}</div>
            </div>
          )}
          
          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full h-12 px-6 flex items-center justify-center rounded-md
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md active:shadow-sm'}
              transition-shadow duration-150 bg-white shadow border border-gray-200`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-6 h-6 mr-3"
                />
                <span className="text-gray-700 font-medium">התחבר עם Google</span>
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;