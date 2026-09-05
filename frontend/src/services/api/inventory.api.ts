import { apiClient } from './client';
import { ApiResponse } from '../../types/api';
import { Warehouse, StockItem } from '../../types/inventory';

export const inventoryApi = {
  getWarehouses: async (): Promise<ApiResponse<Warehouse[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Warehouse[]>>('/inventory/warehouses');
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch warehouses' };
    }
  },

  getStockItems: async (warehouseId?: string): Promise<ApiResponse<StockItem[]>> => {
    try {
      if (!warehouseId) {
        // Fetch all warehouses and their inventory if no specific warehouse is provided
        const whRes = await apiClient.get<ApiResponse<Warehouse[]>>('/inventory/warehouses');
        if (!whRes.data.success || !whRes.data.data) {
          throw new Error('Failed to fetch warehouses');
        }
        let allStock: StockItem[] = [];
        for (const wh of whRes.data.data) {
          try {
            const stockRes = await apiClient.get<ApiResponse<StockItem[]>>(`/inventory/warehouses/${wh.id}/inventory`);
            if (stockRes.data.success && stockRes.data.data) {
              allStock = allStock.concat(stockRes.data.data);
            }
          } catch (e) {
            console.warn(`Failed to fetch stock for warehouse ${wh.id}`);
          }
        }
        return { success: true, data: allStock, error: null };
      }
      
      const res = await apiClient.get<ApiResponse<StockItem[]>>(`/inventory/warehouses/${warehouseId}/inventory`);
      return res.data;
    } catch (err: any) {
      return { success: false, data: null, error: err.response?.data?.message || 'Failed to fetch stock items' };
    }
  },
};
