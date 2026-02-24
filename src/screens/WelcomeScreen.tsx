import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Text, View, XStack, YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiGet, getActiveTokenPrefix, setAuthToken } from '../api/client';

const tokenA = process.env.EXPO_PUBLIC_API_TOKEN;
const tokenB = process.env.EXPO_PUBLIC_API_TOKEN_B;

export default function WelcomeScreen() {
  const queryClient = useQueryClient();

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<'A' | 'B'>('A');
  const [activeTokenPrefix, setActiveTokenPrefix] = useState(getActiveTokenPrefix());

  const checkApi = async () => {
    try {
      await apiGet<{ unread_count: number }>('/messages/unread-count');
      setApiStatus('connected');
      setErrorMessage(null);
    } catch (error) {
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (tokenA) {
      setAuthToken(tokenA);
      setActiveTokenPrefix(getActiveTokenPrefix());
    }
    checkApi();
  }, []);

  const switchToUser = async (user: 'A' | 'B') => {
    const token = user === 'A' ? tokenA : tokenB;

    if (!token) {
      setErrorMessage(`Missing token for User ${user} in .env`);
      setApiStatus('error');
      return;
    }

    setAuthToken(token);
    setActiveTokenPrefix(getActiveTokenPrefix());
    setActiveUser(user);
    queryClient.clear();
    await checkApi();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center" gap="$4">
        <Text fontSize="$8" fontWeight="700">
          Synapse Messaging
        </Text>

        <View
          padding="$4"
          borderRadius="$4"
          backgroundColor={
            apiStatus === 'connected' ? '$green2' : apiStatus === 'error' ? '$red2' : '$gray2'
          }
          width="100%"
        >
          <Text fontSize="$4" fontWeight="600">
            {apiStatus === 'checking' && 'Checking API connection...'}
            {apiStatus === 'connected' && 'API connected'}
            {apiStatus === 'error' && 'API connection failed'}
          </Text>
          {errorMessage && (
            <Text fontSize="$2" color="$red11" marginTop="$2">
              {errorMessage}
            </Text>
          )}
        </View>

        <YStack width="100%" gap="$2">
          <Text fontSize="$3" color="$gray11" textAlign="center">
            Current account: User {activeUser}
          </Text>
          <Text fontSize="$2" color="$gray10" textAlign="center">
            Token prefix: {activeTokenPrefix}
          </Text>
          <XStack gap="$2">
            <Button flex={1} onPress={() => switchToUser('A')} disabled={activeUser === 'A'}>
              Use User A
            </Button>
            <Button flex={1} onPress={() => switchToUser('B')} disabled={activeUser === 'B'}>
              Use User B
            </Button>
          </XStack>
        </YStack>

        <Text fontSize="$3" color="$gray11" textAlign="center" lineHeight="$4">
          Open the Messages tab to view conversations, requests, and threads.
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
