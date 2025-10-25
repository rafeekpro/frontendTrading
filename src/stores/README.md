# Zustand Stores

This directory contains all Zustand state management stores for the application.

## Stores

### 1. Paper Trading Store (`paperTrading.ts`)

Manages paper trading account state including balance, positions, and trade history.

**Features:**
- Execute buy/sell trades with validation
- Track open positions with real-time P&L
- Close positions and calculate profit/loss
- Persist state to localStorage
- Reset account to initial state

**Usage:**
```typescript
import { usePaperTradingStore } from '@/stores';

// In a component
const { balance, positions, executeTrade, closePosition } = usePaperTradingStore();

// Execute a trade
const trade = executeTrade(instrument, 'buy', 1.0, 1.085);

// Close a position
const success = closePosition(positionId, 1.090);

// Get total P&L
const totalPnL = usePaperTradingStore.getState().getTotalPnL();
```

### 2. Watchlist Store (`watchlist.ts`)

Manages user's watchlist of instruments.

**Features:**
- Add/remove instruments from watchlist
- Check if instrument is watched
- Clear entire watchlist
- Persist to localStorage

**Usage:**
```typescript
import { useWatchlistStore } from '@/stores';

const { instruments, addInstrument, removeInstrument, hasInstrument } = useWatchlistStore();

// Add to watchlist
addInstrument('EUR_USD');

// Check if watched
if (hasInstrument('EUR_USD')) {
  // ...
}
```

### 3. AI Config Store (`aiConfig.ts`)

Manages AI provider configuration and settings.

**Features:**
- Select AI provider (OpenAI, Anthropic, Google, Local, None)
- Configure API keys and models
- Set temperature and max tokens
- Toggle AI features on/off
- Persist to localStorage

**Usage:**
```typescript
import { useAIConfigStore } from '@/stores';

const { provider, enabled, setProvider, setApiKey, toggleEnabled } = useAIConfigStore();

// Configure AI
setProvider('openai');
setApiKey('sk-...');
setModel('gpt-4');
```

## localStorage Keys

Each store persists to a unique localStorage key:

- `paper-trading-state` - Paper trading account state
- `trading-watchlist` - User's instrument watchlist
- `ai-config` - AI provider configuration

## Testing

All stores have comprehensive test coverage following TDD principles.

Run tests:
```bash
npm test -- src/stores/__tests__/
```

## Type Safety

All stores are fully typed with TypeScript. Import types from:

```typescript
import type {
  PaperTradingStore,
  WatchlistStore,
  AIConfigStore,
  Trade,
  Position,
} from '@/stores';
```

## Architecture

Built with:
- **Zustand** - Lightweight state management
- **persist middleware** - localStorage persistence
- **TypeScript** - Full type safety
- **Vitest** - Comprehensive test coverage

## Related

- Type definitions: `src/types/stores.ts`
- Trading types: `src/types/trading.ts`
- Tests: `src/stores/__tests__/`
