import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const ADMIN_EMAIL = 'harshakya56@gmail.com';
const OTP_EXPIRY_SECONDS = 600; // 10 minutes
const MAX_ATTEMPTS = 3;         // alert after this many wrong passwords

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp, salt) {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

function getMailer() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// ── OTP success email ──────────────────────────────────────────────────────────
async function sendOTPEmail(otp) {
  await getMailer().sendMail({
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `🔐 Admin Login OTP — ${otp}`,
    html: `
      <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:32px;background:#0a0a0a;border:1px solid #222;border-radius:12px;color:#fff;">
        <h2 style="color:#fff;margin-bottom:8px;">Admin Portal Login</h2>
        <p style="color:#888;margin-bottom:24px;font-size:14px;">Someone entered the correct password. Use this OTP to proceed.</p>
        <div style="background:#111;border:1px solid #333;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#fff;">${otp}</span>
        </div>
        <p style="color:#555;font-size:12px;">Expires in <strong style="color:#888">10 minutes</strong>. If you didn't initiate this, your password may be compromised — change it immediately.</p>
      </div>
    `,
  });
}

// ── Intrusion alert email ──────────────────────────────────────────────────────
async function sendIntrusionAlert({ ip, userAgent, attempts, timestamp, country, city }) {
  const time = new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Parse UA for readable browser/OS
  const isChrome   = /Chrome\/[\d.]+/.test(userAgent) && !/Edg|OPR/.test(userAgent);
  const isFirefox  = /Firefox\/[\d.]+/.test(userAgent);
  const isSafari   = /Safari\/[\d.]+/.test(userAgent) && !isChrome;
  const isEdge     = /Edg\/[\d.]+/.test(userAgent);
  const browserName = isEdge ? 'Microsoft Edge' : isChrome ? 'Google Chrome' : isFirefox ? 'Mozilla Firefox' : isSafari ? 'Safari' : 'Unknown Browser';

  const isWindows = /Windows NT/.test(userAgent);
  const isMac     = /Mac OS X/.test(userAgent);
  const isLinux   = /Linux/.test(userAgent) && !/Android/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isIOS     = /iPhone|iPad/.test(userAgent);
  const osName    = isWindows ? 'Windows' : isMac ? 'macOS' : isAndroid ? 'Android' : isIOS ? 'iOS' : isLinux ? 'Linux' : 'Unknown OS';

  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const deviceType = isMobile ? '📱 Mobile' : '🖥️ Desktop';

  const location = [city, country].filter(Boolean).join(', ') || 'Unknown';

  await getMailer().sendMail({
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `🚨 SECURITY ALERT — ${attempts} Failed Admin Login Attempts`,
    html: `
      <div style="font-family:monospace;max-width:520px;margin:0 auto;padding:32px;background:#0a0a0a;border:1px solid #7f1d1d;border-radius:12px;color:#fff;">
        
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <div style="width:48px;height:48px;background:#7f1d1d;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">🚨</div>
          <div>
            <h2 style="color:#ef4444;margin:0 0 4px;">Intrusion Attempt Detected</h2>
            <p style="color:#888;margin:0;font-size:13px;">Someone tried to access your admin portal</p>
          </div>
        </div>

        <div style="background:#111;border:1px solid #7f1d1d;border-radius:8px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="color:#888;padding:6px 0;width:140px;">Failed Attempts</td>
              <td style="color:#ef4444;font-weight:bold;font-size:16px;">${attempts} / ${MAX_ATTEMPTS}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">Time (IST)</td>
              <td style="color:#fff;">${time}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">IP Address</td>
              <td style="color:#fff;font-weight:bold;">${ip}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">Location</td>
              <td style="color:#fff;">${location}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">Browser</td>
              <td style="color:#fff;">${browserName}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">Operating System</td>
              <td style="color:#fff;">${osName}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;">Device Type</td>
              <td style="color:#fff;">${deviceType}</td>
            </tr>
          </table>
        </div>

        <div style="background:#1a0a0a;border:1px solid #333;border-radius:6px;padding:12px;margin-bottom:20px;">
          <p style="color:#555;font-size:11px;margin:0 0 4px;">Full User-Agent String:</p>
          <p style="color:#888;font-size:11px;margin:0;word-break:break-all;">${userAgent}</p>
        </div>

        <div style="border-top:1px solid #222;padding-top:16px;">
          <p style="color:#ef4444;font-size:12px;margin:0 0 8px;">⚠️ Recommended Actions:</p>
          <ul style="color:#888;font-size:12px;margin:0;padding-left:16px;line-height:1.8;">
            <li>If this was not you, change your <strong style="color:#fff">ADMIN_PASSWORD</strong> immediately in Vercel env vars</li>
            <li>Block the IP <strong style="color:#fff">${ip}</strong> in Vercel firewall if attacks persist</li>
            <li>Consider enabling Vercel's DDoS protection</li>
          </ul>
        </div>
      </div>
    `,
  });
}

// ── Geo-lookup (best-effort, no API key needed) ────────────────────────────────
async function getGeoInfo(ip) {
  try {
    // Skip private/local IPs
    if (!ip || ip === 'unknown' || ip.startsWith('::') || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local Network', city: '' };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    if (data.status === 'success') return { country: data.country, city: data.city };
  } catch {}
  return { country: '', city: '' };
}

// ── Parse attempt counter from cookie ─────────────────────────────────────────
function getAttemptCount(request) {
  const cookie = request.cookies.get('admin_attempts');
  if (!cookie) return 0;
  const [countStr, expiryStr] = (cookie.value || '').split(':');
  const expiry = parseInt(expiryStr || '0', 10);
  if (Date.now() > expiry) return 0; // Window expired — reset
  return parseInt(countStr || '0', 10);
}

// ── POST /api/admin/login ──────────────────────────────────────────────────────
// Body: { password } → sends OTP, returns { step: 'otp' }
// Body: { otp }     → verifies OTP, sets auth cookie
export async function POST(request) {
  try {
    const body = await request.json();
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // ── Step 2: OTP verification ───────────────────────────────────────────────
    if (body.otp) {
      const otpCookie  = request.cookies.get('admin_otp');
      const saltCookie = request.cookies.get('admin_otp_salt');

      if (!otpCookie || !saltCookie) {
        return NextResponse.json({ success: false, error: 'OTP expired or not found. Please start over.' }, { status: 401 });
      }

      const [hash, expiryStr] = (otpCookie.value || '').split(':');
      const expiry = parseInt(expiryStr || '0', 10);

      if (Date.now() > expiry) {
        const res = NextResponse.json({ success: false, error: 'OTP expired. Please start over.' }, { status: 401 });
        res.cookies.set('admin_otp',      '', { path: '/', maxAge: 0 });
        res.cookies.set('admin_otp_salt', '', { path: '/', maxAge: 0 });
        return res;
      }

      const inputHash = hashOTP(body.otp.trim(), saltCookie.value);
      if (inputHash !== hash) {
        return NextResponse.json({ success: false, error: 'Incorrect OTP.' }, { status: 401 });
      }

      // ✅ OTP correct — grant access, clear attempt counter
      const res = NextResponse.json({ success: true, step: 'done' });
      res.cookies.set('admin_auth', getAuthToken(), {
        path: '/', maxAge: 60 * 60 * 24 * 7,
        httpOnly: true, sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      res.cookies.set('admin_otp',      '', { path: '/', maxAge: 0 });
      res.cookies.set('admin_otp_salt', '', { path: '/', maxAge: 0 });
      res.cookies.set('admin_attempts', '', { path: '/', maxAge: 0 });
      return res;
    }

    // ── Step 1: Password check ─────────────────────────────────────────────────
    if (!body.password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    if (body.password !== (process.env.ADMIN_PASSWORD || 'admin123')) {
      // Slow brute-force
      await new Promise(r => setTimeout(r, 1000));

      // Increment attempt counter (1-hour sliding window)
      const prevCount = getAttemptCount(request);
      const newCount  = prevCount + 1;
      const windowEnd = Date.now() + 60 * 60 * 1000; // 1 hour from first attempt

      const res = NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
      res.cookies.set('admin_attempts', `${newCount}:${windowEnd}`, {
        path: '/', maxAge: 60 * 60,
        httpOnly: true, sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      // Send alert at exactly MAX_ATTEMPTS (not every time after)
      if (newCount === MAX_ATTEMPTS) {
        const geo = await getGeoInfo(ip);
        sendIntrusionAlert({ ip, userAgent, attempts: newCount, timestamp: Date.now(), ...geo })
          .catch(err => console.error('Failed to send intrusion alert:', err));
      }

      return res;
    }

    // ── Password correct → generate & send OTP ────────────────────────────────
    const otp    = generateOTP();
    const salt   = crypto.randomBytes(16).toString('hex');
    const hash   = hashOTP(otp, salt);
    const expiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;

    await sendOTPEmail(otp);

    const maskedEmail = ADMIN_EMAIL.replace(/(.{2}).*(@.*)/, '$1***$2');
    const res = NextResponse.json({ success: true, step: 'otp', message: `OTP sent to ${maskedEmail}` });

    res.cookies.set('admin_otp', `${hash}:${expiry}`, {
      path: '/', maxAge: OTP_EXPIRY_SECONDS,
      httpOnly: true, sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.cookies.set('admin_otp_salt', salt, {
      path: '/', maxAge: OTP_EXPIRY_SECONDS,
      httpOnly: true, sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    // Reset attempt counter on successful password
    res.cookies.set('admin_attempts', '', { path: '/', maxAge: 0 });
    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_auth',     '', { path: '/', maxAge: 0, httpOnly: true });
  res.cookies.set('admin_attempts', '', { path: '/', maxAge: 0, httpOnly: true });
  return res;
}
