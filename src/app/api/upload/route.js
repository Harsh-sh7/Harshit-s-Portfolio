import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';
import { isAdminAuthenticated } from '@/lib/auth';

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Get original extension
    const originalName = file.name;
    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;

    // If Vercel Blob token is configured, save directly to Vercel Blob cloud storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, { access: 'public' });
      return NextResponse.json({ success: true, url: blob.url });
    }

    // Otherwise, fallback to saving on the local filesystem
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
