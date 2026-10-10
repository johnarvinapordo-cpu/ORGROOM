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
4. If your MySQL user/password differs from the defaults, edit `.env`.

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

## Schedule source notes
The database intentionally does not carry over the previous database's unrelated/fake facility catalog, class-meeting/raw-import tables, or unrelated schedule records. Facility names are based on the supplied workbook's final schedule headers. Schedule rows retain the workbook's day, time, course, program/block, instructor, term dates, and source sheet/header information.

Room capacities are left NULL because the supplied schedule does not provide capacity values; the UI therefore displays `Capacity not listed` rather than inventing capacities.
