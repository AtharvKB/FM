const Stats = () => {
  const stats = [
    { number: '50,000+', label: 'Active Users', icon: '👥' },
    { number: '₹5 Cr+', label: 'Money Managed', icon: '💰' },
    { number: '99.9%', label: 'Uptime', icon: '⚡' },
    { number: '4.8/5', label: 'User Rating', icon: '⭐' }
  ];

  return (
    <section style={statsStyles}>
      <div className="container">
        <div style={statsGridStyles}>
          {stats.map((stat, index) => (
            <div key={index} style={statCardStyles}>
              <span style={iconStyles}>{stat.icon}</span>
              <h3 style={numberStyles}>{stat.number}</h3>
              <p style={labelStyles}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
