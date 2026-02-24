import { useLayoutEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import { Button, Spinner, Text, View, YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConversationRow from '../components/ConversationRow';
import { useConversations } from '../hooks/useConversations';
import type { MessagesStackParamList } from '../navigation/RootNavigator';

type Navigation = StackNavigationProp<MessagesStackParamList, 'ConversationsList'>;

export default function ConversationsScreen() {
  const navigation = useNavigation<Navigation>();
  const { activeConversationsQuery, requestsQuery, activeConversations, requests } = useConversations();
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button size="$2" onPress={() => navigation.navigate('Compose')}>
          Compose
        </Button>
      ),
    });
  }, [navigation]);

  const isLoading = activeConversationsQuery.isLoading || requestsQuery.isLoading;
  const hasError = activeConversationsQuery.isError || requestsQuery.isError;
  const refreshAll = async () => {
    setIsPullRefreshing(true);
    await Promise.all([activeConversationsQuery.refetch(), requestsQuery.refetch()]);
    setIsPullRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
          <Spinner size="large" />
          <Text>Loading conversations...</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$3">
          <Text textAlign="center">Could not load messages.</Text>
          <Button onPress={refreshAll}>Retry</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const isEmpty = activeConversations.length === 0 && requests.length === 0;

  if (isEmpty) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$3">
          <Text fontSize="$6" fontWeight="700">
            No conversations yet
          </Text>
          <Text color="$gray11" textAlign="center">
            Start a new message to connect with another researcher.
          </Text>
          <Button onPress={() => navigation.navigate('Compose')}>Start conversation</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <FlashList
        data={activeConversations}
        keyExtractor={(item) => item.conversation_id}
        estimatedItemSize={86}
        refreshControl={<RefreshControl refreshing={isPullRefreshing} onRefresh={refreshAll} />}
        ListHeaderComponent={
          requests.length > 0 ? (
            <YStack paddingTop="$2">
              <Text paddingHorizontal="$3" paddingVertical="$2" color="$gray11" fontWeight="700">
                Pending requests
              </Text>
              {requests.map((request) => (
                <ConversationRow
                  key={request.conversation_id}
                  conversation={request}
                  onPress={() =>
                    navigation.navigate('MessageThread', {
                      conversationId: request.conversation_id,
                      otherUserName: request.other_user.name,
                      seedConversation: request,
                    })
                  }
                />
              ))}
              <View height={8} backgroundColor="$gray2" />
              <Text paddingHorizontal="$3" paddingVertical="$2" color="$gray11" fontWeight="700">
                Active conversations
              </Text>
            </YStack>
          ) : null
        }
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() =>
              navigation.navigate('MessageThread', {
                conversationId: item.conversation_id,
                otherUserName: item.other_user.name,
                seedConversation: item,
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}
