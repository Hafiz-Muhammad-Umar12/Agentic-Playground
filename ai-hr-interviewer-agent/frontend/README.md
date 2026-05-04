# 🤖 AI HR Interviewer Agent

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0-ff69b4?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

**AI HR Interviewer Agent** is a next-generation technical interview simulation platform. It leverages advanced AI to provide realistic HR and technical interview experiences, helping candidates master their interview skills with real-time feedback and comprehensive performance analytics.

---

## 🌟 Key Features

- **🎯 Dynamic Interviewing:** Real-time AI agent that asks follow-up questions based on your unique responses, simulating a real human interaction.
- **📊 Comprehensive Evaluation:** Detailed score breakdowns including **Correctness**, **Clarity**, **Depth**, and **Technical Accuracy**.
- **💡 Professional Feedback:** Receive actionable insights with specific strengths, weaknesses, and areas for improvement.
- **🌐 Domain Agnostic:** Tailored interviews for any job role—from Frontend Engineer and Product Manager to Marketing Executive.
- **⚡ Modern Interface:** A sleek, high-performance UI built with Next.js App Router, Tailwind CSS 4, and Framer Motion for fluid animations.
- **🔄 State Management:** Robust state handling using Zustand for seamless interview transitions and data persistence.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) (Next-gen utility-first CSS)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)

### Backend (Integration)
- **API Communication:** RESTful API integration with a Python/FastAPI backend (expected at `localhost:8000`).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Backend API running locally (refer to backend documentation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-hr-interviewer.git
   cd ai-hr-interviewer/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env.local` file in the root directory (if needed) or ensure `lib/api.ts` points to your correct backend URL.
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) to start your interview.

---

## 📸 Screenshots

| Landing Page | Interview Session | Evaluation Report |
| :---: | :---: | :---: |
| ![Landing](https://via.placeholder.com/400x225?text=Landing+Page) | ![Interview](https://via.placeholder.com/400x225?text=Interview+UI) | ![Score](https://via.placeholder.com/400x225?text=Score+Card) |
*(Add your project screenshots here)*

---

## 🏗️ Project Structure

```text
frontend/
├── app/                # Next.js App Router (Pages & Layouts)
│   ├── interview/      # Main interview experience page
│   └── page.tsx        # Modern landing page
├── components/         # Reusable UI components (Chat, Input, Cards)
├── lib/                # API utilities and interview logic flow
├── store/              # Zustand state management
├── public/             # Static assets
└── styles/             # Global CSS and Tailwind configuration
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by Your Name
</p>
