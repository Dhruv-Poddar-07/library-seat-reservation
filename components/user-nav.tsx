"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { User as AuthUser } from "@supabase/supabase-js"

interface UserNavProps {
  user: AuthUser | null
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Library Seat Reservation</h1>
          {user && <p className="text-sm text-muted-foreground">{user.email}</p>}
        </div>
        <div className="flex gap-4">
          <a href="/" className="text-sm hover:text-primary transition-colors">
            Book Seat
          </a>
          <a href="/dashboard" className="text-sm hover:text-primary transition-colors">
            My Reservations
          </a>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
