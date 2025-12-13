import { useState } from 'react'
import { Search, X, Menu, Video, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onSearch: (query: string) => void
  onZoomClick: () => void
  onMenuClick: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function Header({ onSearch, onZoomClick, onMenuClick, darkMode, onToggleDarkMode }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setSearchValue('')
    onSearch('')
  }

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground">Track and manage your learning journey</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-9 sm:w-[280px]"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onToggleDarkMode}
          className="hidden sm:flex"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button onClick={onZoomClick} className="gap-2">
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Send Zoom Links</span>
        </Button>
      </div>
    </header>
  )
}
