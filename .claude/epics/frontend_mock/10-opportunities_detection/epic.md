---
name: opportunities-detection
status: backlog
created: '2025-10-26T00:00:00.000Z'
progress: 0
prd: .claude/prds/frontend_mock.md
github: '[Will be updated when synced to GitHub]'
priority: P1
type: frontend
dependencies: [5, 7]
epic_number: 10
---

# Epic 10: Opportunities Detection

## Overview
Opportunities detection UI with mock data for trading signals and AI-generated recommendations.

## Scope
This epic covers Feature #8 from PRD (P1 - Should Have):
- Opportunities list page with mock data
- Opportunity cards with detection criteria display
- Filter and sort functionality
- Opportunity detail modal with comprehensive information
- Mock AI analysis integration

## Dependencies
- Epic 5: Data Layer (for mock data infrastructure)
- Epic 7: Dashboard (for navigation and layout)

## Success Criteria
- All 5 tasks implemented and tested
- Mock opportunities data with realistic trading signals
- Filterable and sortable opportunities list
- Detailed opportunity view with analysis
- MSW handlers for opportunities API
- All tests passing with 100% coverage
- Code review passed
- UI/UX review approved

## Estimated Effort
**1.5 weeks**

## Technical Approach

### Mock Data Structure
```typescript
interface Opportunity {
  id: string;
  instrumentId: string;
  instrumentSymbol: string;
  type: 'long' | 'short';
  detectionCriteria: string[];
  confidence: number; // 0-100
  aiAnalysis: string;
  aiProvider: 'openai' | 'claude' | 'gemini';
  detectedAt: Date;
  priceAtDetection: number;
  targetPrice: number;
  stopLoss: number;
  potentialReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'expired' | 'triggered';
  expiresAt: Date;
}
```

### Component Architecture
- OpportunitiesList page with infinite scroll
- OpportunityCard component with key metrics
- OpportunityDetailModal with charts
- Filter panel (by type, risk, confidence, status)
- Sort options (by date, confidence, potential return)

### Integration Points
- TanStack Query for data fetching
- Zustand for filter/sort state
- MSW for API mocking
- Recharts for opportunity charts

## Risk Factors
- Dependency on Epic 5 (Data Layer)
- Dependency on Epic 7 (Dashboard)
- Estimated complexity: Medium
- Mock AI analysis must feel realistic

## Notes
- Feature #8 from PRD (P1 - Should Have)
- Mock data should include 50+ opportunities
- AI analysis text should be comprehensive and realistic
- Detection criteria should match common trading patterns

---
*Generated on 2025-10-26T00:00:00.000Z for frontend_mock PRD*
