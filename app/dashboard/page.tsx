import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReservationHistory } from "@/components/reservation-history"
import { UserNav } from "@/components/user-nav"
import { Card } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Fetch active reservations
  const { data: activeReservations } = await supabase
    .from("reservations")
    .select("*, seat:seats(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("start_time", { ascending: true })

  // Fetch reservation history
  const { data: history } = await supabase
    .from("reservation_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-background">
      <UserNav user={userProfile} />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Reservations</h1>
          <p className="text-muted-foreground">Manage your library seat bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Active Reservations */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Active Reservations</h2>
              {activeReservations && activeReservations.length > 0 ? (
                <div className="space-y-4">
                  {activeReservations.map((reservation: any) => (
                    <div
                      key={reservation.id}
                      className="border border-border rounded-lg p-4 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-semibold">{reservation.seat.seat_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reservation.start_time).toLocaleString()} -{" "}
                          {new Date(reservation.end_time).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: <span className="font-medium text-green-600">Active</span>
                        </p>
                      </div>
                      <CancelButton reservationId={reservation.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active reservations</p>
              )}
            </Card>

            {/* Reservation History */}
            <ReservationHistory history={history} />
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reservations</p>
                  <p className="text-2xl font-bold">{activeReservations?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{history?.length || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <a
                href="/"
                className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
              >
                Book New Seat
              </a>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function CancelButton({ reservationId }: { reservationId: string }) {
  return (
    <form
      action={async () => {
        "use server"
        const supabase = await getSupabaseServer()
        await supabase.from("reservations").update({ status: "cancelled" }).eq("id", reservationId)
      }}
    >
      <button
        type="submit"
        className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity"
      >
        Cancel
      </button>
    </form>
  )
}
