import { 
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockStudents, mockCohorts, mockSessions, mockAttendance } from '@/data/mockData'
import { cn } from '@/lib/utils'

interface AnalyticsPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function AnalyticsPage({ showToast }: AnalyticsPageProps) {
  const activeCohort = mockCohorts.find(c => c.status === 'active')
  const cohortStudents = mockStudents.filter(s => s.cohortId === activeCohort?.id)
  
  // Calculate attendance breakdown
  const totalRecords = mockAttendance.length
  const presentCount = mockAttendance.filter(a => a.status === 'present').length
  const lateCount = mockAttendance.filter(a => a.status === 'late').length
  const absentCount = mockAttendance.filter(a => a.status === 'absent').length
  
  const attendanceBreakdown = [
    { label: 'Present', count: presentCount, percentage: Math.round((presentCount / totalRecords) * 100), color: 'bg-emerald-500', icon: CheckCircle2 },
    { label: 'Late', count: lateCount, percentage: Math.round((lateCount / totalRecords) * 100), color: 'bg-amber-500', icon: Clock },
    { label: 'Absent', count: absentCount, percentage: Math.round((absentCount / totalRecords) * 100), color: 'bg-red-500', icon: XCircle },
  ]

  // Group students by attendance rate
  const excellent = cohortStudents.filter(s => s.attendanceRate >= 90).length
  const good = cohortStudents.filter(s => s.attendanceRate >= 75 && s.attendanceRate < 90).length
  const needsImprovement = cohortStudents.filter(s => s.attendanceRate >= 50 && s.attendanceRate < 75).length
  const critical = cohortStudents.filter(s => s.attendanceRate < 50).length

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Rank', 'Name', 'Email', 'Cohort', 'Attendance Rate', 'Status']
    const rows = [...cohortStudents]
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .map((student, index) => [
        index + 1,
        student.name,
        student.email,
        activeCohort?.name || 'Unknown',
        `${student.attendanceRate}%`,
        student.status
      ])
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showToast('CSV report downloaded!', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance Analytics</h2>
          <p className="text-sm text-muted-foreground">
            View attendance reports and export data
          </p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{cohortStudents.length}</p>
              <p className="text-sm text-muted-foreground">Active Students</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Math.round(cohortStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / cohortStudents.length)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockSessions.length}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRecords}</p>
              <p className="text-sm text-muted-foreground">Attendance Records</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Breakdown</CardTitle>
            <CardDescription>Overall attendance status distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendanceBreakdown.map(({ label, count, percentage, color, icon: Icon }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', 
                      label === 'Present' ? 'text-emerald-500' : 
                      label === 'Late' ? 'text-amber-500' : 'text-red-500'
                    )} />
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="text-muted-foreground">{count} ({percentage}%)</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div 
                    className={cn('h-full transition-all duration-500', color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Student Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Performance</CardTitle>
            <CardDescription>Grouped by attendance rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{excellent}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500">Excellent (90%+)</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{good}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500">Good (75-89%)</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{needsImprovement}</p>
                <p className="text-sm text-amber-600 dark:text-amber-500">Needs Work (50-74%)</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{critical}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Critical (&lt;50%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Leaderboard</CardTitle>
          <CardDescription>Students ranked by attendance rate</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendance Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...cohortStudents]
                  .sort((a, b) => b.attendanceRate - a.attendanceRate)
                  .map((student, index) => (
                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                            <div 
                              className={cn(
                                'h-full',
                                student.attendanceRate >= 80 
                                  ? 'bg-emerald-500'
                                  : student.attendanceRate >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              )}
                              style={{ width: `${student.attendanceRate}%` }}
                            />
                          </div>
                          <span className="font-semibold">{student.attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                          student.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          student.status === 'graduated' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
