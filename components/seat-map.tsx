"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Seat } from "@/lib/types"
import { SeatGrid } from "./seat-grid"
import { ReservationForm } from "./reservation-form"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SeatMap() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [loading, setLoading] = useState(true)
  const [floor, setFloor] = useState(1)

  useEffect(() => {
    fetchSeats()
    const subscription = getSupabaseClient()
      .channel("seats")
      .on("postgres_changes", { event: "*", schema: "public", table: "seats" }, () => {
        fetchSeats()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
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

  async function handleReservationComplete() {
    await fetchSeats()
    setSelectedSeat(null)
  }

  const floorSeats = seats.filter((s) => s.floor === floor)
  const sections = Array.from(new Set(floorSeats.map((s) => s.section))).sort()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Floor</h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFloor(f)
                    setSelectedSeat(null)
                  }}
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
            <Tabs defaultValue={sections[0]} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}>
                {sections.map((section) => (
                  <TabsTrigger key={section} value={section}>
                    Section {section}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sections.map((section) => (
                <TabsContent key={section} value={section} className="mt-6">
                  <SeatGrid
                    seats={floorSeats.filter((s) => s.section === section)}
                    selectedSeat={selectedSeat}
                    onSelectSeat={setSelectedSeat}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold mb-4">Legend</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded"></div>
                <span className="text-sm">Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-400 rounded"></div>
                <span className="text-sm">Unavailable</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        {selectedSeat ? (
          <ReservationForm seat={selectedSeat} onReservationComplete={handleReservationComplete} />
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Select a seat to make a reservation</p>
          </Card>
        )}
      </div>
    </div>
  )
}
