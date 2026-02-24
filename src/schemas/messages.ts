import { z } from 'zod';

export const ConversationStatusSchema = z.enum(['active', 'pending', 'declined']);

export const OtherUserSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  verified: z.boolean().optional().default(false),
  verified_author_id: z.string().nullable().optional(),
  pic: z.string().nullable().optional(),
});

export const ConversationSchema = z.object({
  conversation_id: z.string(),
  status: ConversationStatusSchema,
  created_at: z.string().optional().default(''),
  last_message_at: z.string().nullable().optional().default(null),
  last_message_preview: z.string().nullable().optional().default(null),
  is_initiator: z.boolean(),
  unread_count: z.number().optional().default(0),
  other_user: OtherUserSchema,
});

export const MessageSchema = z.object({
  message_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  read_at: z.string().nullable().optional().default(null),
  is_mine: z.boolean(),
});

export const ConversationsListResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  page: z.number(),
  limit: z.number(),
  total_count: z.number(),
  has_more: z.boolean(),
});

export const MessageRequestsResponseSchema = z.object({
  requests: z.array(ConversationSchema),
  page: z.number(),
  limit: z.number(),
  total_count: z.number(),
  has_more: z.boolean(),
});

export const MessagesResponseSchema = z.object({
  messages: z.array(MessageSchema).optional().default([]),
  conversation: ConversationSchema,
  has_more: z.boolean().optional().default(false),
});

export const StartConversationResponseSchema = z.object({
  message: z.string(),
  conversation: ConversationSchema,
  sent_message: MessageSchema.optional(),
});

export const SendMessageResponseSchema = z.object({
  message: z.string(),
  sent_message: MessageSchema,
});

export const RespondToRequestResponseSchema = z.object({
  message: z.string(),
  conversation: ConversationSchema,
});

export const MarkAsReadResponseSchema = z.object({
  message: z.string(),
  marked_count: z.number(),
});

export const UnreadCountResponseSchema = z.object({
  unread_count: z.number(),
});

export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;
export type OtherUser = z.infer<typeof OtherUserSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;

export type ConversationsListResponse = z.infer<typeof ConversationsListResponseSchema>;
export type MessageRequestsResponse = z.infer<typeof MessageRequestsResponseSchema>;
export type MessagesResponse = z.infer<typeof MessagesResponseSchema>;
export type StartConversationResponse = z.infer<typeof StartConversationResponseSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
export type RespondToRequestResponse = z.infer<typeof RespondToRequestResponseSchema>;
export type MarkAsReadResponse = z.infer<typeof MarkAsReadResponseSchema>;
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;
