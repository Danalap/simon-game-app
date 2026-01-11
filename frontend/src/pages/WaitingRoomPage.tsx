/**
 * Waiting Room / Game Page - Classic Simon Style
 * 
 * Combined page that shows:
 * - Waiting room before game starts
 * - Simon game board during gameplay
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSimonStore } from '../store/simonStore';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundService';
import { CircularSimonBoard } from '../components/game/CircularSimonBoard';
import { GameOverScreen } from '../components/game/GameOverScreen';
import { Toast } from '../components/ui/Toast';
import { MuteButton } from '../components/ui/MuteButton';

export function WaitingRoomPage() {
  const navigate = useNavigate();
  const { session, clearSession } = useAuthStore();
  const gameCode = session?.gameCode;
  const playerId = session?.playerId;
  
  const { 
    isGameActive, 
    currentSequence, 
    currentRound, 
    isShowingSequence,
    isInputPhase,
    playerSequence,
    canSubmit,
    lastResult,
    message,
    secondsRemaining,
    timerColor,
    isTimerPulsing,
    isEliminated,
    scores,
    submittedPlayers,
    isGameOver,
    gameWinner,
    finalScores,
    initializeListeners,
    cleanup,
    addColorToSequence,
    submitSequence,
    resetGame,
  } = useSimonStore();
  
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'countdown' | 'active'>('waiting');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isHost, setIsHost] = useState(session?.isHost || false);
  const [players, setPlayers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastCountdownValue = useRef<number | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    const socket = socketService.connect();
    initializeListeners();
    
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    socket.once('room_state', (room: any) => {
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    socket.on('room_state_update', (room: any) => {
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    socket.on('error', (data: { message: string }) => {
      setToast({ message: data.message, type: 'error' });
    });
    
    socket.on('countdown', (data: { count: number }) => {
      setRoomStatus('countdown');
      setCountdownValue(data.count);
      
      if (lastCountdownValue.current !== data.count) {
        soundService.playCountdown(data.count);
        lastCountdownValue.current = data.count;
      }
      
      if (data.count === 0) {
        setRoomStatus('active');
        setCountdownValue(null);
        lastCountdownValue.current = null;
      }
    });
    
    socket.on('player_joined', () => {});
    
    socket.on('player_left', (data: { playerId: string }) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });
    
    socket.on('game_restarted', () => {
      resetGame();
      setRoomStatus('waiting');
      lastCountdownValue.current = null;
    });
    
    return () => {
      cleanup();
      socket.off('room_state');
      socket.off('room_state_update');
      socket.off('error');
      socket.off('countdown');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_restarted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, playerId]);
  
  const handleStartGame = async () => {
    await soundService.init();
    const socket = socketService.getSocket();
    
    if (!socket || !gameCode || !playerId) {
      setToast({ message: 'Connection error', type: 'error' });
      return;
    }
    
    socket.emit('start_game', { gameCode, playerId });
  };
  
  const copyGameCode = async () => {
    if (!gameCode) return;
    try {
      await navigator.clipboard.writeText(gameCode);
      setToast({ message: 'Code copied!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy', type: 'error' });
    }
  };
  
  const copyInviteLink = async () => {
    if (!gameCode) return;
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast({ message: 'Link copied!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy', type: 'error' });
    }
  };
  
  const shareGame = async () => {
    if (!gameCode) return;
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Simon Game!',
          text: `Play Simon with me! Code: ${gameCode}`,
          url: inviteUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };
  
  const handlePlayAgain = () => {
    resetGame();
    setRoomStatus('waiting');
    const socket = socketService.getSocket();
    if (socket && gameCode && playerId) {
      socket.emit('restart_game', { gameCode, playerId });
    }
  };

  const handleGoHome = () => {
    cleanup();
    clearSession();
    navigate('/');
  };

  // Game Over screen
  if (isGameOver) {
    return (
      <>
        <MuteButton />
        <GameOverScreen
          winner={gameWinner}
          finalScores={finalScores}
          currentPlayerId={playerId || ''}
          roundsPlayed={currentRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          gameCode={gameCode || ''}
        />
      </>
    );
  }

  // Active game board
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-2 sm:p-4">
        <MuteButton />
        
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div className="classic-panel p-3 mb-4 w-full">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">
                Scoreboard
              </div>
              <div className="space-y-1">
                {players.map((player) => {
                  const score = scores[player.id] || 0;
                  const hasSubmitted = submittedPlayers.includes(player.id);
                  const isCurrentPlayer = player.id === playerId;
                  
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2 rounded ${
                        isCurrentPlayer 
                          ? 'bg-[#00a74a]/20 border border-[#00a74a]/40' 
                          : 'bg-black/30'
                      }`}
                    >
                      <span className="text-white text-sm flex items-center gap-2">
                        <span>{player.avatar || '🎮'}</span>
                        <span>{player.displayName}</span>
                        {isCurrentPlayer && <span className="text-[#00a74a] text-xs">(YOU)</span>}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#00ff6e] font-bold font-mono">
                          {score}
                        </span>
                        {hasSubmitted && isInputPhase && (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Eliminated Message */}
          {isEliminated && (
            <div className="classic-panel p-4 mb-4 text-center w-full border-2 border-red-500/50">
              <div className="text-3xl mb-2">💀</div>
              <div className="text-red-400 font-bold uppercase tracking-wider">
                Eliminated
              </div>
              <p className="text-gray-500 text-sm mt-1">Spectating mode</p>
            </div>
          )}
          
          <CircularSimonBoard
            sequence={currentSequence}
            round={currentRound}
            isShowingSequence={isShowingSequence}
            isInputPhase={isInputPhase}
            playerSequence={playerSequence}
            canSubmit={canSubmit}
            lastResult={lastResult}
            onColorClick={addColorToSequence}
            onSubmit={() => {
              if (gameCode && playerId) {
                submitSequence(gameCode, playerId);
              }
            }}
            disabled={isEliminated}
            secondsRemaining={secondsRemaining}
            timerColor={timerColor}
            isTimerPulsing={isTimerPulsing}
          />
          
          {/* Message */}
          {message && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="text-center">
          <div 
            className="text-8xl sm:text-9xl font-bold mb-4 animate-pulse-light"
            style={{ 
              color: '#00ff6e',
              textShadow: '0 0 30px #00ff6e, 0 0 60px #00ff6e',
              fontFamily: "'Press Start 2P', cursive",
            }}
          >
            {countdownValue}
          </div>
          <p className="text-xl text-gray-400 uppercase tracking-[0.3em]">
            Get Ready
          </p>
        </div>
      </div>
    );
  }
  
  // Waiting room
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="classic-panel p-6 sm:p-8 max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white embossed tracking-wider mb-2">
            Waiting Room
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#00ff6e] rounded-full animate-pulse-light" />
            <span className="text-gray-500 text-sm uppercase tracking-wider">
              Waiting for players
            </span>
          </div>
        </div>
        
        {/* Game Code */}
        <div className="mb-6">
          <div className="score-display rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Game Code
            </p>
            <p 
              className="text-3xl sm:text-4xl tracking-[0.3em] cursor-pointer hover:opacity-80 transition-opacity font-mono"
              style={{ color: '#00ff6e', textShadow: '0 0 10px #00ff6e' }}
              onClick={copyGameCode}
            >
              {gameCode}
            </p>
          </div>
          
          {/* Share buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={copyGameCode}
              className="flex-1 classic-btn py-2.5 px-3 text-sm"
              style={{ touchAction: 'manipulation' }}
            >
              📋 Code
            </button>
            <button
              onClick={copyInviteLink}
              className="flex-1 classic-btn py-2.5 px-3 text-sm"
              style={{ touchAction: 'manipulation' }}
            >
              🔗 Link
            </button>
            <button
              onClick={shareGame}
              className="flex-1 classic-btn py-2.5 px-3 text-sm"
              style={{ touchAction: 'manipulation' }}
            >
              📤 Share
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider">
              Players
            </h2>
            <span className="text-[#00ff6e] font-bold">{players.length}</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  player.id === playerId 
                    ? 'bg-[#00a74a]/20 border border-[#00a74a]/40' 
                    : 'bg-black/30'
                }`}
              >
                <span className="text-white flex items-center gap-2">
                  <span className="text-xl">
                    {['🎮', '👾', '🕹️', '⭐', '🏆', '💎', '🎯', '🚀'][parseInt(player.avatarId || '1') - 1] || '🎮'}
                  </span>
                  <span>{player.displayName}</span>
                  {player.id === playerId && (
                    <span className="text-[#00a74a] text-xs">(YOU)</span>
                  )}
                </span>
                {player.isHost && (
                  <span className="text-yellow-400 text-sm">👑 Host</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Start Button */}
        {(isHost || players.length === 1) && (
          <div>
            {players.length === 1 && (
              <p className="text-center text-sm text-gray-500 mb-3">
                💡 Start solo or wait for others
              </p>
            )}
            <button
              onClick={handleStartGame}
              className="classic-btn classic-btn-green w-full py-4 px-6 text-lg min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              ▶ {players.length === 1 ? 'Start Solo' : 'Start Game'}
            </button>
          </div>
        )}
        
        {!isHost && players.length > 1 && (
          <div className="text-center">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <span className="animate-pulse-light">●</span>
              Waiting for host...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
