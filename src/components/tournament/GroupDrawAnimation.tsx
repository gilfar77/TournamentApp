import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatoonNames, Platoon } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface GroupDrawAnimationProps {
  teams: string[];
  onComplete: (groupA: string[], groupB: string[]) => void;
}

const platoonColors: Record<Platoon, string> = {
  [Platoon.PALSAR]: 'bg-sky-200',
  [Platoon.PALCHAN]: 'bg-orange-200',
  [Platoon.PALNAT]: 'bg-white',
  [Platoon.PALSAM]: 'bg-gray-700',
  [Platoon.PALTAZ]: 'bg-blue-800',
  [Platoon.MESAYAAT]: 'bg-black'
};

const platoonTextColors: Record<Platoon, string> = {
  [Platoon.PALSAR]: 'text-sky-900',
  [Platoon.PALCHAN]: 'text-orange-900',
  [Platoon.PALNAT]: 'text-gray-900',
  [Platoon.PALSAM]: 'text-white',
  [Platoon.PALTAZ]: 'text-white',
  [Platoon.MESAYAAT]: 'text-white'
};

const GroupDrawAnimation: React.FC<GroupDrawAnimationProps> = ({ teams, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [groupA, setGroupA] = useState<string[]>([]);
  const [groupB, setGroupB] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shuffledTeams, setShuffledTeams] = useState<string[]>([]);
  const [showInitialTeams, setShowInitialTeams] = useState(true);

  const startDraw = () => {
    setGroupA([]);
    setGroupB([]);
    setCurrentIndex(-1);
    setShowInitialTeams(true);
    setIsDrawing(false);
    setShuffledTeams([...teams].sort(() => Math.random() - 0.5));
  };

  const beginAnimation = () => {
    setShowInitialTeams(false);
    setIsDrawing(true);
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (!isDrawing) return;

    const timeoutId = setTimeout(() => {
      if (currentIndex < shuffledTeams.length) {
        const team = shuffledTeams[currentIndex];
        
        // If group A has 3 teams, all remaining teams go to group B
        if (groupA.length === 3) {
          setGroupB(prev => [...prev, ...shuffledTeams.slice(currentIndex)]);
          setCurrentIndex(shuffledTeams.length);
          setIsDrawing(false);
          return;
        }
        
        // If group B has 3 teams, all remaining teams go to group A
        if (groupB.length === 3) {
          setGroupA(prev => [...prev, ...shuffledTeams.slice(currentIndex)]);
          setCurrentIndex(shuffledTeams.length);
          setIsDrawing(false);
          return;
        }

        // Randomly assign to group A or B
        const assignToGroupA = Math.random() < 0.5 && groupA.length < 3;
        if (assignToGroupA || groupB.length >= 3) {
          setGroupA(prev => [...prev, team]);
        } else {
          setGroupB(prev => [...prev, team]);
        }

        setCurrentIndex(prev => prev + 1);
      } else {
        setIsDrawing(false);
      }
    }, 3500); // Increased delay between team assignments

    return () => clearTimeout(timeoutId);
  }, [currentIndex, shuffledTeams, isDrawing, groupA.length, groupB.length]);

  useEffect(() => {
    startDraw();
  }, []);

  const handleComplete = () => {
    // Convert arrays to simple string arrays before passing to onComplete
    const finalGroupA = [...groupA];
    const finalGroupB = [...groupB];
    onComplete(finalGroupA, finalGroupB);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-8">הגרלת בתים</h2>
        
        {/* Initial teams display */}
        {showInitialTeams && (
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {shuffledTeams.map((team, index) => (
              <motion.div
                key={team}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }} // Slowed down initial appearance
                className={`p-4 rounded-lg shadow-md ${platoonColors[team as Platoon]}`}
              >
                <span className={`text-lg font-medium ${platoonTextColors[team as Platoon]}`}>
                  {PlatoonNames[team as Platoon]}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">בית א׳</h3>
            <div className="space-y-3 min-h-[200px]">
              {groupA.map((team, index) => (
                <motion.div
                  key={team}
                  initial={{ x: -100, y: -200, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 50, // Reduced for slower animation
                    damping: 20, // Increased for less bouncing
                    duration: 2 // Longer duration
                  }}
                  className={`p-4 rounded-lg shadow-sm ${platoonColors[team as Platoon]}`}
                >
                  <span className={`text-lg font-medium ${platoonTextColors[team as Platoon]}`}>
                    {PlatoonNames[team as Platoon]}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">בית ב׳</h3>
            <div className="space-y-3 min-h-[200px]">
              {groupB.map((team, index) => (
                <motion.div
                  key={team}
                  initial={{ x: 100, y: -200, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 50, // Reduced for slower animation
                    damping: 20, // Increased for less bouncing
                    duration: 2 // Longer duration
                  }}
                  className={`p-4 rounded-lg shadow-sm ${platoonColors[team as Platoon]}`}
                >
                  <span className={`text-lg font-medium ${platoonTextColors[team as Platoon]}`}>
                    {PlatoonNames[team as Platoon]}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-center mt-8">
          {showInitialTeams && !isDrawing && (
            <Button
              onClick={beginAnimation}
              variant="primary"
            >
              התחל הגרלה
            </Button>
          )}
          {!showInitialTeams && !isDrawing && (
            <>
              <Button
                onClick={startDraw}
                variant="primary"
                className="ml-4"
              >
                ערבב מחדש
              </Button>
              <Button
                onClick={handleComplete}
                variant="outline"
                className="mr-4"
              >
                סגור
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDrawAnimation;