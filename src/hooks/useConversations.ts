import { useQuery } from '@tanstack/react-query';

import { getConversations, getMessageRequests, getUnreadCount } from '../api/messages';
import { queryKeys } from './queryKeys';
import { useAppForeground } from './useAppForeground';

export function useConversations() {
  const isForeground = useAppForeground();

  const activeConversationsQuery = useQuery({
    queryKey: queryKeys.conversationsActive,
    queryFn: () => getConversations('active'),
    refetchInterval: isForeground ? 10_000 : false,
  });

  const requestsQuery = useQuery({
    queryKey: queryKeys.conversationsRequests,
    queryFn: () => getMessageRequests(),
    refetchInterval: isForeground ? 10_000 : false,
  });

  return {
    activeConversationsQuery,
    requestsQuery,
    activeConversations: activeConversationsQuery.data?.conversations ?? [],
    requests: requestsQuery.data?.requests ?? [],
  };
}

export function useUnreadCount() {
  const isForeground = useAppForeground();

  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: isForeground ? 10_000 : false,
  });
}
