import { useState } from 'react'
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
  PlayCircle
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
import { mockSessions, mockCohorts } from '@/data/mockData'
import { Session } from '@/types'
import { cn } from '@/lib/utils'

interface SessionsPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function SessionsPage({ showToast }: SessionsPageProps) {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all')

  const filteredSessions = mockSessions.filter((session) => {
    if (filter === 'all') return true
    return session.status === filter
  })

  const getCohortName = (cohortId: string) => {
    return mockCohorts.find(c => c.id === cohortId)?.name || 'Unknown'
  }

  const handleCreateSession = () => {
    showToast('Create Session modal coming soon!', 'info')
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
        
        <Button onClick={handleCreateSession}>
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

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
