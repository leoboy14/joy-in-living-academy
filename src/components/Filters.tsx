import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FilterOptions, TaskStatus } from '@/types'

interface FiltersProps {
  options: FilterOptions
  onChange: (options: Partial<FilterOptions>) => void
}

const sortOptions = [
  { value: 'recent', label: 'Recent Activity' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'title', label: 'Title (A-Z)' },
] as const

const filterOptions = [
  { value: 'all', label: 'All Tasks' },
  { value: 'current', label: 'Current' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
] as const

export function Filters({ options, onChange }: FiltersProps) {
  const selectedSort = sortOptions.find((o) => o.value === options.sortBy)
  const selectedFilter = filterOptions.find((o) => o.value === options.filterBy)

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[160px] justify-between gap-2">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sort By
              </span>
              <span className="font-medium">{selectedSort?.label}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange({ sortBy: option.value })}
              className="justify-between"
            >
              {option.label}
              {options.sortBy === option.value && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[160px] justify-between gap-2">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filter By
              </span>
              <span className="font-medium">{selectedFilter?.label}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuLabel>Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange({ filterBy: option.value as TaskStatus | 'all' })}
              className="justify-between"
            >
              {option.label}
              {options.filterBy === option.value && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
