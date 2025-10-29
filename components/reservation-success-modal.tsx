"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import type { Reservation } from "@/lib/types"

interface ReservationSuccessModalProps {
  reservation: Reservation
  onContinue: () => void
}

export function ReservationSuccessModal({ reservation, onContinue }: ReservationSuccessModalProps) {
  const router = useRouter()

  const startTime = new Date(reservation.start_time).toLocaleString()
  const endTime = new Date(reservation.end_time).toLocaleString()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
          <p className="text-muted-foreground mb-6">Your seat has been successfully reserved</p>

          <div className="bg-muted p-4 rounded-lg mb-6 text-left space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Seat</p>
              <p className="font-semibold text-lg">{reservation.seat_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="font-semibold">{startTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-semibold">{endTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reservation ID</p>
              <p className="font-mono text-sm">{reservation.id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onContinue} className="flex-1 bg-transparent">
              Continue Reserving
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="flex-1">
              View Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
