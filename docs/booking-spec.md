# Askari Event Place — Booking and Access Specification

## Booking Inquiry Record

Each booking inquiry is stored in the `bookingInquiries` table. It has a numeric identifier and records the customer name, phone, optional email, selected event type, requested event date, estimated guest count, optional special requests, a management status, and timestamps for creation and latest update. Dates are stored as a date-only string because a booking inquiry does not require a time-zone-dependent timestamp; audit timestamps use database-managed UTC timestamps.

| Field | Type | Validation / purpose |
| --- | --- | --- |
| `id` | Integer | Primary key. |
| `fullName` | String | Required, 2–120 characters. |
| `phone` | String | Required, 7–32 characters. |
| `email` | String | Optional; validated when supplied. |
| `eventType` | Enum | Wedding, Mehndi, Walima, Birthday, Corporate, Social Celebration, or Other. |
| `eventDate` | String | Required ISO date in the future; availability must be confirmed by the venue. |
| `guestCount` | Integer | Required, 1–1100. |
| `specialRequests` | Text | Optional, capped at 2,000 characters. |
| `status` | Enum | New, Contacted, Confirmed, Declined, or Closed. |
| `createdAt`, `updatedAt` | Timestamp | Audit record for dashboard ordering and management. |

## Interaction Contract

The public `booking.create` procedure validates, persists, and then sends a non-blocking owner notification containing the customer name, event type, requested date, and contact number. The inquiry remains saved even if an owner notification provider is temporarily unavailable; the procedure returns a notification status for observability rather than exposing it in the customer experience.

The protected `booking.adminList` and `booking.adminUpdateStatus` procedures use the existing owner/admin middleware. The public site never sees management records beyond its own successful submission message. The `/admin` route is protected in both the UI and server procedure layer, and only authenticated accounts with the `admin` role can read or update any inquiry.
