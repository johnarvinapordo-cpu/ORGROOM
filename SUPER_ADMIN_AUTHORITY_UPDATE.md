# ORGROOM — Super Admin Authority Update

This update keeps the existing React/Vite/Express/MySQL application and adds role-aware reservation approval, automatic Super Admin reservation approval, privileged decision overrides, audit/decision history, global settings, and a Super Admin system-oversight page.

## Role policy

- Teacher reservations are submitted as `PENDING`; Admin or Super Admin may approve/reject them.
- Regular Admin reservations are submitted as `PENDING`; only Super Admin may approve/reject them.
- Super Admin reservations become `APPROVED` with `decision_source = SYSTEM_AUTO_APPROVAL` only after the existing room, date, time-window, capacity, weekly-schedule and overlap validation succeeds.
- A requester cannot approve their own request.
- Normal account creation still permits Teacher and normal Admin only; creation of another Super Admin remains unavailable through User Management.
- Regular Admin account management is Teacher-only. Super Admin can manage Teacher and normal Admin accounts. Super Admin accounts remain protected from routine edit/deactivation routes, which is stricter than only protecting the final active Super Admin.

## New Super Admin page

The authenticated Super Admin receives a **System oversight** navigation item. It reads real database values from protected APIs and provides:

- Account and reservation summaries, facility booking counts, and activity derived from audit logs.
- Global account capacity and reservation-window configuration (with a required reason).
- Existing facility details, capacity, status, description, amenities and image URL editing.
- Weekly schedule create/update/soft-deactivate actions with required reasons and overlapping-schedule checks.
- Paginated read-only audit log.
- Per-reservation decision history from the Requests page.

Facility deletion is intentionally not offered. Weekly schedule removal is a soft deactivation (`is_active=0`) so the source record is preserved.

## Database migration

The backend's existing `ensureDatabase()` process creates the additional tables and adds `reservations.decision_source` and `facilities.image_url` if they are missing. A manual, repeatable SQL migration is also provided at:

`migrations/20261126_super_admin_authority.sql`

Run it in the existing ORGROOM database (Aiven `defaultdb` for production) only if you prefer to apply schema changes manually before restarting the backend. It uses `INSERT IGNORE` for default settings and does not overwrite previously stored global settings.

No existing decision transitions are fabricated. Existing reservation status, `decision_by_user_id`, and `decision_at` values are preserved; new decisions and overrides are recorded in the new history table.

## Local testing

1. Back up your existing database.
2. Keep your existing `.env` outside this ZIP and point it to a local test database for local validation.
3. Install dependencies using the existing lockfile: `npm ci`.
4. Start ORGROOM using its existing workflow: `npm run dev`.
5. Log in separately as Teacher, regular Admin, and Super Admin, then test the permission matrix and the reservation/override flows.
6. Confirm the database contains the new settings, audit and reservation history tables after backend startup (or run the migration manually).

## Important scope notes

- No Git commit, push, merge, or deployment is performed by this package.
- The source archive did not include `.git`, so the current local branch and uncommitted Git changes could not be inspected.
- Existing audit history predating this update cannot be reconstructed from a database that only stores the latest reservation decision. Older `decision_by_user_id` and `decision_at` fields are preserved; complete transition history starts with the new feature.
- The included audit/report API is database-backed. Usage analytics currently count reservations/approved attendees by facility; they are booking counts, not an independently measured physical occupancy sensor.

## Validation performed for this source package

- Node syntax checks passed for `server/auth-server.js`, `server/db.js`, and `shared/reservation-window.js`.
- JSX parser checks passed for `src/App.jsx`, `src/SuperAdminConsole.jsx`, `src/ChatWidget.jsx`, and `src/RoomImage.jsx`.
- Shared reservation-window boundary tests passed for 7:00 AM opening, rejection before opening, 8:30 PM closing, and rejection after closing.
- A full Vite production build and live MySQL role/integration tests were not completed in this packaging environment. Complete the local account-role and reservation-flow tests described above before any production deployment.
