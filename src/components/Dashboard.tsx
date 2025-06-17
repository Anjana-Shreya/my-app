// src/components/Dashboard.tsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../slice/authSlice';
import { setSearchTerm, setSelectedOption, filterTemplates } from '../slice/templateSlice';
import { dashboardApi } from '../slice/dashboardApiSlice';
import './dashboard.css';
import { DashboardTemplate } from '../types/types';

interface DashboardProps {
  searchTerm: string;
  selectedOption: string;
  filteredTemplates: DashboardTemplate[];
  auth: any;
  templatesData: {
    data?: DashboardTemplate[];
    isLoading: boolean;
    error?: any;
  };
  dashboardsData: {
    data?: any[];
    isLoading: boolean;
    error?: any;
  };

  setSearchTerm: (term: string) => void;
  setSelectedOption: (option: string) => void;
  filterTemplates: (templates: DashboardTemplate[]) => void;
  logout: () => void;
  getOrgTemplates: (orgId: number) => void;
  getOrgDashboards: (params: { orgId: number, userId: number }) => void;

  history: any;
}

class Dashboard extends Component<DashboardProps> {
  componentDidMount() {
    const { auth, getOrgTemplates, getOrgDashboards } = this.props;
    const orgId = auth?.user?.organization?.id;
    const userId = auth?.user?.id;
    
    
    if (orgId) {
      getOrgTemplates(orgId);
      if (userId) {
        getOrgDashboards({ orgId, userId });
      }
    }
  }

// In your Dashboard.tsx component
handleTemplateClick = (item: any) => {
  // Save the dashboard data to localStorage for easy access in detail view
  const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]');
  const parsedDashboards = Array.isArray(savedDashboards) ? savedDashboards : [];
  
  // Update or add the current dashboard
  const existingIndex = parsedDashboards.findIndex(d => d.id === item.id);
  if (existingIndex >= 0) {
    parsedDashboards[existingIndex] = item;
  } else {
    parsedDashboards.push(item);
  }
  
  localStorage.setItem('dashboards', JSON.stringify(parsedDashboards));
  
