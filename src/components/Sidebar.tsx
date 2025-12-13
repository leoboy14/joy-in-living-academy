import { 
  GraduationCap, 
  ListTodo, 
  LayoutGrid, 
  Calendar, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Moon,
  Sun,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeNav: string
  onNavChange: (nav: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

const navItems = [
  { id: 'tasks', label: 'My Tasks', icon: ListTodo },
  { id: 'space', label: 'My Space', icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
]

export function Sidebar({
  activeNav,
  onNavChange,
  collapsed,
  onToggleCollapse,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  const NavButton = ({ id, label, icon: Icon }: typeof navItems[0]) => {
    const button = (
      <Button
        variant={activeNav === id ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3',
          collapsed && 'justify-center px-2',
          activeNav === id && 'bg-primary/10 text-primary hover:bg-primary/20'
        )}
        onClick={() => {
          onNavChange(id)
          onClose()
        }}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Button>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-20' : 'w-[280px]',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-transparent">
              Joy in the Living
            </span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="hidden shrink-0 lg:flex"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavButton key={item.id} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3">
        <Separator className="mb-3" />
        
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 mb-3',
                collapsed && 'justify-center px-2'
              )}
              onClick={onToggleDarkMode}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{darkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>}
        </Tooltip>

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 rounded-lg bg-muted p-3',
          collapsed && 'justify-center p-2'
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">Trainee</span>
              <span className="truncate text-xs text-muted-foreground">Student</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
