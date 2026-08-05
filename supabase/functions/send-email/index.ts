// ============================================================
// Edge Function: send-email
// Sends a transactional email via SMTP.
// Requires env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM.
// Authorization: any authenticated user (rate limited per user).
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

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
      if (!(await checkRateLimit(supabase, `send-email:${user.id}`, 50, "1 hour"))) {
        return json({ error: "Rate limit exceeded" }, 429)
      }
    } catch {
      /* rate_limit_check RPC unavailable — allow send */
    }

    const host = Deno.env.get("SMTP_HOST")
    if (!host) {
      return json({ error: "SMTP not configured (SMTP_HOST missing)" }, 501)
    }

    const { to, subject, content, html } = await req.json()
    if (!to || !subject) {
      return json({ error: "to and subject are required" }, 400)
    }

    const smtp = new SmtpClient()
    await smtp.connectTLS({
      hostname: host,
      port: Number(Deno.env.get("SMTP_PORT") || 465),
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    })

    await smtp.send({
      from: Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER") || "no-reply@zvida.co.zw",
      to,
      subject,
      content: content || "",
      html: html || undefined,
    })
    await smtp.close()

    return json({ sent: true, to })
  } catch (error) {
    return json({ error: error.message }, 500)
  }
})