  // Navigate to detail view
  this.props.history.push(`/dashboard/${item.id}`);
};

  // In Dashboard.tsx
  handleToggleFavorite = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    
    try {
      const favorites = JSON.parse(localStorage.getItem('dashboardFavorites') || '{}');
      const parsedFavorites = typeof favorites === 'string' ? JSON.parse(favorites) : favorites;
      
      const newFavoriteStatus = !parsedFavorites[item.id];
      parsedFavorites[item.id] = newFavoriteStatus;
      
      localStorage.setItem('dashboardFavorites', JSON.stringify(parsedFavorites));
      
      const updatedItems = this.props.filteredTemplates.map(d => 
        d.id === item.id ? { ...d, isFavorite: newFavoriteStatus } : d
      );
      
      this.props.filterTemplates(updatedItems);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  componentDidUpdate(prevProps: DashboardProps) {
    const { templatesData, dashboardsData, filterTemplates, searchTerm, selectedOption } = this.props;

    const templatesChanged = templatesData.data !== prevProps.templatesData.data;
    const dashboardsChanged = dashboardsData.data !== prevProps.dashboardsData.data;
    const searchChanged = searchTerm !== prevProps.searchTerm;
    const optionChanged = selectedOption !== prevProps.selectedOption;

    const shouldUpdate = templatesChanged || dashboardsChanged || searchChanged || optionChanged;

    if (!shouldUpdate) return;

    // Get favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('dashboardFavorites') || '{}');

    let filtered: DashboardTemplate[] = [];

    if (selectedOption === 'Templates' && templatesData.data) {
      filtered = templatesData.data.map(template => ({
        ...template,
        isFavorite: !!favorites[template.id]
      })).filter((template) =>
        template.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    else if (['Public Board', 'Private Boards', 'Favorites'].includes(selectedOption) && dashboardsData.data) {
      let boardFilter = dashboardsData.data.map(dashboard => ({
        ...dashboard,
        isFavorite: !!favorites[dashboard.id]
      }));

      if (selectedOption === 'Public Board') {
        boardFilter = boardFilter.filter((dashboard: any) => dashboard.type === 'public');
      } else if (selectedOption === 'Private Boards') {
        boardFilter = boardFilter.filter((dashboard: any) => dashboard.type !== 'public'); 
      } else if (selectedOption === 'Favorites') {
        boardFilter = boardFilter.filter((dashboard: any) => dashboard.isFavorite === true);
      }

      filtered = boardFilter.filter((dashboard: any) =>
        (dashboard.dashboardName || dashboard.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    else if (selectedOption === 'All Boards') {
      const all = [
        ...(templatesData.data?.map(template => ({
          ...template,
          isFavorite: !!favorites[template.id]
        })) || []),
        ...(dashboardsData.data?.map(dashboard => ({
          ...dashboard,
          isFavorite: !!favorites[dashboard.id]
        })) || [])
      ];

      filtered = all.filter((item) =>
        (item.templateName || item.dashboardName || item.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Sort favorites to the top when not in Favorites view
    if (selectedOption !== 'Favorites') {
      filtered.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
      });
    }

    filterTemplates(filtered);
  }

  handleLogout = () => {
    this.props.logout();
    this.props.history.push('/');
  };

  handleRetry = () => {
    const { auth, getOrgTemplates, getOrgDashboards } = this.props;
    const orgId = auth?.user?.organization?.id;
    const userId = auth?.user?.id;
    
    if (orgId) {
      getOrgTemplates(orgId);
      if (userId) {
        getOrgDashboards({ orgId, userId });
      }
    }
  };

  render() {
    const {
      searchTerm,
      selectedOption,
      filteredTemplates,
      templatesData,
      dashboardsData,
      setSearchTerm,
      setSelectedOption
    } = this.props;

    const allItems = filteredTemplates || [];
    const isLoading = templatesData.isLoading || dashboardsData.isLoading;
    const error = templatesData.error || dashboardsData.error;

    return (
      <div className="dashboard-container">
        <div className="main-content">
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

          {isLoading && <p className="status-text">Loading data...</p>}
          
          {error && (
            <div className="status-text error-text">
              Error loading data
              <button onClick={this.handleRetry} className="retry-button">
                Retry
              </button>
            </div>
          )}

          <div className="template-list">
            {allItems.length > 0 ? (
              allItems.map((item) => (
                <div 
                  key={item.id} 
                  className="template-row"
                  onClick={() => this.handleTemplateClick(item)}
                  style={{ cursor: 'pointer' }}
                > 
                  <div className="left-section">
                    <div className="template-icon">▦</div>
                    <div className="template-info">
                      <div className="template-name">
                        {item.templateName || item.dashboardName || item.name || 'Untitled'}
                      </div>
                      <div className="template-description">
                        {item.description || ''}
                      </div>
                    </div>
                  </div>
                  <div className="middle-section">
                    {(Array.isArray(item.metricsList || item.widgets || item.metrics) 
                      ? (item.metricsList || item.widgets || item.metrics) 
                      : []).slice(0, 3).map((metric: any, index: number) => (
                      <span key={metric?.id || index} className="metric-pill">
                        {metric?.metricName || metric?.widgetType || metric?.name || 'Metric'}
                      </span>
                    ))}
                    {Array.isArray(item.metricsList || item.widgets || item.metrics) && 
                    (item.metricsList || item.widgets || item.metrics).length > 3 && (
                      <span className="metric-pill">
                        +{(item.metricsList || item.widgets || item.metrics).length - 3}
                      </span>
                    )}
                  </div>
                  <div className="right-section">
                    <span 
                      className={`icon-btn ${item.isFavorite ? 'favorite-active' : ''}`}
                      onClick={(e) => this.handleToggleFavorite(e, item)}
                    >
                      {item.isFavorite ? '★' : '☆'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-card">
                {!isLoading && templatesData.data?.length === 0 && dashboardsData.data?.length === 0
                  ? 'No data found'
                  : 'No matching items found'}
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
  templatesData: dashboardApi.endpoints.getOrgTemplates.select(state.auth?.user?.organization?.id)(state),
  dashboardsData: dashboardApi.endpoints.getUserDashboards.select({
    orgId: state.auth?.user?.organization?.id,
    userId: state.auth?.user?.id
  })(state)
});

const mapDispatchToProps = {
  setSearchTerm,
  setSelectedOption,
  filterTemplates,
  logout,
  getOrgTemplates: dashboardApi.endpoints.getOrgTemplates.initiate,
  getOrgDashboards: dashboardApi.endpoints.getUserDashboards.initiate
};

const DashboardWithRouter = (props: any) => {
  const navigate = useNavigate();
  return <ConnectedDashboard {...props} history={{ push: navigate }} />;
};

const ConnectedDashboard = connect(mapStateToProps, mapDispatchToProps)(Dashboard);
export default DashboardWithRouter;