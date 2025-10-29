"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Seat } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function SeatManagement() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [floor, setFloor] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchSeats()
  }, [])

  async function fetchSeats() {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("seats").select("*").order("seat_number")

    if (error) {
      console.error("Error fetching seats:", error)
      return
    }

    setSeats(data || [])
    setLoading(false)
  }

  async function toggleSeatStatus(seat: Seat) {
    const newStatus = seat.status === "unavailable" ? "available" : "unavailable"

    try {
      const response = await fetch(`/api/admin/seats/${seat.id}/unavailable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        toast({ title: "Error", description: "Failed to update seat", variant: "destructive" })
        return
      }

      setSeats(seats.map((s) => (s.id === seat.id ? { ...s, status: newStatus } : s)))
      toast({ title: "Success", description: `Seat ${seat.seat_number} marked as ${newStatus}` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update seat", variant: "destructive" })
    }
  }

  const floorSeats = seats.filter((s) => s.floor === floor)
  const sections = Array.from(new Set(floorSeats.map((s) => s.section))).sort()

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Floor</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                floor === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading seats...</div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <h3 className="font-semibold mb-3">Section {section}</h3>
              <div className="grid grid-cols-5 gap-3">
                {floorSeats
                  .filter((s) => s.section === section)
                  .map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeatStatus(seat)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                        seat.status === "available"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-400 hover:bg-gray-500 text-white"
                      }`}
                      title={`${seat.seat_number} - Click to toggle`}
                    >
                      {seat.seat_number.split("-")[2]}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
