import ConversationRow from './ConversationRow';
import type { Conversation } from '../schemas/messages';
import { renderWithProviders } from '../test/renderWithProviders';

const baseConversation: Conversation = {
  conversation_id: 'conv-1',
  status: 'active',
  created_at: '2026-02-23T10:00:00+00:00',
  last_message_at: '2026-02-23T11:00:00+00:00',
  last_message_preview: 'Thanks for the paper link.',
  is_initiator: true,
  unread_count: 2,
  other_user: {
    user_id: 'user-2',
    name: 'Dr. Sarah Chen',
    verified: true,
    verified_author_id: 'A1234567',
    pic: null,
  },
};

describe('ConversationRow', () => {
  it('renders name, preview and unread badge when unread_count > 0', () => {
    const screen = renderWithProviders(
      <ConversationRow conversation={baseConversation} onPress={jest.fn()} />
    );

    expect(screen.getByTestId('conversation-name').props.children).toBe('Dr. Sarah Chen');
    expect(screen.getByTestId('conversation-preview').props.children).toBe('Thanks for the paper link.');
    expect(screen.getByTestId('unread-badge')).toBeTruthy();
  });

  it('hides unread badge when unread_count is 0 and marks pending requests', () => {
    const screen = renderWithProviders(
      <ConversationRow
        conversation={{ ...baseConversation, unread_count: 0, status: 'pending' }}
        onPress={jest.fn()}
      />
    );

    expect(screen.queryByTestId('unread-badge')).toBeNull();
    expect(screen.getByTestId('pending-indicator')).toBeTruthy();
  });
});
