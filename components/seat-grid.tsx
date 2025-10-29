"use client"

import type { Seat } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SeatGridProps {
  seats: Seat[]
  selectedSeat: Seat | null
  onSelectSeat: (seat: Seat) => void
}

export function SeatGrid({ seats, selectedSeat, onSelectSeat }: SeatGridProps) {
  const getSeatColor = (seat: Seat) => {
    if (seat.status === "available") return "bg-green-500 hover:bg-green-600"
    if (seat.status === "reserved") return "bg-blue-500 cursor-not-allowed"
    return "bg-gray-400 cursor-not-allowed"
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {seats.map((seat) => (
        <button
          key={seat.id}
          onClick={() => seat.status === "available" && onSelectSeat(seat)}
          disabled={seat.status !== "available"}
          className={cn(
            "aspect-square rounded-lg font-semibold text-sm transition-all",
            getSeatColor(seat),
            selectedSeat?.id === seat.id && "ring-2 ring-primary ring-offset-2",
            seat.status === "available" && "cursor-pointer",
          )}
          title={`${seat.seat_number} - ${seat.status}`}
        >
          {seat.seat_number.split("-")[2]}
        </button>
      ))}
    </div>
  )
}
