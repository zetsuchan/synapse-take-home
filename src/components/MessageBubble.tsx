import { Text, XStack, YStack } from 'tamagui';

import type { Message } from '../schemas/messages';

type MessageBubbleProps = {
  message: Message;
};

function formatMessageTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.is_mine;

  return (
    <YStack
      alignSelf={isMine ? 'flex-end' : 'flex-start'}
      maxWidth="82%"
      marginVertical="$1"
      gap="$1"
    >
      <XStack
        padding="$3"
        borderRadius="$4"
        backgroundColor={isMine ? '$blue9' : '$gray4'}
      >
        <Text color={isMine ? 'white' : '$color'}>{message.content}</Text>
      </XStack>
      <Text fontSize="$1" color="$gray10" textAlign={isMine ? 'right' : 'left'}>
        {formatMessageTime(message.created_at)}
      </Text>
    </YStack>
  );
}
