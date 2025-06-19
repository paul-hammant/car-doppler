# Doppler Speed Detector (Cypress Testing Branch)

A React TypeScript application that uses Doppler shift analysis to detect vehicle speeds through audio processing. See footer for "wildly inaccurate" warning.

This branch demonstrates the same [UI Component Testing pattern](https://paulhammant.com/2017/02/01/ui-component-testing/) using **Cypress** instead of Playwright for component testing.

Very much a work in progress, but the deployed site is [https://paul-hammant.github.io/car-doppler/](https://paul-hammant.github.io/car-doppler/).

## Quick Start - See the Component Testing Pattern

```bash
npm install
npm run cy:open
```

This will open Cypress and you can run component tests to see:
- Component behavior
- Test harness state changes  
- Event coupling trace

The tests demonstrate **mph → km/h → mph** conversion with visual verification.

# Developer Advice

## Workstation setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Verify Setup**
   ```bash
   npm run typecheck    # TypeScript validation
   npm run test         # Unit tests (Vitest)
   npm run cy:run       # Component tests (Cypress)
   npm run cy:e2e       # End-to-end tests (Cypress)
   npm run build        # Production build
   ```

3. **Start Development**
   ```bash
   npm start            # Development server on port 3000
   ```

### Testing Commands

#### **Unit Tests** (Fastest - Development TDD Loop)
- `npm test` - Run Vitest unit tests with React Testing Library
- `npm run test:watch` - Run tests in watch mode for TDD

#### **Component Tests** (Cypress-based Component Testing)

- `npm run cy:run` - Headless component tests
- `npm run cy:open` - **Visual component tests** with Cypress UI
- `npm run cy:component` - Run only component tests

#### **Full App Tests** (Complete User Workflows)

- `npm run cy:e2e` - End-to-end tests with Cypress
- `npm run cy:open` - Interactive debugging with Cypress UI

#### **Code Quality**

- `npm run typecheck` - TypeScript validation
- `npm run lint` - ESLint code quality checks
- `npm audit` - Security vulnerability scanning

### Testing Architecture with Cypress

#### **Unit Testing** (Base of Test Pyramid)
- **Tool**: Vitest + React Testing Library
- **Speed**: 2-5ms per test
- **Location**: `src/components/__tests__/*.test.tsx`

#### **Component Testing** (Cypress Component Testing)
- **Tool**: Cypress Component Testing
- **Approach**: Implements [UI Component Testing pattern](https://paulhammant.com/2017/02/01/ui-component-testing)
- **Speed**: 0.030s per test (33.3 tests/sec) without screenshots, 0.190s per test (5.26 tests/sec) with screenshots
- **Performance**: 17x faster than Playwright component testing
- **Location**: `src/components/__tests__/*.cy.tsx`

#### **Full App Testing** (Cypress E2E)
- **Tool**: Cypress End-to-End
- **Speed**: ~10 seconds for 11 tests
- **Location**: `cypress/e2e/*.cy.ts`

## Key Differences from Main Branch

This branch uses **Cypress** instead of Playwright:

- Component tests: `*.cy.tsx` files using Cypress Component Testing
- E2E tests: `cypress/e2e/*.cy.ts` files
- Same test harness pattern but adapted for Cypress APIs
- Interactive debugging through Cypress UI

For the complete architecture documentation, refer to the [main branch README](https://github.com/paul-hammant/car-doppler/blob/main/README.md).

## Accuracy Warning 

**Speed calculations are experimental and wildly inaccurate.** This webapp should NOT be used for law enforcement or official measurements.

