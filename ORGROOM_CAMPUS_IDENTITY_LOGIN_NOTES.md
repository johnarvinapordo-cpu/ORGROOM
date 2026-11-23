# ORGROOM Full-Screen CMDI Campus Login

Scope: login-page visual redesign only, based on the previous Campus Identity project ZIP and the newly supplied CMDI campus photograph.

## Changed files
- `public/cmdi-campus.jpg`: replaced with the user's supplied CMDI campus photograph.
- `src/calm-campus.css`: added a scoped full-screen campus background and floating translucent login panel, with light/dark and responsive styling.
- `ORGROOM_CAMPUS_IDENTITY_LOGIN_NOTES.md`: updated this change report.

## Preserved
The existing `Auth` component and its login API calls, email/password fields, password visibility control, forgot-password flow, email verification flow, submit lock/loading behavior, validation, and `onLogin` handoff were not rewritten. No backend, database, RBAC, protected-route, dashboard, reservation, messaging, notification, sidebar, or navigation source was changed.

## Verification limitations
The CSS and JSX should be validated with `npm install` and `npm run build` in the user's local environment. This packaging environment does not contain the project's installed npm dependencies, and no live backend/database or authenticated Teacher/Admin/Super Admin accounts are available here. Therefore end-to-end login, verification, recovery, RBAC, and runtime console tests have not been claimed as passed.
