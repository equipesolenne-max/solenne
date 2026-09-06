export type NotificationType = "order" | "inventory" | "support" | "marketing";

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  related_id?: string;
  url?: string;
}

export type MessageStatus = "new" | "in_progress" | "replied" | "resolved";

export interface ContactMessage {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface MessageReply {
  id: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  created_at: string;
  is_admin: boolean;
}

export interface Conversation extends ContactMessage {
  replies: MessageReply[];
}
