# 🩸 BloodLink — Frontend (Next.js)

A professional, dark-themed blood donation platform frontend built with Next.js 14, Tailwind CSS, and TypeScript.

---

## 📁 Project Structure

```
blood_donation_frontend/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── layout.tsx                  ← Root layout (fonts, toast, auth)
│   ├── globals.css                 ← Tailwind + custom styles
│   ├── not-found.tsx               ← 404 page
│   ├── auth/
│   │   ├── login/page.tsx          ← Login page
│   │   └── signup/page.tsx         ← Signup page
│   └── dashboard/
│       ├── layout.tsx              ← Sidebar layout (protected)
│       ├── page.tsx                ← Dashboard home
│       ├── requests/
│       │   ├── page.tsx            ← All blood requests (with filters)
│       │   └── [id]/page.tsx       ← Request detail + donate
│       ├── create/page.tsx         ← Create new blood request
│       ├── donors/page.tsx         ← Find donors (smart matching)
│       ├── my-donations/page.tsx   ← My donation history
│       ├── my-requests/page.tsx    ← My blood requests
│       ├── notifications/page.tsx  ← Notifications center
│       └── profile/page.tsx        ← Edit profile + availability
├── lib/
│   ├── api.ts                      ← Axios client + all API calls
│   ├── auth.tsx                    ← Auth context + hooks
│   └── utils.ts                    ← Helpers, constants, colors
├── types/
│   └── index.ts                    ← TypeScript types
├── tailwind.config.ts
├── package.json
└── .env.local.example
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
cd blood_donation_frontend
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL to your backend URL
```

### 3. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/signup` | Register |
| `/dashboard` | Home with stats & recent activity |
| `/dashboard/requests` | All blood requests with filters |
| `/dashboard/requests/[id]` | Request detail + accept donation |
| `/dashboard/create` | Create new blood request |
| `/dashboard/donors` | Find compatible donors |
| `/dashboard/my-donations` | Track your donations |
| `/dashboard/my-requests` | Your blood requests |
| `/dashboard/notifications` | Notification center |
| `/dashboard/profile` | Edit profile & availability |

---

## 🎨 Design

- **Theme**: Dark UI with blood-red accents
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Colors**: Custom blood palette (blood-50 → blood-950)
- **Features**: Responsive sidebar, animated cards, blood group colors

---

## 🚀 Deployment (Vercel)

1. Push code to GitHub
2. Import repo to [Vercel](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!
