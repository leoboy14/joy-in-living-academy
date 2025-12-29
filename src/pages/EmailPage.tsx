import { useState } from 'react'
import { 
  Send, 
  Save,
  Users,
  ChevronDown,
  AtSign,
  Eye,
  Search,
  Loader2,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockCohorts, mockStudents } from '@/data/mockData'
import { Student, Cohort, Session } from '@/types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EmailPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

const templates = [
  { 
    id: '1', 
    name: 'Welcome Email', 
    subject: 'Welcome to Joy in Living Academy!',
    body: 'Hi [Name],\n\nWelcome to the [Cohort]! We are excited to have you with us.\n\nBest regards,\nJoy in Living Academy'
  },
  { 
    id: '2', 
    name: 'Zoom Link Reminder', 
    subject: 'Your Zoom Link for [Date]',
    body: 'Hi [Name],\n\nHere is your Zoom link for the upcoming session:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n🔗 Link: [Link]\n\nPlease join 5 minutes early.\n\nBest regards,\nJoy in Living Academy'
  },
  { 
    id: '3', 
    name: 'Attendance Warning', 
    subject: 'Important: Attendance Update',
    body: 'Hi [Name],\n\nWe noticed your attendance rate is currently at [Rate]. Please let us know if you have any difficulties attending the sessions.\n\nBest regards,\nJoy in Living Academy'
  },
]

const variableList = [
  { key: '[Name]', description: 'Student\'s name' },
  { key: '[Email]', description: 'Student\'s email' },
  { key: '[Cohort]', description: 'Cohort name' },
  { key: '[Link]', description: 'Zoom meeting link' },
  { key: '[Date]', description: 'Session date' },
  { key: '[Time]', description: 'Session time' },
  { key: '[Rate]', description: 'Attendance rate' },
]

