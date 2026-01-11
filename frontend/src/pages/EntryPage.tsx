/**
 * Entry Page - Cyber Tech Edition
 * 
 * Futuristic name + avatar selection page.
 * First screen players see.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createSession, joinGame } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function EntryPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [avatarId, setAvatarId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  
  // Handle invite link with game code in URL
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setMode('join');
      setGameCode(joinCode.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await createSession(displayName, avatarId);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await joinGame(displayName, avatarId, gameCode);
      setSession(response.session);
      navigate('/waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  // Avatar options with cyber theme
  const avatars = ['🤖', '👾', '🎮', '⚡', '🔮', '💎', '🌟', '🚀'];

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] cyber-grid-animated flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="glass-card rounded-2xl p-8 max-w-md w-full relative cyber-corners animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 
              className="text-5xl sm:text-6xl font-bold mb-2"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              <span className="text-glow-cyan text-[#00f0ff]">SIM</span>
              <span className="text-glow-pink text-[#ff00ff]">ON</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="w-8 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-xs uppercase tracking-[0.3em]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Neural Link Edition
              </span>
              <span className="w-8 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
            </div>
          </div>
          
          {/* Buttons */}
          <div className="space-y-4 stagger-children">
            <button
              onClick={() => setMode('create')}
              className="cyber-btn w-full py-4 px-6 rounded-lg text-base min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Initialize Game
              </span>
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="cyber-btn cyber-btn-pink w-full py-4 px-6 rounded-lg text-base min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Join Session
              </span>
            </button>
          </div>
          
          {/* Footer decoration */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {['#ff3131', '#ffff00', '#39ff14', '#00f0ff'].map((color, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] cyber-grid-animated flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full relative cyber-corners animate-slide-up">
        {/* Back button */}
        <button
          onClick={() => setMode(null)}
          className="text-gray-400 hover:text-[#00f0ff] transition-colors mb-6 flex items-center gap-2 text-sm"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>
        
        {/* Title */}
        <h2 
          className="text-2xl font-bold mb-6 text-[#00f0ff]"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {mode === 'create' ? '// INITIALIZE' : '// CONNECT'}
        </h2>
        
        <form onSubmit={mode === 'create' ? handleCreateGame : handleJoinGame} className="space-y-5">
          {/* Display Name */}
          <div>
            <label 
              className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Callsign
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter identifier..."
              minLength={3}
              maxLength={12}
              required
              className="cyber-input w-full px-4 py-3 rounded-lg"
            />
          </div>
          
          {/* Game Code (join only) */}
          {mode === 'join' && (
            <div>
              <label 
                className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                Access Code
                {searchParams.get('join') && (
                  <span className="ml-2 text-[#39ff14] normal-case tracking-normal">
                    ✓ Auto-linked
                  </span>
                )}
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                required
                className="cyber-input w-full px-4 py-3 rounded-lg uppercase tracking-[0.3em] text-center text-xl"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              />
            </div>
          )}
          
          {/* Avatar Selection */}
          <div>
            <label 
              className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Avatar Unit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((emoji, index) => {
                const id = String(index + 1);
                const isSelected = avatarId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAvatarId(id)}
                    className={`
                      relative p-3 rounded-lg transition-all duration-200 min-h-[60px]
                      ${isSelected 
                        ? 'bg-[#00f0ff]/20 border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                        : 'bg-black/30 border-2 border-gray-700/50 hover:border-gray-500'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="text-2xl">{emoji}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00f0ff] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              cyber-btn cyber-btn-green w-full py-4 px-6 rounded-lg text-base min-h-[60px]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ touchAction: 'manipulation' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {mode === 'create' ? 'Launch Session' : 'Connect'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
