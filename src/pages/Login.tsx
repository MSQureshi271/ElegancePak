import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!isLogin && password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success("Successfully logged in!");
      } else {
        await registerWithEmail(email, password);
        toast.success("Account created successfully!");
      }
      navigate('/');
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError('Email/Password sign-in is not enabled. Please use Google Sign-In or enable it in the Firebase Console.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully logged in!");
      navigate('/');
    } catch (err: any) {
      setAuthError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-surface p-8 border border-border">
        <h2 className="text-2xl font-serif mb-6 text-neutral text-center">{isLogin ? 'Sign In' : 'Create an Account'}</h2>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{authError}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          )}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-4 text-sm text-tertiary">Or continue with</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-4 bg-primary border border-border text-neutral text-xs uppercase tracking-widest hover:border-secondary transition-colors flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Google
        </button>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-tertiary hover:text-secondary transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