export function EmailPage({ showToast }: EmailPageProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'cohort' | 'individual'>('all')
  const [selectedCohort, setSelectedCohort] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)
  
  // Session variables
  const [zoomLink, setZoomLink] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  
  const [students, setStudents] = useState<Student[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (!isSupabaseConfigured) {
        setStudents(mockStudents)
        setCohorts(mockCohorts)
        return
      }

      const [{ data: stData }, { data: cData }, { data: sessData }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('cohorts').select('*'),
        supabase.from('sessions').select('*').in('status', ['scheduled', 'in-progress']).order('date', { ascending: true })
      ])

      if (stData) setStudents(stData as any)
      if (cData) setCohorts(cData as any)
      if (sessData) setSessions(sessData as any)
    } catch (error) {
      console.error('Error fetching email data:', error)
    }
  }

  const activeStudentCount = students.filter(s => s.status === 'active').length
  const cohortStudentCount = selectedCohort 
    ? students.filter(s => s.cohortId === selectedCohort && s.status === 'active').length
    : 0
  const individualCount = selectedStudents.length

  const recipientCount = targetType === 'all' 
    ? activeStudentCount 
    : targetType === 'cohort' 
      ? cohortStudentCount 
      : individualCount

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + variable)
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      showToast('Please fill in subject and message', 'error')
      return
    }

    if (recipientCount === 0) {
      showToast('No recipients selected', 'error')
      return
    }

    try {
      setSending(true)
      
      // 1. Get recipient list with personalization data
      const getRecipientData = (student: Student) => ({
        email: student.email,
        name: student.name,
        cohort: cohorts.find(c => c.id === student.cohortId)?.name || 'Your Cohort',
        attendanceRate: `${Math.round(student.attendanceRate)}%`
      })

      let recipients: { email: string; name: string; cohort: string; attendanceRate: string }[] = []
      if (targetType === 'all') {
        recipients = students.filter(s => s.status === 'active').map(getRecipientData)
      } else if (targetType === 'cohort') {
        recipients = students.filter(s => s.cohortId === selectedCohort && s.status === 'active').map(getRecipientData)
      } else {
        recipients = students.filter(s => selectedStudents.includes(s.id)).map(getRecipientData)
      }

      if (!isSupabaseConfigured) {
        showToast(`Simulation: Email would be sent to ${recipients.length} students.`, 'info')
        setSubject('')
        setBody('')
        return
      }

      // 2. Invoke Edge Function
      const { error } = await supabase.functions.invoke('send-email-blast', {
        body: {
          subject,
          body,
          recipients,
          sessionVars: {
            link: zoomLink,
            date: sessionDate,
            time: sessionTime
          }
        }
      })

      if (error) throw error

      showToast(`Email blast sent to ${recipients.length} students!`, 'success')
      setSubject('')
      setBody('')
      setSelectedStudents([])
    } catch (error: any) {
      console.error('Error sending email:', error)
      showToast(error.message || 'Failed to send email blast', 'error')
    } finally {
      setSending(false)
    }
  }
  
  const handleSaveDraft = () => {
    showToast('Draft saved!', 'info')
  }

  const previewBody = body
    .replace('[Name]', 'John Tan')
    .replace('[Email]', 'john.tan@email.com')
    .replace('[Cohort]', 'SCTP3 Batch 046')
    .replace('[Link]', 'https://zoom.us/j/1234567890')
    .replace('[Date]', '15 Jan 2025')
    .replace('[Time]', '09:00 AM')
    .replace('[Rate]', '75%')

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Composer */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose Email</CardTitle>
            <CardDescription>Send announcements to your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipients</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={targetType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetType('all')}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  All Active Students ({activeStudentCount})
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={targetType === 'cohort' ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {selectedCohort 
                        ? cohorts.find(c => c.id === selectedCohort)?.name 
                        : 'Select Cohort'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {cohorts.map((cohort) => (
                      <DropdownMenuItem 
                        key={cohort.id}
                        onClick={() => {
                          setTargetType('cohort')
                          setSelectedCohort(cohort.id)
                        }}
                      >
                        {cohort.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant={targetType === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetType('individual')}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Select Individuals ({individualCount})
                </Button>
              </div>
            </div>

            {/* Individual Student Selection */}
            {targetType === 'individual' && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => setSelectedStudents([])}
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {students
                    .filter(s => s.status === 'active')
                    .filter(s => 
                      !studentSearch || 
                      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      s.email.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map(student => (
                      <label 
                        key={student.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded border transition-colors cursor-pointer hover:bg-background",
                          selectedStudents.includes(student.id) && "bg-primary/10 border-primary/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(prev => [...prev, student.id])
                            } else {
                              setSelectedStudents(prev => prev.filter(id => id !== student.id))
                            }
                          }}
                          className="h-3.5 w-3.5 rounded border-gray-300 accent-primary"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Session Variables (optional) */}
            {(body.includes('[Link]') || body.includes('[Date]') || body.includes('[Time]') ||
              subject.includes('[Link]') || subject.includes('[Date]') || subject.includes('[Time]')) && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Session Variables (used in your template)</p>
                  {sessions.length > 0 && (body.includes('[Link]') || body.includes('[Date]') || body.includes('[Time]')) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {selectedSession ? selectedSession.name : 'Select Session'}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-[200px] overflow-y-auto">
                        <DropdownMenuItem onClick={() => {
                          setSelectedSession(null)
                          setZoomLink('')
                          setSessionDate('')
                          setSessionTime('')
                        }}>
                          <span className="text-muted-foreground">Clear selection</span>
                        </DropdownMenuItem>
                        {sessions.map((session) => {
                          const sessionDateStr = new Date(session.date).toLocaleDateString('en-US', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })
                          return (
                            <DropdownMenuItem 
                              key={session.id}
                              onClick={() => {
                                setSelectedSession(session)
                                setZoomLink(session.zoomLink || '')
                                setSessionDate(sessionDateStr)
                                setSessionTime(session.startTime || '')
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{session.name}</span>
                                <span className="text-xs text-muted-foreground">{sessionDateStr} at {session.startTime}</span>
                              </div>
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(body.includes('[Link]') || subject.includes('[Link]')) && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Zoom Link</label>
                      <Input
                        placeholder="https://zoom.us/j/..."
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  {(body.includes('[Date]') || subject.includes('[Date]')) && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Session Date</label>
                      <Input
                        placeholder="e.g. 25 Dec 2025"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  {(body.includes('[Time]') || subject.includes('[Time]')) && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Session Time</label>
                      <Input
                        placeholder="e.g. 09:00 AM"
                        value={sessionTime}
                        onChange={(e) => setSessionTime(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Message</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <AtSign className="h-3 w-3" />
                      Insert Variable
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {variableList.map((v) => (
                      <DropdownMenuItem 
                        key={v.key}
                        onClick={() => insertVariable(v.key)}
                      >
                        <span className="font-mono text-primary">{v.key}</span>
                        <span className="ml-2 text-muted-foreground">- {v.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <textarea
                className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Write your message here...

Use variables like [Name], [Link], [Date] for personalization."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSend} disabled={recipientCount === 0 || sending}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {recipientCount} Students
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>How your email will appear to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-2 text-sm text-muted-foreground">Subject:</p>
                <p className="mb-4 font-semibold">{subject || '(No subject)'}</p>
                <p className="mb-2 text-sm text-muted-foreground">Message:</p>
                <div className="whitespace-pre-wrap text-sm">
                  {previewBody || '(No message)'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Templates Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Quick start with pre-made templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSubject(template.subject)
                  setBody(template.body)
                  showToast(`Template "${template.name}" loaded!`, 'info')
                }}
              >
                {template.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Variables</CardTitle>
            <CardDescription>Click to copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {variableList.map((v) => (
              <button
                key={v.key}
                onClick={() => {
                  navigator.clipboard.writeText(v.key)
                  showToast(`Copied ${v.key}`, 'success')
                }}
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span className="font-mono text-primary">{v.key}</span>
                <span className="text-xs text-muted-foreground">{v.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
