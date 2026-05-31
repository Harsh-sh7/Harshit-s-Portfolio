import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // We only care when a new repository is created
    if (payload.action === 'created' && payload.repository) {
      await dbConnect();
      
      const repoName = payload.repository.name;
      const repoUrl = payload.repository.html_url;
      const repoDesc = payload.repository.description || 'No description provided.';
      
      // Fetch current projects
      const currentProjects = await Project.find({}).lean();
      
      const currentProjectsHtml = currentProjects.length > 0 
        ? currentProjects.map(p => `<li>${p.title} - <a href="${p.github_url}">${p.github_url}</a></li>`).join('')
        : '<li>No projects listed yet.</li>';

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // sending to yourself
        subject: `[Portfolio] New GitHub Repo Created: ${repoName}`,
        html: `
          <h2>New GitHub Repository Created!</h2>
          <p>You just created a new repository on GitHub. Would you like to add it to your portfolio?</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>Repository Details:</h3>
            <p><strong>Name:</strong> ${repoName}</p>
            <p><strong>URL:</strong> <a href="${repoUrl}">${repoUrl}</a></p>
            <p><strong>Description:</strong> ${repoDesc}</p>
          </div>
          
          <p>Go to your <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin">Admin Dashboard</a> to add it!</p>
          
          <hr />
          <h3>Your Current Portfolio Projects:</h3>
          <ul>
            ${currentProjectsHtml}
          </ul>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Webhook processed and email sent for repository: ${repoName}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
