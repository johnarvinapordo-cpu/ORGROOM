# ORGROOM — Audit-Based Production Readiness Fixes

This build is an incremental hardening pass based on the complete ORGROOM system audit. Existing application structure, React/Vite stack, MariaDB schema, real schedule data, reservation locking, notification system, reminder system, and map architecture were preserved.

## Major fixes

- Verification codes now have a 5-attempt limit and are deleted after too many failures.
- Password reset invalidates all existing sessions for the account.
- Service worker no longer caches `/api/*` responses or other arbitrary GET responses; only navigation/static assets are cached.
- CORS defaults to the local ORGROOM frontend origins when no explicit `CLIENT_ORIGIN` is configured.
- Signup/forgot-password responses are less useful for account enumeration.
- Reservation creation/update now require a real facility and canonical room/building match.
- Reservation validation now rejects past dates, past start times for today, invalid times, outside-hours bookings, invalid attendee counts, over-capacity requests, empty purposes, and unavailable facilities.
- Existing exact minute overlap checking and reservation locks were preserved.
- Cancellation is now a persisted `CANCELLED` state instead of deleting the reservation record.
- Cancelled reservations remain in history and can be notified/audited.
- Failed notification emails are retried by a background worker.
- User notification deep-links now open the targeted reservation.
- Reminder scanning now covers a wider historical/future window so short backend outages are less likely to miss persistent end alarms.
- Rooms and Campus Map availability now use live schedule + reservation data instead of only the static facility status.
- Calendar availability was refactored to use the same shared availability calculation and retains the Church/Pool calendar-indicator exclusion.
- Calendar room booking now carries the selected calendar date into the reservation form.
- Campus Map now exposes all database buildings. Buildings without supplied floor-plan geometry use a database-linked room overview rather than invented geometry.
- Mobile bottom navigation now sizes itself for the actual number of navigation items instead of always assuming five.
- Table header/secondary text contrast was improved for light mode.
- Existing light/dark theme architecture was preserved.
- Database setup no longer begins with `DROP DATABASE IF EXISTS`.
- SQL setup is safer to re-run, preserves the real weekly schedule data, adds verification-code attempt storage, and adds the missing reservation/notification foreign keys.
- Existing invalid schedule rows remain preserved/inactive; no real schedule data was replaced with fabricated data.

## Verification performed in this environment

- Backend JavaScript syntax check: passed with `node --check`.
- Source/data integrity checks: real weekly schedule insert block remains byte-for-byte unchanged from the audited source.
- Package manifest and lockfile were preserved.
- Full browser/Vite runtime build could not be completed in this environment because dependency installation could not finish from the available package cache/network. The source project therefore still needs a local `npm install` + `npm run build`/`npm run dev` verification on a machine with npm registry access.

## Important remaining limitations

- Full live MariaDB integration and SMTP delivery were not available in this audit environment.
- Some audit recommendations remain intentionally out of scope, including DB CHECK constraints, full pagination/performance redesign, full floor-plan geometry for buildings where no source geometry exists, and production reverse-proxy deployment configuration.
- Legacy seeded/demo account data remains in the provided SQL to preserve the supplied project data; the backend still auto-migrates legacy SHA-256 passwords after successful login.
