/**
 * Mute Button - Classic Simon Style
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
        transition-all duration-150
        classic-btn
        ${isMuted ? '' : 'bg-[#00a74a]/20 border-[#00a74a]'}
      `}
      style={{ touchAction: 'manipulation' }}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
    </button>
  );
};

export default MuteButton;
