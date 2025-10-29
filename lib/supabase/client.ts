import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

export const getSupabaseClient = createClient

export async function getAuthUser() {
  const supabase = createClient()
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[v0] Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("[v0] Exception getting user:", error)
    return null
  }
}
