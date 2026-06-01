import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Dedicated endpoint to verify admin session — used by the admin page on load
export async function GET() {
  const authed = await isAdminAuthenticated();
  if (authed) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
