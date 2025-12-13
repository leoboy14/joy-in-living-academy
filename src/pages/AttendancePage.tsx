import { useState } from 'react'
import { 
  RefreshCw, 
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockSessions, mockStudents, mockAttendance, mockCohorts } from '@/data/mockData'
import { AttendanceStatus } from '@/types'
import { cn } from '@/lib/utils'

interface AttendancePageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function AttendancePage({ showToast }: AttendancePageProps) {
  const [syncing, setSyncing] = useState(false)
  const [selectedSession, setSelectedSession] = useState(mockSessions[0]?.id)

  const activeCohort = mockCohorts.find(c => c.status === 'active')
  const cohortStudents = mockStudents.filter(s => s.cohortId === activeCohort?.id)
  
  const sessionAttendance = mockAttendance.filter(a => a.sessionId === selectedSession)
  
  const stats = {
    present: sessionAttendance.filter(a => a.status === 'present').length,
    late: sessionAttendance.filter(a => a.status === 'late').length,
    absent: sessionAttendance.filter(a => a.status === 'absent').length,
  }

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      showToast('Attendance synced from Zoom!', 'success')
    }, 2000)
  }

  const getAttendanceForStudent = (studentId: string): AttendanceStatus | null => {
    const record = sessionAttendance.find(a => a.studentId === studentId)
    return record?.status || null
  }

  const statusConfig = {
    present: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100', label: 'Present' },
    late: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Late' },
    absent: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Absent' },
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Sync and manage student attendance from Zoom
          </p>
        </div>
        
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
          {syncing ? 'Syncing...' : 'Sync from Zoom'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.late}</p>
              <p className="text-sm text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Session</CardTitle>
          <CardDescription>Choose a session to view attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockSessions.map((session) => (
              <Button
                key={session.id}
                variant={selectedSession === session.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSession(session.id)}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {session.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Student Attendance</CardTitle>
            <CardDescription>
              {cohortStudents.length} students in {activeCohort?.name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{sessionAttendance.length} records</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Check-in Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cohortStudents.map((student) => {
                  const status = getAttendanceForStudent(student.id)
                  const config = status ? statusConfig[status] : null
                  const attendanceRecord = sessionAttendance.find(a => a.studentId === student.id)

                  return (
                    <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
                            'bg-primary/10 text-primary'
                          )}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {config ? (
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            config.bg, config.color
                          )}>
                            <config.icon className="h-3 w-3" />
                            {config.label}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {attendanceRecord?.checkInTime 
                            ? new Date(attendanceRecord.checkInTime).toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 overflow-hidden rounded-full bg-muted">
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
                          <span className="text-xs font-medium">{student.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
