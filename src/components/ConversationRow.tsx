import { Pressable } from 'react-native';
import { Text, View, XStack, YStack } from 'tamagui';

import type { Conversation } from '../schemas/messages';

type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
};

function formatRelativeTime(timestamp: string | null) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const safeDiffMs = Math.max(0, diffMs);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const minutes = Math.floor(safeDiffMs / (1000 * 60));
  if (minutes < 1) {
    return 'now';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString();
}

function formatConversationTimestamp(lastMessageAt: string | null, createdAt: string) {
  const primary = formatRelativeTime(lastMessageAt);
  if (primary) {
    return primary;
  }

  const fallback = formatRelativeTime(createdAt);
  if (fallback) {
    return fallback;
  }

  return '--';
}

function getAvatarLetter(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

export default function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const unreadCount = conversation.unread_count;
  const isPending = conversation.status === 'pending';
  const timestampLabel = formatConversationTimestamp(
    conversation.last_message_at,
    conversation.created_at
  );

  return (
    <Pressable onPress={onPress} testID="conversation-row" accessibilityRole="button">
      <XStack
        padding="$3"
        gap="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$gray4"
        backgroundColor={isPending ? '$yellow2' : '$background'}
      >
        <View
          width={44}
          height={44}
          borderRadius={22}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isPending ? '$yellow6' : '$gray5'}
        >
          <Text fontWeight="700">{getAvatarLetter(conversation.other_user.name)}</Text>
        </View>

        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center" gap="$2">
            <Text testID="conversation-name" fontWeight="700" numberOfLines={1} flex={1}>
              {conversation.other_user.name}
            </Text>
            <Text color="$gray11" fontSize="$2" minWidth={36} textAlign="right">
              {timestampLabel}
            </Text>
          </XStack>

          <Text color="$gray10" fontSize="$1" numberOfLines={1}>
            ID: {conversation.other_user.user_id}
          </Text>

          <XStack alignItems="center" gap="$2">
            {isPending && (
              <Text testID="pending-indicator" color="$yellow11" fontWeight="600" fontSize="$2">
                Request
              </Text>
            )}
            <Text
              testID="conversation-preview"
              color="$gray11"
              flex={1}
              numberOfLines={1}
              fontSize="$3"
            >
              {conversation.last_message_preview ?? 'No messages yet'}
            </Text>
          </XStack>
        </YStack>

        {unreadCount > 0 && (
          <View
            testID="unread-badge"
            minWidth={24}
            height={24}
            borderRadius={12}
            paddingHorizontal="$2"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$blue9"
          >
            <Text color="white" fontWeight="700" fontSize="$2">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </XStack>
    </Pressable>
  );
}
