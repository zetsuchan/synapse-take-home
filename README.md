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

### Two-account testing note

User switching is fully implemented — tapping "Use User A / Use User B" on the Home tab calls `setAuthToken()` and `queryClient.clear()`, so all queries refetch under the new identity. The pending/accept flow was tested against the seeded recipients (Dr. Sarah Chen, Prof. Marcus Williams). A direct A→B message requires knowing User A's `user_id`, which no endpoint in this test environment exposes. In production this would be a non-issue as user IDs are surfaced through researcher profiles and search.

### QA helpers intentionally kept

A few developer aids were left in rather than removed before submission:

- **Conversation row user ID label** — shows `other_user.user_id` on each row to make it easy to copy a recipient ID for compose testing without needing to inspect network traffic.
- **Compose quick-pick recipients** — pre-fills the recipient field with known seeded users so the flow can be tested without manual ID lookup.
- **Welcome screen token prefix** — displays the first few characters of the active token to confirm which account is active after switching.

These would be removed before a production release but were useful throughout development and left in to make the test environment easier to navigate.

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

## Expo Compatibility & Environment Setup

### Initial environment

- iPhone running iOS 26.4 with the latest Expo Go app, which supports Expo SDK 54.
- This repo is pinned to Expo SDK 51 (`expo ~51.0.31` in `package.json`).

### Why iPhone testing failed

- Expo Go on device showed: *"Project is incompatible… Expo Go SDK 54 vs project SDK 51."*
- The App Store only carries the latest Expo Go build, so downgrading to SDK 51 on a physical device isn't possible without a custom dev client.

### Network attempts before switching to simulator

- Tunnel mode (`exp.direct`) hit a certificate error in this environment.
- LAN mode connected but was still blocked by the SDK mismatch on the real device.

### Workaround

Switched to iOS Simulator. Expo CLI can install a compatible Expo Go build for simulator regardless of the SDK pinned in the project, so the SDK 51 app runs cleanly there.

```bash
npm start -- --ios --clear
```

### Additional runtime issues fixed during setup

| Issue | Fix |
|---|---|
| Axios bundling error (Node `crypto` module) | Pinned axios to `1.7.7` in `package.json` |
| `main has not been registered` on launch | Added `index.js` with `registerRootComponent(App)`, updated `package.json` `main` to `index.js` |
| Metro disconnect warning (1001 stream end) | Restarted Metro cleanly and relaunched simulator |

### Current testing approach

All UI testing was run in iOS Simulator (SDK 51-compatible). The practical alternative without upgrading the entire repo to SDK 54 — which would be the right long-term fix but out of scope for this take-home.

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
