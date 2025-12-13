import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Upload, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockStudents, mockCohorts } from '@/data/mockData'
import { Student } from '@/types'
import { cn } from '@/lib/utils'

interface RosterPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function RosterPage({ showToast }: RosterPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getCohortName = (cohortId: string) => {
    return mockCohorts.find(c => c.id === cohortId)?.name || 'Unknown'
  }

  const handleAddStudent = () => {
    showToast('Add Student modal coming soon!', 'info')
  }

  const handleBulkImport = () => {
    showToast('Bulk Import modal coming soon!', 'info')
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Students</h2>
          <p className="text-sm text-muted-foreground">
            {filteredStudents.length} of {mockStudents.length} students
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={handleAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('graduated')}>Graduated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Attendance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => (
                  <StudentRow 
                    key={student.id} 
                    student={student} 
                    cohortName={getCohortName(student.cohortId)}
                    showToast={showToast}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No students found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StudentRow({ 
  student, 
  cohortName,
  showToast 
}: { 
  student: Student
  cohortName: string
  showToast: (message: string, type: 'success' | 'error' | 'info') => void 
}) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-700',
    graduated: 'bg-blue-100 text-blue-700',
    withdrawn: 'bg-red-100 text-red-700',
  }

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold',
            student.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium">{student.name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {student.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm">{cohortName}</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
          statusColors[student.status]
        )}>
          {student.status === 'active' ? (
            <UserCheck className="h-3 w-3" />
          ) : (
            <UserX className="h-3 w-3" />
          )}
          {student.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <div 
              className={cn(
                'h-full transition-all',
                student.attendanceRate >= 80 
                  ? 'bg-emerald-500'
                  : student.attendanceRate >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              )}
              style={{ width: `${student.attendanceRate}%` }}
            />
          </div>
          <span className="text-sm font-medium">{student.attendanceRate}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => showToast('Edit student coming soon!', 'info')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => showToast('Email sent!', 'success')}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => showToast('Delete student coming soon!', 'info')}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
