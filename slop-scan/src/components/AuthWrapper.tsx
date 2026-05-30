'use client';
import { useState, useEffect, ReactNode } from 'react';

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if they already logged in during this session
    const auth = localStorage.getItem('slop_auth');
    if (auth === '1') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    
    setLoading(true);
    setError(null);
    // Fake network delay for realism
    setTimeout(() => {
      if (isLoginView) {
        const savedUser = localStorage.getItem('slop_demo_user');
        const savedPass = localStorage.getItem('slop_demo_pass');
        if (savedUser === userId && savedPass === password) {
          localStorage.setItem('slop_auth', '1');
          setIsAuthenticated(true);
        } else {
          setError('Invalid User ID or password. Please try again.');
        }
      } else {
        // Register flow
        localStorage.setItem('slop_demo_user', userId);
        localStorage.setItem('slop_demo_pass', password);
        localStorage.setItem('slop_auth', '1');
        setIsAuthenticated(true);
      }
      setLoading(false);
    }, 800);
  };

  // Don't render anything while checking local storage on mount
  if (isAuthenticated === null) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'var(--accent-light)', color: 'var(--accent)', 
            fontSize: '1.5rem', marginBottom: '1rem' 
          }}>
            🔒
          </div>
          <h2>{isLoginView ? 'Welcome back' : 'Create an account'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isLoginView ? 'Sign in to access your dashboard' : 'Join Slop Scan to get started'}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)' }}>
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', margin: 0, fontFamily: 'var(--font-mono)' }}>⚠ {error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              User ID
            </label>
            <input 
              type="text" 
              className="text-input" 
              style={{ minHeight: 'auto', padding: '0.6rem 0.75rem' }} 
              placeholder="Enter your ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Password
              </label>
              {isLoginView && (
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot?
                </a>
              )}
            </div>
            <input 
              type="password" 
              className="text-input" 
              style={{ minHeight: 'auto', padding: '0.6rem 0.75rem' }} 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`scan-btn ${loading ? 'scanning' : ''}`} 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isLoginView ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', padding: 0 }}
          >
            {isLoginView ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
