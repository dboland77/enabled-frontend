'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';
import { NotificationType, NotificationCategory } from '@/types/notification';

// ----------------------------------------------------------------------

export interface CreateAdjustmentRequestData {
  title: string;
  detail: string;
  adjustmentType: string;
  workfunction: string;
  location: string;
  requiredDate: Date;
  approverId: string;
  approverName: string;
}

export interface UpdateAdjustmentRequestData extends CreateAdjustmentRequestData {
  id: string;
  status?: RequestStatusTypes;
}

export interface ApproverActionData {
  requestId: string;
  status: RequestStatusTypes;
  responseMessage?: string;
}

// Extended type for requests with user info (for approvers)
export interface IAdjustmentRequestWithUser extends IAdjustmentRequestItem {
  requesterName?: string;
  requesterEmail?: string;
}

export function useAdjustmentRequests() {
  const supabase = createClient();
  const [adjustmentRequests, setAdjustmentRequests] = useState<IAdjustmentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdjustmentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('adjustment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAdjustmentRequests(data as IAdjustmentRequestItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch adjustment requests');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createAdjustmentRequest = useCallback(
    async (requestData: CreateAdjustmentRequestData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const now = new Date().toISOString();
        const insertData = {
          user_id: user.id,
          title: requestData.title,
          detail: requestData.detail,
          adjustment_type: requestData.adjustmentType,
          work_function: requestData.workfunction,
          location: requestData.location,
          required_date: requestData.requiredDate.toISOString(),
          status: RequestStatusTypes.NEW,
          created_at: now,
          approver_id: requestData.approverId,
          approver_name: requestData.approverName,
          requester_name: user.user_metadata?.full_name || user.email,
          requester_email: user.email,
        };

        const { data, error: insertError } = await supabase
          .from('adjustment_requests')
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;

        // Send notification to the approver
        await supabase.from('notifications').insert({
          user_id: requestData.approverId,
          title: 'New Adjustment Request',
          message: `${user.user_metadata?.full_name || user.email} has submitted a new adjustment request: "${requestData.title}"`,
          type: NotificationType.ADJUSTMENT_REQUEST_SUBMITTED,
          category: NotificationCategory.APPROVAL,
          related_request_id: data.id,
          metadata: {
            requestTitle: requestData.title,
            requesterId: user.id,
            requesterName: user.user_metadata?.full_name || user.email,
          },
        });

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: data.id,
          previous_status: null,
          new_status: RequestStatusTypes.NEW,
          changed_by: user.id,
          message: 'Request submitted',
        });

        setAdjustmentRequests((prev) => [data as IAdjustmentRequestItem, ...prev]);
        return data as IAdjustmentRequestItem;
      } catch (err) {
        console.error('createAdjustmentRequest error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create adjustment request');
        throw err;
      }
    },
    [supabase]
  );

  const updateAdjustmentRequest = useCallback(
    async (requestData: UpdateAdjustmentRequestData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        // Get the current request to check previous status
        const { data: currentRequest } = await supabase
          .from('adjustment_requests')
          .select('status, approver_id')
          .eq('id', requestData.id)
          .single();

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            title: requestData.title,
            detail: requestData.detail,
            adjustment_type: requestData.adjustmentType,
            work_function: requestData.workfunction,
            location: requestData.location,
            required_date: requestData.requiredDate.toISOString(),
            status: requestData.status || RequestStatusTypes.PENDING,
            approver_id: requestData.approverId,
            approver_name: requestData.approverName,
          })
          .eq('id', requestData.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Notify approver if request was updated
        if (currentRequest?.approver_id) {
          await supabase.from('notifications').insert({
            user_id: currentRequest.approver_id,
            title: 'Adjustment Request Updated',
            message: `${user.user_metadata?.full_name || user.email} has updated their adjustment request: "${requestData.title}"`,
            type: NotificationType.ADJUSTMENT_REQUEST_UPDATED,
            category: NotificationCategory.APPROVAL,
            related_request_id: requestData.id,
            metadata: {
              requestTitle: requestData.title,
              requesterId: user.id,
              requesterName: user.user_metadata?.full_name || user.email,
              previousStatus: currentRequest.status,
              newStatus: requestData.status || RequestStatusTypes.PENDING,
            },
          });
        }

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: requestData.id,
          previous_status: currentRequest?.status,
          new_status: requestData.status || RequestStatusTypes.PENDING,
          changed_by: user.id,
          message: 'Request updated by requester',
        });

        setAdjustmentRequests((prev) =>
          prev.map((item) => (item.id === requestData.id ? (data as IAdjustmentRequestItem) : item))
        );
        return data as IAdjustmentRequestItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update adjustment request');
        throw err;
      }
    },
    [supabase]
  );

  const deleteAdjustmentRequest = useCallback(
    async (id: string) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const { error: deleteError } = await supabase
          .from('adjustment_requests')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setAdjustmentRequests((prev) => prev.filter((item) => item.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete adjustment request');
        return false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchAdjustmentRequests();
  }, [fetchAdjustmentRequests]);

  return {
    adjustmentRequests,
    loading,
    error,
    refetch: fetchAdjustmentRequests,
    createAdjustmentRequest,
    updateAdjustmentRequest,
    deleteAdjustmentRequest,
  };
}

