export const queryKeys = {
  conversationsActive: ['conversations', 'active'] as const,
  conversationsRequests: ['conversations', 'requests'] as const,
  unreadCount: ['messages', 'unread-count'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
};
