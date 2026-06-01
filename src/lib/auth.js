import { cookies } from 'next/headers';
import crypto from 'crypto';

function getExpectedToken() {
  // ADMIN_PASSWORD must be set in environment variables
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('admin_auth');
    if (!authCookie) return false;
    return authCookie.value === getExpectedToken();
  } catch (error) {
    return false;
  }
}

export function getAuthToken() {
  return getExpectedToken();
}
