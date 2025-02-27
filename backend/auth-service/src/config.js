// auth-service/src/config.js
module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/exam-auth',
    jwtSecret: process.env.JWT_SECRET || 'exam-app-secret-key',
    port: process.env.PORT || 3001
  };