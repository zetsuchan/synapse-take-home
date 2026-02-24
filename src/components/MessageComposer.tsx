import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

import { sendMessage } from '../api/messages';
import type { Message } from '../schemas/messages';

type MessageComposerProps = {
  conversationId: string;
  onSent?: (message: Message) => void;
};

export default function MessageComposer({ conversationId, onSent }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMutation = useMutation({
    mutationFn: (value: string) => sendMessage(conversationId, value),
    onSuccess: (response) => {
      setContent('');
      setError(null);
      onSent?.(response.sent_message);
    },
    onError: () => {
      setError('Message failed to send. Please retry.');
    },
  });

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || sendMutation.isPending) {
      return;
    }

    sendMutation.mutate(trimmed);
  };

  return (
    <YStack padding="$3" borderTopWidth={1} borderTopColor="$gray4" gap="$2">
      {error && (
        <Text testID="send-error" color="$red10" fontSize="$2">
          {error}
        </Text>
      )}
      <XStack gap="$2" alignItems="center">
        <Input
          testID="message-input"
          flex={1}
          placeholder="Type a message"
          value={content}
          onChangeText={setContent}
          editable={!sendMutation.isPending}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Button
          testID="send-button"
          onPress={handleSend}
          disabled={!content.trim() || sendMutation.isPending}
        >
          Send
        </Button>
      </XStack>
    </YStack>
  );
}
