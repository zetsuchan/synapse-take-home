import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { useUnreadCount } from '../hooks/useConversations';
import type { Conversation } from '../schemas/messages';
import ComposeScreen from '../screens/ComposeScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

export type MessagesStackParamList = {
  ConversationsList: undefined;
  MessageThread: {
    conversationId: string;
    otherUserName: string;
    seedConversation?: Conversation;
  };
  Compose: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Messages: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MessagesStack = createStackNavigator<MessagesStackParamList>();

function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen
        name="ConversationsList"
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />
      <MessagesStack.Screen
        name="MessageThread"
        component={MessageThreadScreen}
        options={{ title: 'Thread' }}
      />
      <MessagesStack.Screen name="Compose" component={ComposeScreen} options={{ title: 'New message' }} />
    </MessagesStack.Navigator>
  );
}

export default function RootNavigator() {
  const unreadCountQuery = useUnreadCount();
  const unreadCount = unreadCountQuery.data?.unread_count ?? 0;

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={WelcomeScreen} />
      <Tab.Screen
        name="Messages"
        component={MessagesStackNavigator}
        options={{
          headerShown: false,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}
