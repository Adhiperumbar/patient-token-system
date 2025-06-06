import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthButton.css';

const AuthButton = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        name: userCredential.displayName,
        email: userCredential.email,
        photoURL: userCredential.photoURL
      }));
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="auth-container">
      {user ? (
        <div className="user-profile">
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="user-avatar"
          />
          <span className="user-name">{user.displayName}</span>
          <button 
            onClick={handleSignOut}
            className="auth-button sign-out"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button 
          onClick={handleGoogleSignIn}
          className="auth-button sign-in"
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="google-icon"
          />
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default AuthButton; 