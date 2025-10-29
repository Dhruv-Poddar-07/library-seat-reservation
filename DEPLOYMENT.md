# Deployment Guide

## Prerequisites
- Vercel account
- Supabase project
- GitHub repository

## Step 1: Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run:
   - `scripts/01-init-schema.sql` - Create tables and RLS policies
   - `scripts/02-seed-data.sql` - Populate initial seats

3. Get your credentials:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > anon public
   - Service Role Key: Settings > API > service_role secret

## Step 2: Vercel Deployment

1. Push code to GitHub
2. Go to vercel.com and import your repository
3. Add environment variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
   CRON_SECRET=<generate_random_string>
   \`\`\`
4. Deploy

## Step 3: Cron Job Setup

To enable automatic hold expiration:

1. In Vercel dashboard, go to Cron Jobs
2. Create new cron job:
   - URL: `https://your-domain.vercel.app/api/cron/expire-holds`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Authorization: Add header `Authorization: Bearer <CRON_SECRET>`

## Step 4: Create Admin User

1. Sign up a new account in your app
2. In Supabase, go to SQL Editor and run:
   \`\`\`sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   \`\`\`

## Monitoring

- Check Supabase logs for database errors
- Monitor Vercel function logs for API errors
- Set up alerts for failed cron jobs
- Track database performance metrics

## Troubleshooting

### Seats not loading
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Verify RLS policies are enabled
- Check browser console for errors

### Reservations failing
- Verify SUPABASE_SERVICE_ROLE_KEY is set
- Check database for constraint violations
- Review API logs in Vercel

### Cron job not running
- Verify CRON_SECRET is set correctly
- Check cron job logs in Vercel
- Ensure URL is accessible
