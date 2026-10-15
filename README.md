# Resource Reservation Management System

A web application for managing shared resources (meeting rooms, labs, equipment, vehicles) and booking them without double-booking.

- ER diagram: https://dbdiagram.io/d/6ad0c8e0064322c8695dd467
- Demo video: TODO paste your video link

## The problem

Reservations handled through informal communication and manual records cause scheduling confusion, overlapping bookings and uncertainty about availability. This app gives one central place to manage resources, book them, see what is booked and keep the rules enforced as usage grows.

## Features

- Resources: create, edit, list, deactivate (name, category, capacity, description)
- Reservations: create, list (filter by resource), cancel
- Overlap prevention: the same resource can never be booked twice for overlapping times
- Validation with clear messages: end after start, no past start times, maximum 12 hours, resource must be active
- Cancelled bookings are kept for history and free up the slot

## Tech stack

Next.js (App Router) and TypeScript, PostgreSQL, Prisma ORM, Zod validation, Tailwind CSS.

## Setup

Prerequisites: Node.js 20+ and a local PostgreSQL 14+ server.

1. Install dependencies

```bash
   npm install
```

2. Create an empty database named `reservations` in PostgreSQL.

3. Copy `.env.example` to `.env` and put your PostgreSQL password in `DATABASE_URL`.

4. Create the tables (this also adds the overlap rule):

```bash
   npx prisma migrate deploy
```

5. Load sample users and resources (optional):

```bash
   npx prisma db seed
```

6. Start the app and open http://localhost:3000

```bash
   npm run dev
```

If you did not run the seed, add a user in Prisma Studio (`npx prisma studio`) because the booking form needs at least one user.

## Key design decision: overlap prevention in the database

Checking "is this slot free?" in application code and then inserting is not safe. Two requests arriving at the same moment can both pass the check and both insert, creating a double booking.

Instead, a PostgreSQL exclusion constraint enforces the rule (see `prisma/migrations/*_init/migration.sql`):

```sql
EXCLUDE USING gist (
  "resourceId" WITH =,
  tstzrange("startTime", "endTime", '[)') WITH &&
) WHERE ("status" = 'CONFIRMED');
```

- It is race-free: if two people book the same slot at the same instant, the database accepts one and rejects the other (HTTP 409 in the API).
- Time ranges are half-open, so back-to-back bookings (2:00-3:00 then 3:00-4:00) are allowed.
- Only CONFIRMED bookings count, so cancelling frees the slot.
- A CHECK constraint also guarantees end time is after start time.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | /api/resources | List active resources (`?all=true` includes deactivated) |
| POST | /api/resources | Create a resource |
| PATCH | /api/resources/:id | Edit or deactivate a resource |
| GET | /api/users | List users |
| GET | /api/reservations | List reservations (`?resourceId=`) |
| POST | /api/reservations | Create a reservation (409 if the slot is taken) |
| PATCH | /api/reservations/:id | Cancel a reservation |

## Assumptions and limitations

- No login. The booking form lets you choose who is booking. The User table and role field are ready for adding authentication.
- A reservation is for one resource and has a maximum length of 12 hours.
- Times are stored in UTC (timestamptz) and shown in the browser's local time.
- Tests were done manually; automated tests are a next step.

## Future improvements

Authentication and admin/member permissions, an availability calendar, usage reports, email notifications, automated tests.