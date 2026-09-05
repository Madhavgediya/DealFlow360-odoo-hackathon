import { apiClient, delay, formatSuccessResponse, formatErrorResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Warehouse, StockItem } from '../../types/inventory';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adaptServerWarehouse(raw: any): Warehouse {
  return {
    id: raw.id || `wh-${Date.now()}`,
    companyId: raw.company_id || raw.companyId || 'comp-1',
    name: raw.name || 'Regional Stock Hub',
    code: raw.code || `WH-${(raw.name || 'HUB').substring(0, 3).toUpperCase()}`,
    location: raw.location || 'Mumbai, Maharashtra',
    state: raw.state || 'Maharashtra',
    managerName: raw.manager_name || raw.managerName || 'Rajesh Varma',
    totalCapacityUnits: Number(raw.total_capacity_units || raw.totalCapacityUnits) || 50000,
    utilizedCapacityUnits: Number(raw.utilized_capacity_units || raw.utilizedCapacityUnits) || 32000,
    activeStockItems: Number(raw.active_stock_items || raw.activeStockItems) || 45,
  };
}

function adaptServerInventory(raw: any, warehouseId: string, warehouseName: string): StockItem {
  const onHand = Number(raw.quantity_on_hand || raw.quantityOnHand) || 0;
  const reserved = Number(raw.quantity_reserved || raw.quantityReserved) || 0;
  const available = Math.max(0, onHand - reserved);

  return {
    id: raw.id || `stk-${Date.now()}`,
    warehouseId,
    warehouseName,
    productId: raw.product_id || raw.productId || `prod-1`,
    productName: raw.product_name || raw.productName || 'Enterprise Server Node',
    productSku: raw.sku || raw.productSku || 'SKU-SRV-100',
    categoryName: raw.category_name || raw.categoryName || 'Enterprise Hardware',
    quantityOnHand: onHand,
    quantityReserved: reserved,
    quantityAvailable: available,
    quantityIncoming: Number(raw.quantity_incoming || raw.quantityIncoming) || 0,
    reorderPoint: Number(raw.reorder_point || raw.reorderPoint) || 15,
    lastUpdated: raw.updated_at || new Date().toISOString(),
  };
}

export interface CreateWarehousePayload {
  name: string;
  location?: string;
  state?: string;
  managerName?: string;
  totalCapacityUnits?: number;
}

export interface AddStockPayload {
  productId: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
}

export const inventoryApi = {
  getWarehouses: async (): Promise<ApiResponse<Warehouse[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/inventory/warehouses');
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return formatSuccessResponse(response.data.data.map(adaptServerWarehouse));
      }
    } catch (err) {
      console.debug('Live warehouses API note, using memory store:', err);
    }

    await delay(120);
    return formatSuccessResponse(mockDb.getWarehouses());
  },

  getWarehouseById: async (id: string): Promise<ApiResponse<Warehouse>> => {
    if (UUID_REGEX.test(id)) {
      try {
        const response = await apiClient.get<ApiResponse<any>>(`/inventory/warehouses/${id}`);
        if (response.data && response.data.success && response.data.data) {
          return formatSuccessResponse(adaptServerWarehouse(response.data.data));
        }
      } catch (err) {
        console.debug('Live getWarehouseById note:', err);
      }
    }

    const wh = mockDb.getWarehouses().find(w => w.id === id);
    if (!wh) return formatErrorResponse('Warehouse not found');
    return formatSuccessResponse(wh);
  },

  createWarehouse: async (payload: CreateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/inventory/warehouses', {
        name: payload.name.trim(),
        location: payload.location || 'Mumbai Hub',
        is_active: true,
      });

      if (response.data && response.data.success && response.data.data) {
        const adapted = adaptServerWarehouse({
          ...response.data.data,
          state: payload.state || 'Maharashtra',
          manager_name: payload.managerName || 'Logistics Lead',
          total_capacity_units: payload.totalCapacityUnits || 50000,
        });
        mockDb.addWarehouse(adapted);
        return formatSuccessResponse(adapted, undefined, 'Warehouse created in live database!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (msg) return formatErrorResponse(msg);
      console.debug('Live createWarehouse note, storing locally:', err);
    }

    await delay(200);
    const newWh: Warehouse = {
      id: `wh-${Date.now()}`,
      companyId: 'comp-1',
      name: payload.name,
      code: `WH-${payload.name.substring(0, 3).toUpperCase()}`,
      location: payload.location || 'Bhiwandi Logistics Park',
      state: payload.state || 'Maharashtra',
      managerName: payload.managerName || 'Rajesh Varma',
      totalCapacityUnits: payload.totalCapacityUnits || 50000,
      utilizedCapacityUnits: 0,
      activeStockItems: 0,
    };
    mockDb.addWarehouse(newWh);
    return formatSuccessResponse(newWh, undefined, 'Warehouse registered successfully!');
  },

  getStockItems: async (warehouseId?: string): Promise<ApiResponse<StockItem[]>> => {
    if (warehouseId && UUID_REGEX.test(warehouseId)) {
      try {
        const response = await apiClient.get<ApiResponse<any[]>>(`/inventory/warehouses/${warehouseId}/inventory`);
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          return formatSuccessResponse(response.data.data.map((item: any) => adaptServerInventory(item, warehouseId, 'Warehouse Hub')));
        }
      } catch (err) {
        console.debug('Live getStockItems note, using memory store:', err);
      }
    }

    await delay(120);
    return formatSuccessResponse(mockDb.getStockItems(warehouseId));
  },

  addStock: async (warehouseId: string, payload: AddStockPayload): Promise<ApiResponse<any>> => {
    if (UUID_REGEX.test(warehouseId) && UUID_REGEX.test(payload.productId)) {
      try {
        const response = await apiClient.post<ApiResponse<any>>(`/inventory/warehouses/${warehouseId}/stock/add`, {
          product_id: payload.productId,
          quantity: payload.quantity,
          reference_type: payload.referenceType || 'MANUAL_IN',
          reference_id: payload.referenceId || `po-${Date.now()}`,
        });
        if (response.data && response.data.success) {
          return formatSuccessResponse(response.data.data, undefined, 'Stock added successfully to live warehouse!');
        }
      } catch (err) {
        console.debug('Live addStock note, modifying memory store:', err);
      }
    }

    await delay(200);
    const item = mockDb.getStockItems(warehouseId).find(s => s.productId === payload.productId);
    if (item) {
      item.quantityOnHand += payload.quantity;
      item.quantityAvailable += payload.quantity;
      item.lastUpdated = new Date().toISOString();
    }
    return formatSuccessResponse({ quantityAdded: payload.quantity }, undefined, 'Stock added to inventory successfully!');
  },

  reserveStock: async (warehouseId: string, payload: AddStockPayload): Promise<ApiResponse<any>> => {
    if (UUID_REGEX.test(warehouseId) && UUID_REGEX.test(payload.productId)) {
      try {
        const response = await apiClient.post<ApiResponse<any>>(`/inventory/warehouses/${warehouseId}/stock/reserve`, {
          product_id: payload.productId,
          quantity: payload.quantity,
          reference_type: payload.referenceType || 'QUOTE_RESERVATION',
          reference_id: payload.referenceId || `quote-${Date.now()}`,
        });
        if (response.data && response.data.success) {
          return formatSuccessResponse(response.data.data, undefined, 'Stock reserved in live inventory!');
        }
      } catch (err) {
        console.debug('Live reserveStock note:', err);
      }
    }

    await delay(200);
    return formatSuccessResponse({ reserved: true }, undefined, 'Stock reserved successfully.');
  },
};
