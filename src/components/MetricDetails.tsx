import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useGetTeamMetricsQuery } from '../slice/dashboardApiSlice';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './metricdetail.css';

interface TeamMetricData {
  teamId: number;
  teamName: string;
  averageMetricValue: number;
  totalCount: number;
  totalMetricValue: number;
  startDate: string;
  endDate: string;
}

interface GraphData {
  [date: string]: TeamMetricData[];
}

interface TeamMetricsResponse {
  graphData?: GraphData;
}

const MetricDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payload } = (location.state || {}) as { payload?: any };
  const [tabValue, setTabValue] = React.useState(0);
  
  // Get filter values from localStorage
  const startDate = localStorage.getItem('startDate2');
  const endDate = localStorage.getItem('endDate2');
  const selectedTeams = JSON.parse(localStorage.getItem('selectedTeams2') || '[]');
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const filterType = (localStorage.getItem('filterType') as 'daily' | 'weekly' | 'monthly') || 'weekly';

  // Fetch team metrics data for the chart
  const { 
    data: teamMetrics, 
    isLoading: isLoadingMetrics, 
    isError: isMetricsError 
  } = useGetTeamMetricsQuery({
    userId: authData?.user?.id || 0,
    orgId: authData?.user?.organization?.id || 0,
    organizationId: authData?.user?.organization?.id || 0,
    startDate: startDate ? parseInt(startDate) : Math.floor(Date.now() / 1000) - 86400 * 7,
    endDate: endDate ? parseInt(endDate) : Math.floor(Date.now() / 1000),
    filterType: filterType,
    teamIds: selectedTeams,
    projectIds: [],
    advancedFilters: {},
    metricType: payload?.metricType || ''
  }) as { data?: TeamMetricsResponse, isLoading: boolean, isError: boolean };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!payload) {
    navigate('/dashboard');
    return null;
  }

  if (isLoadingMetrics) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (isMetricsError || !teamMetrics) {
    return (
      <Box className="error-container">
        <Typography variant="h6" color="error">Error loading metric details</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const prepareChartData = (): { categories: string[]; series: { name: string; data: number[] }[] } => {
    if (!teamMetrics?.graphData) {
      return { categories: [], series: [] };
    }

    const seriesMap: Record<number, { name: string; data: number[] }> = {};
    const categories: string[] = [];

    Object.entries(teamMetrics.graphData).forEach(([date, teamData]) => {
      categories.push(date);
      teamData.forEach((team: TeamMetricData) => {
        if (!seriesMap[team.teamId]) {
          seriesMap[team.teamId] = {
            name: team.teamName,
            data: []
          };
        }
      });
    });

    Object.entries(teamMetrics.graphData).forEach(([_, teamData]) => {
      Object.keys(seriesMap).forEach(teamId => {
        const team = teamData.find((t: TeamMetricData) => t.teamId === Number(teamId));
        seriesMap[Number(teamId)].data.push(team?.totalMetricValue || 0);
      });
    });

    return {
      categories,
      series: Object.values(seriesMap)
    };
  };

  const { categories, series } = prepareChartData();

  // Prepare chart options
  const chartOptions: Highcharts.Options = {
    title: {
      text: `${payload.metricType?.replace(/-/g, ' ') || 'Metric'} by Team`,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
      }
    },
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: 'transparent',
      borderRadius: 8,
      spacing: [20, 20, 20, 20]
    },
    xAxis: {
      categories: categories,
      title: {
        text: 'Time Period',
        style: {
          fontWeight: 'bold'
        }
      },
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Commits',
        style: {
          fontWeight: 'bold'
        }
      },
      gridLineWidth: 1,
      gridLineColor: '#f0f0f0'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderRadius: 4,
        pointPadding: 0.1,
        groupPadding: 0.1,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y}',
          style: {
            textOutline: 'none',
            fontSize: '11px'
          }
        }
      }
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
      shared: true,
      useHTML: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      shadow: true,
      style: {
        padding: '10px'
      }
    },
    legend: {
      itemStyle: {
        fontSize: '12px',
        fontWeight: 'normal'
      },
      itemHoverStyle: {
        color: '#555'
      }
    },
    series: series as Highcharts.SeriesOptionsType[],
    credits: {
      enabled: false
    }
  };

  // Prepare table data
  const tableData = Object.entries(teamMetrics.graphData || {}).flatMap(([date, teamData]) => {
    return teamData.map((team: TeamMetricData) => ({
      date,
      teamName: team.teamName,
      totalMetricValue: team.totalMetricValue,
      totalCount: team.totalCount
    }));
  });

  return (
    <div className="metric-details-container">
      <Box className="metric-details-content">
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          className="back-button"
          style={{marginBottom:"15px"}}
        >
          Back to Chart
        </Button>

        <Typography variant="h4" className="metric-title" gutterBottom>
          Team Metrics for {payload.metricType?.replace(/-/g, ' ') || 'Metric'}
        </Typography>

        <Typography variant="subtitle1" className="metric-subtitle" gutterBottom>
          {new Date((payload.startDate || 0) * 1000).toLocaleDateString()} - {new Date((payload.endDate || 0) * 1000).toLocaleDateString()}
          {' | '}
          {payload.teamIds?.length || 0} team(s) selected
        </Typography>

        <Box className="tabs-container">
          {/* <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            className="metric-tabs"
          >
            <Tab label="Data Table" className="metric-tab" />
            <Tab label="Visualization" className="metric-tab" />
          </Tabs> */}

          {/* {tabValue === 0 && (
            <Box className="table-container">
              <Typography variant="h6" className="table-title" gutterBottom>
                Detailed Metrics
              </Typography>
              <TableContainer component={Paper} className="metric-table-container">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="table-header">Date</TableCell>
                      <TableCell className="table-header">Team</TableCell>
                      <TableCell align="right" className="table-header">Metric Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow 
                        key={`${row.date}-${row.teamName}-${index}`}
                        className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}
                      >
                        <TableCell className="table-cell">{row.date}</TableCell>
                        <TableCell className="table-cell">{row.teamName}</TableCell>
                        <TableCell align="right" className="table-cell">{row.totalMetricValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )} */}

          {/* {tabValue === 1 && ( */}
            <Box className="chart-container">
              <Paper elevation={3} className="chart-paper">
                {series.length > 0 ? (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                  />
                ) : (
                  <Box className="no-data-container">
                    <Typography variant="body1" className="no-data-text">
                      No chart data available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          {/* )} */}
        </Box>
      </Box>
    </div>
  );
};

export default MetricDetails;