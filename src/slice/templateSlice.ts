// src/slice/templateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardTemplate } from '../types/types';

interface TemplatesState {
  searchTerm: string;
  selectedOption: string;
  filteredTemplates: DashboardTemplate[];
}

const initialState: TemplatesState = {
  searchTerm: '',
  selectedOption: 'All Boards',
  filteredTemplates: [],
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
    },
    filterTemplates: (state, action: PayloadAction<DashboardTemplate[]>) => {
      const searchLower = state.searchTerm.toLowerCase();
      state.filteredTemplates = action.payload.filter(template => {
        return (
          template.templateName?.toLowerCase().includes(searchLower) ||
          template.templateDescription?.toLowerCase().includes(searchLower) ||
          template.metricsList?.some(metric =>
            metric.metricName.toLowerCase().includes(searchLower) ||
            metric.metricDescription.toLowerCase().includes(searchLower)
          )
        );
      });
    },
  },
});

export const { setSearchTerm, setSelectedOption, filterTemplates } = templatesSlice.actions;
export default templatesSlice.reducer;