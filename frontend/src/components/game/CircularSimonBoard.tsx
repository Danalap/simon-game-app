/**
 * Circular Simon Board Component - Cyber Tech Edition
 * 
 * Futuristic circular Simon game with neon glow effects using SVG paths.
 */

import { useState, useEffect, useRef } from 'react';
import type { Color } from '../../shared/types';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface CircularSimonBoardProps {
  sequence: Color[];
  round: number;
  isShowingSequence: boolean;
  isInputPhase: boolean;
  playerSequence: Color[];
  canSubmit: boolean;
  lastResult: { isCorrect: boolean; playerName: string } | null;
  onColorClick: (color: Color) => void;
  onSubmit: () => void;
  disabled?: boolean;
  secondsRemaining: number;
  timerColor: 'green' | 'yellow' | 'red';
  isTimerPulsing: boolean;
}

// =============================================================================
// SVG PATH HELPER
// =============================================================================

function createWedgePath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + outerRadius * Math.cos(startRad);
  const y1 = centerY + outerRadius * Math.sin(startRad);
  const x2 = centerX + outerRadius * Math.cos(endRad);
  const y2 = centerY + outerRadius * Math.sin(endRad);
  const x3 = centerX + innerRadius * Math.cos(endRad);
  const y3 = centerY + innerRadius * Math.sin(endRad);
  const x4 = centerX + innerRadius * Math.cos(startRad);
  const y4 = centerY + innerRadius * Math.sin(startRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${x1} ${y1}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
    Z
  `;
}

// =============================================================================
// WEDGE COMPONENT
// =============================================================================

interface WedgeProps {
  color: Color;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  startAngle: number;
  endAngle: number;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
}

const ColorWedge: React.FC<WedgeProps> = ({
  color,
  isActive,
  onClick,
  disabled,
  startAngle,
  endAngle,
  centerX,
  centerY,
  innerRadius,
  outerRadius,
}) => {
  // Cyber neon colors
  const colors: Record<Color, { dim: string; bright: string; glow: string }> = {
    green: { dim: '#0a3d1f', bright: '#39ff14', glow: '#39ff14' },
    red: { dim: '#3d0a0a', bright: '#ff3131', glow: '#ff3131' },
    yellow: { dim: '#3d3d0a', bright: '#ffff00', glow: '#ffff00' },
    blue: { dim: '#0a1a3d', bright: '#00f0ff', glow: '#00f0ff' },
  };

  const wedgeColor = colors[color];
  const fillColor = isActive ? wedgeColor.bright : wedgeColor.dim;

  const path = createWedgePath(
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
  );

  return (
    <path
      d={path}
      fill={fillColor}
      stroke="#1a1a2e"
      strokeWidth="3"
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'fill 0.1s ease, filter 0.1s ease, transform 0.1s ease',
        filter: isActive 
          ? `brightness(1.5) drop-shadow(0 0 20px ${wedgeColor.glow}) drop-shadow(0 0 40px ${wedgeColor.glow}) drop-shadow(0 0 60px ${wedgeColor.glow})` 
          : 'brightness(1)',
        transformOrigin: `${centerX}px ${centerY}px`,
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        opacity: disabled ? 0.4 : 1,
      }}
      role="button"
      aria-label={`${color} button`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    />
  );
};

// =============================================================================
// CIRCULAR SIMON BOARD COMPONENT
// =============================================================================

export const CircularSimonBoard: React.FC<CircularSimonBoardProps> = ({
  sequence,
  round,
  isShowingSequence,
  isInputPhase,
  playerSequence,
  canSubmit,
  onColorClick,
  onSubmit,
  disabled = false,
  secondsRemaining,
  timerColor,
  isTimerPulsing,
}) => {
  const [activeColor, setActiveColor] = useState<Color | null>(null);

  // SVG dimensions
  const size = 320;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 15;
  const innerRadius = size * 0.2;
  const gapAngle = 5;

  // Wedge angles
  const wedges: { color: Color; start: number; end: number }[] = [
    { color: 'green', start: 180 + gapAngle / 2, end: 270 - gapAngle / 2 },
    { color: 'red', start: 270 + gapAngle / 2, end: 360 - gapAngle / 2 },
    { color: 'yellow', start: 90 + gapAngle / 2, end: 180 - gapAngle / 2 },
    { color: 'blue', start: 0 + gapAngle / 2, end: 90 - gapAngle / 2 },
  ];

  const [sequenceIndex, setSequenceIndex] = useState<number>(-1);
  const audioInitialized = useRef(false);
  const sequenceRef = useRef<Color[]>(sequence);
  sequenceRef.current = sequence;

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      if (!audioInitialized.current) {
        await soundService.init();
        audioInitialized.current = true;
      }
    };

    initAudio();

    const handleClick = () => {
      initAudio();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Animate sequence
  useEffect(() => {
    if (!isShowingSequence || sequence.length === 0) {
      setActiveColor(null);
      setSequenceIndex(-1);
      return;
    }

    const sequenceLength = sequence.length;
    const sequenceToShow = [...sequence];
    const currentRound = round;
    
    if (sequenceLength === 0) {
      console.error(`🎨 ERROR: Empty sequence for round ${currentRound}`);
      return;
    }

    const SHOW_DURATION = 600;
    const SHOW_GAP = 200;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const showNextColor = () => {
      if (isCancelled || currentIndex >= sequenceLength) {
        setActiveColor(null);
        setSequenceIndex(-1);
        return;
      }

      const color = sequenceToShow[currentIndex];
      setActiveColor(color);
      setSequenceIndex(currentIndex);

      soundService.playColor(color, SHOW_DURATION / 1000);

      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      setTimeout(() => {
        if (isCancelled) return;
        
        setActiveColor(null);
        currentIndex++;
        
        if (!isCancelled && currentIndex < sequenceLength) {
          timeoutId = setTimeout(showNextColor, SHOW_GAP);
        } else {
          setActiveColor(null);
          setSequenceIndex(-1);
        }
      }, SHOW_DURATION);
    };

    timeoutId = setTimeout(showNextColor, 500);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      setActiveColor(null);
      setSequenceIndex(-1);
    };
  }, [isShowingSequence, sequence, round]);

  // Handle color button click
  const handleColorClick = (color: Color) => {
    if (disabled || isShowingSequence || !isInputPhase) return;

    soundService.playColorClick(color);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 150);
    onColorClick(color);
  };

  // Get color indicator
  const getColorIndicator = (color: Color): string => {
    const indicators: Record<Color, string> = {
      red: '🔴',
      blue: '🔵',
      yellow: '🟡',
      green: '🟢',
    };
    return indicators[color];
  };

  // Timer colors
  const timerColors = {
    green: '#39ff14',
    yellow: '#ffff00',
    red: '#ff3131',
  };

  return (
    <div className="game-area flex flex-col items-center gap-4 w-full">
      {/* Round Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#00f0ff]" />
          <h2 
            className="text-2xl font-bold text-[#00f0ff]"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            ROUND {round}
          </h2>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#00f0ff]" />
        </div>
        
        {isShowingSequence ? (
          <div className="bg-[#ffff00]/10 border border-[#ffff00]/50 rounded-lg px-4 py-2 animate-pulse">
            <p 
              className="text-[#ffff00] font-bold text-sm uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              ◉ Memorize Pattern
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            {disabled 
              ? '👁 Spectating' 
              : isInputPhase
                ? '⚡ Input Sequence' 
                : '✓ Ready'}
          </p>
        )}
      </div>

      {/* Timer Display */}
      {isInputPhase && secondsRemaining > 0 && (
        <div className="flex flex-col items-center">
          <div 
            className={`font-bold transition-all duration-200 ${isTimerPulsing ? 'animate-pulse scale-110' : ''}`}
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              color: timerColors[timerColor],
              textShadow: `0 0 10px ${timerColors[timerColor]}, 0 0 20px ${timerColors[timerColor]}`,
              fontSize: secondsRemaining <= 5 ? '3rem' : secondsRemaining <= 10 ? '2.5rem' : '2rem',
            }}
          >
            {secondsRemaining}
          </div>
          <div 
            className="text-xs uppercase tracking-wider mt-1"
            style={{ color: timerColors[timerColor], fontFamily: 'Orbitron, sans-serif' }}
          >
            Seconds
          </div>
        </div>
      )}

      {/* SVG Circular Simon Board */}
      <div className="relative w-full max-w-[min(85vw,340px)] mx-auto">
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 animate-pulse"
          style={{
            background: `radial-gradient(circle, transparent 60%, ${activeColor ? 
              (activeColor === 'green' ? '#39ff14' : activeColor === 'red' ? '#ff3131' : activeColor === 'yellow' ? '#ffff00' : '#00f0ff') 
              : '#00f0ff'} 100%)`,
            filter: 'blur(20px)',
          }}
        />
        
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto relative z-10"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Definitions for filters */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 8}
            fill="#0a0a0f"
            stroke="#1a1a2e"
            strokeWidth="2"
          />

          {/* Colored wedges */}
          {wedges.map((wedge) => (
            <ColorWedge
              key={wedge.color}
              color={wedge.color}
              isActive={activeColor === wedge.color}
              onClick={() => handleColorClick(wedge.color)}
              disabled={disabled || isShowingSequence || !isInputPhase}
              startAngle={wedge.start}
              endAngle={wedge.end}
              centerX={centerX}
              centerY={centerY}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
            />
          ))}

          {/* Center hub */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 3}
            fill="#0a0a0f"
            stroke="#00f0ff"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
          />

          {/* Center content */}
          {isShowingSequence && sequenceIndex >= 0 ? (
            <>
              <text
                x={centerX}
                y={centerY + 8}
                textAnchor="middle"
                fill="#00f0ff"
                fontSize="36"
                fontWeight="bold"
                fontFamily="Orbitron, sans-serif"
                style={{ filter: 'drop-shadow(0 0 5px #00f0ff)' }}
              >
                {sequenceIndex + 1}
              </text>
              <text
                x={centerX}
                y={centerY + 26}
                textAnchor="middle"
                fill="#666"
                fontSize="12"
                fontFamily="Orbitron, sans-serif"
              >
                /{sequence.length}
              </text>
            </>
          ) : (
            <>
              <text
                x={centerX}
                y={centerY - 2}
                textAnchor="middle"
                fill="#00f0ff"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Orbitron, sans-serif"
                style={{ filter: 'drop-shadow(0 0 3px #00f0ff)' }}
              >
                SIMON
              </text>
              <text
                x={centerX}
                y={centerY + 14}
                textAnchor="middle"
                fill="#ff00ff"
                fontSize="8"
                fontFamily="Orbitron, sans-serif"
                letterSpacing="3"
              >
                CYBER
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Player Sequence Display */}
      {isInputPhase && playerSequence.length > 0 && (
        <div className="glass-card rounded-xl p-3 w-full max-w-[min(85vw,340px)]">
          <div className="flex justify-center items-center gap-1.5 min-h-[32px] flex-wrap">
            {playerSequence.map((color, i) => (
              <span 
                key={i} 
                className="text-xl transition-transform hover:scale-110"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {getColorIndicator(color)}
              </span>
            ))}
            <span 
              className="text-gray-500 text-xs ml-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {playerSequence.length}/{sequence.length}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {isInputPhase && (
        <button
          onClick={() => {
            if (canSubmit && 'vibrate' in navigator) {
              navigator.vibrate(100);
            }
            onSubmit();
          }}
          disabled={!canSubmit}
          style={{ touchAction: 'manipulation' }}
          className={`
            w-full max-w-[min(85vw,340px)] py-4 rounded-xl font-bold text-base min-h-[60px]
            transition-all duration-200 uppercase tracking-wider
            ${canSubmit 
              ? 'cyber-btn cyber-btn-green' 
              : 'bg-gray-800/50 border-2 border-gray-700 text-gray-500 cursor-not-allowed'}
          `}
        >
          <span 
            className="flex items-center justify-center gap-2"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {canSubmit ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit
              </>
            ) : (
              <>
                <span className="text-sm">{playerSequence.length}/{sequence.length}</span>
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
};

export default CircularSimonBoard;
