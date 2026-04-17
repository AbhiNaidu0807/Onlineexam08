import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await client.execute({
      sql: `SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20`,
      args: [userId]
    });
    
    return successResponse(res, result.rows);
  } catch (error) {
    return errorResponse(res, error, 'Failed to fetch notifications');
  }
};

export const markAsRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.body;
  try {
    if (id) {
      await client.execute({
        sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        args: [id, userId]
      });
    } else {
      await client.execute({
        sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        args: [userId]
      });
    }
    return successResponse(res, null, 'Notifications updated');
  } catch (error) {
    return errorResponse(res, error, 'Failed to update notifications');
  }
};

export const clearNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    await client.execute({
      sql: 'DELETE FROM notifications WHERE user_id = ?',
      args: [userId]
    });
    return successResponse(res, null, 'Notifications cleared');
  } catch (error) {
    return errorResponse(res, error, 'Failed to clear notifications');
  }
};

// Helper for other controllers
export const createNotification = async (userId, type, message) => {
  try {
    await client.execute({
      sql: 'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      args: [userId, type, message]
    });
  } catch (e) {
    console.error('Notification creation failed', e);
  }
};
