import { useState, useMemo, useEffect } from 'react'
import { 
  Video, 
  Play, 
  Search, 
  Calendar, 
  Clock, 
  GraduationCap, 
  Mail, 
  Hash,
  ArrowRight,
  LogOut,
  ChevronLeft,
  Loader2,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Recording {
  id: string
  title: string
  sessionName: string
  cohortId: string
  cohortName: string
  date: Date
  duration: string
  size: string
  category: string
  thumbnailUrl?: string
}

interface Cohort {
  id: string
  name: string
  code: string
}

interface PublicArchivesPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  onExit: () => void
}

export function PublicArchivesPage({ showToast, onExit }: PublicArchivesPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [cohortNumber, setCohortNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingRecordings, setLoadingRecordings] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for Supabase data
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [studentCohort, setStudentCohort] = useState<Cohort | null>(null)

  // Fetch cohorts on mount
  useEffect(() => {
    const fetchCohorts = async () => {
      if (!isSupabaseConfigured) {
        // Fallback mock data if Supabase isn't configured
        setCohorts([
          { id: 'cohort-1', name: 'Cohort 1', code: 'C1' },
          { id: 'cohort-2', name: 'Cohort 2', code: 'C2' },
          { id: 'cohort-3', name: 'Cohort 3', code: 'C3' },
        ])
        return
      }

      try {
        const { data, error } = await supabase.from('cohorts').select('id, name, code')
        if (error) throw error
        if (data) setCohorts(data)
      } catch (error) {
        console.error('Error fetching cohorts:', error)
      }
    }

    fetchCohorts()
  }, [])

  // Fetch recordings when authenticated
  useEffect(() => {
    if (!isAuthenticated || !studentCohort) return

    const fetchRecordings = async () => {
      setLoadingRecordings(true)
      
      if (!isSupabaseConfigured) {
        // Mock recordings for demo
        const mockRecordings: Recording[] = []
        const categories = ['session', 'workshop', 'special-event', 'training']
        const now = new Date()

        for (let i = 0; i < 8; i++) {
          const recordingDate = new Date(now)
          recordingDate.setDate(recordingDate.getDate() - Math.floor(Math.random() * 60))
          mockRecordings.push({
            id: `rec-${i + 1}`,
            title: `${categories[i % categories.length].charAt(0).toUpperCase() + categories[i % categories.length].slice(1)} - Lesson ${i + 1}`,
            sessionName: `${studentCohort.name} Archive`,
            cohortId: studentCohort.id,
            cohortName: studentCohort.name,
            date: recordingDate,
            duration: `${Math.floor(Math.random() * 90) + 30}:00`,
            size: `${(Math.random() * 2 + 0.5).toFixed(2)} GB`,
            category: categories[i % categories.length],
          })
        }
        setRecordings(mockRecordings.sort((a, b) => b.date.getTime() - a.date.getTime()))
        setLoadingRecordings(false)
        return
      }

      try {
        // Fetch recordings from Supabase filtered by cohort
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .eq('cohortId', studentCohort.id)
          .order('date', { ascending: false })

        if (error) throw error
        
        if (data) {
          const transformed: Recording[] = data.map((r: any) => ({
            ...r,
            date: new Date(r.date),
            cohortName: studentCohort.name
          }))
          setRecordings(transformed)
        }
      } catch (error) {
        console.error('Error fetching recordings:', error)
        showToast('Failed to load recordings.', 'error')
      } finally {
        setLoadingRecordings(false)
      }
    }

    fetchRecordings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, studentCohort])

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !cohortNumber) {
      setError('Please enter both email and cohort number')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Find cohort by code (case-insensitive)
      const cohort = cohorts.find(c => c.code.toLowerCase() === cohortNumber.toLowerCase())
      
      if (!cohort) {
        setError('Cohort not found. Please check your cohort code.')
        setIsLoading(false)
        return
      }

      if (isSupabaseConfigured) {
        // Verify student exists in the cohort - strict validation
        const { data: studentData, error } = await supabase
          .from('students')
          .select('id, email, cohortId')
          .ilike('email', email.toLowerCase())
          .eq('cohortId', cohort.id)
          .single()

        if (error || !studentData) {
          setError('Email not found in this cohort. Please verify your email is registered.')
          setIsLoading(false)
          return
        }
        
        setIsAuthenticated(true)
        setStudentCohort(cohort)
        showToast('Access granted! Welcome to your cohort archives.', 'success')
      } else {
        // Supabase not configured - show error
        setError('Database connection unavailable. Please contact the administrator.')
      }

    } catch (error) {
      console.error('Error verifying access:', error)
      showToast('An error occurred. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecordings = useMemo(() => {
    if (!studentCohort) return []
    return recordings.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           r.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [recordings, studentCohort, searchQuery])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-primary/5 blur-3xl" />
        </div>

        <Card className="w-full max-w-md relative border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
              <Video className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Cohort Archives</CardTitle>
            <CardDescription className="text-base">
              Access your recorded sessions and workshops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccess} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Access Denied</p>
                    <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setError(null)} 
                    className="text-destructive/60 hover:text-destructive transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}


              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className={`pl-10 ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                    required
                  />
                </div>
              </div>


              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="cohort">
                  Cohort Number/Code
                </label>
                <div className="relative">
                  <Hash className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <Input
                    id="cohort"
                    type="text"
                    placeholder="e.g. C1, C2, C3"
                    value={cohortNumber}
                    onChange={(e) => { setCohortNumber(e.target.value); setError(null); }}
                    className={`pl-10 ${error ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                    required
                  />
                </div>
              </div>


              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Archives
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="pt-4 flex flex-col gap-2">
                <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Admin Login
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  Enter your registered email and cohort code to access archives
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg hidden sm:block">Joy in Living Academy</h1>
              <Badge variant="secondary" className="font-normal">
                {studentCohort?.name} Archive
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Archive</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-8 max-w-6xl">
        <div className="flex flex-col gap-6">
          {/* Welcome Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome, {email.split('@')[0]}!</h2>
              <p className="text-muted-foreground">
                Here are the recorded sessions for {studentCohort?.name}.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Loading State */}
          {loadingRecordings ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : filteredRecordings.length === 0 ? (
            <Card className="border-dashed flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Video className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-xl">No recordings found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                {searchQuery 
                  ? "We couldn't find any recordings matching your search term."
                  : "There are no recordings available for your cohort at this time."}
              </p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery('')} className="mt-4">
                  Clear search
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRecordings.map((recording) => (
                <Card key={recording.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center">
                    <Play className="h-12 w-12 text-indigo-600/40 group-hover:text-indigo-600/80 group-hover:scale-110 transition-all duration-300" />
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      <Badge className="bg-black/60 backdrop-blur-md text-white border-0">
                        {recording.duration}
                      </Badge>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300" />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <Badge variant="outline" className="mb-2 text-[10px] uppercase font-bold tracking-wider">
                          {recording.category}
                        </Badge>
                        <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                          {recording.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(recording.date)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {recording.duration}
                        </div>
                      </div>
                      
                      <Button className="w-full bg-secondary hover:bg-indigo-600 hover:text-white transition-all gap-2">
                        <Play className="h-4 w-4 fill-current" />
                        Watch Recording
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Joy in Living Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
