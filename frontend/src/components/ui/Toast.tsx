/**
 * Toast Notification Component - Cyber Tech Edition
 * 
 * Shows temporary success/error messages with neon styling
 */

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      border: 'border-[#39ff14]',
      bg: 'bg-[#39ff14]/10',
      text: 'text-[#39ff14]',
      glow: '0 0 15px rgba(57, 255, 20, 0.3)',
      icon: '✓',
    },
    error: {
      border: 'border-[#ff3131]',
      bg: 'bg-[#ff3131]/10',
      text: 'text-[#ff3131]',
      glow: '0 0 15px rgba(255, 49, 49, 0.3)',
      icon: '✕',
    },
    info: {
      border: 'border-[#00f0ff]',
      bg: 'bg-[#00f0ff]/10',
      text: 'text-[#00f0ff]',
      glow: '0 0 15px rgba(0, 240, 255, 0.3)',
      icon: 'i',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-md">
      <div 
        className={`
          ${style.bg} ${style.border} border-2 backdrop-blur-md
          text-white px-4 sm:px-5 py-3 sm:py-4 rounded-lg 
          flex items-center gap-3 min-w-[280px] sm:min-w-[320px]
        `}
        style={{ 
          boxShadow: style.glow,
          fontFamily: 'Rajdhani, sans-serif',
        }}
      >
        {/* Icon */}
        <span 
          className={`
            ${style.text} ${style.border} border-2 
            w-7 h-7 rounded-full flex items-center justify-center 
            text-sm font-bold flex-shrink-0
          `}
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {style.icon}
        </span>
        
        {/* Message */}
        <span className="font-medium text-sm sm:text-base flex-1 text-gray-100">
          {message}
        </span>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
