import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { Customer } from '../../types/customer';

export const customersApi = {
  getCustomers: async (search?: string): Promise<ApiResponse<Customer[]>> => {
    await delay(180);
    const data = mockDb.getCustomers(search);
    return formatSuccessResponse(data, { total: data.length });
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    await delay(150);
    const customer = mockDb.getCustomerById(id);
    if (!customer) throw new Error('Customer not found');
    return formatSuccessResponse(customer);
  },
};
