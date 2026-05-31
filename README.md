# Premium Developer Portfolio & Dynamic Admin Panel

A state-of-the-art, fully dynamic portfolio website built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **MongoDB**. This project features a highly polished user experience with seamless transitions, a dynamic showcase gallery that supports any file format, and a secure, password-protected **Admin Panel** to manage your entire profile, projects, experiences, and gallery cards directly in the browser without editing any code.

---

## 🚀 Key Features

* **Dynamic Hero & Contact Info**: All personal details (name, role, location, profile image, and social links) are loaded dynamically from MongoDB.
* **Modular About Section**: An editable markdown-formatted biography alongside a dynamic Polaroid glimpse card stack manager.
* **Multi-Format Showcase Gallery**: Group images, loops, PDFs, and ZIP download links into dynamic visual folders.
* **Virtual Projects Folder**: Toggling a showcase folder to visitor-facing projects feeds directly from your projects database.
* **Secure Admin Control Center**: A dedicated side-panel dashboard to manage:
  * Profile Settings (basic details, resume files, social handles).
  * About Settings (biography markdown editor and photo stack).
  * Projects Manager (reordering, visibility toggling, case study markdown editor).
  * Experience Timeline (work experiences and descriptions).
  * Showcase Gallery (adding/deleting folders, reordering items, multi-format media uploads).
* **Automated Contact Form**: Integrated with Nodemailer to email user messages straight to your inbox, backed by honeypot anti-spam and Upstash Redis rate limiting.
* **Dynamic Favicon**: The browser tab favicon dynamically updates to match whatever profile picture you upload in the admin panel.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js (React 19), Tailwind CSS, Framer Motion, Lucide Icons.
* **Backend**: Next.js Route Handlers (Serverless API endpoints).
* **Database**: MongoDB Atlas with Mongoose schemas.
* **Mailing**: Nodemailer (via SMTP/Gmail).
* **Caching**: Upstash Redis (for API rate-limiting contact forms).
* **Security**: SHA-256 Hashed Token authentication verified using secure HTTP-only cookies.

---

## 🔒 Security & Admin Protection

To prevent unauthorized access or endpoint bypasses, the portfolio implements a robust signature-based auth system:
1. **No Plaintext Cookies**: Instead of storing static state cookies (like `admin_auth=true`), the login endpoint generates a secure SHA-256 hash of your `ADMIN_PASSWORD` secret.
2. **Endpoint Route Protection**: All state-modifying API routes (`POST`, `PUT`, `DELETE` handlers) run a server-side authentication check using the `isAdminAuthenticated` utility. Attempts to modify data without a valid cookie are blocked immediately with `401 Unauthorized`.
3. **HTTP Cookie Lifespan**: Auth cookies are restricted to path `/` and configured with safety configurations.

---

## 📋 Environment Variables for Deployment

Copy and paste the following environment variables into your deployment portal (e.g., Vercel, Netlify, or your local `.env.local` file):

```env
# -------------------------------------------------------------
# 1. Admin Portal Authentication
# -------------------------------------------------------------
# Define a strong password to protect your admin dashboard panel.
ADMIN_PASSWORD=your_strong_admin_password_here

# -------------------------------------------------------------
# 2. Database Configuration
# -------------------------------------------------------------
# Connection string for your MongoDB Atlas database cluster.
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio?retryWrites=true&w=majority

# -------------------------------------------------------------
# 3. Email Contact Form (Nodemailer)
# -------------------------------------------------------------
# The Gmail address that will send and receive your contact form messages.
EMAIL_USER=your_email@gmail.com
# Your Gmail 16-character App Password (NOT your account password).
# How to get it: Google Account > Security > 2-Step Verification > App Passwords.
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# -------------------------------------------------------------
# 4. GitHub Contribution Calendar Integration
# -------------------------------------------------------------
# Your personal GitHub token (classic or fine-grained) to fetch contributions.
GITHUB_TOKEN=ghp_your_personal_github_token_here
# Your exact GitHub username to display the contribution graph grid.
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username_here

# -------------------------------------------------------------
# 5. Upstash Redis Rate Limiting (Optional)
# -------------------------------------------------------------
# Set these if you want to enable automatic anti-spam rate limiting on contact forms.
KV_REST_API_URL=https://your-redis-instance.upstash.io
KV_REST_API_TOKEN=your_upstash_redis_token_here
```

---

## 📦 Setting Up Locally

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd harsh-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create a `.env.local` file in the root directory and fill in the environment variables shown above.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Log in to the Admin Dashboard**:
   Navigate to `/admin` and enter your configured `ADMIN_PASSWORD` (defaults to `admin123` if not defined).

---

## ⚡ Deployment Instructions (Vercel)

1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **New Project** and import your portfolio GitHub repository.
3. In the **Environment Variables** section, expand the card and copy-paste the variables listed above.
4. Click **Deploy**.
5. Once deployment is complete, navigate to your live domain `/admin` to log in, customize your details, and populate your database dynamically!