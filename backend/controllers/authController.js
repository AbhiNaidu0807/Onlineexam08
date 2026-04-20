import bcrypt from 'bcryptjs';
import client from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 'Name, email, and password are required', 'Bad Request', 400);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 'Invalid email format', 'Bad Request', 400);
  }

  if (!validatePassword(password)) {
    return errorResponse(res, 'Password must be at least 6 characters', 'Bad Request', 400);
  }

  try {
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });

    if (existingUser.rows.length > 0) {
      return errorResponse(res, 'Email already registered', 'Conflict', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.execute({
      sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      args: [name, email, hashedPassword, role || 'student']
    });

    const user = { id: result.lastInsertRowid.toString(), name, email, role: role || 'student' };
    const token = generateToken(user);

    return successResponse(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 'Bad Request', 400);
  }

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });

    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 'Unauthorized', 401);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 'Unauthorized', 401);
    }

    const token = generateToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    
    // Don't send password
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return errorResponse(res, 'Name and email are required', 'Bad Request', 400);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 'Invalid email format', 'Bad Request', 400);
  }

  try {
    // Check if email is taken by another user
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
      args: [email, userId]
    });

    if (existing.rows.length > 0) {
      return errorResponse(res, 'Email already in use', 'Conflict', 409);
    }

    await client.execute({
      sql: 'UPDATE users SET name = ?, email = ? WHERE id = ?',
      args: [name, email, userId]
    });

    const updatedUser = await client.execute({
      sql: 'SELECT id, name, email, role, profile_photo FROM users WHERE id = ?',
      args: [userId]
    });

    return successResponse(res, updatedUser.rows[0], 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 'Bad Request', 400);
  }

  const userId = req.user.id;
  const avatarUrl = `/uploads/${req.file.filename}`;

  try {
    await client.execute({
      sql: 'UPDATE users SET profile_photo = ? WHERE id = ?',
      args: [avatarUrl, userId]
    });

    return successResponse(res, { avatarUrl }, 'Avatar uploaded successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const removeAvatar = async (req, res) => {
  const userId = req.user.id;

  try {
    await client.execute({
      sql: 'UPDATE users SET profile_photo = NULL WHERE id = ?',
      args: [userId]
    });

    return successResponse(res, null, 'Avatar removed successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return errorResponse(res, 'Current and new password are required', 'Bad Request', 400);
  }

  try {
    const result = await client.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [userId]
    });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, 'Incorrect current password', 'Unauthorized', 401);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await client.execute({
      sql: 'UPDATE users SET password = ? WHERE id = ?',
      args: [hashedNewPassword, userId]
    });

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await client.execute({
      sql: 'SELECT id, name, email, role, profile_photo FROM users WHERE id = ?',
      args: [userId]
    });
    return successResponse(res, result.rows[0], 'Profile fetched successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};
