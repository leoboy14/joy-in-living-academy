import { LayoutDashboard, Users, Calendar, ClipboardCheck, Mail } from 'lucide-react'
import { NavPage } from '@/types'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
}

const navItems: { id: NavPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'attendance', label: 'Attend', icon: ClipboardCheck },
  { id: 'email', label: 'Email', icon: Mail },
]

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 pb-safe lg:hidden">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
            currentPage === id ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Icon className={cn('h-5 w-5', currentPage === id && 'text-primary')} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
