# Library Seat Reservation System

A modern, concurrency-safe web application for managing library seat reservations with real-time updates, time-limited holds, and admin controls.

## Features

### User Features
- **Interactive Seat Map**: View available seats organized by floor and section
- **Easy Booking**: Reserve seats with customizable duration (1-8 hours)
- **Time-Limited Holds**: 15-minute hold period before reservation expires
- **Reservation Dashboard**: View active reservations and booking history
- **Real-Time Updates**: Live seat status updates using Supabase subscriptions
- **Cancellation**: Cancel active reservations anytime

### Admin Features
- **Seat Management**: Mark seats as available/unavailable for maintenance
- **Reservation Management**: View and manage all reservations
- **System Statistics**: Monitor seat availability and booking metrics
- **Audit Trail**: Complete history of all reservation actions

## Technical Architecture

### Database Schema
- **users**: Extended Supabase auth with role-based access (user/admin)
- **seats**: Seat inventory with floor, section, and status tracking
- **reservations**: Booking records with time-based holds and concurrency protection
- **reservation_history**: Audit trail for all reservation actions

### Concurrency Safety
The system ensures safe concurrent bookings through:
1. **Unique Constraints**: `UNIQUE(seat_id, start_time, end_time)` prevents double-booking
2. **Conflict Detection**: Pre-booking validation checks for overlapping reservations
3. **Row Level Security**: Database-level access control via RLS policies
4. **Optimistic Locking**: Error handling for race conditions (HTTP 409 Conflict)

### Time-Limited Holds
- 15-minute hold period after reservation creation
- Automatic expiration via cron job (`/api/cron/expire-holds`)
- Expired reservations marked with status "expired"
- Audit trail tracks all expirations

## API Endpoints

### Reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations` - Get user's reservations
- `POST /api/reservations/[id]/cancel` - Cancel reservation

### Admin
- `POST /api/admin/seats/[id]/unavailable` - Toggle seat availability

### Cron Jobs
- `POST /api/cron/expire-holds` - Expire time-limited holds (requires CRON_SECRET)

## Authentication
- Supabase Auth with email/password
- Email confirmation required for signup
- Session management via secure cookies
- Role-based access control (user/admin)

## Deployment

### Environment Variables
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_cron_secret
\`\`\`

### Database Setup
1. Run `scripts/01-init-schema.sql` to create tables and RLS policies
2. Run `scripts/02-seed-data.sql` to populate initial seats
3. Set up cron job to call `/api/cron/expire-holds` every 5 minutes

### Deployment Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables in Vercel
4. Deploy: `vercel deploy`
5. Run database migrations in Supabase console

## Testing Concurrency

To test concurrent booking attempts:

1. Open two browser windows/tabs
2. Navigate to the seat map in both
3. Select the same seat in both windows
4. Click "Reserve Seat" in both windows simultaneously
5. One will succeed, the other will show "Seat was just booked by another user"

The system handles this gracefully through:
- Database unique constraints
- Conflict detection in the API
- User-friendly error messages
- Automatic retry capability

## Performance Considerations

- Indexed queries on frequently accessed columns (user_id, seat_id, status, time ranges)
- Real-time subscriptions for live seat updates
- Server-side rendering for dashboard pages
- Optimized seat grid rendering with React
- Efficient time-based queries with proper indexing

## Security

- Row Level Security (RLS) enforces data privacy
- Admin-only endpoints for seat management
- User can only view/cancel their own reservations
- Secure authentication with Supabase
- CSRF protection via Next.js built-in mechanisms
- Input validation on all API endpoints

## Future Enhancements

- Email notifications for reservation confirmations
- Recurring reservations for regular users
- Seat preferences and favorites
- Analytics dashboard for library staff
- Integration with calendar systems
- Mobile app with push notifications
- Waitlist functionality for fully booked times
