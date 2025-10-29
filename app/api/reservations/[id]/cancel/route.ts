import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Get reservation
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check ownership
    if (reservation.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if already completed or cancelled
    if (reservation.status !== "active") {
      return NextResponse.json({ error: "Cannot cancel this reservation" }, { status: 400 })
    }

    // Update reservation status
    const { error: updateError } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log to history
    await supabase.from("reservation_history").insert({
      reservation_id: id,
      user_id: user.id,
      action: "cancelled",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
