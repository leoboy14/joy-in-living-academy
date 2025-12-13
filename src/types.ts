// Type definitions for Joy in Living Academy Admin Dashboard

// Student/Roster Types
export interface Student {
  id: string
  name: string
  email: string
  phone?: string
  cohortId: string
  enrolledAt: Date
  status: 'active' | 'inactive' | 'graduated' | 'withdrawn'
  attendanceRate: number
}

export interface Cohort {
  id: string
  name: string
  code: string
  startDate: Date
  endDate: Date
  studentCount: number
  status: 'active' | 'completed' | 'upcoming'
}

// Session Types
export interface Session {
  id: string
  name: string
  cohortId: string
  date: Date
  startTime: string
  endTime: string
  zoomMeetingId: string
  zoomLink: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

// Attendance Types
export type AttendanceStatus = 'present' | 'late' | 'absent'

export interface AttendanceRecord {
  id: string
  studentId: string
  sessionId: string
  status: AttendanceStatus
  checkInTime?: Date
  syncedAt: Date
}

export interface AttendanceSummary {
  studentId: string
  totalSessions: number
  present: number
  late: number
  absent: number
  attendanceRate: number
}

// Email Blast Types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[] // e.g., ['name', 'link', 'date']
  createdAt: Date
}

export interface EmailBlast {
  id: string
  templateId?: string
  subject: string
  body: string
  targetType: 'all' | 'cohort' | 'custom'
  targetCohortId?: string
  targetStudentIds?: string[]
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  scheduledAt?: Date
  sentAt?: Date
  recipientCount: number
}

// Analytics Types
export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  totalCohorts: number
  activeCohorts: number
  upcomingSessions: number
  averageAttendanceRate: number
}

// Navigation Types
export type NavPage = 
  | 'dashboard'
  | 'roster'
  | 'sessions'
  | 'attendance'
  | 'email'
  | 'analytics'
  | 'settings'

// Filter Types
export interface FilterOptions {
  sortBy: 'recent' | 'name' | 'date' | 'status'
  filterBy: string
  searchQuery: string
}
