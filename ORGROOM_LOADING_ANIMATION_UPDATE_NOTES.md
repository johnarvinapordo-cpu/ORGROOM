# ORGROOM Loading and Motion Enhancement

## Source project
Started from the most recently available complete project archive in the conversation: `ORGROOM_Admin_Dashboard_Matched_To_Teacher.zip`.

## Files changed
- `src/App.jsx`
  - Added a 2.2-second minimum branded startup display while still waiting for authentication restoration and required initial data loading if those operations take longer.
  - Added a branded post-authentication transition after the existing login / email-verification flow invokes its existing success callback. Role routing remains based on the authenticated user returned by the existing API.
  - Added a logout transition only after `/api/auth/logout` succeeds. The existing server endpoint deletes the current token hash from `auth_sessions`; the client then clears its stored token and authenticated React state. API failures continue to be surfaced by the existing confirmation dialog.
  - Added a short page-content entrance transition keyed to the active page.
- `src/calm-campus.css`
  - Added lightweight CSS motion for startup, logo entrance, progress indicator, page sections, cards, buttons, modals, and notification/search popovers.
  - Added reduced-motion overrides and theme-aware startup/logout surfaces.
- `previews/*.html`
  - Added isolated component previews for the startup, login-transition, and logout-transition visuals. These are preview-only and are not part of the application runtime.

## Preserved
- Existing login request, email verification, password recovery, session restoration, and authenticated role handling.
- Existing `/api/auth/logout` endpoint and server-side session invalidation.
- Existing confirmation-before-logout behavior and error handling.
- Existing role dashboards, navigation, data APIs, reservation logic, database schema, and RBAC checks.
- No new dependencies or SQL changes.

## Verification performed
- JSX syntax parsed successfully with the installed TypeScript JSX parser.
- CSS parsed successfully with PostCSS.
- `node --check server/auth-server.js` passed.
- `node --check scripts/dev.js` passed.
- Static checks confirmed startup timing, login transition callback, all three existing logout entry points using the shared logout action, and preservation of the logout API call.
- ZIP archive integrity verified after packaging.

## Not completed
- `npm ci` timed out in this environment, so the Vite production build could not be run.
- No live browser test against a running API/database was possible here. Login, verification, per-role dashboard routing, server session invalidation, and logout failure handling were preserved by source inspection but not end-to-end exercised.
- The preview screenshots are rendered from the exact transition markup and project CSS in isolated preview pages; they are not screenshots of a running authenticated ORGROOM session.
