import { 
  GraduationCap, 
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  Mail,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Moon,
  Sun,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { NavPage } from '@/types'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  currentPage: NavPage
  onNavigate: (page: NavPage) => void
  collapsed: boolean
  onToggleCollapse: () => void
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

const navItems: { id: NavPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'email', label: 'Email Blast', icon: Mail },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminSidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
}: AdminSidebarProps) {
  const NavButton = ({ id, label, icon: Icon }: typeof navItems[0]) => {
    const isActive = currentPage === id
    
    const button = (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 h-11 transition-all duration-300',
          collapsed && 'justify-center px-2',
          isActive && 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold'
        )}
        onClick={() => {
          onNavigate(id)
          onClose()
        }}
      >
        <Icon className={cn('h-5 w-5 shrink-0 transition-all duration-300', isActive && 'text-primary')} />
        <span className={cn(
          "whitespace-nowrap transition-all duration-300",
          collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        )}>
          {label}
        </span>
      </Button>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{label}</TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3 overflow-hidden">
        <div className={cn(
          "flex items-center gap-3 min-w-0 transition-all duration-300",
          collapsed && "flex-1 justify-center"
        )}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <span className="text-sm font-bold whitespace-nowrap">Joy in Living</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Admin Portal</span>
          </div>
        </div>
        
        {/* Desktop collapse toggle - positioned absolutely when collapsed */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 lg:flex"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Mobile close button */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Floating expand button when collapsed */}
      {collapsed && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-5 z-10 hidden h-6 w-6 rounded-full border bg-card shadow-md lg:flex"
          onClick={onToggleCollapse}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className={cn('mb-2', collapsed && 'hidden')}>
          <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main Menu
          </span>
        </div>
        {navItems.map((item) => (
          <NavButton key={item.id} {...item} />
        ))}
        
        <Separator className="my-3" />
        
        <NavButton id="settings" label="Settings" icon={Settings} />
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-10 mb-2 transition-all duration-300',
                collapsed && 'justify-center px-2'
              )}
              onClick={onToggleDarkMode}
            >
              {darkMode ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
              <span className={cn(
                "text-sm whitespace-nowrap transition-all duration-300",
                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{darkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>}
        </Tooltip>

        {/* Admin Profile */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg bg-muted/50 p-2 transition-all duration-300',
          collapsed && 'justify-center'
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}>
            <span className="truncate text-sm font-medium whitespace-nowrap">Admin User</span>
            <span className="truncate text-xs text-muted-foreground whitespace-nowrap">admin@jila.edu</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8 w-8 shrink-0 transition-all duration-300",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-8 opacity-100"
            )}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
