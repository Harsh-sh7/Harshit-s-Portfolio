import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { socialLinks } from '@/lib/config';
import { isAdminAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    let profile = await Profile.findOne({});
    if (!profile) {
      profile = await Profile.create({
        name: "Admin User",
        role: "Full-Stack Developer",
        bio: "I build interactive web apps using modern frameworks and technologies.",
        location: "Your City, Country",
        email: socialLinks.email,
        portfolioUrl: socialLinks.portfolio,
        github: socialLinks.github,
        linkedin: socialLinks.linkedin,
        codechef: socialLinks.codechef,
        codeforces: socialLinks.codeforces,
        leetcode: socialLinks.leetcode,
        resumeUrl: socialLinks.resume,
        calcomUrl: socialLinks.calcom,
        imageUrl: "",
        twitter: "https://x.com"
      });
    }

    // Convert to plain object and ensure default about fields are populated
    let profileObj = profile.toObject ? profile.toObject() : profile;

    if (!profileObj.aboutHeading1) profileObj.aboutHeading1 = "I solve problems,";
    if (!profileObj.aboutHeading2) profileObj.aboutHeading2 = "they call it coding.";
    if (!profileObj.aboutBody) {
      profileObj.aboutBody = `I'm a full-stack developer and problem-solver with a strong passion for competitive programming and building scalable solutions.\n\nI started by diving deep into data structures and algorithms, which laid a solid foundation for my software engineering journey. From there, I expanded into full-stack development and integrations.\n\nI believe in hands-on building as the best way to learn new technologies.`;
    }
    if (!profileObj.twitter) profileObj.twitter = "https://x.com";
    if (!profileObj.aboutGallery) {
      profileObj.aboutGallery = [];
    }

    return NextResponse.json(
      { success: true, data: profileObj },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const data = await request.json();
    let profile = await Profile.findOne({});
    if (profile) {
      profile = await Profile.findByIdAndUpdate(profile._id, data, { new: true });
    } else {
      profile = await Profile.create(data);
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
