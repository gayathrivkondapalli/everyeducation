import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { wellbeingAPI } from '../utils/api';
import '../styles/StressChart.css';

const StressOverTimeChart = ({ studentId, days = 30 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await wellbeingAPI.getStressOverTime(studentId, days);
        // Transform data to consistent format - API returns different formats for individual vs aggregate
        const transformedData = (response.data || []).map(item => ({
          date: item.date || item.recorded_date,
          stress_level: item.avg_stress !== undefined ? item.avg_stress : item.stress_level
        }));
        setData(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to load stress data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, days]);

  if (loading) return <div className="chart-loading">Loading stress data...</div>;
  if (error) return <div className="chart-error">{error}</div>;
  if (!data || data.length === 0) return <div className="chart-empty">No stress data available for this period.</div>;

  return (
    <div className="chart-container">
      <h3>Stress Levels Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} label={{ value: 'Stress Level', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="stress_level" stroke="#ff7300" name="Stress Level" strokeWidth={2} dot={{ fill: '#ff7300' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StressOverTimeChart;
