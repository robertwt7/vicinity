# AGENTS.md — Happenings Nearby

## Project Overview

**Happenings Nearby** is a community-driven, real-time incident reporting mobile app. Users can view a 2D map of their surroundings with pinned incidents (accidents, police activity, fires, street performers, pop-up events, etc.), report new incidents, view details, comment (anonymously or authenticated), upvote, and share to Twitter/X.

The app is built with **Expo (SDK 54)** and **React Native**, using **Expo Router** for file-based navigation, **React Query** for server state, and a local Express server for API simulation.

---

## Tech Stack

| Layer              | Technology                                                     |
| ------------------ | -------------------------------------------------------------- |
| Framework          | React Native 0.81 + Expo SDK 54                                |
| Language           | TypeScript (strict)                                            |
| Navigation         | Expo Router v6 (file-based, tabs + stack)                      |
| State Management   | React Query v5 (`@tanstack/react-query`), `@nkzw/create-context-hook` |
| Persistence        | `@react-native-async-storage/async-storage`                    |
| Maps               | `react-native-maps`                                            |
| Icons              | `lucide-react-native`                                          |
| Styling            | React Native `StyleSheet` (dark theme, custom color tokens)    |
| Package Manager    | Bun                                                            |
| Web Compatibility  | `react-native-web` (runs in browser via Expo)                  |
| Mock API           | Express.js (running on localhost:3000)                         |

---

## Directory Structure

```
app/
  _layout.tsx           # Root layout: QueryClient, AuthProvider, IncidentsProvider, AuthGate, Stack
  login.tsx             # Login / Register screen (email + password)
  modal.tsx             # Generic modal route
  +not-found.tsx        # 404 fallback
  +native-intent.tsx    # Deep link handler
  (tabs)/
    _layout.tsx         # Tab bar: Map + Nearby feed
    index.tsx           # Map tab — MapView with incident markers + ReportSheet
    feed.tsx            # Nearby feed — scrollable list of IncidentCards
  incident/
    [id].tsx            # Incident detail — full info, comments, upvote, share to X

components/
  IncidentCard.tsx      # Card component for feed list items
  MarkerPin.tsx         # Custom map marker with category emoji + color
  ReportSheet.tsx       # Bottom sheet for creating a new incident report

constants/
  categories.ts         # Category definitions (accident, police, fire, entertainment, etc.)
  colors.ts             # Dark theme color tokens

context/
  auth.tsx              # Auth context (login, register, logout, session restore via AsyncStorage)
  incidents.tsx         # Incidents context (list, create, upvote via React Query)

lib/api/
  config.ts             # API_BASE_URL (defaults to localhost:3000)
  client.ts             # Generic fetch wrapper with auth token injection
  types.ts              # Shared TypeScript interfaces (User, Incident, Comment, payloads)
  auth.ts               # Auth API calls (login, register, logout, getMe)
  incidents.ts          # Incidents API calls (list, create, upvote, delete)
  comments.ts           # Comments API calls (list, create)

server/
  index.ts              # Mock Express server with in-memory store
```

---

## Environment Variables

| Variable                | Description                                | Default                              |
| ----------------------- | ------------------------------------------ | ------------------------------------ |
| `EXPO_PUBLIC_API_URL`   | Base URL for the API                       | `http://localhost:3000`              |

By default, the app points to `http://localhost:3000`. Run `bun server` to start the mock API.

---

## API Contract (Expected Backend Endpoints)

All endpoints are prefixed with `EXPO_PUBLIC_API_URL`.

### Auth
| Method | Path              | Payload                            | Response         |
| ------ | ----------------- | ---------------------------------- | ---------------- |
| POST   | `/auth/login`     | `{ email, password }`              | `AuthResponse`   |
| POST   | `/auth/register`  | `{ email, password, username }`    | `AuthResponse`   |
| POST   | `/auth/logout`    | —                                  | —                |
| GET    | `/auth/me`        | —                                  | `User`           |

### Incidents
| Method | Path                        | Payload                                       | Response      |
| ------ | --------------------------- | --------------------------------------------- | ------------- |
| GET    | `/incidents`                | —                                             | `Incident[]`  |
| POST   | `/incidents`                | `{ categoryId, description, lat, lng }`       | `Incident`    |
| POST   | `/incidents/:id/upvote`     | —                                             | `Incident`    |
| DELETE | `/incidents/:id`            | —                                             | —             |

### Comments
| Method | Path                              | Payload                                  | Response    |
| ------ | --------------------------------- | ---------------------------------------- | ----------- |
| GET    | `/incidents/:id/comments`         | —                                        | `Comment[]` |
| POST   | `/incidents/:id/comments`         | `{ incidentId, text, isAnonymous }`      | `Comment`   |

Authorization: `Bearer <token>` header on all authenticated requests.

---

## Key Patterns & Conventions

1. **Mock Express Server** — Instead of in-memory client-side mocks, the app uses a dedicated Express server (`server/index.ts`) to simulate the backend.

2. **Context via `@nkzw/create-context-hook`** — Auth and Incidents state are exposed as `[Provider, useHook]` pairs, wrapped at the root layout.

3. **React Query everywhere** — All fetches use `useQuery`, all mutations use `useMutation`. Optimistic cache updates via `queryClient.setQueryData`.

4. **Dark theme** — All colors come from `constants/colors.ts`. The palette is a dark base (`#09090F`) with an emerald accent (`#34D399`) and category-specific colors.

5. **Category system** — 8 categories (`accident`, `police`, `fight`, `fire`, `entertainment`, `event`, `hazard`, `roadblock`) defined in `constants/categories.ts` with emoji, label, and color.

6. **Console logging** — Extensive `[Tag]` prefixed logs throughout API calls, auth flows, and state changes for debugging.

7. **Web compatibility** — The app runs on React Native Web. Platform-specific APIs (like `expo-location`) are guarded.

---

## Running the App

```bash
bun install
bun server         # Start the mock Express API
bun start          # Expo dev server (tunnel mode, scan QR)
bun start-web      # Web preview
```

---

## Switching to Production API

1. Set `EXPO_PUBLIC_API_URL` to your deployed backend URL.
2. Implement the endpoints listed in the API Contract above.
3. No code changes needed — the API layer handles the switch automatically.

---

## Notes for AI Agents

- Do NOT delete or refactor `<RootLayoutNav />` from `app/_layout.tsx`.
- Use `bun` (never npm/yarn).
- Prefer `StyleSheet` for all styling. No Tailwind, no styled-components.
- Use `lucide-react-native` for icons.
- When adding new API endpoints, implement them in both `lib/api/` (frontend) and `server/index.ts` (mock backend).
- When adding new context, use `@nkzw/create-context-hook` and wrap at root layout inside `QueryClientProvider`.
- Keep mock server in `server/`, constants in `constants/`, and API modules in `lib/api/`.
