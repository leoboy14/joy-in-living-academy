import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FilterOptions } from '@/types'

interface TaskListProps {
  searchQuery: string
  filterOptions: FilterOptions
}

export function TaskList({ searchQuery, filterOptions }: TaskListProps) {
  const hasTasks = false

  if (!hasTasks) {
    return (
      <Card className="flex flex-1 flex-col items-center justify-center border-2 border-dashed p-8 text-center">
        <div className="relative mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          {/* Animated rings */}
          <div className="absolute inset-0 -m-2 animate-ping rounded-full border-2 border-primary/20" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 -m-4 animate-ping rounded-full border-2 border-primary/10" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </div>
        
        <h3 className="mb-2 text-lg font-semibold">No tasks found</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {searchQuery
            ? `No tasks matching "${searchQuery}"`
            : filterOptions.filterBy !== 'all'
            ? `No ${filterOptions.filterBy} tasks at the moment`
            : "You don't have any tasks yet. They will appear here once assigned."}
        </p>
        
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-3">
      {/* Task items would be rendered here */}
    </div>
  )
}
