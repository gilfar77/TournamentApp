import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home: React.FC = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'טורנירים מהנים',
      description: 'השתתפו במגוון טורנירי ספורט מלהיבים ביום הכיף של היחידה',
      icon: <Trophy className="h-10 w-10 text-primary-500" />,
    },
    {
      title: 'תחרות קבוצתית',
      description: 'התחרו בין המחלקות והפלוגות השונות בתחרויות ספורט מגוונות',
      icon: <Users className="h-10 w-10 text-primary-500" />,
    },
    {
      title: 'לוח זמנים נוח',
      description: 'צפו בלוח המשחקים ועקבו אחר התוצאות בזמן אמת',
      icon: <Calendar className="h-10 w-10 text-primary-500" />,
    },
  ];

  return (
    <div className="bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-primary-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white animate-in-up">
                יום ספורט סיירת כרמלי
              </h1>
              <p className="text-xl text-secondary-300 mb-8 animate-in-up" style={{ animationDelay: '100ms' }}>
                ברוכים הבאים למערכת הטורנירים של יום הספורט! בואו להתחרות, ליהנות ולהוכיח מי הפלוגה הספורטיבית ביותר
              </p>
              <div className="animate-in-up" style={{ animationDelay: '200ms' }}>
                {user ? (
                  <Button 
                    onClick={() => navigate('/tournaments')} 
                    variant="secondary" 
                    size="lg"
                    rightIcon={<Trophy className="h-5 w-5" />}
                  >
                    צפה בטורנירים
                  </Button>
                ) : (
                  <Button 
                    onClick={signIn} 
                    variant="secondary" 
                    size="lg"
                  >
                    התחברות למערכת
                  </Button>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center animate-in-up" style={{ animationDelay: '300ms' }}>
              <div className="w-72 h-72 flex items-center justify-center">
                <img 
                  src="/logo_sport.png" 
                  alt="סיירת כרמלי" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Shape Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="absolute bottom-0 w-full h-full"
          >
            <path 
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
              className="fill-secondary-50"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">מה מחכה לכם?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center p-8 animate-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-accent-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">מוכנים להתחרות?</h2>
          <p className="text-xl text-accent-600 mb-8 max-w-2xl mx-auto">
            הצטרפו אלינו ליום של ספורט, תחרות והנאה!
          </p>
          {user ? (
            <Button 
              onClick={() => navigate('/tournaments')} 
              variant="primary" 
              size="lg"
            >
              צפה בטורנירים
            </Button>
          ) : (
            <Button 
              onClick={signIn} 
              variant="primary" 
              size="lg"
            >
              התחברות למערכת
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;