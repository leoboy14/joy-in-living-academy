import { 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockDashboardStats, mockStudents, mockSessions, mockCohorts } from '@/data/mockData'
import { NavPage } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const stats = mockDashboardStats
  const recentStudents = mockStudents.slice(0, 5)
  const upcomingSessions = mockSessions.filter(s => s.status === 'scheduled')
  const activeCohort = mockCohorts.find(c => c.status === 'active')

  const statCards = [
    { 
      label: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      gradient: 'from-primary to-primary/70',
      change: '+5 this month'
    },
    { 
      label: 'Active Cohorts', 
      value: stats.activeCohorts, 
      icon: GraduationCap, 
      gradient: 'from-emerald-500 to-green-600',
      change: `${stats.totalCohorts} total`
    },
    { 
      label: 'Upcoming Sessions', 
      value: stats.upcomingSessions, 
      icon: Calendar, 
      gradient: 'from-amber-500 to-orange-500',
      change: 'This week'
    },
    { 
      label: 'Avg Attendance', 
      value: `${stats.averageAttendanceRate}%`, 
      icon: TrendingUp, 
      gradient: 'from-blue-500 to-cyan-500',
      change: '+2% from last month'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold">Welcome back, Admin! 👋</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your academy today.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, gradient, change }) => (
          <Card 
            key={label} 
            className={cn(
              'group relative cursor-pointer overflow-hidden border-0 text-white transition-all hover:-translate-y-1 hover:shadow-xl',
              `bg-gradient-to-br ${gradient}`
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{label}</p>
                  <p className="mt-1 text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-xs opacity-75">{change}</p>
                </div>
                <div className="rounded-lg bg-white/20 p-2">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('roster')}
            >
              <Users className="h-4 w-4 text-primary" />
              Add New Student
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('sessions')}
            >
              <Calendar className="h-4 w-4 text-primary" />
              Create Session
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('email')}
            >
              <Clock className="h-4 w-4 text-primary" />
              Send Zoom Links
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('attendance')}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              Sync Attendance
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              <CardDescription>Next scheduled classes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('sessions')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Students & Cohort Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Students</CardTitle>
              <CardDescription>Latest enrollments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('roster')}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
                      student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                    )}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === 'active' ? (
                      <UserCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <UserX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      student.attendanceRate >= 80 
                        ? 'bg-emerald-100 text-emerald-700'
                        : student.attendanceRate >= 60
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    )}>
                      {student.attendanceRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Cohort */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Cohort</CardTitle>
            <CardDescription>Current running batch</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCohort ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{activeCohort.name}</h3>
                    <p className="text-sm text-muted-foreground">{activeCohort.code}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="text-xl font-bold">{activeCohort.studentCount}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Sessions Left</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => onNavigate('roster')}>
                  Manage Cohort
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active cohort</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
