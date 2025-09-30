import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

  const handleGoToRegister = () => {
    setCurrentView('register');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  if (currentView === 'register') {
    return (
      <Register 
        onRegisterSuccess={onAuthSuccess} 
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <Login 
      onLoginSuccess={onAuthSuccess} 
      onGoToRegister={handleGoToRegister}
    />
  );
};

export default AuthScreen;