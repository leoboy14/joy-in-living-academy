import { useState } from 'react'
import { Megaphone, Bell, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Announcement } from '@/types'
import { cn } from '@/lib/utils'

const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Timetable SCTP3 #046',
    content:
      'Please take note! Trainer will be ready by 8.45am to admit trainees. Trainer will take attendance at 9am. Thank you for your co-operation.',
    publishedAt: new Date('2025-07-30T11:14:58'),
    link: '#',
  },
]

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

interface AnnouncementPanelProps {
  className?: string
}

export function AnnouncementPanel({ className }: AnnouncementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <aside className={cn('flex-col border-l border-border bg-card p-4', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Announcements</h2>
          {announcements.length > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {announcements.length}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="mb-4" />

      {isExpanded && (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No announcements</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="border-l-4 border-l-primary transition-all hover:translate-x-1 hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm">{announcement.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{formatDate(announcement.publishedAt)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="mb-3 text-sm text-muted-foreground">{announcement.content}</p>
                  {announcement.link && (
                    <a
                      href={announcement.link}
                      className="group inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:gap-2"
                    >
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
