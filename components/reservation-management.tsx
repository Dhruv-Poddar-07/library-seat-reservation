"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { ReservationWithSeat } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ReservationManagement() {
  const [reservations, setReservations] = useState<ReservationWithSeat[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "cancelled" | "expired">("active")
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
  }, [filter])

  async function fetchReservations() {
    const supabase = getSupabaseClient()
    let query = supabase.from("reservations").select("*, seat:seats(*)")

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data, error } = await query.order("start_time", { ascending: false })

    if (error) {
      console.error("Error fetching reservations:", error)
      return
    }

    setReservations(data || [])
    setLoading(false)
  }

  async function cancelReservation(id: string) {
    try {
      const response = await fetch(`/api/reservations/${id}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        toast({ title: "Error", description: "Failed to cancel reservation", variant: "destructive" })
        return
      }

      setReservations(reservations.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)))
      toast({ title: "Success", description: "Reservation cancelled" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel reservation", variant: "destructive" })
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Reservations</h2>
        <div className="flex gap-2">
          {(["all", "active", "cancelled", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reservations...</div>
      ) : reservations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Seat</th>
                <th className="text-left py-3 px-4 font-semibold">Start Time</th>
                <th className="text-left py-3 px-4 font-semibold">End Time</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{reservation.seat.seat_number}</td>
                  <td className="py-3 px-4">{new Date(reservation.start_time).toLocaleString()}</td>
                  <td className="py-3 px-4">{new Date(reservation.end_time).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        reservation.status === "active"
                          ? "bg-green-100 text-green-800"
                          : reservation.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {reservation.status === "active" && (
                      <Button onClick={() => cancelReservation(reservation.id)} variant="destructive" size="sm">
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-12 text-muted-foreground">No reservations found</p>
      )}
    </Card>
  )
}
