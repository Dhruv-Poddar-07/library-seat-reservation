import { getSupabaseServer } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// This endpoint should be called by a cron job (e.g., Vercel Cron)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await getSupabaseServer()
    const now = new Date().toISOString()

    // Find expired holds
    const { data: expiredReservations, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("status", "active")
      .lt("hold_expires_at", now)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!expiredReservations || expiredReservations.length === 0) {
      return NextResponse.json({ message: "No expired holds" })
    }

    // Mark expired reservations
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "expired" })
      .in(
        "id",
        expiredReservations.map((r) => r.id),
      )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log to history
    for (const reservation of expiredReservations) {
      await supabase.from("reservation_history").insert({
        reservation_id: reservation.id,
        user_id: reservation.user_id,
        action: "expired",
      })
    }

    return NextResponse.json({ message: `Expired ${expiredReservations.length} holds` })
  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
