# Male Feature Module

Male user-specific pages and components.

## Structure

- `components/` - Male-specific UI components
- `hooks/` - Male-specific hooks
- `services/` - Male-specific API calls
- `types/` - Male-specific TypeScript types
- `pages/` - Male user pages

## Pages

- `MaleDashboard.tsx` - Main dashboard with wallet balance, quick stats, navigation
- `NearbyFemalesPage.tsx` - Location-based discovery of nearby females
- `ChatListPage.tsx` - List of active conversations
- `ChatWindowPage.tsx` - Individual chat window (uses chat feature components)
- `WalletPage.tsx` - Wallet balance and transaction history
- `CoinPurchasePage.tsx` - Coin plan selection and purchase

## Responsibilities

- Male user dashboard and navigation
- Discovery and matching interface
- Paid messaging flow
- Coin purchase flow
- Male-specific UI components

## Dependencies

- Uses `@features/chat` for messaging functionality
- Uses `@features/wallet` for wallet operations
- Uses `@features/payment` for coin purchases
- Uses `@features/discovery` for location-based matching
- Uses `@features/profile` for profile management

