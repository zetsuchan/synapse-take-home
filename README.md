# Synapse Messaging Take-Home

## What I built

- Bottom tab navigation with a nested messaging stack:
  - `ConversationsList`
  - `MessageThread`
  - `Compose`
- Conversations inbox with:
  - Active conversations
  - Pending request section
  - Unread badges
  - Pull-to-refresh
  - Empty/error/loading states
- Message thread with:
  - Sent/received bubble styling
  - Cursor pagination (`before_id`) for older messages
  - Request/declined states
  - Read-marking on thread focus
  - Inline send failure handling + retry
- Compose flow:
  - Start conversation by recipient ID + message
  - Navigate into created thread (active or pending)

## Architecture

### Schema-first API boundary

All messaging API responses are validated in `src/api/messages.ts` using Zod schemas from `src/schemas/messages.ts`. Raw API payloads are parsed at the boundary so UI and hooks only consume typed data.

### Data layer and query structure

- React Query drives all server state.
- Query keys are centralized in `src/hooks/queryKeys.ts`.
- Hooks:
  - `useConversations` for active + request lists
  - `useMessages` for paginated thread data (`useInfiniteQuery`)
  - `useUnreadCount` for tab badge
- App foreground state is tracked via Jotai in `useAppForeground` and controls polling.

### UI/component split

- Screens orchestrate data and navigation.
- Components (`ConversationRow`, `MessageBubble`, `RequestBanner`, `MessageComposer`) focus on rendering and local interaction.

## Real-time strategy

### Current

- Inbox + unread count poll every 10s while app is foregrounded.
- Active thread poll every 5s while app is foregrounded.
- Polling pauses in background using `AppState` + Jotai.

### Evolution path

- Add WebSocket rooms per conversation.
- Push `new_message` events directly into React Query cache (`setQueryData`).
- Use exponential backoff reconnect.
- Keep push notifications (APNs/FCM) as the primary background delivery mechanism.
- On foreground resume: REST sync missed messages, then rejoin socket rooms.

## Trade-offs

- Focused on a robust typed data flow and core messaging UX over visual polish.
- Pagination currently appends by re-fetching older pages from API cursor; optimistic local sends are not yet implemented.
- Compose uses recipient ID input; production app should provide researcher search/autocomplete.

## Testing

Implemented two critical-path tests with Jest + React Native Testing Library:

- `ConversationRow`:
  - Name + preview rendering
  - Unread badge visibility behavior
  - Pending request indicator behavior
- `MessageComposer` send flow:
  - API call args verification
  - Input clears on success
  - Inline error and input preservation on failure

## Files added/updated

- `src/schemas/messages.ts`
- `src/api/messages.ts`
- `src/hooks/queryKeys.ts`
- `src/hooks/useAppForeground.ts`
- `src/hooks/useConversations.ts`
- `src/hooks/useMessages.ts`
- `src/components/ConversationRow.tsx`
- `src/components/MessageBubble.tsx`
- `src/components/RequestBanner.tsx`
- `src/components/MessageComposer.tsx`
- `src/screens/ConversationsScreen.tsx`
- `src/screens/MessageThreadScreen.tsx`
- `src/screens/ComposeScreen.tsx`
- `src/screens/WelcomeScreen.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/components/ConversationRow.test.tsx`
- `src/components/MessageComposer.test.tsx`
- `src/test/renderWithProviders.tsx`
- `README.md`
