# StudyFlow 📚

A collaborative virtual study platform that brings students together to learn, focus, and grow. Join themed study rooms, use synchronized Pomodoro timers, chat with fellow students, interact with AI study companions, and track your progress through gamification.

![Built with React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF)
![Supabase](https://img.shields.io/badge/Supabase-2.57.4-3ECF8E)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏠 Virtual Study Rooms
- Create or join themed study rooms (Cozy Library, Rainy Night, Forest, Coffee Shop, etc.)
- Room capacity management (up to 8 users per room)
- Real-time participant tracking
- Browse available rooms with live participant counts

### ⏱️ Synchronized Pomodoro Timer
- Room-wide synchronized study/break sessions
- Customizable study (25 min) and break (5 min) durations
- Automatic session switching
- Session completion tracking for achievements

### 💬 Real-time Chat
- In-room chat with fellow students
- Real-time message synchronization
- AI study buddies that send motivational messages
- Chat history per room

### 🎮 Gamification System
- Experience points (XP) and leveling
- 10 unique achievements to unlock
- Track focus time, streaks, and sessions
- Global leaderboard
- User statistics dashboard

### 🎵 Music & Ambient Sounds
- 7 audio options: Lo-fi, Classical, Rain, Forest, Café, White Noise, Silence
- Advanced music player with controls
- Theme-specific ambient soundscapes

### 🔐 Authentication
- Email/password authentication
- Google OAuth
- GitHub OAuth
- Discord OAuth
- Secure profile management

### 🤖 AI Study Companions
- AI students that join study rooms
- Motivational messages every 2 minutes
- Simulated study buddies for engagement

### 👤 User Profiles
- Personal stats (focus time, streaks, level, XP)
- Achievement showcase
- Study session history
- Customizable avatars

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studyflow.git
   cd studyflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   Follow the complete guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

   Quick version:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run all 7 database migrations
   - Configure authentication providers

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=http://localhost:5173
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Complete Supabase setup guide with step-by-step instructions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to production (Vercel, Netlify) with custom domains |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Solutions to common issues and error messages |

## 🛠️ Tech Stack

**Frontend**
- ⚛️ React 18.3.1 - UI library
- 📘 TypeScript 5.5.3 - Type safety
- ⚡ Vite 5.4.2 - Build tool & dev server
- 🎨 Tailwind CSS 3.4.1 - Styling
- 🎭 Lucide React - Icon library

**Backend & Database**
- 🗄️ Supabase 2.57.4 - PostgreSQL database, authentication, real-time
- 🔒 Row Level Security (RLS) - Database security
- 📡 Supabase Real-time - WebSocket subscriptions
- ⚡ Edge Functions - Serverless functions for AI features

**State Management**
- ⚛️ React Context API - Global state
- 🪝 Custom Hooks - Business logic encapsulation

## 📁 Project Structure

```
studyflow/
├── src/
│   ├── components/          # React components
│   │   ├── Audio/          # Music & ambient sounds
│   │   ├── Auth/           # Authentication components
│   │   ├── Layout/         # Header and layout
│   │   ├── StudyRoom/      # Study room components
│   │   └── UI/             # Reusable UI components
│   ├── context/            # React Context (AppContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Service layer
│   │   ├── auth.ts         # Authentication service
│   │   ├── roomService.ts  # Room operations
│   │   ├── chatService.ts  # Chat functionality
│   │   ├── profileService.ts # User profiles
│   │   └── aiStudentService.ts # AI companions
│   ├── pages/              # Page components
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── migrations/         # Database schema migrations (7 files)
│   └── functions/          # Edge Functions (AI, cleanup)
├── public/                 # Static assets
├── .env.example            # Environment variable template
├── vercel.json            # Vercel deployment config
└── vite.config.ts         # Vite configuration
```

## 🗄️ Database Schema

**Core Tables:**
- `profiles` - User profiles with stats and progression
- `study_rooms` - Room metadata and timer state
- `room_participants` - Room membership tracking
- `chat_messages` - Chat history
- `achievements` - Achievement definitions (10 default)
- `user_achievements` - Earned achievements
- `study_sessions` - Study session tracking
- `user_settings` - User preferences
- `ai_students` - AI companions

**Key Features:**
- Row Level Security (RLS) on all tables
- 5 stored procedures for atomic operations
- Auto-cleanup triggers for empty rooms
- Presence management with 2-minute timeout

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for migration details.

## 🚢 Deployment

Deploy StudyFlow to production in minutes!

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Sign up at [vercel.com](https://vercel.com) with GitHub
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
5. Deploy!

**Complete guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### Other Platforms

StudyFlow also works great on:
- Netlify
- Render
- Railway
- Cloudflare Pages

See deployment guide for platform-specific instructions.

## 🎯 Usage

### Creating a Study Room

1. Sign up or log in
2. Click "Create Room"
3. Choose a theme (Cozy Library, Rainy Night, etc.)
4. Set study/break durations
5. Select ambient music
6. Start studying!

### Joining a Room

1. Browse available rooms on the home page
2. Click "Join" on any room with available space
3. Automatically join the synchronized timer
4. Chat with other participants
5. Earn XP and achievements

### Earning Achievements

- **First Steps**: Join your first study room
- **Social Butterfly**: Join 5 different rooms
- **Focus Master**: Complete 10 study sessions
- **Night Owl**: Study for 100 minutes total
- **Marathon Runner**: Complete a 50-minute session
- **Streak Starter**: Maintain a 3-day streak
- ... and 4 more!

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes locally before submitting

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:5173

# Build
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally

# Linting
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

Having issues? Check out our comprehensive troubleshooting guide:

👉 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Common issues:
- Authentication errors → [Solutions](./TROUBLESHOOTING.md#authentication-errors)
- Database errors → [Solutions](./TROUBLESHOOTING.md#database--supabase-issues)
- Deployment issues → [Solutions](./TROUBLESHOOTING.md#deployment-issues)

## 📊 Free Tier Limits

**Vercel Free Tier:**
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL & global CDN

**Supabase Free Tier:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ⚠️ Projects pause after 1 week of inactivity

Perfect for getting started! Upgrade when you need more.

## 🔒 Security

- All database tables protected by Row Level Security (RLS)
- OAuth providers use industry-standard authentication
- Environment variables for sensitive data
- HTTPS enforced in production
- XSS and CSRF protection via security headers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting platform
- [Lucide Icons](https://lucide.dev) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

## 📞 Support

Need help?

- 📖 [Read the docs](./SUPABASE_SETUP.md)
- 🐛 [Report a bug](https://github.com/yourusername/studyflow/issues)
- 💬 [Join discussions](https://github.com/yourusername/studyflow/discussions)
- 📧 Email: your-email@example.com

## ⭐ Show Your Support

If you found StudyFlow helpful, please consider giving it a star on GitHub!

---

**Built with ❤️ for students who want to study better together**

Start your focused study session today! 🚀
