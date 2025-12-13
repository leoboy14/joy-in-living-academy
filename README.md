# Joy in Living Academy - Admin Dashboard

A modern admin dashboard for managing students, sessions, attendance, and communications for the Joy in Living Academy training platform.

## Features

- 📊 **Dashboard** - Overview with stats, quick actions, and recent activity
- 👥 **Roster Management** - Add, edit, delete students with bulk import
- 📅 **Session Management** - Create classes with Zoom Meeting IDs
- ✅ **Attendance Tracking** - Sync attendance from Zoom, view check-in times
- 📧 **Email Blast System** - Compose emails with variable templating
- 📈 **Analytics** - Attendance breakdown and student performance reports

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Runtime**: Bun

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
bun run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   ├── MobileNav.tsx
│   └── Toast.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── RosterPage.tsx
│   ├── SessionsPage.tsx
│   ├── AttendancePage.tsx
│   ├── EmailPage.tsx
│   └── AnalyticsPage.tsx
├── data/
│   └── mockData.ts   # Demo data
├── lib/
│   └── utils.ts      # Utility functions
├── styles/
│   └── index.css     # Tailwind config
├── types.ts          # TypeScript definitions
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## License

MIT
