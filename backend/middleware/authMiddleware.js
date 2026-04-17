import { verifyToken } from '../config/jwt.js';
import { errorResponse } from '../utils/response.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization header missing or malformed', 'Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 'Unauthorized', 401);
  }
};
