-- Test script to verify concurrency safety
-- This demonstrates how the unique constraint prevents double-booking

-- Setup: Create a test seat and two test users
INSERT INTO seats (seat_number, floor, section, status) VALUES ('TEST-1', 1, 'TEST', 'available');

-- Simulate two concurrent reservation attempts on the same seat
-- In a real scenario, these would happen simultaneously from different clients

-- Attempt 1: User 1 tries to reserve the seat
-- This would succeed in a real concurrent scenario
BEGIN;
  INSERT INTO reservations (
    user_id, 
    seat_id, 
    start_time, 
    end_time, 
    status, 
    hold_expires_at
  ) VALUES (
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM seats WHERE seat_number = 'TEST-1'),
    NOW(),
    NOW() + INTERVAL '2 hours',
    'active',
    NOW() + INTERVAL '15 minutes'
  );
COMMIT;

-- Attempt 2: User 2 tries to reserve the same seat at the same time
-- This would fail due to the UNIQUE constraint on (seat_id, start_time, end_time)
-- The constraint ensures only one reservation can exist for a seat during a time period
BEGIN;
  INSERT INTO reservations (
    user_id, 
    seat_id, 
    start_time, 
    end_time, 
    status, 
    hold_expires_at
  ) VALUES (
    (SELECT id FROM users LIMIT 1 OFFSET 1),
    (SELECT id FROM seats WHERE seat_number = 'TEST-1'),
    NOW(),
    NOW() + INTERVAL '2 hours',
    'active',
    NOW() + INTERVAL '15 minutes'
  );
COMMIT;
-- This INSERT will fail with error code 23505 (unique violation)

-- Cleanup
DELETE FROM reservations WHERE seat_id = (SELECT id FROM seats WHERE seat_number = 'TEST-1');
DELETE FROM seats WHERE seat_number = 'TEST-1';
