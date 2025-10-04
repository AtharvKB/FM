import React, { useState } from "react";

const BuyPremiumPage = ({ userEmail, onBack, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Razorpay SDK failed to load');
        setIsProcessing(false);
        return;
      }

      console.log('🔄 Creating order...');

      const orderResponse = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 352.82, email: userEmail })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert('Order creation failed: ' + orderData.message);
        setIsProcessing(false);
        return;
      }

      console.log('✅ Order created:', orderData.order.id);

      // ⚠️ REPLACE WITH YOUR ACTUAL RAZORPAY KEY ID
      const options = {
        key: 'rzp_test_RPKOU6Ky0Y8EuF', // 🔥 PUT YOUR KEY HERE
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Financial Management',
        description: 'Premium Subscription - 30 Days',
        order_id: orderData.order.id,
        handler: async function (response) {
          console.log('✅ Payment successful:', response);

          const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: userEmail
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            alert('🎉 Premium activated successfully!');
            onPaymentSuccess();
          } else {
            alert('Payment verification failed: ' + verifyData.message);
          }
          setIsProcessing(false);
        },
        prefill: {
          email: userEmail
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled');
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Payment failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
          <button 
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              padding: '0.6rem 1.2rem',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 style={{ color: '#667eea', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Complete Your Premium Purchase
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Logged in as: <strong>{userEmail}</strong>
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            padding: '2rem',
            borderRadius: '15px'
          }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '25px',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              Premium Plan
            </div>
            
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' }}>
              <span style={{ fontSize: '1.5rem', verticalAlign: 'top' }}>₹</span>299
              <span style={{ fontSize: '1rem', color: '#6b7280' }}>/month</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>What's Included:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Unlimited expense tracking</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Unlimited budget categories</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Advanced analytics & AI insights</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Goal tracking & recommendations</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Custom reports & exports</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Bill reminders & notifications</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Priority customer support</li>
                <li style={{ padding: '0.6rem 0', color: '#4b5563' }}>✅ Ad-free experience</li>
              </ul>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', color: '#4b5563' }}>
                <span>Subtotal</span>
                <span>₹299.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', color: '#4b5563' }}>
                <span>GST (18%)</span>
                <span>₹53.82</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem 0',
                borderTop: '2px solid #e5e7eb',
                marginTop: '0.5rem',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#1f2937'
              }}>
                <span>Total</span>
                <span>₹352.82</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: 700,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isProcessing ? 'Opening Payment Gateway...' : '💳 Pay ₹352.82'}
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              🔒 Secure payment powered by Razorpay
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', color: '#374151' }}>
              What Our Premium Users Say
            </h3>
            
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              borderLeft: '4px solid #667eea'
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', color: '#4b5563' }}>
                "Premium features have transformed how I manage my finances. Best investment!"
              </p>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>- Rahul S.</span>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              borderLeft: '4px solid #667eea'
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', color: '#4b5563' }}>
                "The advanced analytics helped me save ₹50,000 in just 3 months."
              </p>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>- Priya M.</span>
            </div>

            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              borderLeft: '4px solid #667eea'
            }}>
              <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', color: '#4b5563' }}>
                "Priority support is incredible. They solve issues within minutes!"
              </p>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>- Amit K.</span>
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '2px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontWeight: 500 }}>
            💯 30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyPremiumPage;
