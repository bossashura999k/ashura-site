# 🌐 ashura.site — Personal Portfolio & Dev Sandbox

> A personal portfolio website and experimental sandbox for integrations, tools, and ideas.  
> Live at **[ashura.site](https://ashura.site)**

---

## 📸 Overview

**ashura.site** is a handcrafted personal website serving two purposes:

1. **Portfolio** — a professional showcase of skills, projects, and contact info
2. **Sandbox** — a live testbed for real-world integrations including AI, payments, and messaging

Built from scratch with vanilla HTML, CSS, and JavaScript — no frameworks on the frontend, just clean fundamentals.

---

## 🗂️ Site Structure

```
ashura.site/
├── index.html          # Home / Landing page
├── about/              # About me page
│   └── index.html
├── chatbox/            # AI-powered chat interface (GROQ)
│   └── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── .htaccess           # Apache redirect & HTTPS rules
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Chatbox | GROQ-powered conversational assistant (Node.js backend on Render) |
| 💳 Payments | Paystack integration for payment flows |
| 💬 WhatsApp | Direct WhatsApp contact button |
| 📊 Analytics | Google Analytics for visitor tracking |
| 🔒 HTTPS Enforced | Apache-level HTTP → HTTPS redirect with canonical domain |
| ⏱️ Countdown Timer | JavaScript countdown to a target date |
| 📩 Contact Form | Client-side validated contact form |

---

## 🧰 Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- No frontend frameworks — hand-rolled everything

**Backend (Chatbox)**
- Node.js + Express
- Deployed on [Render](https://render.com)
- GROQ API (`llama3` model) for AI responses

**Hosting & Server**
- Apache (shared hosting)
- `.htaccess` for redirects, HTTPS enforcement, and security headers

**Integrations**
- [GROQ API](https://groq.com) — AI language model
- [Paystack](https://paystack.com) — payment processing
- WhatsApp click-to-chat
- Google Analytics
- Google Search Console

**Dev Environment**
- Kali Linux (machine: IZZI)
- Git for version control
- Render for backend CI/CD via Git push

---

## 🚀 Getting Started

### Prerequisites
- A web server with Apache and `.htaccess` support
- Node.js ≥ 18 (for the chatbox backend)
- A GROQ API key (get one free at [console.groq.com](https://console.groq.com))

### Frontend Setup

```bash
# Clone the repo
git clone https://github.com/bossashura999k/ashura.site.git
cd ashura.site

# Deploy to your Apache server or open index.html directly
```

### Chatbox Backend Setup

```bash
cd chatbox-backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# → Add your GROQ_API_KEY to .env

# Start locally
node server.js
```

> ⚠️ **Never commit your `.env` file.** It must be listed in `.gitignore`.

### Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your GROQ API key (kept secret, set on Render dashboard) |

---

## 🔒 Security

This project has been hardened with the following measures:

- **Rate limiting** on the chatbox API endpoint (prevents abuse)
- **Input validation & sanitization** on all user messages
- **Message length cap** to prevent prompt flooding
- **Server-side system prompt injection** (client can't override AI behavior)
- **API key presence check** — server fails gracefully if key is missing
- **`.env` in `.gitignore`** — secrets never reach version control
- **Git history purged** of any previously leaked secrets
- **Public `.htaccess` backup files** removed from web root

---

## 🌍 SEO & Redirects

The `.htaccess` enforces the following:

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Canonicalize to non-www
RewriteCond %{HTTP_HOST} ^www\.ashura\.site [NC]
RewriteRule ^(.*)$ https://ashura.site/$1 [L,R=301]
```

- Preferred domain set in **Google Search Console** (non-www HTTPS)
- Sitemap submitted at `https://ashura.site/sitemap.xml`
- Redirect chains cleaned up across all major pages

---

## 📁 Deployment

### Frontend
Push changes to your Apache host via SFTP/Git. The server serves static files directly.

### Chatbox Backend (Render)
```bash
git add .
git commit -m "your message"
git push origin main   # triggers auto-deploy on Render
```

> Make sure your Render service is connected to the `main` branch (not `master`).

---

## 🧪 Known Issues / Roadmap

- [ ] Add dark/light mode toggle
- [ ] Improve mobile responsiveness on `about/` page
- [ ] Add project showcase section with live demos
- [ ] Set up uptime monitoring for the chatbox backend
- [ ] Add `/sitemap.xml` auto-generation

---

## 📬 Contact

Built and maintained by **Ashura**

- 🌐 Website: [ashura.site](https://ashura.site)
- 💬 WhatsApp: via the site's contact button
- 🐙 GitHub: [@bossashura999k](https://github.com/bossashura999k)

---

## 📄 License

This project is personal and not licensed for reuse. All rights reserved © Ashura.

---

<p align="center">
  Made with 🖤 on Kali Linux · Hosted on Apache · AI by GROQ
</p>