// ----------------------------------------------------------------------
// Hook for approvers to manage requests assigned to them
// ----------------------------------------------------------------------

export function useApproverRequests() {
  const supabase = createClient();
  const [pendingRequests, setPendingRequests] = useState<IAdjustmentRequestWithUser[]>([]);
  const [allAssignedRequests, setAllAssignedRequests] = useState<IAdjustmentRequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApproverRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Fetch all requests assigned to this approver
      const { data, error: fetchError } = await supabase
        .from('adjustment_requests')
        .select('*')
        .eq('approver_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        const requests = data as IAdjustmentRequestWithUser[];
        setAllAssignedRequests(requests);
        setPendingRequests(
          requests.filter(
            (r) =>
              r.status === RequestStatusTypes.NEW ||
              r.status === RequestStatusTypes.PENDING
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approver requests');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const approveRequest = useCallback(
    async (actionData: ApproverActionData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        // Get the current request
        const { data: currentRequest } = await supabase
          .from('adjustment_requests')
          .select('*')
          .eq('id', actionData.requestId)
          .single();

        if (!currentRequest) {
          throw new Error('Request not found');
        }

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            status: RequestStatusTypes.APPROVED,
            response_message: actionData.responseMessage || 'Your request has been approved.',
            responded_at: new Date().toISOString(),
          })
          .eq('id', actionData.requestId)
          .eq('approver_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Notify the requester
        await supabase.from('notifications').insert({
          user_id: currentRequest.user_id,
          title: 'Request Approved',
          message: `Your adjustment request "${currentRequest.title}" has been approved by ${user.user_metadata?.full_name || user.email}.`,
          type: NotificationType.ADJUSTMENT_REQUEST_APPROVED,
          category: NotificationCategory.ADJUSTMENT_REQUEST,
          related_request_id: actionData.requestId,
          metadata: {
            requestTitle: currentRequest.title,
            approverId: user.id,
            approverName: user.user_metadata?.full_name || user.email,
            responseMessage: actionData.responseMessage,
            previousStatus: currentRequest.status,
            newStatus: RequestStatusTypes.APPROVED,
          },
        });

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: actionData.requestId,
          previous_status: currentRequest.status,
          new_status: RequestStatusTypes.APPROVED,
          changed_by: user.id,
          message: actionData.responseMessage || 'Request approved',
        });

        // Update local state
        setAllAssignedRequests((prev) =>
          prev.map((item) =>
            item.id === actionData.requestId
              ? { ...item, status: RequestStatusTypes.APPROVED }
              : item
          )
        );
        setPendingRequests((prev) =>
          prev.filter((item) => item.id !== actionData.requestId)
        );

        return data as IAdjustmentRequestWithUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to approve request');
        throw err;
      }
    },
    [supabase]
  );

  const declineRequest = useCallback(
    async (actionData: ApproverActionData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        // Get the current request
        const { data: currentRequest } = await supabase
          .from('adjustment_requests')
          .select('*')
          .eq('id', actionData.requestId)
          .single();

        if (!currentRequest) {
          throw new Error('Request not found');
        }

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            status: RequestStatusTypes.DENIED,
            response_message: actionData.responseMessage || 'Your request has been declined.',
            responded_at: new Date().toISOString(),
          })
          .eq('id', actionData.requestId)
          .eq('approver_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Notify the requester
        await supabase.from('notifications').insert({
          user_id: currentRequest.user_id,
          title: 'Request Declined',
          message: `Your adjustment request "${currentRequest.title}" has been declined. Reason: ${actionData.responseMessage || 'No reason provided.'}`,
          type: NotificationType.ADJUSTMENT_REQUEST_DECLINED,
          category: NotificationCategory.ADJUSTMENT_REQUEST,
          related_request_id: actionData.requestId,
          metadata: {
            requestTitle: currentRequest.title,
            approverId: user.id,
            approverName: user.user_metadata?.full_name || user.email,
            responseMessage: actionData.responseMessage,
            previousStatus: currentRequest.status,
            newStatus: RequestStatusTypes.DENIED,
          },
        });

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: actionData.requestId,
          previous_status: currentRequest.status,
          new_status: RequestStatusTypes.DENIED,
          changed_by: user.id,
          message: actionData.responseMessage || 'Request declined',
        });

        // Update local state
        setAllAssignedRequests((prev) =>
          prev.map((item) =>
            item.id === actionData.requestId
              ? { ...item, status: RequestStatusTypes.DENIED }
              : item
          )
        );
        setPendingRequests((prev) =>
          prev.filter((item) => item.id !== actionData.requestId)
        );

        return data as IAdjustmentRequestWithUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to decline request');
        throw err;
      }
    },
    [supabase]
  );

  const requestMoreInfo = useCallback(
    async (actionData: ApproverActionData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        // Get the current request
        const { data: currentRequest } = await supabase
          .from('adjustment_requests')
          .select('*')
          .eq('id', actionData.requestId)
          .single();

        if (!currentRequest) {
          throw new Error('Request not found');
        }

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            status: RequestStatusTypes.MORE_INFO,
            response_message: actionData.responseMessage || 'Please provide more information.',
            responded_at: new Date().toISOString(),
          })
          .eq('id', actionData.requestId)
          .eq('approver_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Notify the requester
        await supabase.from('notifications').insert({
          user_id: currentRequest.user_id,
          title: 'More Information Required',
          message: `Your adjustment request "${currentRequest.title}" requires more information. Message: ${actionData.responseMessage || 'Please provide additional details.'}`,
          type: NotificationType.ADJUSTMENT_REQUEST_MORE_INFO,
          category: NotificationCategory.ADJUSTMENT_REQUEST,
          related_request_id: actionData.requestId,
          metadata: {
            requestTitle: currentRequest.title,
            approverId: user.id,
            approverName: user.user_metadata?.full_name || user.email,
            responseMessage: actionData.responseMessage,
            previousStatus: currentRequest.status,
            newStatus: RequestStatusTypes.MORE_INFO,
          },
        });

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: actionData.requestId,
          previous_status: currentRequest.status,
          new_status: RequestStatusTypes.MORE_INFO,
          changed_by: user.id,
          message: actionData.responseMessage || 'More information requested',
        });

        // Update local state
        setAllAssignedRequests((prev) =>
          prev.map((item) =>
            item.id === actionData.requestId
              ? { ...item, status: RequestStatusTypes.MORE_INFO }
              : item
          )
        );

        return data as IAdjustmentRequestWithUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to request more info');
        throw err;
      }
    },
    [supabase]
  );

  const setPendingStatus = useCallback(
    async (actionData: ApproverActionData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        // Get the current request
        const { data: currentRequest } = await supabase
          .from('adjustment_requests')
          .select('*')
          .eq('id', actionData.requestId)
          .single();

        if (!currentRequest) {
          throw new Error('Request not found');
        }

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            status: RequestStatusTypes.PENDING,
            response_message: actionData.responseMessage || 'Your request is being reviewed.',
            responded_at: new Date().toISOString(),
          })
          .eq('id', actionData.requestId)
          .eq('approver_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Notify the requester
        await supabase.from('notifications').insert({
          user_id: currentRequest.user_id,
          title: 'Request Under Review',
          message: `Your adjustment request "${currentRequest.title}" is now being reviewed.`,
          type: NotificationType.ADJUSTMENT_REQUEST_PENDING,
          category: NotificationCategory.ADJUSTMENT_REQUEST,
          related_request_id: actionData.requestId,
          metadata: {
            requestTitle: currentRequest.title,
            approverId: user.id,
            approverName: user.user_metadata?.full_name || user.email,
            responseMessage: actionData.responseMessage,
            previousStatus: currentRequest.status,
            newStatus: RequestStatusTypes.PENDING,
          },
        });

        // Record history
        await supabase.from('adjustment_request_history').insert({
          request_id: actionData.requestId,
          previous_status: currentRequest.status,
          new_status: RequestStatusTypes.PENDING,
          changed_by: user.id,
          message: actionData.responseMessage || 'Request marked as pending review',
        });

        // Update local state
        setAllAssignedRequests((prev) =>
          prev.map((item) =>
            item.id === actionData.requestId
              ? { ...item, status: RequestStatusTypes.PENDING }
              : item
          )
        );

        return data as IAdjustmentRequestWithUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set pending status');
        throw err;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchApproverRequests();
  }, [fetchApproverRequests]);

  return {
    pendingRequests,
    allAssignedRequests,
    loading,
    error,
    refetch: fetchApproverRequests,
    approveRequest,
    declineRequest,
    requestMoreInfo,
    setPendingStatus,
  };
}
