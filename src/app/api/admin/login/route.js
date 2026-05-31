import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', getAuthToken(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: false, // Accessible to client-side JS for simple UI changes
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_auth', '', { path: '/', maxAge: 0 });
  return response;
}
