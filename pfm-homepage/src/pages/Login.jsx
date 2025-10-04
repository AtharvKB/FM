import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
