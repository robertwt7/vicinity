# Changelog — Happenings Nearby

All notable changes to this project are documented here.

---

## [1.1.0] — 2026-02-22

### Phase 5: User Profiles, Trust Score & Verification

**What was built:**
Implemented a reputation system with trust scores and a dedicated user profile area to view report history.

- **User Profile Tab** (`app/(tabs)/profile.tsx`): A new tab providing personal info, Trust Score, and Report History.
- **Trust Score System**: Community-driven verification via weighted upvotes (+1) and downvotes (-2).
- **Enhanced Incident Detail**: Added Downvote (Deny) button and reporter trust badge.
- **Reusable Components**: Extracted `IncidentRow` for consistent list UI across Feed and Profile.
- **Expanded API**: New user profile and incidents endpoints, plus voting logic.

---

## [1.0.0] — 2026-02-21

### Phase 1: Core Map & Incident Reporting
The foundation — interactive map, incident pins, and reporting sheet.

### Phase 2: Authentication & API Gateway
Full login/register flow, session persistence, and unified API layer.

### Phase 3: Incident Detail, Comments & Social Sharing
Detailed views, threaded comments, and Twitter/X integration.

### Phase 4: Mock Express Server & Auth Simulation
Transitioned to a local Express server for realistic API simulation.

---

## Architecture Decisions

| Decision | Rationale |
| --- | --- |
| Mock Express Server | Realistic networking and state management during development. |
| Reusable `IncidentRow` | UI consistency and reduced code duplication. |
| Trust Score weighted downvotes | Prevents spam and prioritizes community verification. |
| React Query + Context | Efficient server state management and simple global access. |

---

## What's Next (Suggested)

- [ ] Build real production backend matching API contract.
- [ ] Push notifications for nearby incidents.
- [ ] Image attachments for incident reports.
- [ ] Incident auto-archival after X hours.
- [ ] Top Reporters leaderboard.
- [ ] Edit/Delete own reports from Profile.
