/**
 * Classic Simon Board Component
 * 
 * Authentic recreation of the original 1978 Simon game design.
 * Four colored quadrants with black center hub.
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
// WEDGE COMPONENT - Classic Simon Style
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
  // Classic Simon colors - dim when inactive, bright when lit
  const colors: Record<Color, { dim: string; bright: string; stroke: string }> = {
    green: { dim: '#005a28', bright: '#00ff6e', stroke: '#003d1a' },
    red: { dim: '#6e0f0c', bright: '#ff3b30', stroke: '#4a0a08' },
    yellow: { dim: '#8a6b00', bright: '#ffea00', stroke: '#5c4700' },
    blue: { dim: '#042658', bright: '#3b7eff', stroke: '#021a3d' },
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
      stroke={wedgeColor.stroke}
      strokeWidth="4"
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'fill 0.08s ease',
        filter: isActive ? `brightness(1.3) drop-shadow(0 0 20px ${wedgeColor.bright})` : 'brightness(1)',
        opacity: disabled ? 0.5 : 1,
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

  // SVG dimensions - slightly larger for classic look
  const size = 340;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 12;
  const innerRadius = size * 0.22;
  const gapAngle = 3;

  // Classic Simon layout
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
    
    if (sequenceLength === 0) return;

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

  // Timer display colors
  const timerDisplayColors = {
    green: '#00ff6e',
    yellow: '#ffea00',
    red: '#ff3b30',
  };

  return (
    <div className="game-area flex flex-col items-center gap-4 w-full">
      {/* Round & Status Display - Classic LED style */}
      <div className="text-center">
        <div className="led-display inline-block px-6 py-2 mb-2">
          <span className="text-sm" style={{ color: '#00ff6e' }}>
            ROUND {round}
          </span>
        </div>
        
        {isShowingSequence ? (
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg px-4 py-2">
            <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
              ● Watch the pattern
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm uppercase tracking-wider">
            {disabled 
              ? 'Spectating' 
              : isInputPhase
                ? 'Your turn!' 
                : 'Ready'}
          </p>
        )}
      </div>

      {/* Timer Display */}
      {isInputPhase && secondsRemaining > 0 && (
        <div 
          className={`led-display px-4 py-2 ${isTimerPulsing ? 'animate-pulse-light' : ''}`}
          style={{ color: timerDisplayColors[timerColor] }}
        >
          <span className="text-2xl font-bold">{secondsRemaining}</span>
          <span className="text-xs ml-1">SEC</span>
        </div>
      )}

      {/* Classic Simon Game Unit */}
      <div className="relative w-full max-w-[min(90vw,360px)] mx-auto">
        {/* Outer casing */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            transform: 'scale(1.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.05)',
          }}
        />
        
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto relative z-10"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Black background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius + 6}
            fill="#1a1a1a"
            stroke="#333"
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

          {/* Center hub - Classic black dome */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="url(#centerGradient)"
            stroke="#222"
            strokeWidth="3"
          />
          
          {/* Gradient for center hub */}
          <defs>
            <radialGradient id="centerGradient" cx="40%" cy="30%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
          </defs>

          {/* Center content */}
          {isShowingSequence && sequenceIndex >= 0 ? (
            <>
              <text
                x={centerX}
                y={centerY + 6}
                textAnchor="middle"
                fill="#00ff6e"
                fontSize="28"
                fontWeight="bold"
                fontFamily="'Press Start 2P', cursive"
                style={{ textShadow: '0 0 10px #00ff6e' }}
              >
                {sequenceIndex + 1}
              </text>
              <text
                x={centerX}
                y={centerY + 26}
                textAnchor="middle"
                fill="#666"
                fontSize="10"
                fontFamily="'Audiowide', cursive"
              >
                of {sequence.length}
              </text>
            </>
          ) : (
            <>
              <text
                x={centerX}
                y={centerY - 4}
                textAnchor="middle"
                fill="#888"
                fontSize="20"
                fontWeight="bold"
                fontFamily="'Audiowide', cursive"
                letterSpacing="4"
              >
                SIMON
              </text>
              <text
                x={centerX}
                y={centerY + 16}
                textAnchor="middle"
                fill="#555"
                fontSize="8"
                fontFamily="'Audiowide', cursive"
                letterSpacing="2"
              >
                ® GAME
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Player Input Display */}
      {isInputPhase && playerSequence.length > 0 && (
        <div className="score-display rounded-lg p-3 w-full max-w-[min(90vw,360px)]">
          <div className="flex justify-center items-center gap-2 min-h-[32px] flex-wrap">
            {playerSequence.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2"
                style={{
                  backgroundColor: color === 'green' ? '#00a74a' : 
                                   color === 'red' ? '#d91e18' :
                                   color === 'yellow' ? '#ffc500' : '#094fb3',
                  borderColor: color === 'green' ? '#00ff6e' : 
                               color === 'red' ? '#ff3b30' :
                               color === 'yellow' ? '#ffea00' : '#3b7eff',
                  boxShadow: `0 0 8px ${
                    color === 'green' ? '#00a74a' : 
                    color === 'red' ? '#d91e18' :
                    color === 'yellow' ? '#ffc500' : '#094fb3'
                  }`,
                }}
              />
            ))}
            <span className="text-gray-500 text-xs ml-2 font-mono">
              {playerSequence.length}/{sequence.length}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button - Classic style */}
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
            w-full max-w-[min(90vw,360px)] py-4 rounded-lg font-bold text-base min-h-[56px]
            transition-all duration-150 uppercase tracking-wider
            ${canSubmit 
              ? 'classic-btn classic-btn-green text-white' 
              : 'bg-gray-800 border-2 border-gray-700 text-gray-500 cursor-not-allowed'}
          `}
        >
          {canSubmit ? '✓ Submit' : `${playerSequence.length}/${sequence.length}`}
        </button>
      )}
    </div>
  );
};

export default CircularSimonBoard;
