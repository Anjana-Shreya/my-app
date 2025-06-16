// src/components/Graph1.tsx
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useGetProcessMetricsQuery } from '../slice/metricsApiSlice';

// Helper function to convert minutes to hh:mm format
const formatMinutesToHHMM = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helper function to convert minutes to decimal hours for chart display
const minutesToHours = (minutes: number): number => {
  return parseFloat((minutes / 60).toFixed(2));
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

  const metrics = Array.isArray(metricsData) ? metricsData : [];

  // Prepare chart data
  const categories = metrics.map(metric => metric.period);
  
  // Convert all time metrics from minutes to decimal hours for chart display
  const codingTimeData = metrics.map(metric => minutesToHours(metric.codingTime));
  const reviewedTimeData = metrics.map(metric => minutesToHours(metric.reviewedTime));
  const deployTimeData = metrics.map(metric => minutesToHours(metric.deployTime));
  const cycleTimeData = metrics.map(metric => minutesToHours(metric.cycleTime));
  
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
      title: { text: 'Time Period' },
      crosshair: true
    },
    yAxis: [
      {
        title: { text: 'Time (hours)' },
        min: 0,
        labels: {
          formatter: function() {
            return formatMinutesToHHMM(Number(this.value) * 60);
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
            // Format time values as hh:mm
            const minutes = point.y * 60; 
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${formatMinutesToHHMM(minutes)}</b><br>`;
          } else {
            // Show count values as-is
            tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}</b><br>`;
          }
        });
        
        return tooltip;
      }
    },
    plotOptions: {
      series: {
        marker: { 
          radius: 4, 
          symbol: 'circle' 
        }
      },
      line: {
        tooltip: {
          valueDecimals: 2
        }
      }
    },
    series: [
      { 
        name: 'Coding Time', 
        data: codingTimeData, 
        color: '#4CAF50', 
        type: 'line', 
        yAxis: 0 
      },
      { 
        name: 'Review Time', 
        data: reviewedTimeData, 
        color: '#2196F3', 
        type: 'line', 
        yAxis: 0 
      },
      { 
        name: 'Deploy Time', 
        data: deployTimeData, 
        color: '#9C27B0', 
        type: 'line', 
        yAxis: 0 
      },
      { 
        name: 'Cycle Time', 
        data: cycleTimeData, 
        color: '#FF9800', 
        type: 'line', 
        yAxis: 0 
      },
      { 
        name: 'PR Count', 
        data: prCountData, 
        color: '#F44336', 
        type: 'line',  // Changed from 'column' to 'line'
        yAxis: 1,
        dashStyle: 'Dash' // Optional: Add dash style to differentiate from other lines
      }
    ],
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
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