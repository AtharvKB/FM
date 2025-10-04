import React, { useState } from 'react';
import Header from './components/common/Header';
import Hero from './components/homepage/Hero';
import Features from './components/homepage/Features';
import Footer from './components/common/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import BuyPremiumPage from "./pages/BuyPremiumPage";
import './styles/global.css';
import './styles/auth.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isPremiumFlow, setIsPremiumFlow] = useState(false); // 🆕 Track premium flow

  // 🆕 Show Buy Premium Page after premium user logs in
  if (loggedInUser && isPremiumFlow) {
    return (
      <BuyPremiumPage 
        userEmail={loggedInUser}
        onBack={() => {
          setIsPremiumFlow(false);
          setCurrentView('dashboard');
        }}
        onPaymentSuccess={() => {
          setIsPremiumFlow(false);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Show Dashboard if user is logged in
  if (loggedInUser) {
    return (
      <Dashboard 
        userEmail={loggedInUser} 
        onLogout={() => {
          setLoggedInUser(null);
          setIsPremiumFlow(false);
          setCurrentView('home');
        }}
      />
    );
  }

  // Show Login Page
  if (currentView === 'login') {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <LoginForm 
            onBack={() => {
              setCurrentView('home');
              setIsPremiumFlow(false);
            }}
            onSignUpClick={() => setCurrentView('register')}
            onLoginSuccess={(email) => {
              setLoggedInUser(email);
              // If premium flow, stay on premium flag; otherwise go to dashboard
            }}
          />
        </div>
      </div>
    );
  }

  // Show Register Page
  if (currentView === 'register') {
    return (
      <div className="auth-page">
        <div className="auth-background">
          <RegisterForm 
            onBack={() => {
              setCurrentView('home');
              setIsPremiumFlow(false);
            }}
            onLoginClick={() => setCurrentView('login')}
            onRegisterSuccess={(email) => {
              setLoggedInUser(email);
              // If premium flow, redirect to payment page
            }}
          />
        </div>
      </div>
    );
  }

  // Show Home Page
  return (
    <div className="App">
      <Header onLoginClick={() => setCurrentView('login')} />
      <Hero />
      <Features 
        onRegisterClick={() => {
          setIsPremiumFlow(false); // 🆕 Free plan flow
          setCurrentView('register');
        }}
        onPremiumClick={() => {
          setIsPremiumFlow(true); // 🆕 Premium plan flow
          setCurrentView('register');
        }}
      />
      <Footer />
    </div>
  );
}

export default App;
