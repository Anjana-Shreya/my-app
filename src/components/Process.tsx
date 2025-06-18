import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetHierarchicalTeamQuery,
  useGetTeamAuthorsMutation,
  useGetBranchesQuery
} from '../slice/teamApiSlice';
import { selectCurrentUser } from '../slice/authSlice';
import { addDays } from 'date-fns';
import './process.css';
import Graph1 from './Graph1';
import { Checkbox, FormControlLabel, FormGroup, Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const Process = () => {
  const user = useSelector(selectCurrentUser);
  const userId = user?.id;
  const orgId = user?.organization?.id;

  // Selected Authors
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>(() => {
    const stored = localStorage.getItem('selectedAuthors');
    return stored ? JSON.parse(stored) : [];
  });

  // Selected Repos
  const [selectedRepos, setSelectedRepos] = useState<string[]>(() => {
    const stored = localStorage.getItem('selectedRepos');
    return stored ? JSON.parse(stored) : [];
  });

  // Selected Teams
  const [selectedTeams, setSelectedTeams] = useState<number[]>(() => {
    const stored = localStorage.getItem('selectedTeams');
    return stored ? JSON.parse(stored) : [];
  });

  // Dropdown states
  const [openRepos, setOpenRepos] = useState(false);
  const [openTeams, setOpenTeams] = useState(false);
  const [openAuthors, setOpenAuthors] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState<[Date, Date]>(() => {
    const storedStart = localStorage.getItem('startDate');
    const storedEnd = localStorage.getItem('endDate');
    
    const defaultStart = addDays(new Date(), -7);
    const defaultEnd = new Date();
    
    try {
      const start = storedStart ? new Date(parseInt(storedStart) * 1000) : defaultStart;
      const end = storedEnd ? new Date(parseInt(storedEnd) * 1000) : defaultEnd;
      
      return [start, end];
    } catch (error) {
      console.error('Error parsing dates:', error);
      return [defaultStart, defaultEnd];
    }
  });

  const [startDate, endDate] = dateRange;

  const handleDateRangeChange = (value: [Date, Date] | null) => {
    if (value) {
      setDateRange(value);
      localStorage.setItem('startDate', `${Math.floor(value[0].getTime() / 1000)}`);
      localStorage.setItem('endDate', `${Math.floor(value[1].getTime() / 1000)}`);
    }
  };

  // Fetch
  const { data: teams, isLoading: isLoadingTeams } = useGetHierarchicalTeamQuery(
    { userId, orgId },
    { skip: !userId || !orgId }
  );

  const [fetchAuthors, { data: authors }] = useGetTeamAuthorsMutation();

  const storedRepoIds = localStorage.getItem('repoIds');
  const repoIds = [
    23352, 23332, 23327, 23337, 23342, 23347, 23312, 23302, 23307, 23322, 
    23317, 23318, 23308, 23323, 23313, 23333, 23338, 23343, 23348, 23328, 
    23303, 23353, 23354, 23304, 23329, 23349, 23314, 23324, 23309, 23334, 
    23339, 23344, 23319, 23310, 23330, 23305, 23350, 23315, 23335, 23320, 
    23340, 23345, 23325, 23311, 23321, 23346, 23331, 23306, 23326, 23336, 
    23351, 23341, 23316
  ];

  const { data: repos = [], isLoading: isLoadingRepos } = useGetBranchesQuery(
    { repoIds },
    { skip: repoIds.length === 0 }
  );

  // Dates to Unix
  const getUnixTimestamp = (date: Date | null) =>
    date ? Math.floor(date.getTime() / 1000) : 0;

  // Fetch authors on changes
  useEffect(() => {
    if (selectedTeams.length && startDate && endDate) {
      fetchAuthors({
        teamIds: selectedTeams,
        startDate: getUnixTimestamp(startDate),
        endDate: getUnixTimestamp(endDate)
      }).unwrap().catch(console.error);
    }
  }, [selectedTeams, startDate, endDate, fetchAuthors]);

  // Handle selection changes
  const handleTeamToggle = (teamId: number) => {
    const newSelectedTeams = selectedTeams.includes(teamId)
      ? selectedTeams.filter(id => id !== teamId)
      : [...selectedTeams, teamId];
    setSelectedTeams(newSelectedTeams);
    localStorage.setItem('selectedTeams', JSON.stringify(newSelectedTeams));
  };

  const handleAuthorToggle = (authorId: number) => {
    const newSelectedAuthors = selectedAuthors.includes(authorId)
      ? selectedAuthors.filter(id => id !== authorId)
      : [...selectedAuthors, authorId];
    setSelectedAuthors(newSelectedAuthors);
    localStorage.setItem('selectedAuthors', JSON.stringify(newSelectedAuthors));
  };

  const handleRepoToggle = (repo: string) => {
    const newSelectedRepos = selectedRepos.includes(repo)
      ? selectedRepos.filter(r => r !== repo)
      : [...selectedRepos, repo];
    setSelectedRepos(newSelectedRepos);
    localStorage.setItem('selectedRepos', JSON.stringify(newSelectedRepos));
  };

  const handleSelectAllTeams = () => {
    if (teams) {
      if (selectedTeams.length === teams.length) {
        setSelectedTeams([]);
        localStorage.setItem('selectedTeams', JSON.stringify([]));
      } else {
        const allTeamIds = teams.map(team => team.id);
        setSelectedTeams(allTeamIds);
        localStorage.setItem('selectedTeams', JSON.stringify(allTeamIds));
      }
    }
  };

  const handleSelectAllAuthors = () => {
    if (authors) {
      if (selectedAuthors.length === authors.length) {
        setSelectedAuthors([]);
        localStorage.setItem('selectedAuthors', JSON.stringify([]));
      } else {
        const allAuthorIds = authors.map(author => author.id);
        setSelectedAuthors(allAuthorIds);
        localStorage.setItem('selectedAuthors', JSON.stringify(allAuthorIds));
      }
    }
  };

  const handleSelectAllRepos = () => {
    if (repos) {
      if (selectedRepos.length === repos.length) {
        setSelectedRepos([]);
        localStorage.setItem('selectedRepos', JSON.stringify([]));
      } else {
        setSelectedRepos([...repos]);
        localStorage.setItem('selectedRepos', JSON.stringify([...repos]));
      }
    }
  };

  return (
    <div className="process-container">
      <div className="process-content">
        <h2 className="process-title">Team Authors Report</h2>

        <div className="process-topbar" style={{display:"flex", alignItems:"center"}}>
          {/* Repositories Dropdown with Checkboxes */}
          <div className="filter-group">
            <div className="dropdown-header" onClick={() => setOpenRepos(!openRepos)} style={{display:"flex"}}>
              <Typography variant="subtitle1" className="filter-label">
                Select Repository(ies)
              </Typography>
              <IconButton size="small">
                {openRepos ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            <Collapse in={openRepos}>
              <Box className="checkbox-group-container">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={repos && selectedRepos.length === repos.length}
                      indeterminate={repos && selectedRepos.length > 0 && selectedRepos.length < repos.length}
                      onChange={handleSelectAllRepos}
                      color="primary"
                    />
                  }
                  label="Select all"
                />
                <FormGroup className="checkbox-group">
                  {repos.map(repo => (
                    <FormControlLabel
                      key={repo}
                      control={
                        <Checkbox
                          checked={selectedRepos.includes(repo)}
                          onChange={() => handleRepoToggle(repo)}
                          color="primary"
                        />
                      }
                      label={repo}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
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
                      checked={teams && selectedTeams.length === teams.length}
                      indeterminate={teams && selectedTeams.length > 0 && selectedTeams.length < teams.length}
                      onChange={handleSelectAllTeams}
                      color="primary"
                    />
                  }
                  label="Select all"
                />
                <FormGroup className="checkbox-group">
                  {teams?.map(team => (
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

          {/* Authors Dropdown with Checkboxes */}
          <div className="filter-group">
            <div className="dropdown-header" onClick={() => setOpenAuthors(!openAuthors)} style={{display:"flex"}}>
              <Typography variant="subtitle1" className="filter-label">
                Select Author(s)
              </Typography>
              <IconButton size="small" disabled={!authors || authors.length === 0}>
                {openAuthors ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </div>
            <Collapse in={openAuthors}>
              <Box className="checkbox-group-container">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={authors && selectedAuthors.length === authors.length}
                      indeterminate={authors && selectedAuthors.length > 0 && selectedAuthors.length < authors.length}
                      onChange={handleSelectAllAuthors}
                      color="primary"
                      disabled={!authors || authors.length === 0}
                    />
                  }
                  label="Select all"
                />
                <FormGroup className="checkbox-group">
                  {authors?.map(author => (
                    <FormControlLabel
                      key={author.id}
                      control={
                        <Checkbox
                          checked={selectedAuthors.includes(author.id)}
                          onChange={() => handleAuthorToggle(author.id)}
                          color="primary"
                        />
                      }
                      label={author.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Collapse>
          </div>

          {/* Date Range - RSuite Version */}
          <div className="filter-group date-group" style={{display:"flex", alignItems:"center"}}>
            <Typography variant="subtitle1" className="filter-label" style={{width:"150px"}}>
              Date Range
            </Typography>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="dd/MM/yyyy"
              placeholder="Select date range"
              className="rsuite-daterange-picker"
              cleanable={false}
              showOneCalendar
              placement="bottomEnd"
              ranges={[
                {
                  label: 'Today',
                  value: [new Date(), new Date()],
                  placement: 'left'
                },
                {
                  label: 'Yesterday',
                  value: [addDays(new Date(), -1), addDays(new Date(), -1)],
                  placement: 'left'
                },
                {
                  label: 'Last 7 Days',
                  value: [addDays(new Date(), -6), new Date()],
                  placement: 'left'
                },
                {
                  label: 'Last 30 Days',
                  value: [addDays(new Date(), -29), new Date()],
                  placement: 'left'
                }
              ]}
            />
          </div>
        </div>

        <Graph1 />
      </div>
    </div>
  );
};

export default Process;