"use client"

import { Card } from "@/components/ui/card"

interface ReservationHistoryProps {
  history: any[]
}

export function ReservationHistory({ history }: ReservationHistoryProps) {
  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      created: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    }
    return colors[action] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reservation History</h2>
      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.map((entry: any) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium capitalize">{entry.action}</p>
                <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded font-medium ${getActionBadge(entry.action)}`}>
                {entry.action}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No history yet</p>
      )}
    </Card>
  )
}
