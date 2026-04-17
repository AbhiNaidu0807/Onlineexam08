import { errorResponse } from '../utils/response.js';

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 'Admin role required', 'Forbidden', 403);
  }
};

export const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return errorResponse(res, 'Student role required', 'Forbidden', 403);
  }
};
