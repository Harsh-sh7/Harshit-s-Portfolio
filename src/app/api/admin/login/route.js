import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const ADMIN_EMAIL = 'harshakya56@gmail.com';
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp, salt) {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

async function sendOTPEmail(otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `🔐 Admin Login OTP — ${otp}`,
    html: `
      <div style="font-family: monospace; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; border: 1px solid #222; border-radius: 12px; color: #fff;">
        <h2 style="color: #fff; margin-bottom: 8px;">Admin Portal Login</h2>
        <p style="color: #888; margin-bottom: 24px; font-size: 14px;">Someone just entered the correct password. Use this OTP to proceed.</p>
        <div style="background: #111; border: 1px solid #333; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #fff;">${otp}</span>
        </div>
        <p style="color: #555; font-size: 12px;">This OTP expires in <strong style="color:#888">10 minutes</strong>. If you didn't initiate this login, your password may be compromised.</p>
      </div>
    `,
  });
}

// POST /api/admin/login
// Body: { password } → sends OTP, returns { step: 'otp' }
// Body: { otp }     → verifies OTP, sets auth cookie
export async function POST(request) {
  try {
    const body = await request.json();

    // ── Step 2: OTP verification ──
    if (body.otp) {
      const cookies = request.cookies;
      const otpCookie = cookies.get('admin_otp');
      const saltCookie = cookies.get('admin_otp_salt');

      if (!otpCookie || !saltCookie) {
        return NextResponse.json({ success: false, error: 'OTP expired or not found. Please start over.' }, { status: 401 });
      }

      const { value: storedHash, expires } = otpCookie ? { value: otpCookie.value, expires: null } : {};
      // Parse expiry from cookie value: "hash:timestamp"
      const [hash, expiryStr] = (otpCookie.value || '').split(':');
      const expiry = parseInt(expiryStr || '0', 10);

      if (Date.now() > expiry) {
        const res = NextResponse.json({ success: false, error: 'OTP expired. Please start over.' }, { status: 401 });
        res.cookies.set('admin_otp', '', { path: '/', maxAge: 0 });
        res.cookies.set('admin_otp_salt', '', { path: '/', maxAge: 0 });
        return res;
      }

      const salt = saltCookie.value;
      const inputHash = hashOTP(body.otp.trim(), salt);

      if (inputHash !== hash) {
        return NextResponse.json({ success: false, error: 'Incorrect OTP.' }, { status: 401 });
      }

      // OTP correct — grant access
      const res = NextResponse.json({ success: true, step: 'done' });
      res.cookies.set('admin_auth', getAuthToken(), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      // Clear OTP cookies
      res.cookies.set('admin_otp', '', { path: '/', maxAge: 0 });
      res.cookies.set('admin_otp_salt', '', { path: '/', maxAge: 0 });
      return res;
    }

    // ── Step 1: Password check ──
    if (!body.password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    if (body.password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
      // Add a small delay to slow brute-force
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    // Generate OTP
    const otp = generateOTP();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashOTP(otp, salt);
    const expiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;

    // Send OTP email
    await sendOTPEmail(otp);

    const res = NextResponse.json({ success: true, step: 'otp', message: `OTP sent to ${ADMIN_EMAIL.replace(/(.{2}).*(@.*)/, '$1***$2')}` });
    // Store hashed OTP in short-lived httpOnly cookie
    res.cookies.set('admin_otp', `${hash}:${expiry}`, {
      path: '/',
      maxAge: OTP_EXPIRY_SECONDS,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookies.set('admin_otp_salt', salt, {
      path: '/',
      maxAge: OTP_EXPIRY_SECONDS,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed. Check server logs.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_auth', '', { path: '/', maxAge: 0, httpOnly: true });
  return response;
}
