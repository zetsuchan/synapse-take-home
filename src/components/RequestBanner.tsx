import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Text, XStack, YStack } from 'tamagui';

import { respondToRequest } from '../api/messages';
import { queryKeys } from '../hooks/queryKeys';

type RequestBannerProps = {
  conversationId: string;
  onRespond?: (action: 'accept' | 'decline') => void;
};

export default function RequestBanner({ conversationId, onRespond }: RequestBannerProps) {
  const queryClient = useQueryClient();

  const responseMutation = useMutation({
    mutationFn: (action: 'accept' | 'decline') => respondToRequest(conversationId, action),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsActive });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
      onRespond?.(action);
    },
  });

  return (
    <YStack backgroundColor="$yellow2" padding="$3" gap="$3" borderRadius="$4">
      <Text fontWeight="700">Message request</Text>
      <Text color="$gray11">Accept this request to start replying in this thread.</Text>

      {responseMutation.isError && (
        <Text color="$red10">Could not update request right now. Try again.</Text>
      )}

      <XStack gap="$2">
        <Button
          flex={1}
          onPress={() => responseMutation.mutate('accept')}
          disabled={responseMutation.isPending}
          theme="active"
        >
          Accept
        </Button>
        <Button
          flex={1}
          onPress={() => responseMutation.mutate('decline')}
          disabled={responseMutation.isPending}
          theme="gray"
        >
          Decline
        </Button>
      </XStack>
    </YStack>
  );
}
