import { apiClient, formatSuccessResponse, formatErrorResponse } from './client';
import { ApiResponse } from '../../types/api';
import { User } from '../../types/auth';

export const usersApi = {
  // Get all users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await apiClient.get('/users');
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get a single user by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return formatSuccessResponse(response.data.data);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Create a new user
  createUser: async (userData: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.post('/users', userData);
      return formatSuccessResponse(response.data.data, undefined, 'User created successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to create user');
    }
  },

  // Update a user
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return formatSuccessResponse(response.data.data, undefined, 'User updated successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Update user status (ACTIVE / INACTIVE)
  updateUserStatus: async (id: string, status: string): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { status });
      return formatSuccessResponse(response.data.data, undefined, `User marked as ${status}`);
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to update status');
    }
  },

  // Assign a role to a user
  assignRole: async (userId: string, roleId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post(`/users/${userId}/roles/${roleId}`);
      return formatSuccessResponse(response.data.data, undefined, 'Role assigned successfully');
    } catch (error: any) {
      return formatErrorResponse(error.response?.data?.message || 'Failed to assign role');
    }
  }
};
