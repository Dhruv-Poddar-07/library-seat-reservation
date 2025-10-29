export interface User {
  id: string
  email: string
  full_name: string | null
  role: "user" | "admin"
  created_at: string
}

export interface Seat {
  id: string
  seat_number: string
  floor: number
  section: string
  status: "available" | "reserved" | "unavailable"
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  seat_id: string
  start_time: string
  end_time: string
  status: "active" | "cancelled" | "completed" | "expired"
  hold_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface ReservationWithSeat extends Reservation {
  seat: Seat
}
