import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * INSTITUTIONAL GRADE DATABASE RESILIENCE WRAPPER
 * Automatically retries failed queries to handle network jitter.
 */
export const executeWithRetry = async (queryObj, retries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await client.execute(queryObj);
    } catch (err) {
      lastError = err;
      const isNetworkError = err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET' || err.message.includes('fetch');
      if (!isNetworkError) throw err; // Don't retry logic errors
      
      console.warn(`[DB RETRY] Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw lastError;
};

export default client;
