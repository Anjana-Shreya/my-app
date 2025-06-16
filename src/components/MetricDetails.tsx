// src/components/MetricDetails.tsx
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
import { useGetMetricDetailsQuery, useGetTeamMetricsQuery } from '../slice/dashboardApiSlice';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Sidebar from './Sidebar';

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
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isMetricsError || !teamMetrics) {
    return (
      <Box p={4}>
        <Typography variant="h6" color="error">Error loading metric details</Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
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
      text: `${payload.metricType?.replace(/-/g, ' ') || 'Metric'} by Team`
    },
    chart: {
      type: 'column',
      height: 400
    },
    xAxis: {
      categories: categories,
      title: {
        text: 'Week'
      }
    },
    yAxis: {
      title: {
        text: 'Total Metric Value'
      }
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderRadius: 3,
        pointPadding: 0.1,
        groupPadding: 0.1
      }
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
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
		<div>
			<Sidebar />
			<Box p={4}>
				<Button 
					variant="outlined" 
					onClick={() => navigate(-1)}
					sx={{ mb: 2 }}
				>
					Back to Chart
				</Button>

				<Typography variant="h4" gutterBottom>
					Team Metrics for {payload.metricType?.replace(/-/g, ' ') || 'Metric'}
				</Typography>

				<Typography variant="subtitle1" gutterBottom>
					{new Date((payload.startDate || 0) * 1000).toLocaleDateString()} - {new Date((payload.endDate || 0) * 1000).toLocaleDateString()}
					{' | '}
					{payload.teamIds?.length || 0} team(s) selected
				</Typography>

				<Box mt={4}>
					<Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
						<Tab label="Data Table" />
						<Tab label="Visualization" />
					</Tabs>

					{tabValue === 0 && (
						<>
							<Typography variant="h6" gutterBottom>Detailed Metrics</Typography>
							<TableContainer component={Paper} style={{height:"300px", overflowY:"scroll"}}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Date</TableCell>
											<TableCell>Team</TableCell>
											<TableCell align="right">Metric Value</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{tableData.map((row, index) => (
											<TableRow key={`${row.date}-${row.teamName}-${index}`}>
												<TableCell>{row.date}</TableCell>
												<TableCell>{row.teamName}</TableCell>
												<TableCell align="right">{row.totalMetricValue}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</>
					)}

					{tabValue === 1 && (
						<Box sx={{ width: '100%', mt: 3 }}>
							<Paper elevation={3} sx={{ p: 2 }}>
								{series.length > 0 ? (
									<HighchartsReact
										highcharts={Highcharts}
										options={chartOptions}
									/>
								) : (
									<Box 
										display="flex" 
										justifyContent="center" 
										alignItems="center" 
										height={400}
									>
										<Typography variant="body1" color="textSecondary">
											No chart data available
										</Typography>
									</Box>
								)}
							</Paper>
						</Box>
					)}
				</Box>
			</Box>
		</div>
  );
};

export default MetricDetails;