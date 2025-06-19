# Doppler Speed Detector

A React TypeScript application that uses Doppler shift analysis to detect vehicle speeds through audio processing. See footer for "wildly inaccurate" warning.

Very much a work in progress, but the deployed site is [https://paul-hammant.github.io/car-doppler/](https://paul-hammant.github.io/car-doppler/), and wildly inaccurate for the time being.

This is basically an app in order to help me see a particular style of test automation that's component-centric. I blogged about [in 2017](https://paulhammant.com/2017/02/01/ui-component-testing/) and now again [in 2025](https://paulhammant.com/2025/06/17/ui-component-testing-revisited/).


## Quick Start - See the Component Testing Pattern

```bash
npm install
npx playwright install
npm run test:ct:headed -- UnitsConversion.ct.test.tsx
```

This will open a browser and show a **Test Harness** UI where you can see:
- Component behavior
- Test harness state changes
- Event coupling trace

The single test demonstrates **mph → km/h → mph** conversion with 5-second pauses so you can follow the interaction flow.

# Developer Advice

## Workstation setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers** (for component and full app testing)
   ```bash
   npx playwright install
   npx playwright install-deps  # System dependencies for Linux
   ```

3. **Verify Setup**
   ```bash
   npm run typecheck    # TypeScript validation
   npm run test         # Unit tests
   npm run test:ct      # Component tests with debug harness
   npm run test:e2e     # Full app tests
   npm run build        # Production build
   ```

4. **Start Development**
   ```bash
   npm start            # Development server on port 3000
   ```

### Iterative Development

- `npm start` / `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production using Nx + Vite
- `npm run preview` - Preview production build locally

### Testing Commands

#### **Unit Tests** (Fastest - Development TDD Loop)
- `npm test` - Run Vitest unit tests with React Testing Library
- `npm run test:watch` - Run tests in watch mode for TDD

#### **Component Tests** (why this project was created)

- `npm run test:ct` - Headless component tests with test harness
- `npm run test:ct:headed` - **Visual component tests** (recommended for demos)
- `npm run test:ct:ui` - Interactive component test debugging
- `npm run test:ct:headed -- UnitsConversion.ct.test.tsx` - Run a specific test file

#### **Full App Tests** (Complete User Workflows)

E2e for this repo: Tests the full application stack (React frontend + browser APIs + WASM library) with full build pipeline startup taking up to 2 minutes. 

- `npm run test:e2e` - Headless end-to-end tests
- `npm run test:e2e:headed` - Visual end-to-end tests
- `npm run test:e2e:ui` - Interactive e2e debugging

#### **Code Quality**

- `npm run typecheck` - TypeScript validation
- `npm run lint` - ESLint code quality checks
- `npm audit` - Security vulnerability scanning

### Layers of Testing 

#### **Unit Testing** (Base of Test Pyramid)

- **Tool**: Vitest + React Testing Library
- **Scope**: Individual functions, utilities, and isolated component logic
- **Speed**: 2-5ms per test
- **Location**: `src/components/__tests__/*.test.tsx`
- **Run**: `npm test`

#### **Component Testing** (per blog entries)

- **Tool**: Playwright Experimental Component Testing
- **Approach**: Implements [UI Component Testing pattern](https://paulhammant.com/2017/02/01/ui-component-testing) (2017)
- **Key Innovation**: Tests both the component AND the test harness with event coupling
- **Speed**: ~15 seconds per test (includes visual verification)
- **Location**: `src/components/__tests__/*.ct.test.tsx`

**What Makes This Special:**

The component tests use a **Test Harness** that simulates how components would be used in the real app, enabling **dual assertions**:

1. **Component Assertions** (traditional): Button text changes, visual states
2. **Harness Assertions too**: Test harness state updates via event coupling
3. **Event Coupling Trace**: Complete interaction history for debugging

**Visual Test Harness Layout:**
```
┌─ Component Under Test ───────────────────────┐
│ [Start Listening] [Switch to mph]            │
└──────────────────────────────────────────────┘
┌─ Test Harness State ─────────────────────────┐
│ Recording: OFF                               │
│ Units: METRIC (km/h)                         │  ← Harness state
│ Processing: NO                               │
└──────────────────────────────────────────────┘
┌─ Event Log ──────────────────────────────────┐
│ 2024-01-15T10:30:00.000Z: Recording started  │  ← Event coupling trace
│ 2024-01-15T10:30:05.000Z: Units changed      │
└──────────────────────────────────────────────┘
```

**Component Test Commands:**

- `npm run test:ct` - Headless component tests
- `npm run test:ct:headed` - **Visual mode** with browser UI, screenshots
- `npm run test:ct:ui` - Interactive debugging mode

**Example Tests:**

- `Controls.ct.test.tsx` - Recording/units toggle with event coupling
- `UnitsConversion.ct.test.tsx` - mph → km/h → mph conversion cycle

#### **Integration Testing**

- **Scope**: Module interactions, service integrations
- **Speed**: 100-500ms per test
- **Tools**: Vitest with mocked dependencies

#### **Full App Testing** (Top of Test Pyramid)

- **Tool**: Playwright End-to-End
- **Scope**: Complete user workflows with audio processing
- **Speed**: 5-15 seconds per test
- **Location**: `e2e/*.spec.ts`
- **Run**: `npm run test:e2e:headed` for visual mode

**Test Execution Times (per test on slower dev workstation):**

- Unit tests: 2-5ms per test (fastest feedback)
- Integration tests: 100-500ms 
- Component tests: < 1 second each (ignoring browser startup + visual verification)
- Full app tests: 5-15 seconds (complete user workflows)

## Architecture

- Frontend: React 19, TypeScript and Vite 
- Build System: Nx workspace with Vite plugin
- Audio Processing: Web Audio API + DSP Worker (Doppler shift analysis). FFT aspects of that via a WASM compiled (https://github.com/echogarden-project/pffft-wasm).
- Testing: Vitest (Unit - base of pyramid), Playwright (Component and full stack further up the test pyramid)  
- Deployment: GitHub Actions into GitHub Pages. App does not have a server side, obviously.

## Speed Calculation for the three doppler implementations

Via sibling repo: https://github.com/paul-hammant/Car-Speed-Via-Doppler-Library and deployed lib/service - as well as speed detection library, this details the dependence on https://github.com/echogarden-project/pffft-wasm.

### GitHub Action Deployment Steps (`.github/workflows/deploy.yml`)

Steps taken in GH's build infra, highlighting the subset from the larger series you
could (possibly) do on your dev workstation:

1. **Checkout Repository** - `actions/checkout@v4`
2. **Setup Node.js 18** - `actions/setup-node@v4` with npm cache
3. **Install Dependencies** - `npm ci`
4. Lint Code *(skipped)* - `npm run lint` or `npx eslint .`
5. Type Check *(skipped)* - `npm run typecheck` (TypeScript validation)
6. Run Unit Tests *(skipped)* - `npm run test` (Vitest tests)
7. Run Component Tests *(skipped)* - `npm run test:ct` (Playwright component tests with debug harness)
8. Run Full App Tests *(skipped)* - `npm run test:e2e` (Playwright tests on complete application)
9. Security Audit *(skipped)* - `npm audit` (vulnerability scanning)
10. **Build Application** - `npm run build` (Nx → Vite → `./dist/react-app`)
11. Verify Build *(skipped)* - `npm run preview` (smoke test built artifacts)
12. **Setup GitHub Pages** - `actions/configure-pages@v4`
13. **Upload Build Artifacts** - `actions/upload-pages-artifact@v3` from `./dist/react-app`
14. **Deploy to GitHub Pages** - `actions/deploy-pages@v4` (main branch only)

**Quality Gate Risk**

Currently deploys on GH without running tests, linting, or type checking could mean errors could reach production.

# Still TODO

1. Get WASM + SIMD enabled working - it seems to have load problems
2. Have a fallback mechanism from that, through WASM with SIMD disabled (currently the only confihired impl), to pure JavaScript as a last resort.
3. More strategies for approach/recede timing for clips and more alternates for engine note, cutting out road noise, etc.

# Accuracy Warning 

**Again, Speed calculations are experimental and wildly inaccurate.** This webapp Should NOT be used for law enforcement or official measurements. We'd need a bunch of MP3/WAV recordings of known speeds, in order to get the mathematics to be more accurate and even then it would STILL BE WILDLY INACCURATE.

# Comparisons to Cypress and Selenium (for component testing)

No need to wonder, they're here in this repo on branches:

1. [cypress_instead_of_playwright](https://github.com/paul-hammant/car-doppler/tree/cypress_instead_of_playwright)
2. [selenium_instead_of_playwright](https://github.com/paul-hammant/car-doppler/tree/selenium_instead_of_playwright)
