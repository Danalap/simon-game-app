import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING');

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 150);

    // Update status text
    const statuses = ['INITIALIZING', 'LOADING ASSETS', 'SYNCING DATA', 'READY'];
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
      setStatusText(statuses[statusIndex]);
    }, duration / 4);

    // Start fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 500);

    // Complete
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 cyber-grid-animated opacity-50" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center p-8">
        {/* Main Logo */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-[#00f0ff]/30 animate-spin"
            style={{ 
              width: '200px', 
              height: '200px',
              margin: '-25px',
              animationDuration: '8s'
            }}
          />
          
          {/* Inner content */}
          <div className="relative w-[150px] h-[150px] flex items-center justify-center">
            {/* Simon colors arranged in a circle */}
            <div className="absolute inset-0">
              {[
                { color: '#ff3131', angle: 0 },
                { color: '#ffff00', angle: 90 },
                { color: '#39ff14', angle: 180 },
                { color: '#00f0ff', angle: 270 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="absolute w-10 h-10 rounded-full animate-pulse"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 20px ${item.color}, 0 0 40px ${item.color}`,
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${item.angle}deg) translateY(-50px)`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Center text */}
            <div 
              className="text-3xl font-bold text-white z-10"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span className="text-[#00f0ff]">S</span>
              <span className="text-[#ff00ff]">G</span>
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h1 
          className="text-4xl sm:text-5xl font-bold mb-2"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <span className="text-[#00f0ff] text-glow-cyan">SIM</span>
          <span className="text-[#ff00ff] text-glow-pink">ON</span>
        </h1>
        
        <p 
          className="text-gray-500 text-sm tracking-[0.3em] mb-8 uppercase"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Neural Link Edition
        </p>
        
        {/* Loading bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff00ff] transition-all duration-150 rounded-full"
            style={{ 
              width: `${Math.min(loadingProgress, 100)}%`,
              boxShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff'
            }}
          />
        </div>
        
        {/* Status text */}
        <p 
          className="text-[#00f0ff] text-xs tracking-[0.2em]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {statusText}
          <span className="animate-pulse">_</span>
        </p>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#00f0ff]/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#00f0ff]/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#ff00ff]/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#ff00ff]/30" />
    </div>
  );
};
