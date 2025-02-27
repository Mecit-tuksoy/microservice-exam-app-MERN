// auth-service/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'exam-app-secret-key';

module.exports = function(req, res, next) {
  // Token'ı header'dan al
  const token = req.header('x-auth-token');
  
  // Token kontrolü
  if (!token) {
    return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı' });
  }
  
  try {
    // Token doğrulama
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};