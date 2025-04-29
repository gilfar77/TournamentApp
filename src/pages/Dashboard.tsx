import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Trophy, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Shield className="h-8 w-8 text-primary-500 mr-3" />
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-primary-100 p-3 mr-4">
              <Trophy className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">טורנירים פעילים</h3>
              <p className="text-accent-600">צפה בטורנירים הפעילים כרגע</p>
            </div>
          </div>
          <a
            href="/tournaments"
            className="text-primary-500 hover:text-primary-600 font-medium inline-flex items-center"
          >
            צפה בטורנירים
          </a>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-secondary-100 p-3 mr-4">
              <Calendar className="h-6 w-6 text-secondary-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">לוח משחקים</h3>
              <p className="text-accent-600">המשחקים הקרובים שלך</p>
            </div>
          </div>
          <p className="text-accent-600">אין משחקים מתוכננים</p>
        </Card>

        {user?.isAdmin && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-accent-100 p-3 mr-4">
                <Shield className="h-6 w-6 text-accent-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ניהול מערכת</h3>
                <p className="text-accent-600">גישה לפאנל הניהול</p>
              </div>
            </div>
            <a
              href="/admin"
              className="text-primary-500 hover:text-primary-600 font-medium inline-flex items-center"
            >
              פתח פאנל ניהול
            </a>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;