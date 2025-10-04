import React, { useState } from "react";
import './BuyPremiumPage.css';

const BuyPremiumPage = ({ userEmail, onBack, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    
    // 🆕 TODO: Integrate Razorpay here
    setTimeout(() => {
      alert('Payment successful! Premium activated.');
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="premium-page">
      <div className="premium-container">
        <div className="premium-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1>Complete Your Premium Purchase</h1>
          <p className="user-info">Logged in as: <strong>{userEmail}</strong></p>
        </div>

        <div className="premium-content">
          <div className="plan-summary">
            <div className="plan-badge">Premium Plan</div>
            <div className="plan-price">
              <span className="currency">₹</span>
              <span className="amount">299</span>
              <span className="period">/month</span>
            </div>
            
            <div className="plan-features">
              <h3>What's Included:</h3>
              <ul>
                <li>✅ Unlimited expense tracking</li>
                <li>✅ Unlimited budget categories</li>
                <li>✅ Advanced analytics & AI insights</li>
                <li>✅ Goal tracking & recommendations</li>
                <li>✅ Custom reports & exports</li>
                <li>✅ Bill reminders & notifications</li>
                <li>✅ Priority customer support</li>
                <li>✅ Ad-free experience</li>
              </ul>
            </div>

            <div className="payment-info">
              <div className="info-row">
                <span>Subtotal</span>
                <span>₹299.00</span>
              </div>
              <div className="info-row">
                <span>GST (18%)</span>
                <span>₹53.82</span>
              </div>
              <div className="info-row total">
                <span>Total</span>
                <span>₹352.82</span>
              </div>
            </div>

            <button 
              className="pay-btn" 
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : '💳 Pay ₹352.82'}
            </button>

            <p className="secure-text">🔒 Secure payment powered by Razorpay</p>
          </div>

          <div className="testimonials">
            <h3>What Our Premium Users Say</h3>
            <div className="testimonial">
              <p>"Premium features have transformed how I manage my finances. Best investment!"</p>
              <span>- Rahul S.</span>
            </div>
            <div className="testimonial">
              <p>"The advanced analytics helped me save ₹50,000 in just 3 months."</p>
              <span>- Priya M.</span>
            </div>
            <div className="testimonial">
              <p>"Priority support is incredible. They solve issues within minutes!"</p>
              <span>- Amit K.</span>
            </div>
          </div>
        </div>

        <div className="premium-footer">
          <p>💯 30-day money-back guarantee • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default BuyPremiumPage;
