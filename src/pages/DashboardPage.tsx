import { useState, useEffect } from 'react'
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Mail,
  BarChart3,
  Video,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockDashboardStats, mockSessions, mockCohorts } from '@/data/mockData'
import { NavPage, DashboardStats, Session, Cohort } from '@/types'
import { cn } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function DashboardPage({ onNavigate, showToast }: DashboardPageProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [activeCohorts, setActiveCohorts] = useState<Cohort[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        if (!isSupabaseConfigured) {
          console.warn('Supabase credentials missing. Using mock data.')
          setUpcomingSessions(mockSessions.filter(s => s.status === 'scheduled'))
          setActiveCohorts(mockCohorts.filter(c => c.status === 'active'))
          return
        }

        // Fetch Stats and Data in parallel
        const [
          { count: studentCount },
          { data: cohortsData },
          { data: sessionsData },
          { data: attendanceData }
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('cohorts').select('*'),
          supabase.from('sessions').select('*').order('date', { ascending: true }),
          supabase.from('attendance').select('status')
        ])

        // Process Stats
        const activeCohortsList = (cohortsData || []).filter(c => c.status === 'active')
        const upcomingSessionsList = (sessionsData || []).filter(s => {
          const sDate = new Date(s.date)
          sDate.setHours(0,0,0,0)
          const today = new Date()
          today.setHours(0,0,0,0)
          return s.status === 'scheduled' && sDate >= today
        })

        // Calculate avg attendance (rough estimate from all attendance records)
        const totalAttendance = attendanceData?.length || 0
        const presentCount = attendanceData?.filter(a => a.status === 'present' || a.status === 'late').length || 0
        const avgAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 78

        setStats({
          totalStudents: studentCount || 0,
          activeStudents: (cohortsData || []).reduce((acc, c) => acc + (c.status === 'active' ? c.studentCount : 0), 0),
          totalCohorts: cohortsData?.length || 0,
          activeCohorts: activeCohortsList.length,
          upcomingSessions: upcomingSessionsList.length,
          averageAttendanceRate: avgAttendance
        })

        setUpcomingSessions(upcomingSessionsList.slice(0, 5))
        setActiveCohorts(activeCohortsList)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        showToast('Failed to fetch live dashboard data.', 'error')
        // Fallback already handled by initial state
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    { 
      label: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      gradient: 'from-primary to-primary/70',
    },
    { 
      label: 'Active Cohorts', 
      value: stats.activeCohorts, 
      icon: GraduationCap, 
      gradient: 'from-emerald-500 to-green-600',
    },
    { 
      label: 'Upcoming Sessions', 
      value: stats.upcomingSessions, 
      icon: Calendar, 
      gradient: 'from-amber-500 to-orange-500',
    },
    { 
      label: 'Avg Attendance', 
      value: `${stats.averageAttendanceRate}%`, 
      icon: TrendingUp, 
      gradient: 'from-blue-500 to-cyan-500',
    },
  ]

  const workflowSteps = [
    { id: 'roster', label: 'Roster', icon: Users, page: 'roster' as NavPage },
    { id: 'sessions', label: 'Sessions', icon: Video, page: 'sessions' as NavPage },
    { id: 'email', label: 'Email', icon: Mail, page: 'email' as NavPage },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2, page: 'attendance' as NavPage },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, page: 'analytics' as NavPage },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Zoom link copied!', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <Card 
            key={label} 
            className={cn(
              'group relative overflow-hidden border-0 text-white',
              `bg-gradient-to-br ${gradient}`
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium opacity-90">{label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-white/20 p-2">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Navigation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {workflowSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => onNavigate(step.page)}
                className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-primary hover:bg-primary/10"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {index + 1}
                </span>
                <step.icon className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions with Zoom IDs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              <CardDescription>With Zoom meeting IDs</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => {
                  // Calculate relative date
                  const today = new Date()
                  const sessionDate = new Date(session.date)
                  const isToday = sessionDate.toDateString() === today.toDateString()
                  const tomorrow = new Date(today)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  const isTomorrow = sessionDate.toDateString() === tomorrow.toDateString()
                  
                  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  
                  return (
                    <div 
                      key={session.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3 transition-all",
                        isToday && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          isToday ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        )}>
                          <Video className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{session.name}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            {isToday && (
                              <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 font-semibold text-white">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                Today
                              </span>
                            )}
                            {isTomorrow && (
                              <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                                Tomorrow
                              </span>
                            )}
                            {!isToday && !isTomorrow && (
                              <span className="whitespace-nowrap">{dateLabel}</span>
                            )}
                            <span className="whitespace-nowrap">• {session.startTime}</span>
                            <span className="hidden whitespace-nowrap sm:inline">• ID: {session.zoomMeetingId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant={isToday ? "default" : "ghost"}
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(session.zoomLink)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant={isToday ? "default" : "ghost"}
                          className="h-8 w-8"
                          onClick={() => window.open(session.zoomLink, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Cohorts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Active Cohorts</CardTitle>
              <CardDescription>Currently running batches</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('roster')}>
              Manage <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : activeCohorts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active cohorts</p>
            ) : (
              <div className="space-y-3">
                {activeCohorts.map((cohort) => (
                  <div 
                    key={cohort.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{cohort.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{cohort.studentCount}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

