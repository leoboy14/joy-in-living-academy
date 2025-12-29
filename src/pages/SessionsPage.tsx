import { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar,
  Clock,
  Video,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { mockSessions, mockCohorts } from '@/data/mockData'
import { Session, Cohort } from '@/types'
import { cn } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface SessionsPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function SessionsPage({ showToast }: SessionsPageProps) {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all')
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Form states
  const [newName, setNewName] = useState('')
  const [selectedCohortId, setSelectedCohortId] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('60')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (!isSupabaseConfigured) {
        setSessions(mockSessions)
        setCohorts(mockCohorts)
        return
      }

      const [{ data: sData, error: sError }, { data: cData, error: cError }] = await Promise.all([
        supabase.from('sessions').select('*').order('date', { ascending: true }),
        supabase.from('cohorts').select('*')
      ])

      if (sError) throw sError
      if (cError) throw cError

      if (cData) setCohorts(cData)
      if (sData) {
        const transformed: Session[] = sData.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        }))
        setSessions(transformed)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      showToast('Failed to fetch sessions.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !selectedCohortId || !sessionDate || !startTime) {
      showToast('Please fill in all required fields.', 'error')
      return
    }

    try {
      setIsCreating(true)

      // 1. Create Zoom Meeting
      const startDateTime = `${sessionDate}T${startTime}:00`
      const { data: zoomData, error: zoomError } = await supabase.functions.invoke('create-zoom-meeting', {
        body: {
          topic: newName,
          start_time: startDateTime,
          duration: parseInt(duration)
        }
      })

      if (zoomError) throw zoomError

      // 2. Save to Supabase
      const newSession = {
        name: newName,
        cohortId: selectedCohortId,
        date: sessionDate,
        startTime: startTime,
        endTime: calculateEndTime(startTime, parseInt(duration)),
        zoomMeetingId: zoomData.id,
        zoomLink: zoomData.join_url,
        status: 'scheduled' as const
      }

      const { error: insertError } = await supabase.from('sessions').insert([newSession])
      if (insertError) throw insertError

      showToast('Session created and Zoom meeting scheduled!', 'success')
      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error('Error creating session:', error)
      showToast(error.message || 'Failed to create session.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const calculateEndTime = (start: string, durationMin: number) => {
    const [hours, minutes] = start.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes + durationMin)
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const resetForm = () => {
    setNewName('')
    setSelectedCohortId('')
    setSessionDate('')
    setStartTime('')
    setDuration('60')
  }

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true
    return session.status === filter
  })

  const getCohortName = (cohortId: string) => {
    return cohorts.find(c => c.id === cohortId)?.name || 'Unknown'
  }

  const copyZoomLink = (link: string) => {
    navigator.clipboard.writeText(link)
    showToast('Zoom link copied to clipboard!', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Class Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Manage your scheduled classes and Zoom meetings
          </p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      {/* Create Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Create New Session</CardTitle>
                <CardDescription>Setup a new Zoom class session</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} disabled={isCreating}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Name</label>
                  <Input 
                    placeholder="e.g. Intro to Living Academy" 
                    value={newName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cohort</label>
                  <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map((cohort) => (
                        <SelectItem key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      type="date" 
                      value={sessionDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time</label>
                    <Input 
                      type="time" 
                      value={startTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Session'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'scheduled', 'completed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard 
              key={session.id}
              session={session}
              cohortName={getCohortName(session.cohortId)}
              onCopyLink={copyZoomLink}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {filteredSessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">No sessions found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first session to get started
            </p>
            <Button onClick={handleCreateSession}>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SessionCard({ 
  session, 
  cohortName,
  onCopyLink,
  showToast 
}: { 
  session: Session
  cohortName: string
  onCopyLink: (link: string) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void 
}) {
  const statusConfig = {
    scheduled: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100' },
    'in-progress': { icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
  }

  const { icon: StatusIcon, color, bg } = statusConfig[session.status]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-full p-1', bg)}>
              <StatusIcon className={cn('h-4 w-4', color)} />
            </div>
            <span className={cn('text-xs font-medium capitalize', color)}>
              {session.status}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => showToast('Edit session coming soon!', 'info')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyLink(session.zoomLink)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Zoom Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(session.zoomLink, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Zoom
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => showToast('Delete session coming soon!', 'info')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="text-base">{session.name}</CardTitle>
        <CardDescription>{cohortName}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(session.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{session.startTime} - {session.endTime}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="h-4 w-4" />
          <span className="font-mono">{session.zoomMeetingId}</span>
        </div>

        {session.status === 'scheduled' && (
          <Button className="mt-3 w-full" size="sm" onClick={() => onCopyLink(session.zoomLink)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
