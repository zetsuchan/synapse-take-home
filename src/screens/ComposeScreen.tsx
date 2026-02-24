import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Button, Input, ScrollView, Text, TextArea, XStack, YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { startConversation } from '../api/messages';
import { useConversations } from '../hooks/useConversations';
import { queryKeys } from '../hooks/queryKeys';
import type { MessagesStackParamList } from '../navigation/RootNavigator';

type Navigation = StackNavigationProp<MessagesStackParamList, 'Compose'>;

const SEEDED_QA_RECIPIENTS = [
  { userId: '699cf1441437424f4a5298ea', name: 'Dr. Sarah Chen' },
  { userId: '699cf1441437424f4a5298eb', name: 'Prof. Marcus Williams' },
] as const;

export default function ComposeScreen() {
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const { activeConversations, requests } = useConversations();

  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickRecipients = useMemo(() => {
    const unique = new Map<
      string,
      { userId: string; name: string; status: 'active' | 'pending' | 'seeded' }
    >();

    [...requests, ...activeConversations].forEach((conversation) => {
      const userId = conversation.other_user.user_id;
      if (!userId || unique.has(userId)) {
        return;
      }

      unique.set(userId, {
        userId,
        name: conversation.other_user.name,
        status: conversation.status === 'pending' ? 'pending' : 'active',
      });
    });

    SEEDED_QA_RECIPIENTS.forEach((seededRecipient) => {
      if (unique.has(seededRecipient.userId)) {
        return;
      }

      unique.set(seededRecipient.userId, {
        userId: seededRecipient.userId,
        name: seededRecipient.name,
        status: 'seeded',
      });
    });

    return Array.from(unique.values());
  }, [activeConversations, requests]);

  const startConversationMutation = useMutation({
    mutationFn: ({ recipient, content }: { recipient: string; content: string }) =>
      startConversation(recipient, content),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsActive });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount });

      navigation.replace('MessageThread', {
        conversationId: response.conversation.conversation_id,
        otherUserName: response.conversation.other_user.name,
        seedConversation: response.conversation,
      });
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to start conversation.');
    },
  });

  const handleSubmit = () => {
    const trimmedRecipient = recipientId.trim();
    const trimmedMessage = message.trim();

    if (!trimmedRecipient || !trimmedMessage || startConversationMutation.isPending) {
      return;
    }

    setError(null);
    startConversationMutation.mutate({ recipient: trimmedRecipient, content: trimmedMessage });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <YStack flex={1} padding="$4" gap="$3">
        <Text fontSize="$6" fontWeight="700">
          New conversation
        </Text>

        <YStack gap="$2">
          <Text fontWeight="600">Recipient ID</Text>
          <Input
            placeholder="Enter recipient user ID"
            value={recipientId}
            onChangeText={setRecipientId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {quickRecipients.length > 0 && (
            <YStack gap="$2">
              <Text color="$gray11" fontSize="$2">
                Quick pick recipients
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingVertical="$1">
                  {quickRecipients.map((recipient) => (
                    <Button
                      key={recipient.userId}
                      size="$2"
                      theme={recipient.status === 'pending' ? 'yellow' : 'gray'}
                      onPress={() => setRecipientId(recipient.userId)}
                    >
                      {recipient.name}
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
              <Text color="$gray10" fontSize="$1">
                Includes current inbox users plus seeded QA recipients.
              </Text>
            </YStack>
          )}
          <Text color="$gray10" fontSize="$1">
            Tip: user IDs are shown on conversation rows for copy/paste QA.
          </Text>
        </YStack>

        <YStack gap="$2" flex={1}>
          <Text fontWeight="600">Message</Text>
          <TextArea
            placeholder="Write your first message"
            value={message}
            onChangeText={setMessage}
            minHeight={140}
            textAlignVertical="top"
            flex={1}
          />
        </YStack>

        {error && <Text color="$red10">{error}</Text>}

        <Button
          onPress={handleSubmit}
          disabled={!recipientId.trim() || !message.trim() || startConversationMutation.isPending}
        >
          {startConversationMutation.isPending ? 'Sending...' : 'Send message'}
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
