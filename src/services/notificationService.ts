import firestore from '@react-native-firebase/firestore';
import type {NotificationType, AppNotification} from '@/types/notifications';

export interface CreateNotificationPayload {
  orgId: string;
  recipientId: string;
  senderId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedRequestId: string;
  isRead?: boolean;
}

const collectionName = 'notifications';

type AnyDocSnap = {
  id: string;
  data: () => any;
};

function mapSnapshotToNotification(docSnap: AnyDocSnap): AppNotification {
  const data: any = docSnap.data();

  return {
    id: docSnap.id,
    orgId: data.orgId,
    recipientId: data.recipientId,
    senderId: data.senderId,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedRequestId: data.relatedRequestId,
    isRead: !!data.isRead,
    createdAt:
      data.createdAt && typeof data.createdAt.toDate === 'function'
        ? data.createdAt.toDate()
        : data.createdAt
          ? new Date(data.createdAt)
          : null,
  };
}

export async function createNotification(payload: CreateNotificationPayload) {
  const ref = firestore().collection(collectionName).doc();

  await ref.set({
    id: ref.id,
    orgId: payload.orgId,
    recipientId: payload.recipientId,
    senderId: payload.senderId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    relatedRequestId: payload.relatedRequestId,
    isRead: payload.isRead ?? false,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return ref.id;
}

export async function markNotificationAsRead(notificationId: string, _recipientId: string) {
  await firestore()
    .collection(collectionName)
    .doc(notificationId)
    .update({isRead: true, readAt: new Date(), updatedAt: new Date()});
}

export async function markNotificationForTransactionAsRead(
  transactionId: string,
  recipientId: string,
) {
  const snap = await firestore()
    .collection(collectionName)
    .where('relatedRequestId', '==', transactionId)
    .get();

  const batch = firestore().batch();
  snap.forEach((doc: any) => {
    const data: any = doc.data();
    if (data?.recipientId === recipientId && data?.isRead === false) {
      batch.update(doc.ref, {isRead: true, readAt: new Date(), updatedAt: new Date()});
    }
  });

  await batch.commit();
}

export async function markAllNotificationsAsRead(recipientId: string) {
  const now = new Date();

  // Avoid composite-queries/indexes that can fail due to Firestore security rules
  // or missing composite indexes.
  // We fetch by recipientId and filter by isRead client-side.
  const snap = await firestore()
    .collection(collectionName)
    .where('recipientId', '==', recipientId)
    .get();

  const batch = firestore().batch();
  snap.forEach((doc: any) => {
    const data: any = doc.data();
    if (data?.isRead === false) {
      batch.update(doc.ref, {isRead: true, readAt: now, updatedAt: now});
    }
  });

  await batch.commit();
}

export async function deleteNotification(notificationId: string) {
  await firestore().collection(collectionName).doc(notificationId).delete();
}

export async function getUnreadCount(recipientId: string) {
  // Avoid composite queries that may fail due to Firestore rules/indexes.
  // Fetch by recipientId and count client-side.
  const snap = await firestore()
    .collection(collectionName)
    .where('recipientId', '==', recipientId)
    .get();

  let count = 0;
  snap.forEach((doc: any) => {
    const data: any = doc.data();
    if (data?.isRead === false) count += 1;
  });

  return count;
}

export function subscribeToNotifications(params: {
  recipientId: string;
  orgId?: string;
  onUpdate: (notifications: AppNotification[]) => void;
  onError?: (error: any) => void;
}) {
  const {recipientId, orgId, onUpdate, onError} = params;

  // IMPORTANT: Firestore composite index requirement can cause runtime failures if we
  // combine multiple filters + orderBy. To avoid index dependency, we:
  // 1) Listen by recipientId only.
  // 2) Filter by orgId client-side (cheap for typical notification lists).
  let query: any = firestore().collection(collectionName).where('recipientId', '==', recipientId);

  return query.onSnapshot(
    (qs: any) => {
      const list: AppNotification[] = [];
      qs.forEach((docSnap: any) => {
        const notif = mapSnapshotToNotification(docSnap);
        // Client-side org filtering to avoid composite index queries.
        if (!orgId || notif.orgId === orgId) list.push(notif);
      });
      onUpdate(list);
    },

    (err: any) => onError?.(err),
  );
}
