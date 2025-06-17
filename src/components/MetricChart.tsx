// src/components/MetricChart.tsx
import React from 'react';
import { useGetMetricGraphDataQuery } from '../slice/dashboardApiSlice';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

interface MetricChartProps {
  metricKey: string;
  metricName: string;
  metricDescription?: string;
  yaxisSuffix?: string;
}

interface CockpitGraphData {
  percentage: number;
  weekNo: number;
  formattedDate: string;
  totalMetricCount: number;
  totalCount: number;
}

interface GraphResponse {
  benchmarkInfo: {
    High: string;
    Low: string;
    Medium: string;
    Elite: string;
  };
  CockpitGraphData: CockpitGraphData[];
  benchMarkResult: string;
  changePercentage: string;
  primaryValue: number;
}

const MetricChart: React.FC<MetricChartProps> = ({ 
  metricKey, 
  metricName, 
  metricDescription,
  yaxisSuffix 
}) => {
  const navigate = useNavigate();
  
  // Get filter values from localStorage
  const startDate = localStorage.getItem('startDate2');
  const endDate = localStorage.getItem('endDate2');
  const selectedTeams = JSON.parse(localStorage.getItem('selectedTeams2') || '[]');
  const authData = JSON.parse(localStorage.getItem('auth') || '{}');
  const filterType = localStorage.getItem('filterType') as 'daily' | 'weekly' | 'monthly' || 'weekly';
  
  const { data, isLoading, isError, error } = useGetMetricGraphDataQuery({
    metricKey,
    params: {
      userId: authData?.user?.id || 0,
      orgId: authData?.user?.organization?.id || 0,
      organizationId: authData?.user?.organization?.id || 0,
      startDate: startDate ? parseInt(startDate) : Math.floor(Date.now() / 1000) - 86400 * 7,
      endDate: endDate ? parseInt(endDate) : Math.floor(Date.now() / 1000),
      filterType: filterType,
      teamIds: selectedTeams,
      projectIds: [],
      advancedFilters: {}
    }
  });

  const handlePointClick = (event: Highcharts.PointClickEventObject) => {
    // Prepare the payload to pass to the detail page
    const payload = {
      startDate: startDate ? parseInt(startDate) : Math.floor(Date.now() / 1000) - 86400 * 7,
      endDate: endDate ? parseInt(endDate) : Math.floor(Date.now() / 1000),
      metricType: metricKey,
      mainTeamMetric: true,
      teamIds: selectedTeams,
      organizationId: authData?.user?.organization?.id || 0,
      authorIds: [],
      groupBy: filterType,
      projectIds: [],
      advancedFilters: {},
      signal: {},
      // Add any additional data you want to pass
      pointData: event.point.options
    };

    // Navigate to detail page with the payload
    navigate('/metric-details', { state: { payload } });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    // Type the error properly
    const errorMessage = 'Failed to load chart data';
    
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="300px"
        textAlign="center"
        p={2}
      >
        <Typography variant="h6" gutterBottom>
          No Data to Show - {metricName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Changing filters might help
        </Typography>
      </Box>
    );
  }

  const chartData = (data as GraphResponse)?.CockpitGraphData || [];
  if (chartData.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        height="300px"
        textAlign="center"
        p={2}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No data available for: {metricName}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Try adjusting your filters or date range
        </Typography>
      </Box>
    );
  }

  // Transform the data to match Highcharts format
  const categories = chartData.map(item => item.formattedDate);
  const percentageData = chartData.map(item => item.percentage);
  const totalMetricCountData = chartData.map(item => item.totalMetricCount);
  const totalCountData = chartData.map(item => item.totalCount);

  const chartOptions: Highcharts.Options = {
    title: {
      text: metricName,
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: metricDescription || '',
      style: {
        fontSize: '12px',
        color: '#666'
      }
    },
    chart: {
      type: 'column',
      height: 300,
      backgroundColor: 'transparent',
      events: {
        click: function(event) {
        }
      }
    },
    xAxis: {
      categories: categories,
      title: {
        text: 'Week'
      },
      labels: {
        rotation: -45,
        style: {
          fontSize: '10px'
        }
      }
    },
    yAxis: {
      title: {
        text: yaxisSuffix ? `Value (${yaxisSuffix})` : 'Value'
      },
      labels: {
        formatter: function() {
          return yaxisSuffix ? `${this.value} ${yaxisSuffix}` : this.value.toString();
        }
      }
    },
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: handlePointClick
          }
        }
      },
      column: {
        borderRadius: 3,
        pointPadding: 0.1,
        groupPadding: 0.1
      },
      spline: {
        marker: {
          radius: 4
        }
      }
    },
    series: [
      {
        name: 'Percentage',
        type: 'column',
        data: percentageData.map((value, index) => ({
          y: value,
          name: categories[index],
          date: chartData[index].formattedDate,
          weekNo: chartData[index].weekNo
        })),
        color: '#4285F4',
        dataLabels: {
          enabled: true,
          format: yaxisSuffix ? `{point.y} ${yaxisSuffix}` : '{point.y}'
        }
      },
      {
        name: 'Total Metric Count',
        type: 'spline',
        data: totalMetricCountData.map((value, index) => ({
          y: value,
          name: categories[index],
          date: chartData[index].formattedDate,
          weekNo: chartData[index].weekNo
        })),
        color: '#EA4335',
        marker: {
          symbol: 'circle'
        }
      },
      {
        name: 'Total Count',
        type: 'spline',
        data: totalCountData.map((value, index) => ({
          y: value,
          name: categories[index],
          date: chartData[index].formattedDate,
          weekNo: chartData[index].weekNo
        })),
        color: '#FBBC05',
        marker: {
          symbol: 'circle'
        }
      }
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: '<small>{point.key}</small><table>',
      pointFormat: `
        <tr>
          <td style="color: {series.color}">{series.name}: </td>
          <td style="text-align: right"><b>{point.y}${yaxisSuffix ? ' ' + yaxisSuffix : ''}</b></td>
        </tr>
      `,
      footerFormat: '</table>'
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
    credits: {
      enabled: false
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  };

  return (
    <Box sx={{ height: '100%'}}>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        containerProps={{ style: { height: '100%', width: '100%' } }}
      />
    </Box>
  );
};

export default MetricChart;