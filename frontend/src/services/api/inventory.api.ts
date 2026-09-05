import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Warehouse, StockItem } from '../../types/inventory';

export const inventoryApi = {
  getWarehouses: async (): Promise<ApiResponse<Warehouse[]>> => {
    await delay(150);
    return formatSuccessResponse(mockDb.getWarehouses());
  },

  getStockItems: async (warehouseId?: string): Promise<ApiResponse<StockItem[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getStockItems(warehouseId));
  },
};
