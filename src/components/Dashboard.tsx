// src/components/Dashboard.tsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../slice/authSlice';
import { setSearchTerm, setSelectedOption, filterTemplates } from '../slice/templateSlice';
import { dashboardApi } from '../slice/dashboardApiSlice';
import Sidebar from './Sidebar';
import './dashboard.css';
import { DashboardTemplate } from '../types/types';

interface DashboardProps {
  // From mapStateToProps
  searchTerm: string;
  selectedOption: string; 
  filteredTemplates: DashboardTemplate[];
  auth: any;
  templatesData: {
    data?: DashboardTemplate[];
    isLoading: boolean;
    error?: any;
  };
  
  // From mapDispatchToProps
  setSearchTerm: (term: string) => void;
  setSelectedOption: (option: string) => void;
  filterTemplates: (templates: DashboardTemplate[]) => void;
  logout: () => void;
  getOrgTemplates: (orgId: number) => void;
  
  // From withRouter
  history: any;
}

class Dashboard extends Component<DashboardProps> {
  componentDidMount() {
    const { auth, getOrgTemplates } = this.props;
    const orgId = auth?.user?.organization?.id;
    if (orgId) {
      getOrgTemplates(orgId);
    }
  }

componentDidUpdate(prevProps: DashboardProps) {
  const { templatesData, filterTemplates, searchTerm } = this.props;

  const templatesChanged = templatesData.data !== prevProps.templatesData.data;
  const searchTermChanged = searchTerm !== prevProps.searchTerm;

  if (templatesData.data && (templatesChanged || searchTermChanged)) {
    filterTemplates(templatesData.data);
  }

  if (templatesData.error && templatesData.error.status === 401) {
    this.handleLogout();
  }
}


  handleLogout = () => {
    this.props.logout();
    this.props.history.push('/');
  };

  handleRetry = () => {
    const { auth, getOrgTemplates } = this.props;
    const orgId = auth?.user?.organization?.id;
    if (orgId) {
      getOrgTemplates(orgId);
    }
  };

  render() {
    const {
      searchTerm,
      selectedOption,
      filteredTemplates,
      templatesData,
      setSearchTerm,
      setSelectedOption
    } = this.props;

    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content" style={{width:"78vw"}}>
          <h1 className="dashboard-title">Dashboard</h1>

          <div className="controls">
            <input
              type="text"
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="dropdown"
            >
              <option>All Boards</option>
              <option>Private Boards</option>
              <option>Favorites</option>
              <option>Public Board</option>
              <option>Templates</option>
            </select>
          </div>

          {templatesData.isLoading && <p className="status-text">Loading templates...</p>}
          
          {templatesData.error && (
            <div className="status-text error-text">
              Error loading templates
              <button onClick={this.handleRetry} className="retry-button">
                Retry
              </button>
            </div>
          )}

          <div className="template-list">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div key={template.id} className="template-row">
                  <div className="left-section">
                    <div className="template-icon">▦</div>
                    <div className="template-info">
                      <div className="template-name">{template.templateName || 'Untitled'}</div>
                    </div>
                  </div>
                  <div className="middle-section">
                    {template.metricsList?.slice(0, 3).map((metric) => (
                      <span key={metric.id} className="metric-pill">
                        {metric.metricName}
                      </span>
                    ))}
                    {template.metricsList && template.metricsList.length > 3 && (
                      <span className="metric-pill">+{template.metricsList.length - 3}</span>
                    )}
                  </div>
                  <div className="right-section">
                    <div className="circle-avatar">H</div>
                    <span className="icon-btn">☆</span>
                    <span className="icon-btn">↗</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-card">
                {templatesData.data?.length === 0
                  ? 'No templates found'
                  : 'No matching templates found'}
              </div>
            )}
          </div>
            

          <button onClick={this.handleLogout} className="logout-button" style={{marginBottom:"20px"}}>
            Logout
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  searchTerm: state.templates.searchTerm,
  selectedOption: state.templates.selectedOption,
  filteredTemplates: state.templates.filteredTemplates,
  auth: state.auth,
  templatesData: dashboardApi.endpoints.getOrgTemplates.select(state.auth?.user?.organization?.id)(state)
});

const mapDispatchToProps = {
  setSearchTerm,
  setSelectedOption,
  filterTemplates,
  logout,
  getOrgTemplates: dashboardApi.endpoints.getOrgTemplates.initiate
};

const DashboardWithRouter = (props: any) => {
  const navigate = useNavigate();
  return <ConnectedDashboard {...props} history={{ push: navigate }} />;
};

const ConnectedDashboard = connect(mapStateToProps, mapDispatchToProps)(Dashboard);
export default DashboardWithRouter;