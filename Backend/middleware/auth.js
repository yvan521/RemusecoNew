import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/respond.js';

export function signJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

export function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return unauthorized(res, 'Missing token');
  try {
    const decoded = verifyJwt(token);
    req.user = decoded; // { employee_id, role, username }
    next();
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) return forbidden(res, 'Insufficient role');
    next();
  };
}
