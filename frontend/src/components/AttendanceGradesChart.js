import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { attendanceAPI, gradesAPI } from '../utils/api';
import '../styles/AttendanceGradesChart.css';

const AttendanceGradesChart = ({ days = 30 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await attendanceAPI.getAttendanceGradesCorrelation(days);
        // Transform data for chart
        const chartData = response.data.map((student) => ({
          name: `${student.first_name} ${student.last_name}`.substring(0, 10),
          attendanceRate: (student.attendance_rate * 100).toFixed(1),
          avgGrade: student.avg_grade ? student.avg_grade.toFixed(1) : 0,
        }));
        setData(chartData);
        setError(null);
      } catch (err) {
        setError('Failed to load attendance and grades data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  if (loading) return <div className="chart-loading">Loading attendance data...</div>;
  if (error) return <div className="chart-error">{error}</div>;

  return (
    <div className="chart-container">
      <h3>Attendance vs Grades Correlation</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Average Grade', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="attendanceRate"
            stroke="#8884d8"
            name="Attendance Rate (%)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgGrade"
            stroke="#82ca9d"
            name="Average Grade"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceGradesChart;
