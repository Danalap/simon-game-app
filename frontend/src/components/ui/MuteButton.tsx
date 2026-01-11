/**
 * Mute Button Component - Cyber Tech Edition
 * 
 * Toggle button for muting/unmuting game sounds.
 * Persists preference in localStorage.
 */

import { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';

export const MuteButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundService.getMuted());

  useEffect(() => {
    setIsMuted(soundService.getMuted());
  }, []);

  const handleToggle = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        fixed top-4 right-4 z-50
        w-12 h-12 rounded-lg
        flex items-center justify-center
        transition-all duration-200
        backdrop-blur-sm
        border-2
        ${isMuted 
          ? 'bg-gray-800/80 border-gray-600 hover:border-gray-400' 
          : 'bg-[#39ff14]/10 border-[#39ff14] hover:bg-[#39ff14]/20'}
        active:scale-95
      `}
      style={{ 
        touchAction: 'manipulation',
        boxShadow: isMuted ? 'none' : '0 0 15px rgba(57, 255, 20, 0.3)',
      }}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      {isMuted ? (
        <svg 
          className="w-6 h-6 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" 
          />
        </svg>
      ) : (
        <svg 
          className="w-6 h-6 text-[#39ff14]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          style={{ filter: 'drop-shadow(0 0 3px #39ff14)' }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
          />
        </svg>
      )}
    </button>
  );
};

export default MuteButton;
