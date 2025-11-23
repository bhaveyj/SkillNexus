# Masterclass Registration Feature Setup

This document explains the masterclass registration feature with automated Google Meet link email delivery.

## Overview

The masterclass feature allows:
- Users to browse and register for live masterclass sessions
- Instructors to host sessions with Google Meet links
- Automated email delivery of Google Meet links upon registration
- Tracking of enrollment and registration status

## Database Schema

### New Models

1. **Masterclass**
   - Contains all masterclass details (title, instructor, date, time, duration)
   - Stores Google Meet link
   - Tracks enrollment count and max students

2. **MasterclassRegistration**
   - Links users to masterclasses they've registered for
   - Tracks registration timestamp
   - Flags whether confirmation email was sent

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install nodemailer and other required packages.

### 2. Configure Email Service

Update your `.env` file with SMTP credentials:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@skillnexus.com"
```

**For Gmail:**
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password at: https://myaccount.google.com/apppasswords
4. Use the App Password as `SMTP_PASSWORD`

**For other providers (SendGrid, Mailgun, etc.):**
Update the SMTP settings according to your provider's documentation.

### 3. Run Database Migration

```bash
npm run db:generate
npm run db:migrate
```

This will create the new `Masterclass` and `MasterclassRegistration` tables.

### 4. Seed Sample Data (Optional)

```bash
npx tsx prisma/seed-masterclasses.ts
```

This creates sample instructors and masterclasses for testing.

## File Structure

```
lib/
  email.ts                          # Email sending utility
app/
  api/
    masterclass/
      route.ts                      # List masterclasses
      register/
        route.ts                    # Registration endpoint
  dashboard/
    masterclasses/
      page.tsx                      # Masterclass browsing UI
components/
  ui/
    toast.tsx                       # Toast notifications
prisma/
  schema.prisma                     # Updated with new models
  seed-masterclasses.ts             # Sample data
```

## API Endpoints

### GET `/api/masterclass`

Lists all masterclasses with optional category filter.

**Query Parameters:**
- `category` (optional): Filter by category (AI/ML, Cloud, Web Development, Data Science)

**Response:**
```json
{
  "masterclasses": [
    {
      "id": "...",
      "title": "Advanced Machine Learning",
      "instructorName": "Dr. Sarah Johnson",
      "date": "2024-12-15T14:00:00Z",
      "time": "2:00 PM",
      "duration": "2 hours",
      "level": "ADVANCED",
      "category": "AI/ML",
      "enrollmentCount": 45,
      "maxStudents": 50,
      "meetLink": "https://meet.google.com/...",
      ...
    }
  ]
}
```

### POST `/api/masterclass/register`

Registers current user for a masterclass and sends confirmation email.

**Request Body:**
```json
{
  "masterclassId": "masterclass-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered! Check your email for the Google Meet link.",
  "registration": { ... }
}
```

**Error Responses:**
- 401: User not logged in
- 400: Already registered or masterclass full
- 404: Masterclass not found
- 500: Server error

### GET `/api/masterclass/register`

Gets current user's registrations.

**Response:**
```json
{
  "registrations": [
    {
      "id": "...",
      "registeredAt": "...",
      "emailSent": true,
      "masterclass": { ... }
    }
  ]
}
```

## Email Template

The registration confirmation email includes:
- Masterclass title and description
- Instructor name
- Date, time, and duration
- Clickable Google Meet link button
- Professional HTML formatting

## Usage Flow

1. User browses masterclasses on `/dashboard/masterclasses`
2. User clicks "Register" button
3. System checks:
   - User is authenticated
   - Not already registered
   - Masterclass not full
4. Creates registration record
5. Sends email with Google Meet link
6. Shows success toast notification
7. Updates enrollment count

## Creating a New Masterclass

As an instructor, you can create masterclasses programmatically or add a UI:

```typescript
await prisma.masterclass.create({
  data: {
    title: "Your Masterclass Title",
    description: "Description of the masterclass",
    instructorId: userId,
    instructorName: "Your Name",
    category: "AI/ML", // or Cloud, Web Development, Data Science
    level: MasterclassLevel.INTERMEDIATE,
    date: new Date("2024-12-30T14:00:00"),
    time: "2:00 PM",
    duration: "2 hours",
    meetLink: "https://meet.google.com/your-meeting-link",
    maxStudents: 50,
  }
});
```

## Troubleshooting

### Emails not sending

1. Check SMTP credentials in `.env`
2. Verify App Password is correct (for Gmail)
3. Check console logs for error messages
4. Ensure firewall allows SMTP port (587)

### TypeScript errors

Run `npm run db:generate` after schema changes to update Prisma types.

### Registration fails

1. Check database connection
2. Verify user is authenticated
3. Check console logs in browser and server
4. Ensure masterclass exists and isn't full

## Security Notes

- Google Meet links are only sent via email to registered users
- Registration requires authentication
- Rate limiting should be added for production
- Consider adding email verification before registration
- Store SMTP credentials securely (never commit .env)

## Future Enhancements

- Calendar integration (Google Calendar, Outlook)
- Reminder emails before session starts
- Recording links after session
- Attendance tracking
- Certificate generation
- Payment integration for paid masterclasses
- Waiting list when full
- Cancel registration functionality
- Instructor dashboard to manage sessions
