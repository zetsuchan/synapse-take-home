import { apiGet, apiPost } from './client';
import {
  type ConversationStatus,
  ConversationsListResponseSchema,
  MarkAsReadResponseSchema,
  MessageRequestsResponseSchema,
  MessagesResponseSchema,
  RespondToRequestResponseSchema,
  SendMessageResponseSchema,
  StartConversationResponseSchema,
  UnreadCountResponseSchema,
} from '../schemas/messages';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const DEFAULT_MESSAGE_LIMIT = 50;

export async function getConversations(
  status?: ConversationStatus,
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT
) {
  const response = await apiGet<unknown>('/messages/conversations', {
    status,
    page,
    limit,
  });

  return ConversationsListResponseSchema.parse(response);
}

export async function getMessageRequests(page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT) {
  const response = await apiGet<unknown>('/messages/requests', {
    page,
    limit,
  });

  return MessageRequestsResponseSchema.parse(response);
}

export async function getMessages(
  conversationId: string,
  limit: number = DEFAULT_MESSAGE_LIMIT,
  beforeId?: string
) {
  const response = await apiGet<unknown>(`/messages/${conversationId}`, {
    limit,
    before_id: beforeId,
  });

  return MessagesResponseSchema.parse(response);
}

export async function sendMessage(conversationId: string, content: string) {
  const response = await apiPost<unknown>(`/messages/${conversationId}/send`, {
    content,
  });

  return SendMessageResponseSchema.parse(response);
}

export async function startConversation(recipientId: string, message: string) {
  const response = await apiPost<unknown>('/messages/start', {
    recipient_id: recipientId,
    message,
  });

  return StartConversationResponseSchema.parse(response);
}

export async function respondToRequest(
  conversationId: string,
  action: 'accept' | 'decline'
) {
  const response = await apiPost<unknown>('/messages/respond', {
    conversation_id: conversationId,
    action,
  });

  return RespondToRequestResponseSchema.parse(response);
}

export async function markAsRead(conversationId: string) {
  const response = await apiPost<unknown>(`/messages/${conversationId}/read`);

  return MarkAsReadResponseSchema.parse(response);
}

export async function getUnreadCount() {
  const response = await apiGet<unknown>('/messages/unread-count');

  return UnreadCountResponseSchema.parse(response);
}
