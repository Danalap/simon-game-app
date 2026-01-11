/**
 * Game Over Screen Component - Cyber Tech Edition
 * 
 * Displays the end game results with:
 * - Winner celebration with cyber effects
 * - Final scoreboard with neon styling
 * - Game stats
 * - Play Again / Home buttons
 * - Share score functionality
 */

import { useEffect, useState } from 'react';
import { soundService } from '../../services/soundService';

// =============================================================================
// TYPES
// =============================================================================

interface GameOverScreenProps {
  winner: {
    playerId: string;
    name: string;
    score: number;
  } | null;
  finalScores: Array<{
    playerId: string;
    name: string;
    score: number;
    isEliminated?: boolean;
  }>;
  currentPlayerId: string;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  gameCode: string;
}

// =============================================================================
// CYBER PARTICLES COMPONENT
// =============================================================================

const CyberParticles: React.FC = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
    size: 2 + Math.random() * 4,
    color: ['#00f0ff', '#ff00ff', '#39ff14', '#ffff00'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-rise"
          style={{
            left: `${particle.left}%`,
            bottom: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// =============================================================================
// GAME OVER SCREEN COMPONENT
// =============================================================================

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  finalScores,
  currentPlayerId,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
  gameCode,
}) => {
  const [showParticles, setShowParticles] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const isWinner = winner?.playerId === currentPlayerId;
  const isSoloGame = finalScores.length === 1;

  // Animate score count-up
  useEffect(() => {
    if (!winner) return;
    
    const targetScore = winner.score;
    const duration = 1500;
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [winner]);

  // Play victory sound on mount
  useEffect(() => {
    soundService.playVictory();
    
    const timer = setTimeout(() => setShowParticles(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Get medal/rank display
  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  // Share score functionality
  const handleShare = async () => {
    const myScore = finalScores.find(s => s.playerId === currentPlayerId)?.score || 0;
    const rank = finalScores.findIndex(s => s.playerId === currentPlayerId) + 1;
    
    const shareText = isSoloGame
      ? `🎮 I reached Round ${roundsPlayed} in SIMON CYBER with ${myScore} points! Can you beat my score?`
      : `🏆 I finished #${rank} in SIMON CYBER with ${myScore} points! ${isWinner ? '👑 WINNER!' : ''}`;
    
    const shareUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Simon Cyber Score',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText + '\n' + shareUrl);
        }
      }
    } else {
      copyToClipboard(shareText + '\n' + shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Cyber Particles */}
      {showParticles && <CyberParticles />}
      
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-2"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <span className="text-[#00f0ff] text-glow-cyan">GAME</span>
            <span className="text-[#ff00ff] text-glow-pink ml-3">OVER</span>
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-[#00f0ff] via-[#ff00ff] to-[#00f0ff] rounded-full" />
        </div>

        {/* Winner Section */}
        {winner && (
          <div className="glass-card rounded-2xl p-6 mb-4 text-center relative overflow-hidden border border-[#ffff00]/30">
            {/* Animated glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffff00]/10 to-transparent animate-pulse" />
            
            <div className="relative z-10">
              {/* Crown */}
              <div 
                className="text-5xl mb-3 animate-bounce"
                style={{ filter: 'drop-shadow(0 0 10px #ffff00)' }}
              >
                👑
              </div>
              
              <h2 
                className="text-xl font-bold text-[#ffff00] mb-2 uppercase tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {isSoloGame ? 'Mission Complete' : 'Champion'}
              </h2>
              
              <div 
                className="text-white text-2xl font-semibold mb-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {winner.name}
              </div>
              
              <div 
                className="text-5xl font-bold"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  color: '#39ff14',
                  textShadow: '0 0 10px #39ff14, 0 0 20px #39ff14',
                }}
              >
                {animatedScore}
                <span className="text-lg text-gray-400 ml-2">PTS</span>
              </div>
              
              {isWinner && !isSoloGame && (
                <div 
                  className="mt-3 text-[#00f0ff] text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  ◉ That's You ◉
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scoreboard (Multiplayer only) */}
        {!isSoloGame && finalScores.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-4">
            <h3 
              className="text-center mb-3 text-xs text-gray-500 uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              // Final Rankings
            </h3>
            
            <div className="space-y-2">
              {finalScores.map((player, index) => {
                const isCurrentPlayer = player.playerId === currentPlayerId;
                const rank = index + 1;
                
                return (
                  <div
                    key={player.playerId}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isCurrentPlayer
                        ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30 scale-105'
                        : rank <= 3
                          ? 'bg-black/40'
                          : 'bg-black/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">
                        {getMedal(rank)}
                      </span>
                      <span 
                        className="text-white font-medium"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        {player.name}
                        {isCurrentPlayer && (
                          <span className="text-xs ml-2 text-[#00f0ff]">(YOU)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span 
                        className="font-bold"
                        style={{ 
                          fontFamily: 'Orbitron, sans-serif',
                          color: rank === 1 ? '#39ff14' : '#fff',
                        }}
                      >
                        {player.score}
                      </span>
                      {player.isEliminated && (
                        <span className="text-red-400 text-xs">💀</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex justify-around text-center">
            <div>
              <div 
                className="text-3xl font-bold text-[#00f0ff]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {roundsPlayed}
              </div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">Rounds</div>
            </div>
            <div className="border-l border-gray-700" />
            <div>
              <div 
                className="text-3xl font-bold text-[#39ff14]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {finalScores.find(s => s.playerId === currentPlayerId)?.score || 0}
              </div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">Score</div>
            </div>
            {!isSoloGame && (
              <>
                <div className="border-l border-gray-700" />
                <div>
                  <div 
                    className="text-3xl font-bold text-[#ff00ff]"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    #{finalScores.findIndex(s => s.playerId === currentPlayerId) + 1}
                  </div>
                  <div className="text-gray-500 text-xs uppercase tracking-wider">Rank</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="cyber-btn cyber-btn-green w-full py-4 px-6 rounded-xl text-base min-h-[60px]"
            style={{ touchAction: 'manipulation' }}
          >
            <span 
              className="flex items-center justify-center gap-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rematch
            </span>
          </button>

          <button
            onClick={onGoHome}
            className="cyber-btn w-full py-4 px-6 rounded-xl text-base min-h-[60px]"
            style={{ touchAction: 'manipulation' }}
          >
            <span 
              className="flex items-center justify-center gap-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Exit
            </span>
          </button>

          <button
            onClick={handleShare}
            className="cyber-btn cyber-btn-pink w-full py-3 px-6 rounded-xl text-sm"
            style={{ touchAction: 'manipulation' }}
          >
            <span 
              className="flex items-center justify-center gap-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Score
            </span>
          </button>
        </div>
      </div>

      {/* CSS for particle animation */}
      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
        .animate-rise {
          animation: rise linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GameOverScreen;
