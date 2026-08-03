// ============================================================
// Edge Function: create-contract
// Creates a contract with auto-generated contract number.
// Authorization: admin/broker only. Rate limited per user.
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

async function isPrivileged(client: any, uid: string): Promise<boolean> {
  const { data } = await client
    .from("users")
    .select("role")
    .eq("id", uid)
    .maybeSingle()
  return !!data && (data.role === "admin" || data.role === "broker")
}

async function checkRateLimit(supabase: any, bucket: string, limit: number, window: string): Promise<boolean> {
  const { data: allowed } = await supabase.rpc("rate_limit_check", {
    p_bucket: bucket,
    p_limit: limit,
    p_window: window,
  })
  return allowed === true
}

serve(async (req) => {
  try {
    const { user, client, error } = await authenticate(req)
    if (error) return error

    if (!(await isPrivileged(client, user.id))) {
      return json({ error: "Forbidden: requires admin or broker role" }, 403)
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    if (!(await checkRateLimit(supabase, `create-contract:${user.id}`, 30, "1 hour"))) {
      return json({ error: "Rate limit exceeded" }, 429)
    }

    const { farmer_id, offtaker_id, broker_id, commodity_id, listing_id, quantity, unit, farmer_price, offtaker_price, broker_commission, delivery } = await req.json()

    if (!farmer_id || !offtaker_id || !quantity) {
      return json({ error: "farmer_id, offtaker_id and quantity are required" }, 400)
    }

    // Generate contract number
    const contract_number = `ZV-${Date.now().toString(36).toUpperCase()}`

    // Insert contract
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .insert({
        contract_number,
        farmer_id,
        offtaker_id,
        broker_id,
        commodity_id,
        listing_id,
        quantity,
        unit: unit || "kg",
        farmer_price,
        offtaker_price,
        broker_commission,
        status: "PENDING",
      })
      .select()
      .single()

    if (contractError) throw contractError

    // Create notifications for all parties
    const notifications = [
      { user_id: farmer_id, title: "New Contract Created", body: `Contract ${contract_number} has been created.`, type: "contract", action_url: `/farmer-dashboard?tab=contracts&id=${contract.id}` },
      { user_id: offtaker_id, title: "New Contract Created", body: `Contract ${contract_number} has been created.`, type: "contract", action_url: `/offtaker-dashboard?tab=contracts&id=${contract.id}` },
      { user_id: broker_id, title: "New Contract Created", body: `Contract ${contract_number} has been created.`, type: "contract", action_url: `/zvida-dashboard?tab=contracts&id=${contract.id}` },
    ].filter(n => n.user_id)

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications)
    }

    // Update listing status if listing_id provided
    if (listing_id) {
      await supabase.from("listings").update({ status: "sold" }).eq("id", listing_id)
    }

    // Create the delivery row up front so assigned drivers can see the contract
    // from the very first status transition. If a delivery is already present
    // (e.g. created by the auto_create_delivery trigger), enrich it instead.
    if (delivery && typeof delivery === "object") {
      const deliveryRow = {
        contract_id: contract.id,
        driver_id: delivery.driver_id || null,
        origin: delivery.origin || null,
        destination: delivery.destination || null,
        vehicle_reg: delivery.vehicle_reg || null,
        status: "PENDING",
      }
      const { data: existingDelivery } = await supabase
        .from("deliveries")
        .select("id")
        .eq("contract_id", contract.id)
        .maybeSingle()
      if (existingDelivery?.id) {
        await supabase.from("deliveries").update(deliveryRow).eq("id", existingDelivery.id)
      } else {
        await supabase.from("deliveries").insert(deliveryRow)
      }
    }

    return json({ contract, delivery: delivery ? { contract_id: contract.id } : null })
  } catch (error) {
    return json({ error: error.message }, 400)
  }
})
