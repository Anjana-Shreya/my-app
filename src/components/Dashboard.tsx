// src/components/Dashboard.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSearchTerm, 
  setSelectedOption, 
  filterTemplates 
} from '../slice/templateSlice';
import { 
  useGetOrgTemplatesQuery,
  useGetUserDashboardsQuery,
  useUpdateUserPreferencesMutation
} from '../slice/dashboardApiSlice';
import './dashboard.css';
import { DashboardTemplate } from '../types/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const searchTerm = useSelector((state: any) => state.templates.searchTerm);
  const selectedOption = useSelector((state: any) => state.templates.selectedOption);
  const filteredTemplates = useSelector((state: any) => state.templates.filteredTemplates);
  const auth = useSelector((state: any) => state.auth);
  
  const [favoriteDashboards, setFavoriteDashboards] = useState<Array<{
    id: number;
    isTemplate: boolean;
    dashboardName: string;
  }>>([]);

  // API queries
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useGetOrgTemplatesQuery(auth?.user?.organization?.id, {
    skip: !auth?.user?.organization?.id
  });
  
  const {
    data: dashboardsData,
    isLoading: dashboardsLoading,
    error: dashboardsError,
    refetch: refetchDashboards
  } = useGetUserDashboardsQuery(
    { 
      orgId: auth?.user?.organization?.id, 
      userId: auth?.user?.id 
    },
    { 
      skip: !auth?.user?.organization?.id || !auth?.user?.id 
    }
  );
  
  const [updateUserPreferences] = useUpdateUserPreferencesMutation();

  // Handle template click
  const handleTemplateClick = useCallback((item: any) => {
    const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]');
    const parsedDashboards = Array.isArray(savedDashboards) ? savedDashboards : [];
    
    const existingIndex = parsedDashboards.findIndex(d => d.id === item.id);
    if (existingIndex >= 0) {
      parsedDashboards[existingIndex] = item;
    } else {
      parsedDashboards.push(item);
    }
    
    localStorage.setItem('dashboards', JSON.stringify(parsedDashboards));
    navigate(`/dashboard/${item.id}`);
  }, [navigate]);

  // Load favorite dashboards on mount
  useEffect(() => {
    const loadFavoriteDashboards = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('dashboardFavorites') || '{}');
        const favoriteItems = Object.keys(favorites)
          .filter(key => favorites[key])
          .map(key => {
            const id = parseInt(key);
            const allItems = [
              ...(templatesData || []),
              ...(dashboardsData || [])
            ];
            const item = allItems.find(item => item.id === id);
            return item ? {
              id: item.id,
              isTemplate: item.isTemplate || false,
              dashboardName: item.templateName || item.dashboardName || item.name || 'Untitled'
            } : null;
          })
          .filter(Boolean);
        
        setFavoriteDashboards(favoriteItems as any);
      } catch (error) {
        console.error('Error loading favorite dashboards:', error);
      }
    };

    if (templatesData || dashboardsData) {
      loadFavoriteDashboards();
    }
  }, [templatesData, dashboardsData]);

  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    
    try {
      const favorites = JSON.parse(localStorage.getItem('dashboardFavorites') || '{}');
      const newFavoriteStatus = !favorites[item.id];
      
      // Update local storage
      favorites[item.id] = newFavoriteStatus;
      localStorage.setItem('dashboardFavorites', JSON.stringify(favorites));
      
      // Update UI
      const updatedItems = filteredTemplates.map((d: any) => 
        d.id === item.id ? { ...d, isFavorite: newFavoriteStatus } : d
      );
      dispatch(filterTemplates(updatedItems));
      
      // Update favoriteDashboards state
      setFavoriteDashboards(prev => {
        if (newFavoriteStatus) {
          return [
            ...prev.filter(fav => fav.id !== item.id),
            {
              id: item.id,
              isTemplate: item.isTemplate || false,
              dashboardName: item.templateName || item.dashboardName || item.name || 'Untitled'
            }
          ];
        } else {
          return prev.filter(fav => fav.id !== item.id);
        }
      });
      
      // Prepare payload for API
      const updatedFavorites = newFavoriteStatus
        ? [
            ...favoriteDashboards.filter(fav => fav.id !== item.id),
            {
              id: item.id,
              isTemplate: item.isTemplate || false,
              dashboardName: item.templateName || item.dashboardName || item.name || 'Untitled'
            }
          ]
        : favoriteDashboards.filter(fav => fav.id !== item.id);
      
      // Call API to update preferences
      await updateUserPreferences({
        userId: auth?.user?.id,
        type: "UPDATE_DASHBOARDS",
        organizationId: auth?.user?.organization?.id,
        favouriteDashboards: JSON.stringify(updatedFavorites)
      }).unwrap();
      
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  }, [auth, dispatch, filteredTemplates, favoriteDashboards, updateUserPreferences]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (auth?.user?.organization?.id) {
      refetchTemplates();
      if (auth?.user?.id) {
        refetchDashboards();
      }
    }
  }, [auth, refetchTemplates, refetchDashboards]);

  // Filter and sort templates/dashboards
  useEffect(() => {
    if (!templatesData && !dashboardsData) return;

    const favorites = JSON.parse(localStorage.getItem('dashboardFavorites') || '{}');
    let filtered: DashboardTemplate[] = [];

    if (selectedOption === 'Templates' && templatesData) {
      filtered = templatesData.map(template => ({
        ...template,
        isFavorite: !!favorites[template.id]
      })).filter((template) =>
        template.templateName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    else if (selectedOption === 'Public Board' && dashboardsData) {
      filtered = dashboardsData
        .map((dashboard: any) => ({
          ...dashboard,
          isFavorite: !!favorites[dashboard.id]
        }))
        .filter((dashboard: any) => 
          dashboard.type === 'public' &&
          (dashboard.dashboardName || dashboard.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
    }
    else if (selectedOption === 'Private Boards' && dashboardsData) {
      filtered = dashboardsData
        .map((dashboard: any) => ({
          ...dashboard,
          isFavorite: !!favorites[dashboard.id]
        }))
        .filter((dashboard: any) => 
          dashboard.type !== 'public' &&
          (dashboard.dashboardName || dashboard.name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
    }
    else if (selectedOption === 'Favorites') {
      const favoriteIds = favoriteDashboards.map(fav => fav.id);
      const allItems = [
        ...(templatesData?.map((template: any) => ({
          ...template,
          isFavorite: !!favorites[template.id],
          isTemplate: true
        })) || []),
        ...(dashboardsData?.map((dashboard: any) => ({
          ...dashboard,
          isFavorite: !!favorites[dashboard.id],
          isTemplate: false
        })) || [])
      ];

      filtered = allItems.filter(item => 
        favoriteIds.includes(item.id) &&
        (item.templateName || item.dashboardName || item.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    else if (selectedOption === 'All Boards') {
      const all = [
        ...(templatesData?.map((template: any) => ({
          ...template,
          isFavorite: !!favorites[template.id]
        })) || []),
        ...(dashboardsData?.map((dashboard: any) => ({
          ...dashboard,
          isFavorite: !!favorites[dashboard.id]
        })) || [])
      ];

      filtered = all.filter((item: any) =>
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

    dispatch(filterTemplates(filtered));
  }, [templatesData, dashboardsData, searchTerm, selectedOption, dispatch, favoriteDashboards]);

  const isLoading = templatesLoading || dashboardsLoading;
  const error = templatesError || dashboardsError;
  const allItems = filteredTemplates || [];

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="controls">
          <input
            type="text"
            placeholder="Search boards..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="search-input"
          />

          <select
            value={selectedOption}
            onChange={(e) => dispatch(setSelectedOption(e.target.value))}
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
            <button onClick={handleRetry} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="template-list">
          {allItems.length > 0 ? (
            allItems.map((item: any) => (
              <div 
                key={item.id} 
                className="template-row"
                onClick={() => handleTemplateClick(item)}
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
                    onClick={(e) => handleToggleFavorite(e, item)}
                  >
                    {item.isFavorite ? '★' : '☆'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-card">
              {!isLoading && templatesData?.length === 0 && dashboardsData?.length === 0
                ? 'No data found'
                : 'No matching items found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;