import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Shipment } from '../../types/shipping';

export const shippingApi = {
  getShipments: async (): Promise<ApiResponse<Shipment[]>> => {
    await delay(180);
    return formatSuccessResponse(mockDb.getShipments());
  },

  getShipmentById: async (id: string): Promise<ApiResponse<Shipment>> => {
    await delay(150);
    const ship = mockDb.getShipmentById(id);
    if (!ship) throw new Error('Shipment not found');
    return formatSuccessResponse(ship);
  },
};
