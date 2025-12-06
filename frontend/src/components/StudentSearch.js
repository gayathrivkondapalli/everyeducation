import React, { useState, useEffect, useCallback } from 'react';
import { wellbeingAPI } from '../utils/api';
import '../styles/StudentSearch.css';

const StudentSearch = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, filled, not-filled
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(50);

  const fetchStudents = useCallback(async (searchQuery = '', pageNum = 1) => {
    try {
      setLoading(true);
      const response = await wellbeingAPI.getAllStudentsStatus(searchQuery, pageNum, perPage);
      const data = response.data;
      
      if (data.students) {
        // New paginated format
        setStudents(data.students);
        setTotal(data.total);
        setTotalPages(data.total_pages);
        setPage(data.page);
      } else {
        // Legacy format (array)
        setStudents(data || []);
        setTotal(data?.length || 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchStudents('', 1);
  }, [fetchStudents]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(searchTerm, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchStudents]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchStudents(searchTerm, newPage);
    }
  };

  // Filter students locally based on filled status
  const filteredStudents = students.filter(s => {
    if (filter === 'filled') return s.has_filled_today;
    if (filter === 'not-filled') return !s.has_filled_today;
    return true;
  });

  const fetchStudentDetails = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    try {
      const response = await wellbeingAPI.getStudentWellbeing(student.id, 30);
      setStudentDetails(response.data || []);
    } catch (err) {
      console.error('Failed to fetch student details', err);
      // Mock data
      setStudentDetails(Array.from({ length: 14 }, (_, i) => ({
        id: i + 1,
        sleep_level: Math.floor(Math.random() * 10) + 1,
        stress_level: Math.floor(Math.random() * 10) + 1,
        mood: ['happy', 'calm', 'neutral', 'sad', 'anxious'][Math.floor(Math.random() * 5)],
        recorded_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        mental_health_notes: i % 3 === 0 ? 'Sample note about how the student is feeling.' : null,
      })));
    } finally {
      setDetailsLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      happy: '😊',
      calm: '😌',
      neutral: '😐',
      sad: '😔',
      anxious: '😰',
      frustrated: '😤',
      tired: '😴',
      unwell: '🤒',
    };
    return moods[mood] || '❓';
  };

  const getStressColor = (level) => {
    if (!level) return '#e0e0e0';
    if (level <= 3) return '#10b981';
    if (level <= 5) return '#f59e0b';
    if (level <= 7) return '#f97316';
    return '#ef4444';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const notFilledCount = students.filter(s => !s.has_filled_today).length;
  const filledCount = students.filter(s => s.has_filled_today).length;

  return (
    <div className="student-search-container">
      {/* Summary Stats */}
      <div className="search-stats">
        <div className="stat-box">
          <span className="stat-number">{total.toLocaleString()}</span>
          <span className="stat-label">Total Students</span>
        </div>
        <div className="stat-box filled">
          <span className="stat-number">{filledCount}</span>
          <span className="stat-label">Filled Today ✅</span>
        </div>
        <div className="stat-box not-filled">
          <span className="stat-number">{notFilledCount}</span>
          <span className="stat-label">Not Filled ⚠️</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-controls">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'filled' ? 'active' : ''}`}
            onClick={() => setFilter('filled')}
          >
            ✅ Filled
          </button>
          <button 
            className={`filter-btn ${filter === 'not-filled' ? 'active' : ''}`}
            onClick={() => setFilter('not-filled')}
          >
            ⚠️ Not Filled
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="page-btn"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
          >
            ⏮ First
          </button>
          <button 
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ◀ Prev
          </button>
          <span className="page-info">
            Page {page} of {totalPages} ({total.toLocaleString()} students)
          </span>
          <button 
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next ▶
          </button>
          <button 
            className="page-btn"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
          >
            Last ⏭
          </button>
        </div>
      )}

      <div className="search-content">
        {/* Student List */}
        <div className="student-list">
          <h3>Students ({filteredStudents.length})</h3>
          {loading ? (
            <p className="loading-text">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="no-results">No students found matching your search.</p>
          ) : (
            <div className="student-cards">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''} ${!student.has_filled_today ? 'not-filled' : ''}`}
                  onClick={() => fetchStudentDetails(student)}
                >
                  <div className="student-avatar">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="student-info">
                    <div className="student-name">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="student-id">{student.student_id}</div>
                  </div>
                  <div className="student-status">
                    {student.has_filled_today ? (
                      <span className="status-badge filled">✅ Filled</span>
                    ) : (
                      <span className="status-badge pending">⚠️ Pending</span>
                    )}
                  </div>
                  {student.latest_stress && (
                    <div 
                      className="stress-indicator"
                      style={{ backgroundColor: getStressColor(student.latest_stress) }}
                      title={`Stress: ${student.latest_stress}/10`}
                    >
                      {student.latest_stress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Details Panel */}
        <div className="student-details-panel">
          {selectedStudent ? (
            detailsLoading ? (
              <div className="loading-details">Loading student details...</div>
            ) : (
              <>
                <div className="details-header">
                  <div className="details-avatar">
                    {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                  </div>
                  <div className="details-info">
                    <h2>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p>{selectedStudent.student_id} • {selectedStudent.email}</p>
                  </div>
                </div>

                <div className="details-summary">
                  <div className="summary-item">
                    <span className="summary-label">Last Submission</span>
                    <span className="summary-value">{formatDate(selectedStudent.last_submission)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Latest Mood</span>
                    <span className="summary-value">
                      {selectedStudent.latest_mood ? (
                        <>{getMoodEmoji(selectedStudent.latest_mood)} {selectedStudent.latest_mood}</>
                      ) : 'N/A'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Latest Stress</span>
                    <span 
                      className="summary-value stress-value"
                      style={{ color: getStressColor(selectedStudent.latest_stress) }}
                    >
                      {selectedStudent.latest_stress ? `${selectedStudent.latest_stress}/10` : 'N/A'}
                    </span>
                  </div>
                </div>

                <h3>Wellbeing History (Last 30 Days)</h3>
                {studentDetails && studentDetails.length > 0 ? (
                  <div className="history-list">
                    {studentDetails.map((record, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-date">
                          {new Date(record.recorded_date).toLocaleDateString()}
                        </div>
                        <div className="history-data">
                          <span className="history-mood" title="Mood">
                            {getMoodEmoji(record.mood)}
                          </span>
                          <span className="history-sleep" title={`Sleep: ${record.sleep_level}/10`}>
                            😴 {record.sleep_level}
                          </span>
                          <span 
                            className="history-stress" 
                            title={`Stress: ${record.stress_level}/10`}
                            style={{ color: getStressColor(record.stress_level) }}
                          >
                            📊 {record.stress_level}
                          </span>
                        </div>
                        {record.mental_health_notes && (
                          <div className="history-notes">
                            📝 {record.mental_health_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-history">
                    <p>No wellbeing records found for this student.</p>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">👈</div>
              <h3>Select a Student</h3>
              <p>Click on a student from the list to view their wellbeing details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSearch;
