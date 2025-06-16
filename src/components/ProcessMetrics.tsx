import React from 'react';
import { useGetProcessMetricsQuery } from '../slice/processApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../slice/authSlice';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

interface TimeDisplayProps {
  label: string;
  value: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center', px: 2 }}>
    <Typography variant="subtitle2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="h6" fontWeight="bold">
      {value}
    </Typography>
  </Box>
);

const ProcessMetrics: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const orgId = user?.organization?.id;
  
  // Get values from localStorage
  const selectedTeams = JSON.parse(localStorage.getItem('selectedTeams') || '[]');
  const selectedAuthors = JSON.parse(localStorage.getItem('selectedAuthors') || '[]');
  const selectedRepos = JSON.parse(localStorage.getItem('repoIds') || '[]');
  const startDate = localStorage.getItem('startDate') ? 
    parseInt(localStorage.getItem('startDate')!) : 0;
  const endDate = localStorage.getItem('endDate') ? 
    parseInt(localStorage.getItem('endDate')!) : 0;

  const { data, isLoading, isError } = useGetProcessMetricsQuery({
    orgId: orgId!,
    startDate,
    endDate,
    teamIds: selectedTeams,
    authorIds: selectedAuthors,
    repoIds: selectedRepos,
    branch: ['main', 'development'] // Default branches
  }, { skip: !orgId });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Error loading metrics</Typography>;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2
      }}>
        <TimeDisplay label="Coding" value={data?.codingPhase?.time || '0h 0m'} />
        <TimeDisplay label="Pickup time" value={data?.reviewPhase?.time || '0h 0m'} />
        <TimeDisplay label="Review" value={data?.reviewPhase?.time || '0h 0m'} />
        <TimeDisplay label="Merge" value={data?.mergePhase?.time || '0h 0m'} />
        <TimeDisplay label="Cycle time" value={data?.cycleTime || '0h 0m'} />
      </Box>
      
      <Typography variant="body1" sx={{ textAlign: 'center', mt: 1 }}>
        {data?.prCount || 0} PRs with comments
      </Typography>
    </Paper>
  );
};

export default ProcessMetrics;