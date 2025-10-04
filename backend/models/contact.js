const express = require('express');
const router = express.Router();

// Handle contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    console.log('Contact form received:', { name, email, message });
    
    // Here you could:
    // - Save to database
    // - Send email notification
    // - Log to file
    
    res.json({ 
      success: true, 
      message: 'Thank you for contacting us!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit contact form' 
    });
  }
});

module.exports = router;
