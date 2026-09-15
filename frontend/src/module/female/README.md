# Female Feature Module

Female user-specific pages and components.

## Structure

- `components/` - Female-specific UI components
- `hooks/` - Female-specific hooks
- `services/` - Female-specific API calls
- `types/` - Female-specific TypeScript types
- `pages/` - Female user pages

## Pages

- `FemaleDashboard.tsx` - Main dashboard with earnings, stats, navigation
- `ChatListPage.tsx` - List of active conversations
- `ChatWindowPage.tsx` - Individual chat window (free messaging)
- `EarningsPage.tsx` - Earnings overview, charts, breakdown
- `WithdrawalPage.tsx` - Withdrawal request form and history
- `AutoMessageTemplatesPage.tsx` - Auto-message template management

## Responsibilities

- Female user dashboard and navigation
- Earnings tracking and display
- Withdrawal request management
- Auto-message template management
- Female-specific UI components

## Dependencies

- Uses `@features/chat` for messaging functionality
- Uses `@features/wallet` for wallet operations
- Uses `@features/profile` for profile management

