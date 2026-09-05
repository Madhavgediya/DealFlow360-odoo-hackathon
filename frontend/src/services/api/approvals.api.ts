import { delay, formatSuccessResponse } from './client';
import { mockDb } from '../mock/mockDatabase';
import { ApiResponse } from '../../types/api';
import { ApprovalRequest, ApprovalActionPayload } from '../../types/approval';

export const approvalsApi = {
  getApprovals: async (status?: string): Promise<ApiResponse<ApprovalRequest[]>> => {
    await delay(180);
    const data = mockDb.getApprovals(status);
    return formatSuccessResponse(data, { total: data.length });
  },

  getApprovalById: async (id: string): Promise<ApiResponse<ApprovalRequest>> => {
    await delay(150);
    const item = mockDb.getApprovalById(id);
    if (!item) throw new Error('Approval request not found');
    return formatSuccessResponse(item);
  },

  handleAction: async (
    payload: ApprovalActionPayload,
    approverName?: string,
    approverRole?: string
  ): Promise<ApiResponse<ApprovalRequest>> => {
    await delay(350);
    const result = mockDb.handleApprovalAction(payload, approverName, approverRole);
    const actionLabel = payload.action === 'APPROVE' ? 'Approved' : payload.action === 'REJECT' ? 'Rejected' : 'Changes Requested';
    return formatSuccessResponse(result, undefined, `Approval request ${actionLabel} successfully.`);
  },
};
