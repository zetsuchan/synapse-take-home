import { fireEvent, waitFor } from '@testing-library/react-native';

import MessageComposer from './MessageComposer';
import { sendMessage } from '../api/messages';
import { renderWithProviders } from '../test/renderWithProviders';

jest.mock('../api/messages', () => ({
  sendMessage: jest.fn(),
}));

const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;

describe('MessageComposer', () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
  });

  it('sends a message, calls API with args, and clears input on success', async () => {
    mockSendMessage.mockResolvedValue({
      message: 'Message sent',
      sent_message: {
        message_id: 'msg-1',
        content: 'Hello there',
        created_at: '2026-02-24T12:00:00+00:00',
        read_at: null,
        is_mine: true,
      },
    });

    const screen = renderWithProviders(<MessageComposer conversationId="conv-1" />);

    fireEvent.changeText(screen.getByTestId('message-input'), 'Hello there');
    fireEvent.press(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('conv-1', 'Hello there');
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-input').props.value).toBe('');
    });
  });

  it('shows error and preserves input on failure', async () => {
    mockSendMessage.mockRejectedValue(new Error('network failed'));

    const screen = renderWithProviders(<MessageComposer conversationId="conv-1" />);

    fireEvent.changeText(screen.getByTestId('message-input'), 'Retry message');
    fireEvent.press(screen.getByTestId('send-button'));

    await waitFor(() => {
      expect(screen.getByTestId('send-error')).toBeTruthy();
    });

    expect(screen.getByTestId('message-input').props.value).toBe('Retry message');
  });
});
