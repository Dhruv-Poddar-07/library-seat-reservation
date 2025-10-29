import { getSupabaseServer } from "@/lib/supabase/server"
import { SeatMap } from "@/components/seat-map"
import { redirect } from "next/navigation"
import { UserNav } from "@/components/user-nav"

export default async function Home() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <UserNav user={user} />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Library Seat Reservation</h1>
          <p className="text-muted-foreground">Reserve your study desk for focused work</p>
        </div>
        <SeatMap />
      </div>
    </main>
  )
}
