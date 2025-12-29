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
import { AttendanceStatus, Session, Student, AttendanceRecord, Cohort } from '@/types'
import { cn } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface AttendancePageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  lastSyncTime?: Date
}

export function AttendancePage({ showToast, lastSyncTime }: AttendancePageProps) {
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (!isSupabaseConfigured) {
        setSessions(mockSessions)
        setStudents(mockStudents)
        setAttendance(mockAttendance as any)
        setCohorts(mockCohorts)
        if (mockSessions.length > 0) setSelectedSession(mockSessions[0].id)
        return
      }

      const [
        { data: sData, error: sError },
        { data: stData, error: stError },
        { data: aData, error: aError },
        { data: cData, error: cError }
      ] = await Promise.all([
        supabase.from('sessions').select('*').order('date', { ascending: false }),
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('cohorts').select('*')
      ])

      if (sError) throw sError
      if (stError) throw stError
      if (aError) throw aError
      if (cError) throw cError

      if (sData) {
        const transformed = sData.map((s: any) => ({ ...s, date: new Date(s.date) }))
        setSessions(transformed)
        if (transformed.length > 0 && !selectedSession) setSelectedSession(transformed[0].id)
      }
      if (stData) {
        const transformed = stData.map((s: any) => ({ ...s, enrolledAt: new Date(s.enrolledAt) }))
        setStudents(transformed)
      }
      if (aData) {
        const transformed = aData.map((a: any) => ({ ...a, syncedAt: new Date(a.syncedAt), checkInTime: a.checkInTime ? new Date(a.checkInTime) : undefined }))
        setAttendance(transformed)
      }
      if (cData) setCohorts(cData)

    } catch (error) {
      console.error('Error fetching attendance data:', error)
      showToast('Failed to fetch attendance data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const activeCohort = cohorts.find(c => c.status === 'active')
  const cohortStudents = students.filter(s => s.cohortId === activeCohort?.id)
  
  const sessionAttendance = attendance.filter(a => a.sessionId === selectedSession)
  
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

  const formatSyncTime = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return timeStr
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

      {/* Nightly Sync Info */}
      {lastSyncTime && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-transparent dark:border-emerald-900 dark:from-emerald-950">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">Nightly Zoom Sync Active</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                Attendance is automatically synced at {formatSyncTime(lastSyncTime)} every night
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
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
      )}

      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Session</CardTitle>
          <CardDescription>Choose a session to view attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sessions.map((session) => (
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
