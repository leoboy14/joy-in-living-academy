import { useState, useMemo } from 'react'
import {
  Video,
  Play,
  Download,
  Trash2,
  Search,
  Filter,
  Archive,
  Clock,
  Calendar,
  Folder,
  ChevronRight,
  AlertCircle,
  FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Recording {
  id: string
  title: string
  sessionName: string
  cohortId: string
  cohortName: string
  date: Date
  duration: string
  size: string
  category: RecordingCategory
  thumbnailUrl?: string
  status: 'active' | 'archived'
  expiresAt: Date
}

type RecordingCategory = 'session' | 'workshop' | 'special-event' | 'training' | 'other'

interface RecordingsPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

// Calculate the archive date (2 months from recording date)
const calculateExpiryDate = (recordingDate: Date): Date => {
  const expiryDate = new Date(recordingDate)
  expiryDate.setMonth(expiryDate.getMonth() + 2)
  return expiryDate
}

// Check if a recording should be archived
const shouldBeArchived = (recording: Recording): boolean => {
  return new Date() >= recording.expiresAt
}

// Get days until expiry
const getDaysUntilExpiry = (expiresAt: Date): number => {
  const now = new Date()
  const diffTime = expiresAt.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Mock data for recordings
const generateMockRecordings = (): Recording[] => {
  const cohorts = [
    { id: 'cohort-1', name: 'Spring 2024' },
    { id: 'cohort-2', name: 'Summer 2024' },
    { id: 'cohort-3', name: 'Fall 2024' },
  ]

  const categories: RecordingCategory[] = ['session', 'workshop', 'special-event', 'training', 'other']
  
  const mockRecordings: Recording[] = []
  
  // Generate recordings across different dates
  const now = new Date()
  
  // Active recordings (within 2 months)
  for (let i = 0; i < 12; i++) {
    const recordingDate = new Date(now)
    recordingDate.setDate(recordingDate.getDate() - Math.floor(Math.random() * 50))
    
    const cohort = cohorts[Math.floor(Math.random() * cohorts.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const expiresAt = calculateExpiryDate(recordingDate)
    
    mockRecordings.push({
      id: `rec-${i + 1}`,
      title: `${category === 'session' ? 'Session' : category === 'workshop' ? 'Workshop' : category === 'training' ? 'Training' : 'Event'} Recording ${i + 1}`,
      sessionName: `${cohort.name} - Week ${Math.floor(Math.random() * 12) + 1}`,
      cohortId: cohort.id,
      cohortName: cohort.name,
      date: recordingDate,
      duration: `${Math.floor(Math.random() * 90) + 30}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      size: `${(Math.random() * 2 + 0.5).toFixed(2)} GB`,
      category,
      status: shouldBeArchived({ expiresAt } as Recording) ? 'archived' : 'active',
      expiresAt,
    })
  }

  // Add some archived recordings (older than 2 months)
  for (let i = 0; i < 5; i++) {
    const recordingDate = new Date(now)
    recordingDate.setMonth(recordingDate.getMonth() - 3 - Math.floor(Math.random() * 3))
    
    const cohort = cohorts[Math.floor(Math.random() * cohorts.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    mockRecordings.push({
      id: `rec-archived-${i + 1}`,
      title: `Archived ${category === 'session' ? 'Session' : 'Event'} ${i + 1}`,
      sessionName: `${cohort.name} - Past Session`,
      cohortId: cohort.id,
      cohortName: cohort.name,
      date: recordingDate,
      duration: `${Math.floor(Math.random() * 90) + 30}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      size: `${(Math.random() * 2 + 0.5).toFixed(2)} GB`,
      category,
      status: 'archived',
      expiresAt: calculateExpiryDate(recordingDate),
    })
  }

  return mockRecordings.sort((a, b) => b.date.getTime() - a.date.getTime())
}

const categoryConfig: Record<RecordingCategory, { label: string; color: string }> = {
  session: { label: 'Session', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  workshop: { label: 'Workshop', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  'special-event': { label: 'Special Event', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  training: { label: 'Training', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  other: { label: 'Other', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
}

export function RecordingsPage({ showToast }: RecordingsPageProps) {
  const [recordings] = useState<Recording[]>(() => generateMockRecordings())
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter] = useState<RecordingCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [selectedCategory, setSelectedCategory] = useState<RecordingCategory | null>(null)

  // Separate active and archived recordings
  const { activeRecordings, archivedRecordings } = useMemo(() => {
    const active = recordings.filter(r => r.status === 'active')
    const archived = recordings.filter(r => r.status === 'archived')
    return { activeRecordings: active, archivedRecordings: archived }
  }, [recordings])

  // Group recordings by category
  const recordingsByCategory = useMemo(() => {
    const filtered = recordings.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          r.title.toLowerCase().includes(query) ||
          r.sessionName.toLowerCase().includes(query) ||
          r.cohortName.toLowerCase().includes(query)
        )
      }
      return true
    })

    const grouped: Record<RecordingCategory, Recording[]> = {
      session: [],
      workshop: [],
      'special-event': [],
      training: [],
      other: [],
    }

    filtered.forEach(recording => {
      grouped[recording.category].push(recording)
    })

    return grouped
  }, [recordings, searchQuery, statusFilter])

  // Filtered recordings for list view
  const filteredRecordings = useMemo(() => {
    return recordings.filter(r => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (selectedCategory && r.category !== selectedCategory) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          r.title.toLowerCase().includes(query) ||
          r.sessionName.toLowerCase().includes(query) ||
          r.cohortName.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [recordings, categoryFilter, statusFilter, selectedCategory, searchQuery])

  const handlePlay = (recording: Recording) => {
    showToast(`Playing: ${recording.title}`, 'info')
  }

  const handleDownload = (recording: Recording) => {
    showToast(`Downloading: ${recording.title}`, 'success')
  }

  const handleDelete = (recording: Recording) => {
    showToast(`Deleted: ${recording.title}`, 'info')
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
          <p className="text-muted-foreground">
            Manage session recordings • Auto-archived after 2 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Video className="h-3.5 w-3.5" />
            {activeRecordings.length} Active
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            <Archive className="h-3.5 w-3.5" />
            {archivedRecordings.length} Archived
          </Badge>
        </div>
      </div>

      {/* Archive Notice */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Automatic Archival Policy</p>
            <p className="text-sm text-muted-foreground">
              Recordings are automatically archived after 2 months from the recording date. 
              Archived recordings can still be accessed but may be permanently deleted after the retention period.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as 'all' | 'active' | 'archived')}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="gap-1.5"
            >
              <Folder className="h-4 w-4" />
              {categoryConfig[selectedCategory].label}
              <span className="text-muted-foreground">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Folders */}
      {!selectedCategory && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {(Object.entries(categoryConfig) as [RecordingCategory, typeof categoryConfig[RecordingCategory]][]).map(
            ([category, config]) => {
              const count = recordingsByCategory[category].length
              const activeCount = recordingsByCategory[category].filter(r => r.status === 'active').length
              
              return (
                <Card
                  key={category}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
                    count === 0 && 'opacity-50'
                  )}
                  onClick={() => count > 0 && setSelectedCategory(category)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className={cn('p-2 rounded-lg', config.color.split(' ')[0])}>
                        <FolderOpen className={cn('h-5 w-5', config.color.split(' ')[1])} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-medium">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {count} recording{count !== 1 ? 's' : ''}
                        {activeCount < count && ` • ${activeCount} active`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}

      <Separator />

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedCategory ? (
              <>
                <FolderOpen className="h-5 w-5" />
                {categoryConfig[selectedCategory].label} Recordings
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                All Recordings
              </>
            )}
          </CardTitle>
          <CardDescription>
            {filteredRecordings.length} recording{filteredRecordings.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Video className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">No recordings found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search or filters' : 'Recordings will appear here after sessions'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecordings.map((recording) => {
                const daysUntilExpiry = getDaysUntilExpiry(recording.expiresAt)
                const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 14
                const isExpired = daysUntilExpiry <= 0

                return (
                  <div
                    key={recording.id}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-colors',
                      recording.status === 'archived'
                        ? 'bg-muted/30 border-muted'
                        : 'bg-card hover:bg-muted/50'
                    )}
                  >
                    {/* Thumbnail placeholder */}
                    <div className="relative h-20 w-36 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary/60" />
                      <span className="absolute bottom-1 right-1 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                        {recording.duration}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{recording.title}</h3>
                        <Badge variant="outline" className={cn('text-xs', categoryConfig[recording.category].color)}>
                          {categoryConfig[recording.category].label}
                        </Badge>
                        {recording.status === 'archived' && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Archive className="h-3 w-3" />
                            Archived
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{recording.sessionName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(recording.date)}
                        </span>
                        <span>{recording.size}</span>
                        <span className="text-muted-foreground/70">•</span>
                        <span>{recording.cohortName}</span>
                      </div>
                      
                      {/* Expiry indicator */}
                      {recording.status === 'active' && (
                        <div className={cn(
                          'flex items-center gap-1 mt-2 text-xs',
                          isExpiringSoon ? 'text-amber-500' : 'text-muted-foreground'
                        )}>
                          <Clock className="h-3.5 w-3.5" />
                          {isExpiringSoon ? (
                            <span>Expires in {daysUntilExpiry} days</span>
                          ) : (
                            <span>Expires {formatDate(recording.expiresAt)}</span>
                          )}
                        </div>
                      )}
                      {isExpired && recording.status === 'archived' && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Archive className="h-3.5 w-3.5" />
                          <span>Archived on {formatDate(recording.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlay(recording)}
                        className="gap-1.5"
                      >
                        <Play className="h-4 w-4" />
                        <span className="hidden sm:inline">Play</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownload(recording)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(recording)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
