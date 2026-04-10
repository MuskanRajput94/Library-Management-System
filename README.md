# Library Management System — Web App

A web-based Library Management System built with **HTML, CSS, JavaScript** and **Supabase** (PostgreSQL). Features book/member management, transaction tracking, automated fine calculation, and a dashboard with live stats.

**Live Demo**: [neon-gecko-eebd8b.netlify.app](https://neon-gecko-eebd8b.netlify.app)

---

## Features

| Module | Capabilities |
|---|---|
| **Books** | Add, view, search (title/author), edit, delete |
| **Members** | Register, view, search (name/email), delete |
| **Transactions** | Issue book, return book, view active issues |
| **Fines** | Auto-calculated at ₹5/day after 7-day due period |
| **Dashboard** | Live stats — total books, members, issued, overdue count |
| **Auth** | Login screen with session-based authentication |

**Safeguards:**
- Prevents issuing books with 0 available copies
- Blocks duplicate issues (same book to same member)
- Unique email constraint on members
- Foreign key protection on delete

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Database | Supabase (PostgreSQL) |
| Hosting | Netlify |
| Font | Inter (Google Fonts) |
| UI | Dark theme, glassmorphism, responsive |

---

## Project Structure

```
web/
├── index.html              # Single-page app with tabs and modals
├── style.css               # Dark theme, responsive layout
├── app.js                  # CRUD logic, fine calculation, auth
├── supabase-config.js      # Supabase URL + anon key (blank — fill yours)
├── schema.sql              # Database schema for Supabase
├── .gitignore
└── README.md
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────┐
│    books     │       │   members    │
├──────────────┤       ├──────────────┤
│ id       PK  │       │ id       PK  │
│ title        │       │ name         │
│ author       │       │ email  UQ    │
│ quantity     │       │ phone        │
│ available    │       └──────┬───────┘
└──────┬───────┘              │
       │    ┌─────────────────┘
       │    │
┌──────┴────┴──────┐
│  transactions    │
├──────────────────┤
│ id           PK  │
│ book_id      FK  │
│ member_id    FK  │
│ issue_date       │
│ return_date      │
│ fine             │
└──────────────────┘
```

---

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** and run `schema.sql` to create tables and seed data
3. Go to **Settings → API** and copy your **Project URL** and **anon key**

### 2. Configure

Open `supabase-config.js` and paste your credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. Run Locally

Just open `index.html` in a browser — no build step needed.

Or use a local server:
```bash
npx serve .
```

### 4. Deploy to Netlify

1. Push this folder to GitHub
2. Connect the repo to [Netlify](https://netlify.com)
3. Set publish directory to `web/` (or root if repo is just the web folder)
4. Deploy — your app is live

---

## Login Credentials

| Field | Value |
|---|---|
| Email | `Muskan_admin@gmail.com` |
| Password | `Muskan@123` |

> This is a hardcoded MVP login. For production, use Supabase Auth.

---

## Usage

### Login
Enter admin credentials to access the dashboard.

### Books Tab
View all books in a searchable table. Add, edit, or delete books.

### Members Tab
View registered members. Add new members (email must be unique).

### Transactions Tab
- **Issue Book** — select an available book and a member
- **Return Book** — select an active issue, view fine preview, confirm return
- Overdue items show ⚠ OVERDUE badge with days late
- Due soon items show yellow "Due Soon" badge

---

## Screenshots

> Add screenshots of the running app here.

---

## Future Improvements

- [ ] Supabase Auth for real user management
- [ ] Book categories and genre filtering
- [ ] Member borrowing history
- [ ] Export transactions to CSV
- [ ] Email notifications for due dates
- [ ] Dark/light theme toggle

---

## Author

**Muskan**

---

## License

MIT
