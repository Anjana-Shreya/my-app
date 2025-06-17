// src/components/DashboardDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetHierarchicalTeamQuery } from '../slice/teamApiSlice';
import { selectCurrentUser } from '../slice/authSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import { Checkbox, FormControlLabel, FormGroup, Box, Typography, Collapse, IconButton, Button, CircularProgress, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
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
  const fixedColors = ['#E57373', '#64B5F6', '#81C784', '#FFD54F', '#BA68C8', '#4DB6AC'];

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
      <div className="dashboard-content">
        <Button 
					variant="outlined" 
					onClick={() => navigate(-1)}
					sx={{ mb: 2 }}
				>
					Back to Dashboard
				</Button>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" className="dashboard-title">
            {dashboard.templateName}
          </Typography>
        </Box>

        {/* Filters Section */}
        <div className="filters-container">
          {/* Date Range Filter */}
          <div className="filter-card">
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
                className="date-picker-input"
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
                className="date-picker-input"
                placeholderText="End date"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>

          {/* Time Granularity Filter */}
          <div className="filter-card">
            <Typography variant="subtitle1" className="filter-label">
              Time Granularity
            </Typography>
            <div className="select-wrapper">
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
          </div>

          {/* Teams Filter */}
          <div className="filter-card teams-filter">
            <div
              className="teams-dropdown-header"
              onClick={() => setOpenTeams(!openTeams)}
            >
              <Typography variant="subtitle1" className="filter-label">
                Teams ({selectedTeams.length})
              </Typography>
              <IconButton size="small">
                {openTeams ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>

            <Collapse in={openTeams}>
              <Paper className="teams-dropdown-content">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTeams.length === teams.length}
                      indeterminate={selectedTeams.length > 0 && selectedTeams.length < teams.length}
                      onChange={handleSelectAllTeams}
                    />
                  }
                  label="Select all"
                />
                <FormGroup className="teams-list">
                  {teams.map((team, index) => {
                    const color = fixedColors[team.id % fixedColors.length]; 
                    return (
                      <FormControlLabel
                        key={team.id}
                        control={
                          <Checkbox
                            checked={selectedTeams.includes(team.id)}
                            onChange={() => handleTeamToggle(team.id)}
                          />
                        }
                        label={
                          <div className="team-label">
                            <div 
                              className="team-avatar" 
                              style={{ backgroundColor: color }}
                            >
                              {team.name
                                .split(' ')
                                .map((word) => word[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="team-name">{team.name}</span>
                          </div>
                        }
                      />
                    );
                  })}
                </FormGroup>
              </Paper>
            </Collapse>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-detail">
          {dashboard.templateDescription && (
            <Typography variant="body1" className="dashboard-description">
              {dashboard.templateDescription}
            </Typography>
          )}
          
          {/* Charts Grid */}
          <div className="charts-grid">
            {dashboard.metricsList.map((metric) => (
              <div key={metric.id} className="chart-container">
                <Paper elevation={2} className="chart-paper">
                  <MetricChart 
                    metricKey={metric.metricKey}
                    metricName={metric.metricName}
                    metricDescription={metric.metricDescription}
                    yaxisSuffix={metric.yaxisSuffix}
                  />
                </Paper>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;