# Harshit Shakya Portfolio Setup Guide

Welcome to your new minimalist portfolio! This guide will walk you through the final steps required to connect your MongoDB backend, configure your Google App password for emails, set up your GitHub webhook, and ensure everything is running flawlessly.

## Step 1: Environment Variables Setup

You'll need to fill in the placeholders in your `.env.local` file (located in the root of the project).

1. Open `.env.local`.
2. **MongoDB Connection**: 
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Get your connection string (URI) and add it to `MONGODB_URI`.
3. **Google App Password (for Emails)**:
   - Go to your Google Account -> Security -> 2-Step Verification -> App passwords.
   - Create a new app password and add it to `EMAIL_PASS`.
   - Add your Google email address to `EMAIL_USER`.
4. **GitHub Token**:
   - Go to your GitHub Settings -> Developer settings -> Personal access tokens.
   - Generate a new classic token (read-only access is fine) and add it to `GITHUB_TOKEN`. This powers the GitHub contribution graph.

## Step 2: The Admin Portal

To make your portfolio dynamic (where you can update projects and experience without touching the code), we've built a full-stack Admin Portal connected to your MongoDB database.

1. Once your `MONGODB_URI` is set up, start your local server (`npm run dev`) and visit `http://localhost:3000/admin`.
2. Use the default password `admin123` to log in (you can change this in `src/app/admin/page.jsx`).
3. You can now visually add new Projects and Experiences! They will be saved to your MongoDB database automatically.

## Step 3: Setting Up the GitHub Webhook (Auto-Email Notifications)

We've created a webhook endpoint that will email you whenever you create a new repository on GitHub, asking if you want to add it to your portfolio (along with a list of your current portfolio projects).

1. Ensure your portfolio is deployed to a live URL (e.g., Vercel), OR use a tool like `ngrok` if testing locally. Let's assume your domain is `https://your-portfolio.vercel.app`.
2. Go to GitHub -> Settings (for your whole account, not a specific repo) -> Webhooks (or set it up on a specific repo if preferred). Actually, to listen to *new* repos, you need an Organization webhook or you can use GitHub Actions.
   - *Alternative for Personal Accounts*: Create a GitHub Action in your profile repository that triggers on new repos and hits your API. 
   - *If using a Repo Webhook*: Go to your Repo -> Settings -> Webhooks -> Add webhook.
3. Set the **Payload URL** to: `https://your-portfolio.vercel.app/api/github-webhook`
4. Set **Content type** to `application/json`.
5. Select **Let me select individual events** and check **Repositories** (or just push events, depending on your preference).
6. Save the webhook. Now, whenever you trigger that event, your Next.js API will receive it and email you!

## Step 4: Making the Frontend Dynamic

Currently, your projects are loaded statically from `src/lib/showcase.js` and your experience is loaded from `src/components/sections/experience.jsx`. 

Now that your admin portal is set up, you can modify those components to fetch data on the server-side from MongoDB! 

Example for `experience.jsx` (converted to a Server Component):
```javascript
import dbConnect from '@/lib/mongodb';
import ExperienceModel from '@/models/Experience';

export default async function Experience() {
  await dbConnect();
  const experiences = await ExperienceModel.find({}).sort({ createdAt: -1 }).lean();
  
  // Now map over the `experiences` array instead of the static one!
  // ...
}
```

## Step 5: Final Polish and Deployment

1. Review your `/about` page and the `hero.jsx` to ensure all links and text represent you perfectly.
2. The UI has been updated to use the ultra-minimalist `Inter` font, providing a very clean aesthetic.
3. To deploy, simply push your repository to GitHub and import it into [Vercel](https://vercel.com).
4. Don't forget to add your Environment Variables into the Vercel project settings before deploying!

You're all set to go!
