import { useState, useEffect } from 'react'
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
  Filter,
  ChevronUp,
  ChevronDown,
  X,
  Loader2
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
import { Student, Cohort } from '@/types'
import { cn } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface RosterPageProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function RosterPage({ showToast }: RosterPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  // Fetch students from Supabase
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (!isSupabaseConfigured) {
        setStudents(mockStudents)
        setCohorts(mockCohorts)
        return
      }

      const [{ data: sData, error: sError }, { data: cData, error: cError }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('cohorts').select('*')
      ])
      
      if (sError) throw sError
      if (cError) throw cError

      if (cData) setCohorts(cData)

      if (sData) {
        const transformed: Student[] = sData.map((s: any) => ({
          ...s,
          enrolledAt: new Date(s.enrolledAt),
          status: s.status as Student['status']
        }))
        setStudents(transformed)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('Failed to fetch data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getCohortName = (cohortId: string) => {
    return cohorts.find(c => c.id === cohortId)?.name || 'Unknown'
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setIsModalOpen(true)
  }

  const handleBulkImport = () => {
    showToast('Bulk Import modal coming soon!', 'info')
  }

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }

  const handleSelectStudent = (id: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedStudents(newSelected)
  }

  const handleBulkEmail = () => {
    showToast(`Sending email to ${selectedStudents.size} students...`, 'info')
  }

  const handleSort = (column: 'name' | 'attendance') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDir === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    } else {
      return sortDir === 'asc'
        ? a.attendanceRate - b.attendanceRate
        : b.attendanceRate - a.attendanceRate
    }
  })

  const SortIcon = ({ column }: { column: 'name' | 'attendance' }) => {
    if (sortBy !== column) return null
    return sortDir === 'asc' 
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />
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

      {/* Bulk Action Bar */}
      {selectedStudents.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-3">
            <span className="text-sm font-medium">
              {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleBulkEmail}>
                <Mail className="mr-1 h-3 w-3" />
                Email Selected
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedStudents(new Set())}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b bg-muted/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === sortedStudents.length && sortedStudents.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 accent-primary"
                    />
                  </th>
                  <th 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">
                      Student
                      <SortIcon column="name" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cohort
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th 
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort('attendance')}
                  >
                    <span className="flex items-center gap-1">
                      Attendance
                      <SortIcon column="attendance" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading students...
                      </div>
                    </td>
                  </tr>
                ) : sortedStudents.map((student) => (
                  <StudentRow 
                    key={student.id} 
                    student={student} 
                    cohortName={getCohortName(student.cohortId)}
                    showToast={showToast}
                    isSelected={selectedStudents.has(student.id)}
                    onSelect={() => handleSelectStudent(student.id)}
                    onEdit={() => handleEditStudent(student)}
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

      {/* Student Modal (Add/Edit) */}
      {isModalOpen && (
        <StudentModal 
          cohorts={cohorts}
          student={editingStudent || undefined}
          onClose={() => {
            setIsModalOpen(false)
            setEditingStudent(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setEditingStudent(null)
            fetchData()
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

interface StudentModalProps {
  cohorts: Cohort[]
  student?: Student
  onClose: () => void
  onSuccess: () => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

function StudentModal({ cohorts, student, onClose, onSuccess, showToast }: StudentModalProps) {
  const isEdit = !!student
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    cohortId: student?.cohortId || 'cohort-1',
    status: student?.status || 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error')
      return
    }

    try {
      setSubmitting(true)
      
      if (isEdit) {
        // 1. Update student
        const { error: updateError } = await supabase
          .from('students')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            cohortId: formData.cohortId,
            status: formData.status,
          })
          .eq('id', student.id)

        if (updateError) throw updateError

        // 2. If cohort changed, update counts for BOTH cohorts
        if (student.cohortId !== formData.cohortId) {
          const updateCohortCount = async (cid: string) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('cohortId', cid)
            
            await supabase
              .from('cohorts')
              .update({ studentCount: count || 0 })
              .eq('id', cid)
          }

          await Promise.all([
            updateCohortCount(student.cohortId),
            updateCohortCount(formData.cohortId)
          ])
        }

        showToast('Student updated successfully!', 'success')
      } else {
        // Create new
        const studentId = `student-${Date.now()}`
        const { error: insertError } = await supabase
          .from('students')
          .insert({
            id: studentId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            cohortId: formData.cohortId,
            status: formData.status,
            enrolledAt: new Date().toISOString()
          })

        if (insertError) throw insertError

        // Update cohort count
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('cohortId', formData.cohortId)

        await supabase
          .from('cohorts')
          .update({ studentCount: count || 0 })
          .eq('id', formData.cohortId)

        showToast('Student added successfully!', 'success')
      }
      
      onSuccess()
    } catch (error: any) {
      console.error('Error saving student:', error)
      showToast(error.message || 'Failed to save student', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200 my-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{isEdit ? 'Edit Student' : 'Add New Student'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number (Optional)</label>
              <Input 
                placeholder="+65 1234 5678" 
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cohort</label>
                <Select 
                  value={formData.cohortId} 
                  onValueChange={v => setFormData(prev => ({ ...prev, cohortId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map(cohort => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={v => setFormData(prev => ({ ...prev, status: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update Student' : 'Add Student'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentRow({ 
  student, 
  cohortName,
  showToast,
  isSelected,
  onSelect,
  onEdit
}: { 
  student: Student
  cohortName: string
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
}) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-700',
    graduated: 'bg-blue-100 text-blue-700',
    withdrawn: 'bg-red-100 text-red-700',
  }

  return (
    <tr className={cn("hover:bg-muted/50 transition-colors", isSelected && "bg-primary/5")}>
      <td className="w-10 px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-4 w-4 rounded border-gray-300 accent-primary"
        />
      </td>
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
            <DropdownMenuItem onClick={onEdit}>
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
