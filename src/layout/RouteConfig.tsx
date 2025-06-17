import Dashboard from "../components/Dashboard"
import Process from '../components/Process';
import DashboardDetail from '../components/DashboardDetail';
import MetricDetails from '../components/MetricDetails';
import { Navigate } from 'react-router-dom';

const RouteConfig = [
    {path: "/dashboard", element: <Dashboard /> },
    {path: "/process", element: <Process /> },
    {path: "/dashboard/:id", element: <DashboardDetail /> },
    {path: "/metric-details", element: <MetricDetails /> },
    { path: '/*', element: <Navigate to="/dashboard" replace /> }, 
]

export default RouteConfig;