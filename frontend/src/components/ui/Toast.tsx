/**
 * Toast Notification - Classic Simon Style
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
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-[#00a74a]/90',
      border: 'border-[#00ff6e]',
      icon: '✓',
    },
    error: {
      bg: 'bg-[#d91e18]/90',
      border: 'border-[#ff3b30]',
      icon: '✕',
    },
    info: {
      bg: 'bg-[#094fb3]/90',
      border: 'border-[#3b7eff]',
      icon: 'i',
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 animate-slide-in max-w-[calc(100vw-1rem)] sm:max-w-md">
      <div 
        className={`${style.bg} ${style.border} border-2 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-lg`}
      >
        <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-white text-sm font-bold">
          {style.icon}
        </span>
        <span className="text-white font-medium text-sm flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
