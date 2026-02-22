# Changelog — Happenings Nearby

All notable changes to this project are documented here.

---

## [1.0.0] — 2026-02-21

### Phase 1: Core Map & Incident Reporting

**What was built:**
The foundation of the app — a full-screen interactive map centered on Midtown Manhattan with real-time incident pins and a report sheet.

- **Map tab** (`app/(tabs)/index.tsx`): Full-screen `MapView` with custom dark styling, displaying incidents as emoji-colored markers via `MarkerPin` component.
- **Report sheet** (`components/ReportSheet.tsx`): Bottom sheet overlay for reporting new incidents. Users select a category (8 types: accident, police, fire, fight, entertainment, event, hazard, roadblock), write a description, and submit. The report uses the map's current center as the location.
- **Nearby feed tab** (`app/(tabs)/feed.tsx`): Scrollable list of all incidents sorted by recency, displayed as `IncidentCard` components with category badge, timestamp, upvote count, and description preview.
- **Category system** (`constants/categories.ts`): 8 incident categories with emoji, label, and unique color.
- **Color palette** (`constants/colors.ts`): Dark theme with `#09090F` base, emerald `#34D399` accent, and per-category colors.
- **Mock data** (`mocks/incidents.ts`): 8 seed incidents around NYC Midtown for development.
- **Tab navigation** (`app/(tabs)/_layout.tsx`): Two tabs — Map and Nearby — with custom dark tab bar styling.

### Phase 2: Authentication & API Gateway

**What was built:**
Full login/register flow with session persistence and a production-ready API layer that can toggle between mock data and a real backend.

- **Login screen** (`app/login.tsx`): Dual-mode form (login / register) with email, password, and username fields. Animated transitions, error handling, and loading states.
- **Auth context** (`context/auth.tsx`): Built with `@nkzw/create-context-hook`. Handles login, register, logout mutations via React Query. Persists session token and user object in AsyncStorage. Auto-restores session on app launch.
- **Auth gate** (`app/_layout.tsx`): `AuthGate` component watches auth state and redirects unauthenticated users to `/login`, authenticated users to `/(tabs)`.
- **API client** (`lib/api/client.ts`): Generic `fetch` wrapper that auto-injects `Authorization: Bearer <token>` header, logs all requests, and handles error responses.
- **API config** (`lib/api/config.ts`): Reads `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_USE_MOCK` from environment. Single toggle switches entire app between mock and production mode.
- **Auth API** (`lib/api/auth.ts`): `loginApi`, `registerApi`, `logoutApi`, `getMeApi` — each with mock and real branches.
- **Incidents API** (`lib/api/incidents.ts`): `getIncidentsApi`, `createIncidentApi`, `upvoteIncidentApi`, `deleteIncidentApi` — mock uses in-memory store, real uses REST endpoints.
- **Incidents context** (`context/incidents.tsx`): Built with `@nkzw/create-context-hook` + React Query. Provides `incidents`, `addIncident`, `upvoteIncident` with optimistic cache updates.
- **Type system** (`lib/api/types.ts`): Shared interfaces for `User`, `AuthResponse`, `Incident`, `Comment`, and all request payloads.

### Phase 3: Incident Detail, Comments & Social Sharing

**What was built:**
Detailed incident view with a threaded comment system (anonymous or authenticated) and Twitter/X sharing.

- **Incident detail screen** (`app/incident/[id].tsx`): Full-screen detail page with:
  - Category badge with emoji and color
  - Title, description, reporter, and relative timestamp
  - Mini map showing the incident location
  - Upvote button with count
  - **Share to X/Twitter** button — composes a tweet with incident title, category, and a link
  - **Comments section** — real-time list of comments with author, timestamp, and anonymous badge
  - **Comment composer** — text input with anonymous toggle switch, submit button
- **Comments API** (`lib/api/comments.ts`): `getCommentsApi`, `createCommentApi` — mock and real branches.
- **Navigation**: Incident cards in both Map (marker callout) and Feed tab link to `/incident/[id]` via `expo-router`.

### Phase 4: Mock Express Server & Auth Simulation

**What was built:**
Transitioned from in-memory client-side mocks to a dedicated local Express server, enabling a more realistic API simulation and simplified auth flow.

- **Mock Express server** (`server/index.ts`): A lightweight Node.js server using Express and Bun to handle all API requests.
- **In-memory data store**: The server maintains state for `users`, `incidents`, and `comments` in-memory, allowing for persistent mutations across app reloads (until server restart).
- **Simulated Auth**:
  - `POST /auth/login`: Accepts any password 4+ chars long, allowing quick login with the demo user or any registered user.
  - `POST /auth/register`: Adds new users to the in-memory store.
  - `GET /auth/me`: Returns the current session's user.
- **Refactored API Layer**:
  - Removed `USE_MOCK` logic and client-side mock data (`mocks/` directory).
  - API modules (`lib/api/*.ts`) now perform real HTTP calls to the `EXPO_PUBLIC_API_URL`.
  - Updated `lib/api/config.ts` to default to `http://localhost:3000`.
- **New scripts**: Added `bun server` to `package.json` for easy starting of the mock API.

---

## Architecture Decisions

| Decision | Rationale |
| --- | --- |
| Mock Express Server over in-memory mocks | Provides a more realistic development environment, tests actual HTTP networking, and simplifies the frontend codebase by removing conditional mock logic. |
| Bun for the server | Fast startup, built-in TypeScript support, and consistent with the rest of the project's tooling. |
| Simplified Auth in mock server | Allows developers to easily bypass login/register screens while still exercising the auth context and persistence logic. |
| `@nkzw/create-context-hook` over raw Context | Eliminates boilerplate, enforces type safety, creates clean `[Provider, useHook]` pairs |
| React Query for all server state | Automatic caching, refetching, stale time, and optimistic updates out of the box |
| Dark theme as default | Matches the "live radar / real-time alerts" aesthetic of the app |
| No custom native modules | Everything runs in Expo Go for fast iteration |

---

## What's Next (Suggested)

- [ ] Build the real production backend (Hono + tRPC or Express) matching the API contract in AGENTS.md
- [ ] Add push notifications for nearby incidents (expo-notifications)
- [ ] Add image attachments to incident reports (expo-image-picker + S3/R2 upload)
- [ ] Add user profiles and report history
- [ ] Add incident expiry / auto-archival (incidents older than X hours fade out)
- [ ] Add geofenced notifications ("alert me when something happens within 500m")
- [ ] Add report verification / trust score system
- [ ] Implement persistent storage for the mock server (e.g., SQLite or a JSON file) to survive server restarts.
