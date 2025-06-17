// src/components/Graph1.tsx
import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useGetProcessMetricsQuery } from '../slice/metricsApiSlice';

// Helper function to convert seconds to days for chart display
const secondsToDays = (seconds: number): number => {
  return parseFloat((seconds / (24 * 3600)).toFixed(3)); // Convert to days with 3 decimal places
};

// Helper function to format days with hours
const formatDaysWithHours = (days: number): string => {
  const fullDays = Math.floor(days);
  const remainingHours = Math.round((days - fullDays) * 24);
  
  if (fullDays > 0 && remainingHours > 0) {
    return `${fullDays}d ${remainingHours}h`;
  } else if (fullDays > 0) {
    return `${fullDays}d`;
  } else {
    return `${remainingHours}h`;
  }
};

const Graph1 = () => {
  const selectedTeams = JSON.parse(localStorage.getItem('selectedTeams') || '[]');
  const selectedAuthors = JSON.parse(localStorage.getItem('selectedAuthors') || '[]');
  const selectedRepos = JSON.parse(localStorage.getItem('selectedRepos') || '[]');
  const startDate = localStorage.getItem('startDate') || '';
  const endDate = localStorage.getItem('endDate') || '';
  const ids = JSON.parse(localStorage.getItem('repoIds') || '[]');

  const { data: metricsData, isLoading, error } = useGetProcessMetricsQuery({
    repoIds: ids,
    startDate: parseInt(startDate),
    endDate: parseInt(endDate),
    authorIds: selectedAuthors,
    teamIds: selectedTeams,
    branch: selectedRepos
  });

  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    'Coding Time': true,
    'Review Time': true,
    'Deploy Time': true,
    'Cycle Time': true,
    'PR Count': true
  });

  const toggleSeriesVisibility = (seriesName: string) => {
    setVisibleSeries(prev => {
      const currentlyOnlyVisible = Object.entries(prev).every(
        ([key, value]) => key === seriesName ? value : !value
      );

      // If the clicked one is the only visible one -> show all
      if (currentlyOnlyVisible) {
        return {
          'Coding Time': true,
          'Review Time': true,
          'Deploy Time': true,
          'Cycle Time': true,
          'PR Count': true
        };
      }

      // Otherwise, show only the clicked one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = key === seriesName;
      });
      return newState;
    });
  };

  const metrics = Array.isArray(metricsData) ? metricsData : [];

  // Prepare chart data
  const categories = metrics.map(metric => metric.period);
  
  // Convert all time metrics from seconds to days for chart display
  const codingTimeData = metrics.map(metric => secondsToDays(metric.codingTime));
  const reviewedTimeData = metrics.map(metric => secondsToDays(metric.reviewedTime));
  const deployTimeData = metrics.map(metric => secondsToDays(metric.deployTime));
  const cycleTimeData = metrics.map(metric => secondsToDays(metric.cycleTime));
  
  // Count metrics remain as-is
  const prCountData = metrics.map(metric => metric.openToMergedCount);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      height: '500px'
    },
    title: {
      text: 'Development Process Metrics'
    },
    xAxis: {
      categories: categories,
      title: { text: 'Date' },
      crosshair: true
    },
    yAxis: [
      {
        title: { text: 'Time' },
        min: 0,
        labels: {
          formatter: function() {
            return formatDaysWithHours(Number(this.value));
          }
        }
      },
      {
        title: { text: 'Count' },
        opposite: true,
        min: 0
      }
    ],
    tooltip: {
      shared: true,
      formatter: function(this: any) {
        const points = this.points || [];
        let tooltip = `<b>${this.x}</b><br>`;
        
        points.forEach((point: any) => {
          if (point.series.name.includes('Time') || point.series.name === 'Cycle Time') {
            // Format time values as days and hours
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${formatDaysWithHours(point.y)}</b><br>`;
          } else {
            // Show count values as-is
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}</b><br>`;
          }
        });
        
        return tooltip;
      }
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        cursor: 'pointer'
      },
      itemHoverStyle: {
        color: '#333'
      }
    },
    plotOptions: {
      series: {
        events: {
          legendItemClick: function() {
            const seriesName = this.name;
            toggleSeriesVisibility(seriesName);
            return false; // Prevent default behavior
          }
        },
        marker: { 
          radius: 4, 
          symbol: 'circle' 
        },
        showInLegend: true
      },
      line: {
        tooltip: {
          valueDecimals: 3
        }
      }
    },
    series: [
      { 
        name: 'Coding Time', 
        data: codingTimeData, 
        color: '#4CAF50', 
        type: 'line', 
        yAxis: 0,
        visible: visibleSeries['Coding Time']
      },
      { 
        name: 'Review Time', 
        data: reviewedTimeData, 
        color: '#2196F3', 
        type: 'line', 
        yAxis: 0,
        visible: visibleSeries['Review Time']
      },
      { 
        name: 'Deploy Time', 
        data: deployTimeData, 
        color: '#9C27B0', 
        type: 'line', 
        yAxis: 0,
        visible: visibleSeries['Deploy Time']
      },
      { 
        name: 'Cycle Time', 
        data: cycleTimeData, 
        color: '#FF9800', 
        type: 'line', 
        yAxis: 0,
        visible: visibleSeries['Cycle Time']
      },
      { 
        name: 'PR Count', 
        data: prCountData, 
        color: '#F44336', 
        type: 'line',
        yAxis: 1,
        dashStyle: 'Dash',
        visible: visibleSeries['PR Count']
      }
    ],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 600
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

  if (isLoading) return <div className="loading-message">Loading metrics data...</div>;
  if (error) return <div className="error-message">Error loading metrics data</div>;

  return (
    <div className="metrics-chart-container">
      {metrics.length > 0 ? (
        <HighchartsReact 
          highcharts={Highcharts} 
          options={chartOptions} 
        />
      ) : (
        <div className="empty-message">No metrics data available</div>
      )}
    </div>
  );
};

export default Graph1;