# 🧠 MindMatch - Real-time Word Guessing Game
https://github.com/user-attachments/assets/d784c92f-356e-4c96-99e3-c6894f418132
<div align="center">

![MindMatch](https://img.shields.io/badge/MindMatch-Word%20Game-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Two-player real-time word guessing game! Same category, instant matching, endless fun.**

<<<<<<< HEAD
[🎮 Demo](#) • [📖 Documentation](#installation) • [🚀 Deploy](#deploy)
=======
[🎮 Demo](https://mindmatch-eosin.vercel.app) • [📖 Dokümantasyon](#kurulum) • [🚀 Deploy](#deploy)
>>>>>>> 15e956726add986588880b74b56253b2760891d3

</div>

---

## ✨ Features

### 🎯 Game Mechanics
- **Real-time Multiplayer**: Two players can play instantly
- **Category-based**: 10 different word categories (Animals, Food, Cities, etc.)
- **Smart Scoring**: Same word 2 points, different word 1 point
- **Instant Feedback**: Continues immediately when the other player types
- **5 Round System**: Short and exciting game sessions

### 🌐 Technical Features
- **URL Persistence**: Game continues even when page is refreshed
- **LocalStorage**: Player information is preserved
- **Real-time Sync**: Instant synchronization with Supabase Realtime
- **Responsive Design**: Mobile and desktop compatible
- **Modern UI**: Glassmorphism design and gradient backgrounds

### 🛠️ Technologies
- **Frontend**: Next.js 15, TypeScript, React 19
- **Styling**: Tailwind CSS, Custom CSS Animations
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

---

## 🎮 How to Play?

### 1. Create or Join a Room
- **Create Room**: Enter nickname and click "Create Room" button
- **Join Room**: Enter nickname and 6-digit room code

### 2. Game Starts
- Same category is shown each round
- Both players write a word related to the category
- Type your word and click "Submit Answer" button

### 3. Scoring
- **Same word**: Both players get 2 points 🎉
- **Different word**: Both players get 1 point ⚡
- Highest score wins after 5 rounds! 🏆

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18+ (required to run Next.js)
- **npm** or **yarn** (package manager)
- **Supabase** account (for database)

### 1. Clone the Project
```bash
git clone https://github.com/yourusername/mindmatch.git
cd mindmatch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create Supabase Project
1. Create [Supabase](https://supabase.com) account
2. Create new project
3. Select **Europe West (eu-west-1)** as region (optimal for Turkey)

#### Setup Database Schema
1. Supabase Dashboard → **SQL Editor**
2. Copy and run the contents of `supabase_schema.sql` file

#### Get API Keys
1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** and **anon public key**

### 4. Environment Variables
Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application
```bash
npm run dev
```

Application will run at `http://localhost:3000`! 🎉

---

## 📁 Project Structure

```
mindmatch/
├── src/
│   ├── app/
│   │   ├── room/[roomId]/       # Dynamic room pages
│   │   ├── page.tsx             # Main page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── HomePage.tsx         # Home page component
│   │   ├── GameRoom.tsx         # Game room component
│   │   └── ui/                  # UI components
│   ├── contexts/
│   │   └── GameContext.tsx      # Game state management
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── game-utils.ts        # Game functions
│   │   └── utils.ts             # Helper functions
├── supabase_schema.sql          # Database schema
├── SETUP.md                     # Detailed setup guide
└── README.md                    # This file
```

---

## 🗄️ Database Schema

### Tables
- **players**: Player information and statistics
- **rooms**: Game rooms and statuses
- **room_players**: Player-room relationships and scores
- **categories**: Word categories
- **game_rounds**: Game rounds and categories
- **player_answers**: Player answers and points

### Features
- **Row Level Security (RLS)**: Secure data access
- **Real-time Subscriptions**: Instant data synchronization
- **Optimized Indexes**: Fast queries

---

## 🚀 Deploy

### Vercel Deploy
```bash
# Vercel CLI kur
npm i -g vercel

# Deploy et
vercel

# Environment variables ekle
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Production deploy
vercel --prod
```

### Environment Variables (Production)
Add these variables in Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key

---

## 🎨 UI/UX Features

### Design System
- **Gradient Backgrounds**: Modern gradient backgrounds
- **Glassmorphism**: Transparent glass effect cards
- **Responsive Layout**: Mobile-first design
- **Smooth Animations**: CSS transitions and animations
- **Dark Theme**: Eye-friendly dark theme

### Interactive Elements
- **Real-time Status**: Live player statuses
- **Loading States**: Smart loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Success animations

---

## 🧪 Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

### Code Quality
- **TypeScript**: Type safety
- **ESLint**: Code standards
- **Prettier**: Code formatting
- **React Hooks**: Modern React patterns

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👥 Creator

**MindMatch Team**
- 🌐 Website: [mindmatch.vercel.app](#)
- 📧 Email: [contact@mindmatch.com](#)
- 🐦 Twitter: [@mindmatch](#)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Vercel](https://vercel.com/) - Deployment platform

---

<div align="center">

**⭐ Don't forget to give the project a star if you liked it! ⭐**

Made with ❤️ for word game lovers

</div>
