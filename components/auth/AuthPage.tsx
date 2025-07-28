import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <AuthLayout
      title={isLogin ? 'Welcome Back' : 'Create Account'}
      subtitle={isLogin ? 'Sign in to your account to continue' : 'Join UNKNOWN Pharmaceutical Distribution'}
    >
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} onSuccess={onAuthSuccess} />
      ) : (
        <SignupForm onToggleMode={toggleMode} onSuccess={onAuthSuccess} />
      )}
    </AuthLayout>
  );
};