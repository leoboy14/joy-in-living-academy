import { Bell, Menu, Moon, Sun, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NavPage } from '@/types'

interface AdminHeaderProps {
  currentPage: NavPage
  onMenuClick: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  lastSyncTime?: Date
}

const pageTitles: Record<NavPage, { title: string; description: string }> = {
  dashboard: { title: 'Dashboard', description: 'Overview of your academy' },
  roster: { title: 'Student Roster', description: 'Manage student profiles' },
  sessions: { title: 'Sessions', description: 'Create and manage classes' },
  attendance: { title: 'Attendance', description: 'Track student attendance' },
  email: { title: 'Email Blast', description: 'Send announcements to students' },
  analytics: { title: 'Analytics', description: 'View attendance reports' },
  settings: { title: 'Settings', description: 'Configure your account' },
  recordings: { title: 'Recordings', description: 'Session recordings archive' },
}

export function AdminHeader({ currentPage, onMenuClick, darkMode, onToggleDarkMode, lastSyncTime }: AdminHeaderProps) {
  const { title, description } = pageTitles[currentPage]

  const formatSyncTime = (date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return isToday ? `Today at ${timeStr}` : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ` at ${timeStr}`
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lastSyncTime && (
          <div className="hidden items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm dark:bg-emerald-950 md:flex">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400">
              Synced: {formatSyncTime(lastSyncTime)}
            </span>
          </div>
        )}

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="w-[200px] pl-9 lg:w-[280px]"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  )
}
