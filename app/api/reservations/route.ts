import { getSupabaseServer, getSupabaseServiceRole } from "@/lib/supabase/server"
import { ensureUserRecord } from "@/app/actions/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Reservation API called")
    const supabase = await getSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User from auth:", user?.id, user?.email)

    if (!user) {
      console.log("[v0] No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ensureResult = await ensureUserRecord(user.id, user.email || "")
    console.log("[v0] ensureUserRecord result:", ensureResult)
    if (!ensureResult.success) {
      console.log("[v0] Failed to ensure user record")
      return NextResponse.json({ error: "Failed to create user record" }, { status: 500 })
    }

    const { seat_id, start_time, end_time, duration } = await request.json()
    console.log("[v0] Request body:", { seat_id, duration })

    // Validate input
    if (!seat_id || !duration) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate times
    const now = new Date()
    const startTime = new Date(now)
    const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000)
    const holdExpiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 min hold

    console.log("[v0] Calculated times:", { startTime, endTime, holdExpiresAt })

    // Check if seat exists and is available
    const { data: seat, error: seatError } = await supabase.from("seats").select("*").eq("id", seat_id).single()

    console.log("[v0] Seat check:", { seat, seatError })

    if (seatError || !seat) {
      console.log("[v0] Seat not found")
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    if (seat.status !== "available") {
      console.log("[v0] Seat not available, status:", seat.status)
      return NextResponse.json({ error: "Seat is not available" }, { status: 409 })
    }

    // Check for conflicting reservations
    const { data: conflicts, error: conflictError } = await supabase
      .from("reservations")
      .select("*")
      .eq("seat_id", seat_id)
      .eq("status", "active")
      .lt("end_time", endTime.toISOString())
      .gt("start_time", startTime.toISOString())

    console.log("[v0] Conflict check:", { conflicts, conflictError })

    if (conflictError) {
      console.log("[v0] Conflict check error")
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (conflicts && conflicts.length > 0) {
      console.log("[v0] Conflicts found")
      return NextResponse.json({ error: "Seat is already reserved for this time" }, { status: 409 })
    }

    // Create reservation with concurrency protection
    const { data: reservation, error: insertError } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        seat_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "active",
        hold_expires_at: holdExpiresAt.toISOString(),
      })
      .select()
      .single()

    console.log("[v0] Reservation insert result:", { reservation, insertError })

    if (insertError) {
      // Handle unique constraint violation (double booking)
      if (insertError.code === "23505") {
        console.log("[v0] Double booking detected")
        return NextResponse.json({ error: "Seat was just booked by another user" }, { status: 409 })
      }
      console.log("[v0] Insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[v0] Reservation created successfully, adding to history")
    const serviceRole = await getSupabaseServiceRole()
    await serviceRole.from("reservation_history").insert({
      reservation_id: reservation.id,
      user_id: user.id,
      action: "created",
      notes: `Reserved for ${duration} hours`,
    })

    console.log("[v0] Reservation complete")
    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error("[v0] Reservation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("*, seat:seats(*)")
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
