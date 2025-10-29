"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { autoConfirmUser } from "@/app/actions/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          console.log("[v0] User already logged in, redirecting to home")
          router.push("/")
          return
        }
      } catch (error) {
        console.error("[v0] Error checking auth:", error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  async function handleAuth() {
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      if (isSignUp) {
        console.log("[v0] Attempting signup with:", email)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error("[v0] Signup error:", error)
          toast({ title: "Error", description: error.message, variant: "destructive" })
          return
        }

        console.log("[v0] Signup successful:", data)

        if (data.user?.id) {
          const confirmResult = await autoConfirmUser(data.user.id)
          if (confirmResult.success) {
            console.log("[v0] User auto-confirmed")
          }
        }

        toast({
          title: "Success",
          description: "Account created! Signing you in...",
        })

        // Auto sign in after signup
        setTimeout(() => {
          setEmail("")
          setPassword("")
          setIsSignUp(false)
        }, 1000)
      } else {
        console.log("[v0] Attempting signin with:", email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("[v0] Signin error:", error)
          toast({ title: "Error", description: error.message, variant: "destructive" })
          return
        }

        console.log("[v0] Signin successful:", data)
        toast({ title: "Success", description: "Signed in successfully" })

        // Wait a moment for session to be established, then redirect
        setTimeout(() => {
          console.log("[v0] Redirecting to home")
          router.push("/")
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Library Seat Reservation</h1>
        <p className="text-sm text-muted-foreground mb-6">Reserve your study desk</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleAuth()}
              className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="test@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleAuth()}
              className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <Button onClick={handleAuth} disabled={loading} className="w-full">
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setEmail("")
              setPassword("")
            }}
            className="w-full text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Demo credentials:</p>
            <p className="text-xs text-muted-foreground">Email: test@example.com</p>
            <p className="text-xs text-muted-foreground">Password: password123</p>
          </div>
        </div>
      </Card>
    </main>
  )
}
