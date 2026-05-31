import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = {
    env: {
      MONGODB_URI: process.env.MONGODB_URI ? '✅ SET (length: ' + process.env.MONGODB_URI.length + ')' : '❌ MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ MISSING',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ MISSING',
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? '✅ SET' : '❌ MISSING',
    },
    mongoTest: null,
    mongoError: null,
  };

  // Test MongoDB connection
  try {
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      await mongoose.default.connect(process.env.MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 5000 });
    }
    results.mongoTest = '✅ Connected successfully';
  } catch (err) {
    results.mongoError = err.message;
    results.mongoTest = '❌ FAILED';
  }

  return NextResponse.json(results);
}
