module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiration: 86400, // 24 hours
  jwtRefreshExpiration: 604800, // 7 days
};
