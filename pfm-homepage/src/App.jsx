import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Hero from './components/homepage/Hero';
import Features from './components/homepage/Features';
import Footer from './components/common/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import Dashboard from './components/dashboard/Dashboard';
import BuyPremiumPage from "./pages/BuyPremiumPage";
import PremiumStatusPage from "./pages/PremiumStatusPage";
import ErrorBoundary from './components/common/ErrorBoundary';
import NetworkStatus from './components/common/NetworkStatus';
import './styles/global.css';
import './styles/auth.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isPremiumFlow, setIsPremiumFlow] = useState(false);
  
  // Premium status tracking
  const [isPremium, setIsPremium] = useState(false);
  const [premiumEndDate, setPremiumEndDate] = useState(null);

  // Check premium status when user logs in
  useEffect(() => {
    if (loggedInUser) {
      checkPremiumStatus();
    }
  }, [loggedInUser]);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payment/premium-status/${loggedInUser}`);
      const data = await response.json();
      
      if (data.success) {
        setIsPremium(data.isPremium);
        setPremiumEndDate(data.premiumEndDate);
        console.log('✅ Premium status:', data.isPremium);
      }
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
    }
  };

  // Render function wrapped in ErrorBoundary
  const renderContent = () => {
    // If user is already premium and tries to buy, show premium status page
    if (loggedInUser && isPremiumFlow) {
      if (isPremium) {
        return (
          <PremiumStatusPage
            userEmail={loggedInUser}
            premiumEndDate={premiumEndDate}
            onBack={() => {
              setIsPremiumFlow(false);
              setCurrentView('dashboard');
            }}
          />
        );
      }

      return (
        <BuyPremiumPage 
          userEmail={loggedInUser}
          onBack={() => {
            setIsPremiumFlow(false);
            setCurrentView('dashboard');
          }}
          onPaymentSuccess={() => {
            setIsPremiumFlow(false);
            setIsPremium(true);
            checkPremiumStatus(); // Refresh premium status
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
          isPremium={isPremium}
          premiumEndDate={premiumEndDate}
          onBuyPremium={() => setIsPremiumFlow(true)}
          onLogout={() => {
            setLoggedInUser(null);
            setIsPremiumFlow(false);
            setIsPremium(false);
            setPremiumEndDate(null);
            setCurrentView('home');
          }}
        />
      );
    }

    // Show Forgot Password Page
    if (currentView === 'forgot-password') {
      return (
        <div className="auth-page">
          <div className="auth-background">
            <ForgotPasswordForm 
              onBack={() => setCurrentView('login')}
              onLoginClick={() => setCurrentView('login')}
            />
          </div>
        </div>
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
              onForgotPassword={() => setCurrentView('forgot-password')}
              onLoginSuccess={(email) => {
                setLoggedInUser(email);
                setCurrentView('dashboard'); // ✅ ADDED THIS LINE
                // Premium flow: After login, go to payment
                if (isPremiumFlow) {
                  // checkPremiumStatus will run via useEffect
                }
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
              onLoginSuccess={(email) => { // ✅ CHANGED FROM onRegisterSuccess to onLoginSuccess
                setLoggedInUser(email);
                setCurrentView('dashboard'); // ✅ ADDED THIS LINE
                // If premium flow, isPremiumFlow flag will trigger payment page
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
            setIsPremiumFlow(false); // Free plan flow
            setCurrentView('register');
          }}
          onPremiumClick={() => {
            setIsPremiumFlow(true); // Premium plan flow
            setCurrentView('register');
          }}
        />
        <Footer />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <NetworkStatus />
      {renderContent()}
    </ErrorBoundary>
  );
}

export default App;
