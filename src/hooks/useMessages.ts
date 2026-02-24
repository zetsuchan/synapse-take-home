import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getMessages } from '../api/messages';
import { queryKeys } from './queryKeys';
import { useAppForeground } from './useAppForeground';

export function useMessages(conversationId: string, enabled: boolean = true) {
  const isForeground = useAppForeground();

  const query = useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: ({ pageParam }) => getMessages(conversationId, 50, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more || lastPage.messages.length === 0) {
        return undefined;
      }

      return lastPage.messages[lastPage.messages.length - 1].message_id;
    },
    enabled: Boolean(conversationId) && enabled,
    refetchInterval: isForeground && enabled ? 5_000 : false,
  });

  const messages = useMemo(() => {
    if (!query.data) {
      return [];
    }

    return query.data.pages.flatMap((page) => page.messages);
  }, [query.data]);

  const conversation = query.data?.pages[0]?.conversation;

  return {
    ...query,
    messages,
    conversation,
  };
}
