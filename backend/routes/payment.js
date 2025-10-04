const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, email } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise (₹352.82 = 35282 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: email,
        description: 'Premium Subscription - 30 days'
      }
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created:', order.id);
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Order creation failed: ' + error.message
    });
  }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email
    } = req.body;

    console.log('🔄 Verifying payment for order:', razorpay_order_id);

    // Verify Razorpay signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      console.log('❌ Invalid signature');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }

    console.log('✅ Signature verified successfully');

    // Activate premium (30 days)
    const premiumDuration = 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + premiumDuration);

    const user = await User.findOneAndUpdate(
      { email: email },
      {
        isPremium: true,
        premiumStartDate: startDate,
        premiumEndDate: endDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Premium activated for:', email, 'until', endDate.toDateString());

    res.json({
      success: true,
      message: 'Premium activated successfully!',
      user: {
        email: user.email,
        isPremium: user.isPremium,
        premiumEndDate: user.premiumEndDate
      }
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed: ' + error.message
    });
  }
});

// Check Premium Status
router.get('/premium-status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if expired
    const now = new Date();
    if (user.isPremium && user.premiumEndDate < now) {
      await User.findOneAndUpdate(
        { email: req.params.email },
        { isPremium: false }
      );
      
      return res.json({
        success: true,
        isPremium: false,
        message: 'Premium subscription expired'
      });
    }

    res.json({
      success: true,
      isPremium: user.isPremium,
      premiumEndDate: user.premiumEndDate
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Status check failed'
    });
  }
});

module.exports = router;
