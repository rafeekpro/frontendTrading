---
issue: 10
title: MSW handlers for opportunities and AI (mock only)
analyzed: 2025-10-26T11:30:00Z
estimated_hours: 3
parallelization_factor: 1.0
---

# Task Analysis: Issue #10 - MSW Opportunities & AI Handlers

## Overview
Create MSW mock handlers for trading opportunities detection and AI analysis features. **All mock data** - no real AI providers called, just simulated responses for UI development and testing.

## Current State Assessment

### Existing MSW Infrastructure
From previous tasks, we have:
- ✅ MSW v2 setup (Task #20)
- ✅ Mock data generators (Task #21)
- ✅ Handlers for instruments, trades, positions (Tasks #7, #8, #9)

### What Needs to Be Done
Create 3 new MSW handlers:
1. **GET /api/opportunities** - Trading opportunities detection
2. **GET /api/ai/recommendations** - AI-powered trade recommendations
3. **GET /api/ai/screenshots** - Screenshot analysis history

## Parallel Streams

### Single Stream Approach
**Why Sequential**: Simple task with related handlers. No parallelization needed.

**Estimated Time**: 3 hours

## Implementation Plan

### Phase 1: Mock Data Generators (1 hour)
**Files to create:**
- `src/mocks/data/opportunities.ts` - Mock opportunity data generator
- `src/mocks/data/ai-recommendations.ts` - Mock AI recommendation generator
- `src/mocks/data/ai-screenshots.ts` - Mock screenshot data generator

**Tasks:**
1. Create opportunity data structure with detection criteria
2. Create AI recommendation structure with confidence scores
3. Create screenshot analysis history data
4. Use Faker.js for realistic data

### Phase 2: MSW Handlers (1 hour)
**Files to create:**
- `src/mocks/handlers/opportunities.ts` - Opportunities endpoint handlers
- `src/mocks/handlers/ai.ts` - AI endpoints handlers

**Files to update:**
- `src/mocks/handlers/index.ts` - Export new handlers

**Tasks:**
1. Implement GET /api/opportunities handler
2. Implement GET /api/ai/recommendations handler (with provider support)
3. Implement GET /api/ai/screenshots handler
4. Add realistic delays to simulate processing time
5. Support query parameters (instrumentId, provider)

### Phase 3: Testing (1 hour)
**Files to create:**
- `src/mocks/handlers/__tests__/opportunities.test.ts` - Handler tests
- `src/mocks/handlers/__tests__/ai.test.ts` - AI handler tests

**Tasks:**
1. Write tests for each endpoint
2. Test query parameter handling
3. Test different AI providers (OpenAI, Claude, Gemini)
4. Test error responses
5. Test response delays

## Technical Specifications

### Opportunity Data Structure
```typescript
// src/types/opportunity.ts
export interface TradingOpportunity {
  id: string;
  instrumentId: string;
  symbol: string;
  type: 'buy' | 'sell';
  detectionMethod: 'technical' | 'fundamental' | 'ai' | 'pattern';
  confidence: number; // 0-1
  signal: {
    name: string; // e.g., "Golden Cross", "RSI Oversold"
    description: string;
    strength: 'weak' | 'moderate' | 'strong';
  };
  price: {
    current: number;
    entry: number;
    target: number;
    stopLoss: number;
  };
  metrics: {
    riskRewardRatio: number;
    potentialGain: number; // percentage
    potentialLoss: number; // percentage
    probability: number; // 0-1
  };
  timeframe: string; // e.g., "1H", "4H", "1D"
  detectedAt: number; // timestamp
  expiresAt: number; // timestamp
  status: 'active' | 'expired' | 'triggered';
}
```

### AI Recommendation Structure
```typescript
// src/types/ai.ts
export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface AIRecommendation {
  id: string;
  instrumentId: string;
  symbol: string;
  provider: AIProvider;
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1
  reasoning: string; // AI-generated explanation
  analysis: {
    technical: string;
    fundamental: string;
    sentiment: string;
  };
  price: {
    current: number;
    targetPrice: number;
    stopLoss: number;
    timeframe: string;
  };
  risk: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  timestamp: number;
  modelVersion: string; // e.g., "gpt-4-turbo", "claude-3-opus"
}

export interface AIScreenshot {
  id: string;
  instrumentId: string;
  symbol: string;
  timestamp: number;
  provider: AIProvider;
  analysis: string;
  keyPoints: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  imageUrl?: string; // mock URL
}
```

### Opportunity Generator
```typescript
// src/mocks/data/opportunities.ts
import { faker } from '@faker-js/faker';
import type { TradingOpportunity } from '@/types/opportunity';

const SIGNALS = [
  { name: 'Golden Cross', description: 'MA50 crossed above MA200', strength: 'strong' },
  { name: 'RSI Oversold', description: 'RSI below 30', strength: 'moderate' },
  { name: 'Breakout', description: 'Price broke resistance', strength: 'strong' },
  { name: 'Double Bottom', description: 'Chart pattern detected', strength: 'moderate' },
  { name: 'MACD Bullish', description: 'MACD crossed above signal', strength: 'moderate' },
];

export function generateOpportunities(count: number = 10): TradingOpportunity[] {
  return Array.from({ length: count }, (_, i) => {
    const signal = faker.helpers.arrayElement(SIGNALS);
    const currentPrice = faker.number.float({ min: 1, max: 200, precision: 0.01 });
    const entry = currentPrice * faker.number.float({ min: 0.99, max: 1.01, precision: 0.0001 });
    const targetUpside = faker.number.float({ min: 1.02, max: 1.15, precision: 0.01 });
    const target = entry * targetUpside;
    const stopLoss = entry * faker.number.float({ min: 0.95, max: 0.99, precision: 0.01 });

    const potentialGain = ((target - entry) / entry) * 100;
    const potentialLoss = ((entry - stopLoss) / entry) * 100;
    const riskRewardRatio = potentialGain / potentialLoss;

    return {
      id: `opp-${i + 1}`,
      instrumentId: `inst-${faker.number.int({ min: 1, max: 20 })}`,
      symbol: faker.helpers.arrayElement(['EUR/USD', 'GBP/USD', 'BTC/USD', 'ETH/USD', 'AAPL', 'TSLA']),
      type: faker.helpers.arrayElement(['buy', 'sell'] as const),
      detectionMethod: faker.helpers.arrayElement(['technical', 'fundamental', 'ai', 'pattern'] as const),
      confidence: faker.number.float({ min: 0.6, max: 0.95, precision: 0.01 }),
      signal: {
        name: signal.name,
        description: signal.description,
        strength: signal.strength as 'weak' | 'moderate' | 'strong',
      },
      price: {
        current: currentPrice,
        entry,
        target,
        stopLoss,
      },
      metrics: {
        riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
        potentialGain: parseFloat(potentialGain.toFixed(2)),
        potentialLoss: parseFloat(potentialLoss.toFixed(2)),
        probability: faker.number.float({ min: 0.5, max: 0.85, precision: 0.01 }),
      },
      timeframe: faker.helpers.arrayElement(['15M', '1H', '4H', '1D']),
      detectedAt: Date.now() - faker.number.int({ min: 0, max: 3600000 }), // last hour
      expiresAt: Date.now() + faker.number.int({ min: 3600000, max: 86400000 }), // 1-24 hours
      status: faker.helpers.arrayElement(['active', 'active', 'active', 'expired'] as const), // 75% active
    };
  });
}
```

### AI Recommendation Generator
```typescript
// src/mocks/data/ai-recommendations.ts
import { faker } from '@faker-js/faker';
import type { AIRecommendation, AIProvider } from '@/types/ai';

const MODEL_VERSIONS = {
  openai: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
  claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  gemini: ['gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-1.0-pro-vision'],
};

const REASONING_TEMPLATES = {
  buy: [
    'Technical indicators suggest strong upward momentum. RSI shows oversold conditions with potential for reversal.',
    'Fundamental analysis indicates undervaluation. Strong earnings beat and positive guidance.',
    'Chart pattern shows bullish breakout above resistance. Volume confirms the move.',
    'Sentiment analysis reveals increasing positive mentions. Market positioning favorable.',
  ],
  sell: [
    'Technical indicators show overbought conditions. Risk of pullback increasing.',
    'Fundamental concerns around valuation. PE ratio significantly above sector average.',
    'Chart pattern suggests potential reversal. Bearish divergence detected.',
    'Sentiment turning negative. Institutional selling pressure observed.',
  ],
  hold: [
    'Mixed signals from technical and fundamental analysis. Best to wait for clearer direction.',
    'Current price action suggests consolidation. No strong catalyst in either direction.',
    'Risk-reward ratio not favorable at current levels. Better entry points may emerge.',
    'Market conditions uncertain. Prudent to maintain current position.',
  ],
};

export function generateAIRecommendation(
  instrumentId: string,
  symbol: string,
  provider: AIProvider = 'openai'
): AIRecommendation {
  const action = faker.helpers.arrayElement(['buy', 'sell', 'hold'] as const);
  const currentPrice = faker.number.float({ min: 10, max: 500, precision: 0.01 });
  const targetMultiplier = action === 'buy' ? 1.05 : action === 'sell' ? 0.95 : 1.0;
  const targetPrice = currentPrice * faker.number.float({
    min: targetMultiplier - 0.02,
    max: targetMultiplier + 0.02,
    precision: 0.01,
  });
  const stopLoss = action === 'buy'
    ? currentPrice * 0.97
    : action === 'sell'
    ? currentPrice * 1.03
    : currentPrice * 0.98;

  return {
    id: faker.string.uuid(),
    instrumentId,
    symbol,
    provider,
    action,
    confidence: faker.number.float({ min: 0.65, max: 0.92, precision: 0.01 }),
    reasoning: faker.helpers.arrayElement(REASONING_TEMPLATES[action]),
    analysis: {
      technical: `${faker.helpers.arrayElement(['Bullish', 'Bearish', 'Neutral'])} technical setup with ${faker.helpers.arrayElement(['strong', 'moderate', 'weak'])} momentum indicators.`,
      fundamental: `Valuation appears ${faker.helpers.arrayElement(['attractive', 'fair', 'stretched'])} based on current metrics.`,
      sentiment: `Market sentiment is ${faker.helpers.arrayElement(['positive', 'negative', 'mixed'])} with ${faker.helpers.arrayElement(['increasing', 'stable', 'decreasing'])} interest.`,
    },
    price: {
      current: currentPrice,
      targetPrice,
      stopLoss,
      timeframe: faker.helpers.arrayElement(['1D', '1W', '1M']),
    },
    risk: {
      level: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
      factors: faker.helpers.arrayElements([
        'Market volatility',
        'Geopolitical events',
        'Earnings uncertainty',
        'Regulatory changes',
        'Currency fluctuations',
        'Sector rotation',
      ], faker.number.int({ min: 1, max: 3 })),
    },
    timestamp: Date.now(),
    modelVersion: faker.helpers.arrayElement(MODEL_VERSIONS[provider]),
  };
}
```

### MSW Handlers Implementation
```typescript
// src/mocks/handlers/opportunities.ts
import { http, HttpResponse, delay } from 'msw';
import { generateOpportunities } from '@/mocks/data/opportunities';

export const opportunitiesHandlers = [
  // GET /api/opportunities
  http.get('/api/opportunities', async ({ request }) => {
    await delay(300); // Simulate processing time

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const opportunities = generateOpportunities(limit).filter(
      (opp) => status === 'all' || opp.status === status
    );

    return HttpResponse.json({
      opportunities,
      total: opportunities.length,
      status,
    });
  }),
];
```

```typescript
// src/mocks/handlers/ai.ts
import { http, HttpResponse, delay } from 'msw';
import { generateAIRecommendation } from '@/mocks/data/ai-recommendations';
import type { AIProvider } from '@/types/ai';

export const aiHandlers = [
  // GET /api/ai/recommendations
  http.get('/api/ai/recommendations', async ({ request }) => {
    await delay(1000); // Simulate AI processing time (longer)

    const url = new URL(request.url);
    const instrumentId = url.searchParams.get('instrumentId') || 'inst-1';
    const symbol = url.searchParams.get('symbol') || 'EUR/USD';
    const provider = (url.searchParams.get('provider') || 'openai') as AIProvider;

    const recommendation = generateAIRecommendation(instrumentId, symbol, provider);

    return HttpResponse.json(recommendation);
  }),

  // GET /api/ai/screenshots
  http.get('/api/ai/screenshots', async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const instrumentId = url.searchParams.get('instrumentId');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Generate mock screenshot history
    const screenshots = Array.from({ length: limit }, (_, i) => ({
      id: `ss-${i + 1}`,
      instrumentId: instrumentId || `inst-${faker.number.int({ min: 1, max: 10 })}`,
      symbol: faker.helpers.arrayElement(['EUR/USD', 'BTC/USD', 'AAPL']),
      timestamp: Date.now() - i * 3600000, // 1 hour apart
      provider: faker.helpers.arrayElement(['openai', 'claude', 'gemini'] as const),
      analysis: faker.helpers.arrayElement([
        'Bullish pattern detected with strong momentum',
        'Bearish divergence forming, potential reversal',
        'Consolidation phase, awaiting breakout',
        'Strong support level holding, good entry point',
      ]),
      keyPoints: faker.helpers.arrayElements([
        'Price above MA200',
        'RSI in neutral zone',
        'Volume increasing',
        'Breakout confirmed',
        'Support at 1.0500',
      ], faker.number.int({ min: 2, max: 4 })),
      sentiment: faker.helpers.arrayElement(['bullish', 'bearish', 'neutral'] as const),
      confidence: faker.number.float({ min: 0.6, max: 0.9, precision: 0.01 }),
      imageUrl: `https://example.com/screenshots/${i + 1}.png`,
    }));

    return HttpResponse.json({
      screenshots,
      total: screenshots.length,
    });
  }),
];
```

## Testing Strategy

### Unit Tests
1. **Opportunity Handler Tests**:
   - Test GET /api/opportunities returns data
   - Test status filtering (active, expired, all)
   - Test limit parameter
   - Test response structure

2. **AI Recommendation Handler Tests**:
   - Test GET /api/ai/recommendations returns data
   - Test provider parameter (openai, claude, gemini)
   - Test instrumentId parameter
   - Test response delay (1000ms)
   - Test response structure with all fields

3. **Screenshot Handler Tests**:
   - Test GET /api/ai/screenshots returns data
   - Test instrumentId filtering
   - Test limit parameter
   - Test chronological ordering

### Integration Tests
1. Test handlers work with TanStack Query
2. Test error responses
3. Test concurrent requests

## TDD Cycle

### Phase 1: Mock Data Generators
1. **RED**: Write failing tests for data generators
2. **GREEN**: Implement generators with Faker.js
3. **REFACTOR**: Extract templates and constants

### Phase 2: MSW Handlers
1. **RED**: Write failing tests for handlers
2. **GREEN**: Implement MSW handlers
3. **REFACTOR**: Extract common handler logic

### Phase 3: Integration
1. **RED**: Write failing integration tests
2. **GREEN**: Integrate handlers into MSW setup
3. **REFACTOR**: Optimize response structure

## Dependencies

### Existing Dependencies
- ✅ MSW v2 (Task #20)
- ✅ Faker.js (Task #21)
- ✅ TypeScript types infrastructure

### New Dependencies
- None required (all existing)

## Success Criteria

- ✅ 3 new endpoints working (/api/opportunities, /api/ai/recommendations, /api/ai/screenshots)
- ✅ Realistic mock data with Faker.js
- ✅ Support for query parameters
- ✅ Proper response delays
- ✅ Multiple AI provider support
- ✅ All tests passing
- ✅ TDD cycle followed
- ✅ TypeScript type safety

## Expected Outcomes

**Files Created**: ~6-8 files
- 3 data generator files
- 2 handler files
- 2-3 test files

**Tests Created**: ~20 tests
- Data generator tests (~8)
- Handler tests (~12)

**API Endpoints**:
- GET /api/opportunities (with status, limit params)
- GET /api/ai/recommendations (with instrumentId, symbol, provider params)
- GET /api/ai/screenshots (with instrumentId, limit params)

## Notes

**Important Considerations:**

1. **Mock Only**: No real AI API calls. All responses are generated locally.

2. **Realistic Delays**: Simulate processing time (1000ms for AI, 300ms for opportunities).

3. **Provider Support**: Support OpenAI, Claude, Gemini for future UI provider selection.

4. **Data Quality**: Use Faker.js for realistic but deterministic data (with seeds if needed).

5. **Query Parameters**: Support filtering and pagination for realistic API behavior.

**Future Enhancements** (not in scope):
- Real AI provider integration
- Screenshot upload and analysis
- Opportunity alerts/notifications
- Historical opportunity tracking
- AI model performance comparison

---

**Analysis Complete**: Ready for implementation with clear single-stream approach.
