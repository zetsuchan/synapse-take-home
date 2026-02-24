import { useCallback, useLayoutEffect, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Button, Spinner, Text, YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { markAsRead } from '../api/messages';
import MessageBubble from '../components/MessageBubble';
import MessageComposer from '../components/MessageComposer';
import RequestBanner from '../components/RequestBanner';
import { queryKeys } from '../hooks/queryKeys';
import { useMessages } from '../hooks/useMessages';
import type { Conversation, ConversationsListResponse, Message } from '../schemas/messages';
import type { MessagesStackParamList } from '../navigation/RootNavigator';

type ThreadRoute = RouteProp<MessagesStackParamList, 'MessageThread'>;
type ThreadNavigation = StackNavigationProp<MessagesStackParamList, 'MessageThread'>;

export default function MessageThreadScreen() {
  const route = useRoute<ThreadRoute>();
  const navigation = useNavigation<ThreadNavigation>();
  const queryClient = useQueryClient();

  const { conversationId, otherUserName, seedConversation } = route.params;
  const [localConversation, setLocalConversation] = useState<Conversation | undefined>(seedConversation);

  const shouldLoadMessages = !localConversation || localConversation.status === 'active';

  const {
    messages,
    conversation: fetchedConversation,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useMessages(conversationId, shouldLoadMessages);

  const conversation = fetchedConversation ?? localConversation;

  useLayoutEffect(() => {
    navigation.setOptions({ title: otherUserName });
  }, [navigation, otherUserName]);

  useFocusEffect(
    useCallback(() => {
      if (conversation?.status !== 'active') {
        return undefined;
      }

      let isCancelled = false;

      const runMarkAsRead = async () => {
        try {
          await markAsRead(conversationId);
          if (isCancelled) {
            return;
          }

          queryClient.invalidateQueries({ queryKey: queryKeys.conversationsActive });
          queryClient.invalidateQueries({ queryKey: queryKeys.conversationsRequests });
          queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
        } catch {
          // This should not block thread rendering.
        }
      };

      runMarkAsRead();

      return () => {
        isCancelled = true;
      };
    }, [conversation?.status, conversationId, queryClient])
  );

  const handleMessageSent = (sentMessage: Message) => {
    queryClient.setQueryData(
      queryKeys.conversationsActive,
      (previous: ConversationsListResponse | undefined) => {
        if (!previous) {
          return previous;
        }

        const nextConversations = previous.conversations
          .map((item) => {
            if (item.conversation_id !== conversationId) {
              return item;
            }

            return {
              ...item,
              status: 'active' as const,
              last_message_at: sentMessage.created_at,
              last_message_preview: sentMessage.content,
            };
          })
          .sort((a, b) => {
            const aTime = new Date(a.last_message_at ?? a.created_at).getTime();
            const bTime = new Date(b.last_message_at ?? b.created_at).getTime();
            return bTime - aTime;
          });

        return {
          ...previous,
          conversations: nextConversations,
        };
      }
    );

    queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.conversationsActive });
    queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });
  };

  const handleRequestRespond = (action: 'accept' | 'decline') => {
    if (!localConversation) {
      return;
    }

    if (action === 'accept') {
      setLocalConversation({ ...localConversation, status: 'active' });
      return;
    }

    setLocalConversation({ ...localConversation, status: 'declined' });
  };

  if (shouldLoadMessages && isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
          <Spinner size="large" />
          <Text>Loading thread...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (shouldLoadMessages && isError) {
    const errorMessage = error instanceof Error ? error.message : 'Could not load this conversation.';

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$3" padding="$4">
          <Text textAlign="center">{errorMessage}</Text>
          <Button onPress={() => refetch()}>Retry</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <YStack flex={1}>
        {shouldLoadMessages ? (
          <FlashList
            data={messages}
            inverted
            keyExtractor={(item) => item.message_id}
            estimatedItemSize={92}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={
              conversation?.status === 'active' ? (
                <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
                  <Text color="$gray11">Say something to start the conversation.</Text>
                </YStack>
              ) : null
            }
            renderItem={({ item }) => <MessageBubble message={item} />}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.2}
          />
        ) : (
          <YStack flex={1} justifyContent="center" padding="$4" gap="$3">
            <Text color="$gray11" textAlign="center">
              Review the incoming request before replying.
            </Text>
            {conversation?.last_message_preview && (
              <YStack backgroundColor="$gray3" borderRadius="$4" padding="$3" gap="$2">
                <Text fontWeight="700">Opening message</Text>
                <Text>{conversation.last_message_preview}</Text>
              </YStack>
            )}
          </YStack>
        )}

        {shouldLoadMessages && isFetchingNextPage && (
          <YStack padding="$2" alignItems="center">
            <Text color="$gray10" fontSize="$2">
              Loading older messages...
            </Text>
          </YStack>
        )}

        {conversation?.status === 'pending' && !conversation.is_initiator && (
          <YStack padding="$3">
            <RequestBanner conversationId={conversationId} onRespond={handleRequestRespond} />
          </YStack>
        )}

        {conversation?.status === 'pending' && conversation.is_initiator && (
          <YStack padding="$3" backgroundColor="$yellow2">
            <Text color="$yellow11">Request sent - waiting for approval.</Text>
          </YStack>
        )}

        {conversation?.status === 'declined' && (
          <YStack padding="$3" backgroundColor="$gray3">
            <Text color="$gray11">This request was declined.</Text>
          </YStack>
        )}

        {conversation?.status === 'active' && (
          <MessageComposer conversationId={conversationId} onSent={handleMessageSent} />
        )}
      </YStack>
    </SafeAreaView>
  );
}
