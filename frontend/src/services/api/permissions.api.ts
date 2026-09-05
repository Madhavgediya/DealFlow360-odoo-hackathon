import { apiClient, formatSuccessResponse, formatErrorResponse } from './client';
import { ApiResponse } from '../../types/api';

export interface PermissionObj {
  id: string;
  module: string;
  action: string;
  resource: string;
  description?: string;
}

export const permissionsApi = {
  // Get all permissions
  getPermissions: async (): Promise<ApiResponse<PermissionObj[]>> => {
    try {
      const response = await apiClient.get('/permissions');
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch permissions');
    }
  },

  // Create a new permission
  createPermission: async (data: Omit<PermissionObj, 'id'>): Promise<ApiResponse<PermissionObj>> => {
    try {
      const response = await apiClient.post('/permissions', data);
      return formatSuccessResponse(response.data.data, undefined, 'Permission created successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to create permission');
    }
  },

  // Update a permission
  updatePermission: async (id: string, data: Partial<Omit<PermissionObj, 'id'>>): Promise<ApiResponse<PermissionObj>> => {
    try {
      const response = await apiClient.put(`/permissions/${id}`, data);
      return formatSuccessResponse(response.data.data, undefined, 'Permission updated successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to update permission');
    }
  },

  // Delete a permission
  deletePermission: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/permissions/${id}`);
      return formatSuccessResponse(null, undefined, 'Permission deleted successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to delete permission');
    }
  }
};
