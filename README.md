# Doppler Speed Detector

A React TypeScript application that uses Doppler shift analysis to detect vehicle speeds through audio processing. See footer for "wildly inaccurate" warning.

Very much a work in progress, but the deployed site is [https://paul-hammant.github.io/car-doppler/](https://paul-hammant.github.io/car-doppler/), and wildly inaccurate for the time being.

This is basically an app in order to help me see a particular style of test automation that's component-centric. I blogged about [in 2017](https://paulhammant.com/2017/02/01/ui-component-testing/) and now again [in 2025](https://paulhammant.com/2025/06/17/ui-component-testing-revisited/).


## Quick Start - See the Component Testing Pattern

```bash
npm install
npm run test:ct:headed
```

This will start a component test server and launch Firefox to run **Test Harness Component Testing** with Selenium WebDriver, showing:
- Component behavior with real browser automation
- Test harness state changes via event coupling
- Complete interaction flow with screenshot documentation
- Visual evidence of each test step

The tests demonstrate the **mph → km/h → mph** conversion cycle and recording toggle interactions using Selenium WebDriver for cross-browser compatibility.

# Developer Advice

## Workstation setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Selenium WebDriver** (for component and end-to-end testing)
   ```bash
   # Firefox driver (geckodriver) is installed automatically via npm
   # For other browsers, you may need additional setup
   ```

I, Paul, am developing on a Chromebook, and proper "Chrome" isn't available for Selenium use, so I'm using Firefox. I think Chromium (via apt-get was a choice too). I could be wrong.

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

- `npm run test:ct` - Headless Selenium component tests with test harness
- `npm run test:ct:headed` - **Visual component tests** (recommended for demos) - launches Firefox
- `npm run test:selenium:all` - Run all Selenium-based tests (component + e2e)
- Component tests use Selenium WebDriver with Firefox for cross-browser compatibility

#### **Full App Tests** (Complete User Workflows)

E2e for this repo: Tests the full application stack (React frontend + browser APIs + WASM library) using Selenium WebDriver for comprehensive browser testing.

- `npm run test:e2e` - Headless Selenium end-to-end tests
- `npm run test:e2e:headed` - Visual Selenium end-to-end tests with Firefox
- Uses the same Selenium infrastructure as component tests for consistency

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

- **Tool**: Selenium WebDriver with Jest
- **Approach**: Implements [UI Component Testing pattern](https://paulhammant.com/2017/02/01/ui-component-testing) (2017)
- **Key Innovation**: Tests both the component AND the test harness with event coupling
- **Speed**: ~0.6 seconds per test (includes comprehensive screenshot documentation)
- **Location**: `src/components/__tests__/*.selenium.test.ts`
- **Browser**: Firefox via geckodriver for cross-browser compatibility

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

- `npm run test:ct` - Headless Selenium component tests
- `npm run test:ct:headed` - **Visual mode** with Firefox browser, comprehensive screenshots
- `npm run test:ct:server` - Start component test server manually
- `npm run test:selenium:all` - Run all Selenium tests (component + e2e)

**Example Tests:**

- `Controls.ct.selenium.test.ts` - Recording/units toggle with event coupling and screenshot documentation
- Tests use external component test server for realistic browser environment

#### **Integration Testing**

- **Scope**: Module interactions, service integrations
- **Speed**: 100-500ms per test
- **Tools**: Vitest with mocked dependencies

#### **Full App Testing** (Top of Test Pyramid)

- **Tool**: Selenium WebDriver End-to-End
- **Scope**: Complete user workflows with audio processing
- **Speed**: Variable depending on test complexity
- **Location**: E2E tests use the same Selenium infrastructure as component tests
- **Run**: `npm run test:e2e:headed` for visual mode with Firefox

**Test Execution Times (per test - based on 100-iteration analysis):**

- Unit tests: 2-5ms per test (fastest feedback)
- Integration tests: 100-500ms 
- Component tests: ~0.585 seconds each (includes screenshot documentation via Selenium)
- Full app tests: Variable timing with comprehensive browser automation

## Architecture

- Frontend: React 19, TypeScript and Vite 
- Build System: Nx workspace with Vite plugin
- Audio Processing: Web Audio API + DSP Worker (Doppler shift analysis). FFT aspects of that via a WASM compiled (https://github.com/echogarden-project/pffft-wasm).
- Testing: Vitest (Unit - base of pyramid), Selenium WebDriver (Component and E2E testing with Firefox for cross-browser compatibility)
- Component Test Server: Express server for realistic component testing environment
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
7. Run Component Tests *(skipped)* - `npm run test:ct` (Selenium component tests with test harness)
8. Run Full App Tests *(skipped)* - `npm run test:e2e` (Selenium tests on complete application)
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
