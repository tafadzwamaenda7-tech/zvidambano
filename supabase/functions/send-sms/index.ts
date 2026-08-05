// ============================================================
// Edge Function: send-sms
// Sends an SMS via Africa's Talking.
// Requires env: AT_USERNAME, AT_API_KEY (optional AT_SENDER_ID).
// Authorization: any authenticated user (rate limited per user).
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const JSON_HEADERS = { "Content-Type": "application/json" }
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

async function authenticate(req: Request): Promise<{ user?: any; client?: any; error?: Response }> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: json({ error: "Missing or malformed Authorization header" }, 401) }
  }
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) {
    return { error: json({ error: "Invalid or expired token" }, 401) }
  }
  return { user: data.user, client }
}

async function checkRateLimit(supabase: any, bucket: string, limit: number, window: string): Promise<boolean> {
  const { data } = await supabase.rpc("rate_limit_check", {
    p_bucket: bucket,
    p_limit: limit,
    p_window: window,
  })
  return data === true
}

serve(async (req) => {
  try {
    const { user, client, error } = await authenticate(req)
    if (error) return error

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    try {
      if (!(await checkRateLimit(supabase, `send-sms:${user.id}`, 20, "1 hour"))) {
        return json({ error: "Rate limit exceeded" }, 429)
      }
    } catch {
      /* rate_limit_check RPC unavailable — allow send */
    }

    const apiKey = Deno.env.get("AT_API_KEY")
    if (!apiKey) {
      return json({ error: "SMS not configured (AT_API_KEY missing)" }, 501)
    }

    const { to, message } = await req.json()
    if (!to || !message) {
      return json({ error: "to and message are required" }, 400)
    }

    const params = new URLSearchParams({
      username: Deno.env.get("AT_USERNAME") || "sandbox",
      to,
      message,
    })
    const from = Deno.env.get("AT_SENDER_ID")
    if (from) params.set("from", from)

    const resp = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": apiKey,
        "Accept": "application/json",
      },
      body: params.toString(),
    })

    const body = await resp.json().catch(() => null)
    if (!resp.ok) {
      return json({ error: "SMS gateway error", gateway: body }, 502)
    }
    return json({ sent: true, to, gateway: body })
  } catch (error) {
    return json({ error: error.message }, 500)
  }
})
