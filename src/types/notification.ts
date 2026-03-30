// Notification types for the adjustment request workflow

export enum NotificationType {
  ADJUSTMENT_REQUEST_SUBMITTED = 'adjustment_request_submitted',
  ADJUSTMENT_REQUEST_APPROVED = 'adjustment_request_approved',
  ADJUSTMENT_REQUEST_DECLINED = 'adjustment_request_declined',
  ADJUSTMENT_REQUEST_MORE_INFO = 'adjustment_request_more_info',
  ADJUSTMENT_REQUEST_PENDING = 'adjustment_request_pending',
  ADJUSTMENT_REQUEST_UPDATED = 'adjustment_request_updated',
  COMPLETE_PROFILE = 'complete_profile',
  TRY_WIZARD = 'try_wizard',
  SYSTEM = 'system',
}

export enum NotificationCategory {
  ADJUSTMENT_REQUEST = 'adjustment_request',
  APPROVAL = 'approval',
  GENERAL = 'general',
  SYSTEM = 'system',
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  metadata: NotificationMetadata;
  relatedRequestId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationMetadata {
  requestTitle?: string;
  requesterId?: string;
  requesterName?: string;
  approverId?: string;
  approverName?: string;
  previousStatus?: string;
  newStatus?: string;
  responseMessage?: string;
  [key: string]: unknown;
}

export interface INotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  category?: NotificationCategory;
}

// Database row type (snake_case from Supabase)
export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  category: string;
  is_read: boolean;
  metadata: NotificationMetadata;
  related_request_id: string | null;
  created_at: string;
  read_at: string | null;
}

// Transform database row to frontend type
export function transformNotification(row: NotificationRow): INotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as NotificationType,
    category: row.category as NotificationCategory,
    isRead: row.is_read,
    metadata: row.metadata || {},
    relatedRequestId: row.related_request_id,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

// Helper to get notification icon based on type
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.ADJUSTMENT_REQUEST_SUBMITTED:
      return 'solar:document-add-bold';
    case NotificationType.ADJUSTMENT_REQUEST_APPROVED:
      return 'solar:check-circle-bold';
    case NotificationType.ADJUSTMENT_REQUEST_DECLINED:
      return 'solar:close-circle-bold';
    case NotificationType.ADJUSTMENT_REQUEST_MORE_INFO:
      return 'solar:question-circle-bold';
    case NotificationType.ADJUSTMENT_REQUEST_PENDING:
      return 'solar:clock-circle-bold';
    case NotificationType.ADJUSTMENT_REQUEST_UPDATED:
      return 'solar:refresh-bold';
    case NotificationType.COMPLETE_PROFILE:
      return 'solar:user-circle-bold';
    case NotificationType.TRY_WIZARD:
      return 'mdi:magic-staff';
    case NotificationType.SYSTEM:
    default:
      return 'solar:bell-bold';
  }
}

// Helper to get notification color based on type
export function getNotificationColor(type: NotificationType): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (type) {
    case NotificationType.ADJUSTMENT_REQUEST_APPROVED:
      return 'success';
    case NotificationType.ADJUSTMENT_REQUEST_DECLINED:
      return 'error';
    case NotificationType.ADJUSTMENT_REQUEST_MORE_INFO:
    case NotificationType.COMPLETE_PROFILE:
      return 'warning';
    case NotificationType.ADJUSTMENT_REQUEST_SUBMITTED:
    case NotificationType.ADJUSTMENT_REQUEST_PENDING:
    case NotificationType.TRY_WIZARD:
      return 'info';
    default:
      return 'default';
  }
}
