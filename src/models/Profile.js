import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Admin User" },
  role: { type: String, default: "Full-Stack Developer" },
  bio: { type: String, default: "I build interactive web apps using modern frameworks and technologies." },
  location: { type: String, default: "Your City, Country" },
  email: { type: String, default: "admin@example.com" },
  portfolioUrl: { type: String, default: "https://example.com" },
  github: { type: String, default: "https://github.com" },
  linkedin: { type: String, default: "https://linkedin.com" },
  codechef: { type: String, default: "https://codechef.com" },
  codeforces: { type: String, default: "https://codeforces.com" },
  leetcode: { type: String, default: "https://leetcode.com" },
  resumeUrl: { type: String, default: "/resume.pdf" },
  calcomUrl: { type: String, default: "https://cal.com" },
  imageUrl: { type: String, default: "" },
  // About Page specific fields
  aboutHeading1: { type: String, default: "I solve problems," },
  aboutHeading2: { type: String, default: "they call it coding." },
  aboutBody: {
    type: String,
    default: `I'm a full-stack developer and problem-solver with a strong passion for competitive programming and building scalable solutions.\n\nI started by diving deep into data structures and algorithms, which laid a solid foundation for my software engineering journey. From there, I expanded into full-stack development and integrations.\n\nI believe in hands-on building as the best way to learn new technologies.`
  },
  twitter: { type: String, default: "https://x.com" },
  aboutGallery: {
    type: [
      {
        id: String,
        src: String,
        title: String,
        subtitle: String
      }
    ],
    default: []
  }
}, { timestamps: true });

if (mongoose.models.Profile) {
  delete mongoose.models.Profile;
}

export default mongoose.model('Profile', ProfileSchema);
