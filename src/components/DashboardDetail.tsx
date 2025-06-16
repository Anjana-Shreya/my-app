// src/components/DashboardDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../slice/dashboardApiSlice';
import "./details.css"
import Sidebar from './Sidebar';

interface Metric {
  id: number;
  metricName: string;
  metricDescription: string;
  // Add other metric properties as needed
}

interface DashboardData {
  id: number;
  templateName: string;
  templateDescription: string | null;
  metricsList: Metric[];
}

const DashboardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Try to get from localStorage first
        const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]');
        const parsedDashboards = Array.isArray(savedDashboards) ? savedDashboards : [];
        const localData = parsedDashboards.find((d: DashboardData) => d.id === Number(id));

        if (localData) {
          setDashboard(localData);
        } else {
          // If not found locally, try to fetch from API
          // You'll need to implement this API endpoint
          // const response = await fetchDashboardFromApi(id);
          // setDashboard(response);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!dashboard) {
    return (
      <div className="dashboard-not-found">
        <h2>Dashboard not found</h2>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboards</button>
      </div>
    );
  }

  return (
    <div>
        <Sidebar />
        <div className="dashboard-detail">
            <h1>{dashboard.templateName}</h1>
            {dashboard.templateDescription && (
                <p className="description">{dashboard.templateDescription}</p>
            )}
            
            <div className="metrics-grid">
                {dashboard.metricsList.map((metric) => (
                <div key={metric.id} className="metric-card">
                    <h3>{metric.metricName}</h3>
                    <p>{metric.metricDescription}</p>
                    {/* Add your metric visualization component here */}
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default DashboardDetail;