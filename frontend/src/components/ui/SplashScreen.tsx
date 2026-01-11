import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 2500 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    // Animate the four colors lighting up
    const colors = [0, 1, 2, 3];
    let index = 0;
    
    const lightInterval = setInterval(() => {
      if (index < colors.length) {
        setActiveIndex(index);
        index++;
      }
    }, 300);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 400);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => {
      clearInterval(lightInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  const colors = [
    { bg: '#00a74a', bright: '#00ff6e', name: 'green' },
    { bg: '#d91e18', bright: '#ff3b30', name: 'red' },
    { bg: '#ffc500', bright: '#ffea00', name: 'yellow' },
    { bg: '#094fb3', bright: '#3b7eff', name: 'blue' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a] transition-opacity duration-400 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Simon colored dots animation */}
        <div className="flex gap-4 mb-8">
          {colors.map((color, i) => (
            <div
              key={color.name}
              className="w-12 h-12 rounded-full transition-all duration-200"
              style={{
                backgroundColor: activeIndex >= i ? color.bright : color.bg,
                boxShadow: activeIndex >= i 
                  ? `0 0 20px ${color.bright}, 0 0 40px ${color.bright}` 
                  : 'none',
                opacity: activeIndex >= i ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        
        {/* Title */}
        <h1 
          className="text-5xl font-bold text-white mb-2 embossed tracking-[0.2em]"
          style={{ fontFamily: "'Audiowide', cursive" }}
        >
          SIMON
        </h1>
        
        <p className="text-gray-500 text-sm uppercase tracking-[0.3em]">
          The Memory Game
        </p>
        
        {/* Loading indicator */}
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-light"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
