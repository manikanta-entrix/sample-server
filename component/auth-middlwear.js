import jwt from 'jsonwebtoken';

const authenticator = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Token should be in the form "Bearer <token>"

  if (!token) {
    return res.status(403).json({ status: false, errCode: 'auth:no-token', message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: false, errCode: 'auth:invalid-token', message: 'Invalid or expired token' });
    }

    req.user = decoded;

    next();
  });
};  

export default authenticator;
