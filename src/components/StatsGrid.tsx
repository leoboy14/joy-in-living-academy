import { PlayCircle, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TaskStats, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatsGridProps {
  stats: TaskStats
  onStatClick: (status: TaskStatus) => void
}

const statusConfig: { status: TaskStatus; label: string; icon: typeof PlayCircle; gradient: string }[] = [
  { status: 'current', label: 'Current', icon: PlayCircle, gradient: 'from-primary to-primary/70' },
  { status: 'upcoming', label: 'Upcoming', icon: Calendar, gradient: 'from-amber-500 to-orange-500' },
  { status: 'completed', label: 'Completed', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600' },
  { status: 'overdue', label: 'Overdue', icon: AlertCircle, gradient: 'from-red-400 to-red-600' },
]

export function StatsGrid({ stats, onStatClick }: StatsGridProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statusConfig.map(({ status, label, icon: Icon, gradient }, index) => (
        <Card
          key={status}
          className={cn(
            'group relative cursor-pointer overflow-hidden border-0 p-4 text-white transition-all hover:-translate-y-1 hover:shadow-xl',
            `bg-gradient-to-br ${gradient}`
          )}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onStatClick(status)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStatClick(status)}
        >
          <div className="relative z-10">
            <Icon className="mb-2 h-6 w-6 opacity-90" />
            <p className="text-3xl font-extrabold">{stats[status]}</p>
            <p className="text-sm font-medium opacity-90">{label}</p>
          </div>
          
          {/* Decorative circle */}
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
        </Card>
      ))}
    </div>
  )
}
