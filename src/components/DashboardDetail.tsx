// src/components/DashboardDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetHierarchicalTeamQuery } from '../slice/teamApiSlice';
import { selectCurrentUser } from '../slice/authSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import { 
  Checkbox, 
  FormControlLabel, 
  FormGroup, 
  Box, 
  Typography, 
  Collapse, 
  IconButton,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import Sidebar from './Sidebar';
import MetricChart from './MetricChart';
import "./details.css";

interface Metric {
  id: number;
  metricName: string;
  metricKey: string;
  metricDescription: string;
  metricCategory?: string;
  yaxisSuffix?: string;
}

interface DashboardData {
  id: number;
  templateName: string;
  templateDescription: string | null;
  metricsList: Metric[];
  isFavorite?: boolean;
}

const DashboardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openTeams, setOpenTeams] = useState(false);
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly'>(
    () => (localStorage.getItem('filterType') as 'daily' | 'weekly' | 'monthly') || 'weekly'
  );

  const user = useSelector(selectCurrentUser);
  const userId = user?.id;
  const orgId = user?.organization?.id;

  // Initialize dates from localStorage or default values
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem('startDate2');
    try {
      if (stored && !isNaN(Number(stored))) {
        return new Date(Number(stored) * 1000);
      }
      return addDays(new Date(), -7); // Default to 7 days ago
    } catch (error) {
      console.error('Error parsing startDate:', error);
      return addDays(new Date(), -7);
    }
  });

  const [endDate, setEndDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem('endDate2');
    try {
      if (stored && !isNaN(Number(stored))) {
        return new Date(Number(stored) * 1000);
      }
      return new Date(); // Default to current date
    } catch (error) {
      console.error('Error parsing endDate:', error);
      return new Date();
    }
  });

  // Get data from localStorage if available
  const [selectedTeams, setSelectedTeams] = useState<number[]>(() => {
    const stored = localStorage.getItem('selectedTeams2');
    return stored ? JSON.parse(stored) : [];
  });

  // API calls
  const { data: teams = [], isLoading: isLoadingTeams } = useGetHierarchicalTeamQuery(
    { userId: userId || 0, orgId: orgId || 0 },
    { skip: !userId || !orgId }
  );

  // Handle team selection
  const handleTeamToggle = (teamId: number) => {
    const newSelectedTeams = selectedTeams.includes(teamId)
      ? selectedTeams.filter(id => id !== teamId)
      : [...selectedTeams, teamId];
    setSelectedTeams(newSelectedTeams);
    localStorage.setItem('selectedTeams2', JSON.stringify(newSelectedTeams));
  };

  // Select all/none functions
  const handleSelectAllTeams = () => {
    if (teams.length > 0) {
      if (selectedTeams.length === teams.length) {
        setSelectedTeams([]);
        localStorage.setItem('selectedTeams2', JSON.stringify([]));
      } else {
        const allTeamIds = teams.map(team => team.id);
        setSelectedTeams(allTeamIds);
        localStorage.setItem('selectedTeams2', JSON.stringify(allTeamIds));
      }
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]');
        const parsedDashboards = Array.isArray(savedDashboards) ? savedDashboards : [];
        const localData = parsedDashboards.find((d: DashboardData) => d.id === Number(id));

        if (localData) {
          setDashboard(localData);
          localStorage.setItem('selectedDashboard', JSON.stringify(localData));
        } else {
          console.warn('No matching dashboard found in localStorage');
          // Optionally fetch from API here if needed
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-not-found">
        <h2>Dashboard not found</h2>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboards
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <div className="filters-section">
          {/* Date Range Filter */}
          <div className="filter-group">
            <Typography variant="subtitle1" className="filter-label">
              Date Range
            </Typography>
            <div className="date-range-group">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  if (date) localStorage.setItem('startDate2', `${Math.floor(date.getTime() / 1000)}`);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="date-picker"
                placeholderText="Start date"
                dateFormat="dd/MM/yyyy"
              />
              <span className="date-range-separator">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  if (date) localStorage.setItem('endDate2', `${Math.floor(date.getTime() / 1000)}`);
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate ?? undefined}
                className="date-picker"
                placeholderText="End date"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          {/* Time Granularity Filter */}
          <div className="filter-group">
            <Typography variant="subtitle1" className="filter-label">
              Time Granularity
            </Typography>
            <select 
              value={filterType}
              onChange={(e) => {
                const selected = e.target.value as 'daily' | 'weekly' | 'monthly';
                setFilterType(selected);
                localStorage.setItem('filterType', selected);
              }}
              className="granularity-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Teams Dropdown with Checkboxes */}
          <div className="filter-group">
            <div className="dropdown-header" onClick={() => setOpenTeams(!openTeams)} style={{display:"flex"}}>
              <Typography variant="subtitle1" className="filter-label">
                Select Team(s)
              </Typography>
              <IconButton size="small">
                {openTeams ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            <Collapse in={openTeams}>
              <Box className="checkbox-group-container">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={teams.length > 0 && selectedTeams.length === teams.length}
                      indeterminate={teams.length > 0 && selectedTeams.length > 0 && selectedTeams.length < teams.length}
                      onChange={handleSelectAllTeams}
                      color="primary"
                    />
                  }
                  label="Select all"
                />
                <FormGroup className="checkbox-group">
                  {teams.map(team => (
                    <FormControlLabel
                      key={team.id}
                      control={
                        <Checkbox
                          checked={selectedTeams.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          color="primary"
                        />
                      }
                      label={team.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
          </div>
        </div>

        <div className="dashboard-detail">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" className="dashboard-title">
              {dashboard.templateName}
            </Typography>
          </Box>
          
          {dashboard.templateDescription && (
            <Typography variant="body1" className="dashboard-description" mb={3}>
              {dashboard.templateDescription}
            </Typography>
          )}
          
          <Grid container spacing={3}>
            {dashboard.metricsList.map((metric) => (
              <Grid container spacing={2} key={metric.id}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <MetricChart 
                    metricKey={metric.metricKey}
                    metricName={metric.metricName}
                    metricDescription={metric.metricDescription}
                    yaxisSuffix={metric.yaxisSuffix}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;