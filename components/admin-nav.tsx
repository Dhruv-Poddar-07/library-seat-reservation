"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AdminNav() {
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
          <h1 className="text-lg font-semibold">Library Admin Panel</h1>
          <p className="text-sm text-muted-foreground">System Administration</p>
        </div>
        <div className="flex gap-4">
          <a href="/" className="text-sm hover:text-primary transition-colors">
            User View
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
