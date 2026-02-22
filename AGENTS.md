# AGENTS.md — Happenings Nearby

## Project Overview

**Happenings Nearby** is a community-driven, real-time incident reporting mobile app. Users can view a 2D map of their surroundings with pinned incidents, report new incidents, view details, comment, upvote/downvote to verify, and manage their profile and trust score.

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
| Mock API           | Express.js (running on localhost:3000)                         |

---

## Directory Structure

```
app/
  _layout.tsx           # Root layout: QueryClient, AuthProvider, IncidentsProvider, AuthGate, Stack
  login.tsx             # Login / Register screen
  (tabs)/
    _layout.tsx         # Tab bar: Map, Nearby feed, Profile
    index.tsx           # Map tab
    feed.tsx            # Nearby feed
    profile.tsx         # User profile and report history
  incident/
    [id].tsx            # Incident detail, comments, voting, sharing

components/
  IncidentCard.tsx      # Card for map marker overlays
  IncidentRow.tsx       # Reusable row for Feed and Profile lists
  MarkerPin.tsx         # Custom map marker
  ReportSheet.tsx       # Incident reporting sheet

constants/
  categories.ts         # Category definitions
  colors.ts             # Dark theme tokens

context/
  auth.tsx              # Auth state and session persistence
  incidents.tsx         # Incidents list and voting actions

lib/api/
  users.ts              # User profile and history API calls
  incidents.ts          # Incident list, create, upvote/downvote calls
  comments.ts           # Comment retrieval and creation
  types.ts              # Shared interfaces (User, Incident, etc.)

server/
  index.ts              # Mock Express server with reputation logic
```

---

## API Contract (Expected Backend Endpoints)

All endpoints prefixed with `EXPO_PUBLIC_API_URL`.

### Auth
| Method | Path              | Payload                            | Response         |
| ------ | ----------------- | ---------------------------------- | ---------------- |
| POST   | `/auth/login`     | `{ email, password }`              | `AuthResponse`   |
| POST   | `/auth/register`  | `{ email, password, username }`    | `AuthResponse`   |
| GET    | `/auth/me`        | —                                  | `User`           |

### Users
| Method | Path                        | Payload                                       | Response      |
| ------ | --------------------------- | --------------------------------------------- | ------------- |
| GET    | `/users/:id`                | —                                             | `User`        |
| GET    | `/users/:id/incidents`      | —                                             | `Incident[]`  |

### Incidents
| Method | Path                        | Payload                                       | Response      |
| ------ | --------------------------- | --------------------------------------------- | ------------- |
| GET    | `/incidents`                | —                                             | `Incident[]`  |
| POST   | `/incidents`                | `{ categoryId, description, lat, lng }`       | `Incident`    |
| POST   | `/incidents/:id/upvote`     | —                                             | `Incident`    |
| POST   | `/incidents/:id/downvote`   | —                                             | `Incident`    |

### Comments
| Method | Path                              | Payload                                  | Response    |
| ------ | --------------------------------- | ---------------------------------------- | ----------- |
| GET    | `/incidents/:id/comments`         | —                                        | `Comment[]` |
| POST   | `/incidents/:id/comments`         | `{ text, isAnonymous }`                  | `Comment`   |

---

## Key Patterns & Conventions

1. **Reputation System** — Users have a `trustScore`. Upvotes (+1) and Downvotes (-2) on their reports affect this score globally.
2. **Reusable List Items** — Use `IncidentRow.tsx` for all scrollable incident lists (Feed, History) for UI consistency.
3. **Optimistic Updates** — Always update the React Query cache immediately on voting or reporting.
4. **Mock State** — `server/index.ts` simulates the database in-memory. Restarting the server resets all scores and reports.

---

## Running the App

```bash
bun server         # Start mock API
bun start          # Start Expo
```

---

## Notes for AI Agents

- Follow the dark theme palette in `constants/colors.ts`.
- Use `lucide-react-native` for all icons.
- Implement both frontend API calls and mock backend logic for new features.
- Adhere to the file-based routing structure in `app/`.
- Never commit or stage changes unless asked.
