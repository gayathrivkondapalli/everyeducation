import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  register: (username, email, password, role) =>
    apiClient.post('/auth/register', { username, email, password, role }),
};

export const wellbeingAPI = {
  recordWellbeing: (studentId, data) =>
    apiClient.post('/wellbeing/record', { student_id: studentId, ...data }),
  getStudentWellbeing: (studentId, days = 30) =>
    apiClient.get(`/wellbeing/records/${studentId}?days=${days}`),
  getAlerts: () => apiClient.get('/wellbeing/alerts'),
  getStressOverTime: (studentId = null, days = 30) =>
    apiClient.get(`/wellbeing/stress-over-time?student_id=${studentId}&days=${days}`),
  getHeatmapData: () => apiClient.get('/wellbeing/heatmap-data'),
  getAllStudentsStatus: (search = '', page = 1, perPage = 50) =>
    apiClient.get(`/wellbeing/students-status?search=${encodeURIComponent(search)}&page=${page}&per_page=${perPage}`),
};

export const attendanceAPI = {
  recordAttendance: (studentId, classDate, present) =>
    apiClient.post('/attendance/record', { student_id: studentId, class_date: classDate, present }),
  getStudentAttendance: (studentId, days = 30) =>
    apiClient.get(`/attendance/student/${studentId}?days=${days}`),
  getAbsentStudents: (days = 30, threshold = 0.8) =>
    apiClient.get(`/attendance/absent-students?days=${days}&threshold=${threshold}`),
  getAttendanceGradesCorrelation: (days = 30) =>
    apiClient.get(`/attendance/attendance-grades-correlation?days=${days}`),
  getAttendanceSummary: () => apiClient.get('/attendance/summary'),
};

export const gradesAPI = {
  recordGrade: (studentId, assignmentId, grade, feedback) =>
    apiClient.post('/grades/record', { student_id: studentId, assignment_id: assignmentId, grade, feedback }),
  getStudentGrades: (studentId) => apiClient.get(`/grades/student/${studentId}`),
  getAssignmentGrades: (assignmentId) => apiClient.get(`/grades/assignment/${assignmentId}`),
  getGradeStatistics: () => apiClient.get('/grades/statistics'),
  getPerformanceByAttendance: () => apiClient.get('/grades/performance-by-attendance'),
};

export const alertsAPI = {
  createAlert: (studentId, alertType, message) =>
    apiClient.post('/alerts/create', { student_id: studentId, alert_type: alertType, message }),
  getStudentAlerts: (studentId, includeRead = false) =>
    apiClient.get(`/alerts/student/${studentId}?include_read=${includeRead}`),
  getUnreadAlerts: () => apiClient.get('/alerts/unread'),
  markAlertRead: (alertId) => apiClient.put(`/alerts/mark-read/${alertId}`),
  checkWellbeingAlerts: () => apiClient.post('/alerts/check-wellbeing'),
};
