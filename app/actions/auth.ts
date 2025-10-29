"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function autoConfirmUser(userId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle errors silently
          }
        },
      },
    })

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirmed_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error confirming user:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Unexpected error in autoConfirmUser:", error)
    return { success: false, error: "Failed to confirm user" }
  }
}

export async function ensureUserRecord(userId: string, email: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle errors silently
          }
        },
      },
    })

    const { data: existingUser, error: fetchError } = await supabase.from("users").select("id").eq("id", userId)

    if (existingUser && existingUser.length > 0) {
      return { success: true, created: false }
    }

    // Create user record if it doesn't exist
    const { error } = await supabase.from("users").insert({
      id: userId,
      email,
      role: "user",
    })

    if (error) {
      console.error("[v0] Error creating user record:", error)
      return { success: false, error: error.message }
    }

    return { success: true, created: true }
  } catch (error) {
    console.error("[v0] Unexpected error in ensureUserRecord:", error)
    return { success: false, error: "Failed to ensure user record" }
  }
}
