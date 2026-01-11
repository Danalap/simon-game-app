/**
 * Waiting Room / Game Page - Cyber Tech Edition
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
    console.log('🎮 WaitingRoomPage mounted');
    
    const socket = socketService.connect();
    console.log('✅ Socket connected:', socket.connected);
    
    initializeListeners();
    
    if (gameCode && playerId) {
      socket.emit('join_room_socket', { gameCode, playerId });
    }
    
    socket.once('room_state', (room: any) => {
      console.log('📦 Initial room state:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      const me = room.players?.find((p: any) => p.id === playerId);
      const isHostPlayer = me?.isHost || false;
      setIsHost(isHostPlayer);
    });
    
    socket.on('room_state_update', (room: any) => {
      console.log('🔄 Room state updated:', room);
      setPlayers(room.players || []);
      setRoomStatus(room.status);
      
      const me = room.players?.find((p: any) => p.id === playerId);
      setIsHost(me?.isHost || false);
    });
    
    socket.on('error', (data: { message: string }) => {
      console.error('❌ Server error:', data.message);
      setToast({ message: data.message, type: 'error' });
    });
    
    socket.on('countdown', (data: { count: number }) => {
      console.log('⏳ Countdown:', data.count);
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
    
    socket.on('player_joined', (player: any) => {
      console.log('👋 Player joined:', player);
    });
    
    socket.on('player_left', (data: { playerId: string }) => {
      console.log('👋 Player left:', data.playerId);
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });
    
    socket.on('game_restarted', (data: { gameCode: string }) => {
      console.log('🔄 Game restarted:', data.gameCode);
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
    
    if (!socket) {
      setToast({ message: 'No connection to server', type: 'error' });
      return;
    }
    
    if (!gameCode || !playerId) {
      setToast({ message: 'Missing game info', type: 'error' });
      return;
    }
    
    socket.emit('start_game', { gameCode, playerId });
  };
  
  const copyGameCode = async () => {
    if (!gameCode) return;
    
    try {
      await navigator.clipboard.writeText(gameCode);
      setToast({ message: 'Code copied to clipboard!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy code', type: 'error' });
    }
  };
  
  const copyInviteLink = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setToast({ message: 'Invite link copied!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };
  
  const shareGame = async () => {
    if (!gameCode) return;
    
    const inviteUrl = `${window.location.origin}/?join=${gameCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Simon Game!',
          text: `Join me in Simon Says! Use code: ${gameCode}`,
          url: inviteUrl,
        });
        setToast({ message: 'Invite shared!', type: 'success' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyInviteLink();
        }
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

  // Render Game Over screen
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

  // Render game board if active
  if (roomStatus === 'active' && isGameActive) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] cyber-grid flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
        
        <MuteButton />
        
        <div className="flex flex-col items-center w-full max-w-md relative z-10">
          {/* Scoreboard */}
          {isGameActive && Object.keys(scores).length > 0 && (
            <div className="glass-card rounded-xl p-3 mb-4 w-full">
              <div 
                className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                // Leaderboard
              </div>
              <div className="space-y-1.5">
                {players.map((player, index) => {
                  const score = scores[player.id] || 0;
                  const hasSubmitted = submittedPlayers.includes(player.id);
                  const isCurrentPlayer = player.id === playerId;
                  
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isCurrentPlayer 
                          ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30' 
                          : 'bg-black/30'
                      }`}
                    >
                      <span className="text-white text-sm flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-4">{index + 1}.</span>
                        <span>{player.avatar || '🤖'}</span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>{player.displayName}</span>
                        {isCurrentPlayer && <span className="text-[#00f0ff] text-xs">(YOU)</span>}
                      </span>
                      <div className="flex items-center gap-3">
                        <span 
                          className="text-[#39ff14] font-bold"
                          style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                          {score}
                        </span>
                        {hasSubmitted && isInputPhase && (
                          <span className="text-[#39ff14] text-xs">✓</span>
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
            <div className="glass-card-pink rounded-xl p-4 mb-4 text-center w-full border border-red-500/30">
              <div className="text-4xl mb-2">💀</div>
              <div 
                className="text-red-400 font-bold uppercase tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                Eliminated
              </div>
              <p className="text-gray-400 text-sm mt-1">Spectating...</p>
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
          
          {/* Message Display */}
          {message && (
            <div className="mt-4 text-center">
              <p 
                className="text-gray-300 text-sm"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render countdown
  if (roomStatus === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] cyber-grid-animated flex items-center justify-center p-4 relative overflow-hidden">
        {/* Pulsing background */}
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent animate-pulse" />
        
        <div className="text-center relative z-10">
          <div 
            className="text-8xl sm:text-9xl font-bold mb-4 text-glow-cyan"
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              color: '#00f0ff',
            }}
          >
            {countdownValue}
          </div>
          <p 
            className="text-xl text-gray-400 uppercase tracking-[0.3em]"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Initializing
          </p>
          
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-48 h-48 border-2 border-[#00f0ff]/30 rounded-full animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Render waiting room
  return (
    <div className="min-h-screen bg-[#0a0a0f] cyber-grid-animated flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full relative cyber-corners animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 
            className="text-2xl sm:text-3xl font-bold text-[#00f0ff] mb-2"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            // LOBBY
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse" />
            <span className="text-gray-400 text-sm uppercase tracking-wider">
              Awaiting Players
            </span>
          </div>
        </div>
        
        {/* Game Code Display */}
        <div className="mb-6">
          <div className="bg-black/50 rounded-xl p-4 border border-[#00f0ff]/20">
            <p 
              className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Access Code
            </p>
            <p 
              className="text-3xl sm:text-4xl text-center text-[#00f0ff] tracking-[0.3em] text-glow-cyan cursor-pointer hover:scale-105 transition-transform"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
              onClick={copyGameCode}
            >
              {gameCode}
            </p>
          </div>
          
          {/* Share buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={copyGameCode}
              className="flex-1 cyber-btn py-2.5 px-3 rounded-lg text-xs"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Code
              </span>
            </button>
            <button
              onClick={copyInviteLink}
              className="flex-1 cyber-btn py-2.5 px-3 rounded-lg text-xs"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Link
              </span>
            </button>
            <button
              onClick={shareGame}
              className="flex-1 cyber-btn cyber-btn-pink py-2.5 px-3 rounded-lg text-xs"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </span>
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 
              className="text-sm text-gray-400 uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Connected Players
            </h2>
            <span className="text-[#00f0ff] text-sm font-bold">{players.length}</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {players.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  player.id === playerId 
                    ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30' 
                    : 'bg-black/30 border border-transparent'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="font-medium text-white flex items-center gap-2">
                  <span className="text-xl">{['🤖', '👾', '🎮', '⚡', '🔮', '💎', '🌟', '🚀'][parseInt(player.avatarId || '1') - 1] || '🤖'}</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {player.displayName}
                  </span>
                  {player.id === playerId && (
                    <span className="text-[#00f0ff] text-xs">(YOU)</span>
                  )}
                </span>
                {player.isHost && (
                  <span 
                    className="text-[#ffff00] text-xs uppercase tracking-wider"
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    👑 Host
                  </span>
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
              className="cyber-btn cyber-btn-green w-full py-4 px-6 rounded-lg text-base min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {players.length === 1 ? 'Launch Solo' : 'Launch Game'}
              </span>
            </button>
          </div>
        )}
        
        {!isHost && players.length > 1 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-[#ffff00] rounded-full animate-pulse" />
              <span className="text-sm">Waiting for host to launch...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
