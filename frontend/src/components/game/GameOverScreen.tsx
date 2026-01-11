/**
 * Game Over Screen - Classic Simon Style
 * 
 * Displays end game results with retro styling.
 */

import { useEffect, useState } from 'react';
import { soundService } from '../../services/soundService';

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

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  winner,
  finalScores,
  currentPlayerId,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
  gameCode,
}) => {
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

  useEffect(() => {
    soundService.playVictory();
  }, []);

  const getMedal = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  const handleShare = async () => {
    const myScore = finalScores.find(s => s.playerId === currentPlayerId)?.score || 0;
    const rank = finalScores.findIndex(s => s.playerId === currentPlayerId) + 1;
    
    const shareText = isSoloGame
      ? `🎮 I reached Round ${roundsPlayed} in Simon with ${myScore} points!`
      : `🏆 I finished #${rank} in Simon with ${myScore} points! ${isWinner ? '👑 Winner!' : ''}`;
    
    const shareUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Simon Score', text: shareText, url: shareUrl });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText + '\n' + shareUrl);
        }
      }
    } else {
      navigator.clipboard.writeText(shareText + '\n' + shareUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 embossed tracking-wider">
            Game Over
          </h1>
          <div className="flex justify-center gap-2">
            {['#00a74a', '#d91e18', '#ffc500', '#094fb3'].map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Winner Section */}
        {winner && (
          <div className="classic-panel p-6 mb-4 text-center">
            <div className="text-4xl mb-3">👑</div>
            
            <h2 className="text-xl font-bold text-yellow-400 mb-2 uppercase tracking-wider">
              {isSoloGame ? 'Great Job!' : 'Winner!'}
            </h2>
            
            <div className="text-white text-2xl font-semibold mb-2">
              {winner.name}
            </div>
            
            <div 
              className="text-4xl font-bold font-mono"
              style={{ color: '#00ff6e', textShadow: '0 0 10px #00ff6e' }}
            >
              {animatedScore}
              <span className="text-lg text-gray-400 ml-2">pts</span>
            </div>
            
            {isWinner && !isSoloGame && (
              <div className="mt-3 text-[#00a74a] text-sm font-semibold">
                ✨ That's you! ✨
              </div>
            )}
          </div>
        )}

        {/* Scoreboard (Multiplayer) */}
        {!isSoloGame && finalScores.length > 0 && (
          <div className="classic-panel p-4 mb-4">
            <h3 className="text-center mb-3 text-xs text-gray-500 uppercase tracking-wider">
              Final Standings
            </h3>
            
            <div className="space-y-2">
              {finalScores.map((player, index) => {
                const isCurrentPlayer = player.playerId === currentPlayerId;
                const rank = index + 1;
                
                return (
                  <div
                    key={player.playerId}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      isCurrentPlayer
                        ? 'bg-[#00a74a]/20 border border-[#00a74a]/40'
                        : rank <= 3 ? 'bg-black/40' : 'bg-black/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center">{getMedal(rank)}</span>
                      <span className="text-white">
                        {player.name}
                        {isCurrentPlayer && <span className="text-xs ml-1 text-[#00a74a]">(you)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-mono">{player.score}</span>
                      {player.isEliminated && <span className="text-red-400 text-xs">💀</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Stats */}
        <div className="score-display rounded-lg p-4 mb-6">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-white font-mono">{roundsPlayed}</div>
              <div className="text-gray-500 text-xs uppercase">Rounds</div>
            </div>
            <div className="border-l border-gray-700" />
            <div>
              <div 
                className="text-2xl font-bold font-mono"
                style={{ color: '#00ff6e' }}
              >
                {finalScores.find(s => s.playerId === currentPlayerId)?.score || 0}
              </div>
              <div className="text-gray-500 text-xs uppercase">Score</div>
            </div>
            {!isSoloGame && (
              <>
                <div className="border-l border-gray-700" />
                <div>
                  <div className="text-2xl font-bold text-white font-mono">
                    #{finalScores.findIndex(s => s.playerId === currentPlayerId) + 1}
                  </div>
                  <div className="text-gray-500 text-xs uppercase">Rank</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="classic-btn classic-btn-green w-full py-4 px-6 text-lg min-h-[56px]"
            style={{ touchAction: 'manipulation' }}
          >
            ▶ Play Again
          </button>

          <button
            onClick={onGoHome}
            className="classic-btn w-full py-4 px-6 text-lg min-h-[56px]"
            style={{ touchAction: 'manipulation' }}
          >
            ◀ Home
          </button>

          <button
            onClick={handleShare}
            className="classic-btn w-full py-3 px-6 text-sm"
            style={{ touchAction: 'manipulation' }}
          >
            📤 Share Score
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
