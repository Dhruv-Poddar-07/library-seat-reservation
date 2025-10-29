import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin-nav"
import { SeatManagement } from "@/components/seat-management"
import { ReservationManagement } from "@/components/reservation-management"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userProfile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userProfile?.role !== "admin") {
    redirect("/")
  }

  // Fetch stats
  const { data: seats } = await supabase.from("seats").select("status")
  const { data: reservations } = await supabase.from("reservations").select("status").eq("status", "active")

  const stats = {
    totalSeats: seats?.length || 0,
    availableSeats: seats?.filter((s: any) => s.status === "available").length || 0,
    reservedSeats: seats?.filter((s: any) => s.status === "reserved").length || 0,
    unavailableSeats: seats?.filter((s: any) => s.status === "unavailable").length || 0,
    activeReservations: reservations?.length || 0,
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminNav />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage library seats and reservations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Seats</p>
            <p className="text-2xl font-bold">{stats.totalSeats}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.availableSeats}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Reserved</p>
            <p className="text-2xl font-bold text-blue-600">{stats.reservedSeats}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Unavailable</p>
            <p className="text-2xl font-bold text-gray-600">{stats.unavailableSeats}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active Bookings</p>
            <p className="text-2xl font-bold">{stats.activeReservations}</p>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="seats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seats">Seat Management</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
          </TabsList>

          <TabsContent value="seats" className="mt-6">
            <SeatManagement />
          </TabsContent>

          <TabsContent value="reservations" className="mt-6">
            <ReservationManagement />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
