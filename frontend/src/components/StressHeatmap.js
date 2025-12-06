import React, { useState, useEffect } from 'react';
import '../styles/StressHeatmap.css';
import { wellbeingAPI } from '../utils/api';

const StressHeatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await wellbeingAPI.getHeatmapData();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load heatmap data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getColorForStress = (avgStress) => {
    if (avgStress >= 8) return '#d32f2f'; // Red - Very High
    if (avgStress >= 6) return '#f57c00'; // Orange - High
    if (avgStress >= 4) return '#fbc02d'; // Yellow - Medium
    return '#388e3c'; // Green - Low
  };

  if (loading) return <div className="heatmap-loading">Loading heatmap...</div>;
  if (error) return <div className="heatmap-error">{error}</div>;

  return (
    <div className="heatmap-container">
      <h3>Student Stress Levels Heatmap</h3>
      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#388e3c' }}></span>
          <span>Low (&lt; 4)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#fbc02d' }}></span>
          <span>Medium (4-5)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f57c00' }}></span>
          <span>High (6-7)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#d32f2f' }}></span>
          <span>Very High (≥ 8)</span>
        </div>
      </div>
      <div className="heatmap-grid">
        {data.map((student) => (
          <div
            key={student.id}
            className="heatmap-cell"
            style={{ backgroundColor: getColorForStress(student.avg_stress) }}
            title={`${student.first_name} ${student.last_name}: Stress ${student.avg_stress?.toFixed(1) || 'N/A'}`}
          >
            <div className="cell-name">
              {student.first_name} {student.last_name}
            </div>
            <div className="cell-stress">
              {student.avg_stress ? student.avg_stress.toFixed(1) : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressHeatmap;
