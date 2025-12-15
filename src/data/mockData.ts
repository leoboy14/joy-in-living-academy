import { Student, Cohort, Session, AttendanceRecord, DashboardStats } from '@/types'

// Demo data for the admin dashboard

export const mockCohorts: Cohort[] = [
  {
    id: 'cohort-1',
    name: 'SCTP3 Batch 046',
    code: 'SCTP3-046',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-06-15'),
    studentCount: 25,
    status: 'active',
  },
  {
    id: 'cohort-2',
    name: 'SCTP3 Batch 045',
    code: 'SCTP3-045',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-12-31'),
    studentCount: 28,
    status: 'completed',
  },
  {
    id: 'cohort-3',
    name: 'SCTP3 Batch 047',
    code: 'SCTP3-047',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-12-31'),
    studentCount: 0,
    status: 'upcoming',
  },
]

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'John Tan',
    email: 'john.tan@email.com',
    phone: '+65 9123 4567',
    cohortId: 'cohort-1',
    enrolledAt: new Date('2025-01-10'),
    status: 'active',
    attendanceRate: 95,
  },
  {
    id: 'student-2',
    name: 'Sarah Lim',
    email: 'sarah.lim@email.com',
    phone: '+65 9234 5678',
    cohortId: 'cohort-1',
    enrolledAt: new Date('2025-01-10'),
    status: 'active',
    attendanceRate: 88,
  },
  {
    id: 'student-3',
    name: 'Michael Wong',
    email: 'michael.wong@email.com',
    cohortId: 'cohort-1',
    enrolledAt: new Date('2025-01-12'),
    status: 'active',
    attendanceRate: 72,
  },
  {
    id: 'student-4',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '+65 9345 6789',
    cohortId: 'cohort-1',
    enrolledAt: new Date('2025-01-10'),
    status: 'inactive',
    attendanceRate: 45,
  },
  {
    id: 'student-5',
    name: 'David Lee',
    email: 'david.lee@email.com',
    cohortId: 'cohort-2',
    enrolledAt: new Date('2024-06-28'),
    status: 'graduated',
    attendanceRate: 92,
  },
]

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    name: 'Module 1: Introduction',
    cohortId: 'cohort-1',
    date: new Date('2025-01-20'),
    startTime: '09:00',
    endTime: '12:00',
    zoomMeetingId: '123 456 7890',
    zoomLink: 'https://zoom.us/j/1234567890',
    status: 'completed',
  },
  {
    id: 'session-2',
    name: 'Module 2: Fundamentals',
    cohortId: 'cohort-1',
    date: new Date('2025-01-27'),
    startTime: '09:00',
    endTime: '12:00',
    zoomMeetingId: '123 456 7891',
    zoomLink: 'https://zoom.us/j/1234567891',
    status: 'completed',
  },
  {
    id: 'session-3',
    name: 'Module 3: Advanced Topics',
    cohortId: 'cohort-1',
    date: new Date(), // Today
    startTime: '14:00',
    endTime: '17:00',
    zoomMeetingId: '123 456 7892',
    zoomLink: 'https://zoom.us/j/1234567892',
    status: 'scheduled',
  },
  {
    id: 'session-4',
    name: 'Module 4: Practical Workshop',
    cohortId: 'cohort-1',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    startTime: '09:00',
    endTime: '12:00',
    zoomMeetingId: '123 456 7893',
    zoomLink: 'https://zoom.us/j/1234567893',
    status: 'scheduled',
  },
  {
    id: 'session-5',
    name: 'Module 5: Project Review',
    cohortId: 'cohort-1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    startTime: '09:00',
    endTime: '12:00',
    zoomMeetingId: '123 456 7894',
    zoomLink: 'https://zoom.us/j/1234567894',
    status: 'scheduled',
  },
]

export const mockAttendance: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'student-1', sessionId: 'session-1', status: 'present', checkInTime: new Date('2025-01-20T08:55:00'), syncedAt: new Date() },
  { id: 'att-2', studentId: 'student-2', sessionId: 'session-1', status: 'present', checkInTime: new Date('2025-01-20T08:58:00'), syncedAt: new Date() },
  { id: 'att-3', studentId: 'student-3', sessionId: 'session-1', status: 'late', checkInTime: new Date('2025-01-20T09:15:00'), syncedAt: new Date() },
  { id: 'att-4', studentId: 'student-4', sessionId: 'session-1', status: 'absent', syncedAt: new Date() },
  { id: 'att-5', studentId: 'student-1', sessionId: 'session-2', status: 'present', checkInTime: new Date('2025-01-27T08:50:00'), syncedAt: new Date() },
  { id: 'att-6', studentId: 'student-2', sessionId: 'session-2', status: 'late', checkInTime: new Date('2025-01-27T09:10:00'), syncedAt: new Date() },
  { id: 'att-7', studentId: 'student-3', sessionId: 'session-2', status: 'absent', syncedAt: new Date() },
]

export const mockDashboardStats: DashboardStats = {
  totalStudents: 53,
  activeStudents: 25,
  totalCohorts: 3,
  activeCohorts: 1,
  upcomingSessions: 5,
  averageAttendanceRate: 78,
}

// Helper functions
export function getStudentsByCohort(cohortId: string): Student[] {
  return mockStudents.filter((s) => s.cohortId === cohortId)
}

export function getCohortById(cohortId: string): Cohort | undefined {
  return mockCohorts.find((c) => c.id === cohortId)
}

export function getSessionsByCohort(cohortId: string): Session[] {
  return mockSessions.filter((s) => s.cohortId === cohortId)
}

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  return mockAttendance.filter((a) => a.studentId === studentId)
}

export function getAttendanceBySession(sessionId: string): AttendanceRecord[] {
  return mockAttendance.filter((a) => a.sessionId === sessionId)
}
