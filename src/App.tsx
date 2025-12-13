import { useState, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminSidebar } from '@/components/AdminSidebar'
import { AdminHeader } from '@/components/AdminHeader'
import { DashboardPage } from '@/pages/DashboardPage'
import { RosterPage } from '@/pages/RosterPage'
import { SessionsPage } from '@/pages/SessionsPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { EmailPage } from '@/pages/EmailPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { Toast } from '@/components/Toast'
import { MobileNav } from '@/components/MobileNav'
import { NavPage } from '@/types'
import { cn } from '@/lib/utils'

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) return saved === 'true'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    showToast(darkMode ? 'Light mode enabled' : 'Dark mode enabled', 'info')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} showToast={showToast} />
      case 'roster':
        return <RosterPage showToast={showToast} />
      case 'sessions':
        return <SessionsPage showToast={showToast} />
      case 'attendance':
        return <AttendancePage showToast={showToast} />
      case 'email':
        return <EmailPage showToast={showToast} />
      case 'analytics':
        return <AnalyticsPage showToast={showToast} />
      default:
        return <DashboardPage onNavigate={setCurrentPage} showToast={showToast} />
    }
  }

  return (
    <TooltipProvider>
      <div className={cn(
        'grid min-h-screen transition-all duration-300',
        sidebarCollapsed 
          ? 'grid-cols-[72px_1fr]'
          : 'grid-cols-[260px_1fr]',
        'max-lg:grid-cols-1'
      )}>
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <div className="flex flex-col overflow-hidden">
          <AdminHeader
            currentPage={currentPage}
            onMenuClick={() => setSidebarOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          
          <main className="flex-1 overflow-y-auto bg-background p-6 pb-24 lg:pb-6">
            {renderPage()}
          </main>
        </div>

        <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />

        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </TooltipProvider>
  )
}
