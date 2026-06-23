import type {Timestamp} from './index';

export type NotificationType = 'PAYMENT_REQUEST' | 'PAYMENT_ACCEPTED' | 'PAYMENT_REJECTED';

export interface AppNotification {
  id: string;
  orgId: string;
  recipientId: string;
  senderId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedRequestId: string;
  isRead: boolean;
  createdAt: Timestamp;
}
