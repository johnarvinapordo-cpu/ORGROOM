# ORGROOM — Facility Reservation Platform

This build uses the supplied `FL_1st-Sem-AY-2026-2027-FINAL.xlsx` as the source of truth for the facilities and room schedules.

## Included
- ORGROOM React/Vite frontend
- Node/Express authentication + reservation backend
- MySQL/MariaDB database script: `ORGROOM_REAL_SCHEDULE_DATABASE.sql`
- Existing users and email-verification infrastructure retained
- Reservation and recurring room-schedule tables retained
- Real room/facility list and schedule occupancy extracted from the workbook's `CLASSROOMS FINALIZATION` and `Computer Laboratory` sheets

## Database
1. Open phpMyAdmin or another MySQL/MariaDB client.
2. Import `ORGROOM_REAL_SCHEDULE_DATABASE.sql`.
3. The script creates `orgroom_db` and all required ORGROOM tables.
4. Copy `.env.example` to `.env`, then enter your own database and email-service settings. Do not share or upload `.env`.

## Run
From the project folder, run only:

```bash
npm install
npm run dev
```

`npm run dev` automatically starts the backend and Vite frontend, detects the computer's active LAN IPv4 address, and prints both the PC/local URL and the phone/network URL. A PC browser opens automatically.

For phone testing, connect the phone and computer to the same reachable Wi-Fi/LAN and open the printed **Phone / Network** URL. No separate mobile server or manual IP lookup is required.

If Windows Firewall blocks LAN access, allow the local development server through the firewall when Windows prompts you; the project does not disable or modify the firewall automatically.

## Email verification
Fill in the SMTP values in `.env` before using Gmail/email verification. The existing verification flow is preserved: verified accounts can sign in without receiving a new code every time.


## Secure account administration

- Public self-registration is disabled in the frontend and backend. Existing users continue to use the normal sign-in and password-recovery flows.
- Authorized Admin and Super Admin users create Teacher/Admin accounts from **User Management**. Only the one-time provisioning command below can create the initial `SUPER_ADMIN` role.
- The initial Super Admin is created with a bcrypt password hash. The setup command uses the database connection from `.env`, does not print the password, and records a one-time setup lock in `orgroom_security_setup`. If a Super Admin already exists, it preserves that account and locks the setup without creating another one.
- To create the initial Super Admin from PowerShell, run these commands in the project folder. Use a strong password of at least 12 characters containing letters and numbers:

```powershell
$env:SUPER_ADMIN_NAME = Read-Host "Super Admin full name"
$env:SUPER_ADMIN_EMAIL = Read-Host "Super Admin email"
$securePassword = Read-Host "Super Admin password" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $env:SUPER_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  npm run bootstrap:super-admin
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  Remove-Item Env:SUPER_ADMIN_NAME, Env:SUPER_ADMIN_EMAIL, Env:SUPER_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  $securePassword.Dispose()
}
```

Run the provisioning command only once. Do not add these credentials to `.env`, source files, screenshots, or version control. The command uses the same database account-capacity lock as normal account creation.

## Account capacity

The system-wide account limit is centralized in `server/account-config.js` as `MAX_ACCOUNT_CAPACITY = 50`. Change that one value when the approved capacity changes. All existing user rows count toward the limit, including deactivated accounts. The backend enforces the limit while holding a database-level named lock and transaction, so simultaneous account-creation requests cannot create account 51. Existing accounts are never deleted or deactivated by the capacity check.

On backend startup, the existing database initialization routine safely updates the `users.role` CHECK constraint to permit `TEACHER`, `ADMIN`, and `SUPER_ADMIN`, without changing account rows. No database reset or destructive import is required. The SQL schema snapshots have also been updated for new installations.

## Schedule source notes
The database intentionally does not carry over the previous database's unrelated/fake facility catalog, class-meeting/raw-import tables, or unrelated schedule records. Facility names are based on the supplied workbook's final schedule headers. Schedule rows retain the workbook's day, time, course, program/block, instructor, term dates, and source sheet/header information.

Room capacities are left NULL because the supplied schedule does not provide capacity values; the UI therefore displays `Capacity not listed` rather than inventing capacities.


## Teacher-to-Admin Messaging

ORGROOM now includes a persistent Teacher-to-Admin chat panel. The blue floating chat button appears at the lower-right of authenticated pages. Teachers have one private conversation with the Admin team; Admin and Super Admin accounts share the Admin inbox. Messages and per-user read positions are stored in MariaDB/MySQL, not in browser storage.

### Database migration

No manual destructive database operation is required. The backend's existing `ensureDatabase()` startup migration creates these additive tables if they do not already exist:

- `orgroom_chat_conversations`
- `orgroom_chat_messages`
- `orgroom_chat_reads`

The repeatable SQL is also provided at `migrations/20261120_teacher_admin_messaging.sql`. It uses `CREATE TABLE IF NOT EXISTS` and does not drop or reset existing tables. Back up the database before deploying any application update, as with any database migration.

### Messaging behavior

- Teacher messages are visible to all active, verified Admin and Super Admin accounts.
- Each Admin/Super Admin has an independent read position, so one administrator reading a conversation does not clear another administrator's unread count.
- The existing `notifications` table is extended with `CHAT_MESSAGE` entries; the existing notifications API remains in use.
- The chat checks for new messages approximately every 3.5–5 seconds.
- The optional notification tone is off by default and can be enabled from the chat header. Browser notification permission is not required.
- Dismissing the in-app message banner or minimizing the panel does not mark messages as read. Opening the conversation marks the messages currently displayed as read for that account.
- Messages are limited to 4,000 characters.

### Login keyboard shortcut

The login view now uses native form submission. Pressing Enter from the email or password field submits the same existing login request as the Sign in button. Browser validation and the existing busy state prevent invalid or duplicate submissions.

### Run

Use the existing setup:

```bash
npm install
npm run dev
```

Configure the same `.env` database and email settings already required by ORGROOM. Do not copy production secrets into source control.
