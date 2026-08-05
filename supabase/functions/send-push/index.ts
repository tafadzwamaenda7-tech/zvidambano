// ============================================================
// Edge Function: send-push
// Delivers a web push to a user's registered subscriptions.
// Requires env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (and optionally
// VAPID_SUBJECT). Requires the `push_subscriptions` table.
// Authorization: any authenticated user (rate limited per user).
// Users may only push to themselves unless their role is staff
// (admin/broker/compliance/support).
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "npm:web-push@3.6.7"

const JSON_HEADERS = { "Content-Type": "application/json" }
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

const STAFF_ROLES = ["admin", "broker", "compliance", "support"]

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
    const { user, error } = await authenticate(req)
    if (error) return error

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    try {
      if (!(await checkRateLimit(supabase, `send-push:${user.id}`, 120, "1 hour"))) {
        return json({ error: "Rate limit exceeded" }, 429)
      }
    } catch {
      /* rate_limit_check RPC unavailable — allow send */
    }

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY")
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY")
    if (!vapidPublic || !vapidPrivate) {
      return json({ error: "Web push not configured (VAPID keys missing)" }, 501)
    }
    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") || "mailto:no-reply@zvida.co.zw",
      vapidPublic,
      vapidPrivate
    )

    const { userId, title, body, url } = await req.json()
    if (!userId || !title) {
      return json({ error: "userId and title are required" }, 400)
    }

    // Users can only push to themselves unless staff.
    if (userId !== user.id) {
      const { data: actor } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()
      if (!actor || !STAFF_ROLES.includes(actor.role)) {
        return json({ error: "Not authorized to push to this user" }, 403)
      }
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", userId)

    if (!subs || subs.length === 0) {
      return json({ sent: 0, total: 0 })
    }

    const payload = JSON.stringify({ title, body: body || "", url: url || "/" })
    let sent = 0
    const failures: unknown[] = []

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 86400 }
        )
        sent++
      } catch (err: any) {
        // Subscription no longer valid — drop it so we don't retry forever.
        const code = err?.statusCode || err?.status
        if (code === 410 || code === 404 || code === 403) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
        }
        failures.push({ endpoint: sub.endpoint, status: code || "error", message: String(err?.message || err) })
      }
    }

    return json({ sent, total: subs.length, failures })
  } catch (error: any) {
    return json({ error: error.message }, 500)
  }
})
