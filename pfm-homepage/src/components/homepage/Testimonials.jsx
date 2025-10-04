const Testimonials = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: '👩‍💻',
      text: 'PFM Platform helped me save ₹50,000 in just 6 months! The expense tracking is incredible.',
      rating: 5
    },
    {
      name: 'Rahul Patel',
      role: 'Business Owner',  
      image: '👨‍💼',
      text: 'Finally found a budgeting tool that actually works. Highly recommend!',
      rating: 5
    },
    {
      name: 'Sneha Reddy',
      role: 'Student',
      image: '👩‍🎓', 
      text: 'As a student, this app helps me track every rupee. Love the simple interface!',
      rating: 5
    }
  ];

  return (
    <section style={testimonialsStyles}>
      <div className="container">
        <h2 style={titleStyles}>What Our Users Say</h2>
        <div style={testimonialsGridStyles}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={testimonialCardStyles}>
              <div style={ratingStyles}>
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p style={textStyles}>"{testimonial.text}"</p>
              <div style={userInfoStyles}>
                <span style={avatarStyles}>{testimonial.image}</span>
                <div>
                  <h4>{testimonial.name}</h4>
                  <p style={roleStyles}>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
