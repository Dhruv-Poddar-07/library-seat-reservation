"use client"

import { useState } from "react"
import type { Seat } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ReservationSuccessModal } from "./reservation-success-modal"

interface ReservationFormProps {
  seat: Seat
  onReservationComplete: () => void
}

export function ReservationForm({ seat, onReservationComplete }: ReservationFormProps) {
  const [loading, setLoading] = useState(false)
  const [duration, setDuration] = useState(2) // hours
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastReservation, setLastReservation] = useState(null)
  const { toast } = useToast()

  async function handleReserve() {
    setLoading(true)
    try {
      console.log("[v0] Attempting reservation for seat:", seat.id, "duration:", duration)
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seat_id: seat.id,
          duration,
        }),
      })

      console.log("[v0] Reservation response status:", response.status)
      const data = await response.json()
      console.log("[v0] Reservation response data:", data)

      if (!response.ok) {
        console.log("[v0] Reservation failed:", data.error)
        toast({ title: "Error", description: data.error || "Failed to reserve seat", variant: "destructive" })
        return
      }

      console.log("[v0] Reservation successful:", data)
      setLastReservation(data)
      setShowSuccess(true)
    } catch (error) {
      console.log("[v0] Reservation error:", error)
      toast({ title: "Error", description: "An error occurred while reserving the seat", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function handleContinueReserving() {
    setShowSuccess(false)
    setLastReservation(null)
    onReservationComplete()
  }

  return (
    <>
      <Card className="p-6 sticky top-8">
        <h3 className="font-semibold mb-4">Reservation Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Seat</p>
            <p className="text-lg font-semibold">{seat.seat_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Duration (hours)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                <option key={h} value={h}>
                  {h} hour{h > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              Hold expires in <span className="font-semibold">15 minutes</span>
            </p>
          </div>
          <Button onClick={handleReserve} disabled={loading} className="w-full">
            {loading ? "Reserving..." : "Reserve Seat"}
          </Button>
        </div>
      </Card>

      {showSuccess && lastReservation && (
        <ReservationSuccessModal reservation={lastReservation} onContinue={handleContinueReserving} />
      )}
    </>
  )
}
