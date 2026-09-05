import { apiClient, formatSuccessResponse, formatErrorResponse } from './client';
import { ApiResponse } from '../../types/api';

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
  company_id?: string;
  created_at?: string;
  permissions?: any[];
}

export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    try {
      const response = await apiClient.get('/roles');
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch roles');
    }
  },

  // Get a single role by ID
  getRoleById: async (id: string): Promise<ApiResponse<Role>> => {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch role');
    }
  },

  // Create a new role
  createRole: async (roleData: { name: string; description?: string }): Promise<ApiResponse<Role>> => {
    try {
      const response = await apiClient.post('/roles', roleData);
      return formatSuccessResponse(response.data.data, undefined, 'Role created successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to create role');
    }
  },

  // Update a role
  updateRole: async (id: string, roleData: { name?: string; description?: string }): Promise<ApiResponse<Role>> => {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData);
      return formatSuccessResponse(response.data.data, undefined, 'Role updated successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to update role');
    }
  },

  // Delete a role
  deleteRole: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/roles/${id}`);
      return formatSuccessResponse(null, undefined, 'Role deleted successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to delete role');
    }
  },

  // Get permissions for a role
  getRolePermissions: async (id: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get(`/roles/${id}/permissions`);
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch role permissions');
    }
  },

  // Update permissions for a role
  updateRolePermissions: async (id: string, permissionIds: string[]): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.post(`/roles/${id}/permissions`, { permissionIds });
      return formatSuccessResponse(response.data.data, undefined, 'Role permissions updated successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to update role permissions');
    }
  }
};
