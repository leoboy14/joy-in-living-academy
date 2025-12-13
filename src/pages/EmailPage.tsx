import { useState } from 'react'
import { 
  Send, 
  Save,
  Users,
  ChevronDown,
  AtSign,
  Eye
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

interface EmailPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

const templates = [
  { id: '1', name: 'Welcome Email', variables: ['name', 'cohort'] },
  { id: '2', name: 'Zoom Link Reminder', variables: ['name', 'link', 'date', 'time'] },
  { id: '3', name: 'Attendance Warning', variables: ['name', 'rate'] },
]

const variableList = [
  { key: '[Name]', description: 'Student\'s name' },
  { key: '[Email]', description: 'Student\'s email' },
  { key: '[Cohort]', description: 'Cohort name' },
  { key: '[Link]', description: 'Zoom meeting link' },
  { key: '[Date]', description: 'Session date' },
  { key: '[Time]', description: 'Session time' },
]

export function EmailPage({ showToast }: EmailPageProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'cohort'>('all')
  const [selectedCohort, setSelectedCohort] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const activeStudentCount = mockStudents.filter(s => s.status === 'active').length
  const cohortStudentCount = selectedCohort 
    ? mockStudents.filter(s => s.cohortId === selectedCohort && s.status === 'active').length
    : 0

  const recipientCount = targetType === 'all' ? activeStudentCount : cohortStudentCount

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + variable)
  }

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      showToast('Please fill in subject and message', 'error')
      return
    }
    showToast(`Email sent to ${recipientCount} students!`, 'success')
    setSubject('')
    setBody('')
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
                        ? mockCohorts.find(c => c.id === selectedCohort)?.name 
                        : 'Select Cohort'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {mockCohorts.map((cohort) => (
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
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

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
              <Button onClick={handleSend} disabled={recipientCount === 0}>
                <Send className="mr-2 h-4 w-4" />
                Send to {recipientCount} Students
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
                  if (template.id === '2') {
                    setSubject('Your Zoom Link for [Date]')
                    setBody('Hi [Name],\n\nHere is your Zoom link for the upcoming session:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n🔗 Link: [Link]\n\nPlease join 5 minutes early.\n\nBest regards,\nJoy in Living Academy')
                  }
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
