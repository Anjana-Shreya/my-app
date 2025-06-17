import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetHierarchicalTeamQuery,
  useGetTeamAuthorsMutation,
  useGetGitReposQuery
} from '../slice/teamApiSlice';
import { selectCurrentUser } from '../slice/authSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';
import './process.css';
import Graph1 from './Graph1';
import { Checkbox, FormControlLabel, FormGroup, Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

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

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem('startDate');
    return stored ? new Date(Number(stored) * 1000) : new Date();
  });

  const [endDate, setEndDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem('endDate');
    return stored ? new Date(Number(stored) * 1000) : addDays(new Date(), 7);
  });

  // Fetch
  const { data: teams, isLoading: isLoadingTeams } = useGetHierarchicalTeamQuery(
    { userId, orgId },
    { skip: !userId || !orgId }
  );

  const [fetchAuthors, { data: authors }] = useGetTeamAuthorsMutation();

  const storedRepoIds = localStorage.getItem('repoIds');
  const repoIds = storedRepoIds ? JSON.parse(storedRepoIds) : [];

  const { data: repos = [], isLoading: isLoadingRepos } = useGetGitReposQuery(
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

  // Select all/none functions
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

        <div className="process-topbar">
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

          {/* Date Range */}
          <div className="filter-group" 
            style={{background:"white", padding:"10px", display:"flex", gap:"8px", borderRadius:"8px", borderColor:"black", borderWidth:"1px"}}
          >
            <Typography variant="subtitle1" className="filter-label">
              Date Range
            </Typography>
            <div className="date-range-group">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  if (date) localStorage.setItem('startDate', `${Math.floor(date.getTime() / 1000)}`);
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
                  if (date) localStorage.setItem('endDate', `${Math.floor(date.getTime() / 1000)}`);
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
        </div>

        {/* <ProcessMetrics /> */}
        <Graph1 />
      </div>
    </div>
  );
};

export default Process;