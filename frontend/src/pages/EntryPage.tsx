/**
 * Entry Page - Classic Simon Style
 * 
 * Retro-styled name + avatar selection page.
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

  // Classic arcade-style avatars
  const avatars = ['🎮', '👾', '🕹️', '⭐', '🏆', '💎', '🎯', '🚀'];

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="classic-panel p-8 max-w-md w-full animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* Simon colored dots */}
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#00a74a] shadow-lg" style={{ boxShadow: '0 0 15px #00a74a' }} />
              <div className="w-8 h-8 rounded-full bg-[#d91e18] shadow-lg" style={{ boxShadow: '0 0 15px #d91e18' }} />
              <div className="w-8 h-8 rounded-full bg-[#ffc500] shadow-lg" style={{ boxShadow: '0 0 15px #ffc500' }} />
              <div className="w-8 h-8 rounded-full bg-[#094fb3] shadow-lg" style={{ boxShadow: '0 0 15px #094fb3' }} />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2 embossed tracking-wider">
              SIMON
            </h1>
            <p className="text-gray-500 text-sm uppercase tracking-[0.3em]">
              The Memory Game
            </p>
          </div>
          
          {/* Menu Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="classic-btn w-full py-4 px-6 text-lg min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              ▶ New Game
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="classic-btn w-full py-4 px-6 text-lg min-h-[60px]"
              style={{ touchAction: 'manipulation' }}
            >
              ▶ Join Game
            </button>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs">
              © 2026 • Multiplayer Edition
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="classic-panel p-6 sm:p-8 max-w-md w-full animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => setMode(null)}
          className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm uppercase tracking-wider"
        >
          ◀ Back
        </button>
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-white embossed tracking-wider">
          {mode === 'create' ? '▶ New Game' : '▶ Join Game'}
        </h2>
        
        <form onSubmit={mode === 'create' ? handleCreateGame : handleJoinGame} className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Player Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              minLength={3}
              maxLength={12}
              required
              className="classic-input w-full px-4 py-3"
            />
          </div>
          
          {/* Game Code (join only) */}
          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Game Code
                {searchParams.get('join') && (
                  <span className="ml-2 text-green-500 normal-case">
                    ✓ From invite
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
                className="classic-input w-full px-4 py-3 uppercase tracking-[0.3em] text-center text-xl font-mono"
              />
            </div>
          )}
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Select Avatar
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
                      p-3 rounded-lg transition-all duration-150 min-h-[60px]
                      ${isSelected 
                        ? 'bg-[#00a74a]/20 border-2 border-[#00a74a] shadow-[0_0_10px_rgba(0,167,74,0.3)]' 
                        : 'bg-[#2a2a2a] border-2 border-[#444] hover:border-[#666]'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              ⚠ {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              classic-btn classic-btn-green w-full py-4 px-6 text-lg min-h-[60px]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ touchAction: 'manipulation' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">◌</span>
                Loading...
              </span>
            ) : (
              mode === 'create' ? '▶ Start' : '▶ Join'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
