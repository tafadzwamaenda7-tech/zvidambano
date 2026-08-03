// ============================================================
// Edge Function: update-delivery-status
// Updates delivery status with GPS tracking and notifications.
// Authorization: assigned driver, or admin/broker. Rate limited.
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const JSON_HEADERS = { "Content-Type": "application/json" }
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })

const STATUS_FLOW: Record<string, string> = {
  PENDING: "LOADING",
  LOADING: "FIRST_WEIGHT",
  FIRST_WEIGHT: "IN_TRANSIT",
  IN_TRANSIT: "SECOND_WEIGHT",
  SECOND_WEIGHT: "DELIVERED",
}

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { delivery_id, contract_id, status, gps_lat, gps_lng, weight_data } = await req.json()

    if (!delivery_id && !contract_id) {
      return json({ error: "delivery_id or contract_id is required" }, 400)
    }

    // Resolve the delivery by id, or fall back to the single delivery for a contract.
    let query = supabase.from("deliveries").select("*")
    if (delivery_id) query = query.eq("id", delivery_id).maybeSingle()
    else query = query.eq("contract_id", contract_id).maybeSingle()

    const { data: delivery, error: fetchError } = await query

    if (fetchError || !delivery) {
      return json({ error: "Delivery not found" }, 404)
    }

    // Authorization: assigned driver, or admin/broker
    const privileged = await isPrivileged(client, user.id)
    if (!privileged && delivery.driver_id !== user.id) {
      return json({ error: "Forbidden: not the assigned driver" }, 403)
    }

    if (!(await checkRateLimit(supabase, `update-delivery-status:${user.id}`, 120, "1 hour"))) {
      return json({ error: "Rate limit exceeded" }, 429)
    }

    // Build update object
    const updates: Record<string, any> = {
      status: status || STATUS_FLOW[delivery.status] || delivery.status,
    }

    // Update GPS if provided
    if (gps_lat !== undefined) updates.gps_lat = gps_lat
    if (gps_lng !== undefined) updates.gps_lng = gps_lng

    // Update weight data if provided
    if (weight_data) {
      if (weight_data.first_weight !== undefined) updates.first_weight = weight_data.first_weight
      if (weight_data.first_weighbridge_ticket) updates.first_weighbridge_ticket = weight_data.first_weighbridge_ticket
      if (weight_data.second_weight !== undefined) updates.second_weight = weight_data.second_weight
      if (weight_data.second_weighbridge_ticket) updates.second_weighbridge_ticket = weight_data.second_weighbridge_ticket
      if (weight_data.bucket_count !== undefined) updates.bucket_count = weight_data.bucket_count
      if (weight_data.bucket_capacity_kg !== undefined) updates.bucket_capacity_kg = weight_data.bucket_capacity_kg
      if (weight_data.bucket_photo_url) updates.bucket_photo_url = weight_data.bucket_photo_url
      if (weight_data.bucket_approved !== undefined) updates.bucket_approved = weight_data.bucket_approved
    }

    // Update delivery
    const { data: updated, error: updateError } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", delivery_id)
      .select()
      .single()

    if (updateError) throw updateError

    // Get contract to find parties for notifications
    const { data: contract } = await supabase
      .from("contracts")
      .select("farmer_id, offtaker_id, broker_id, contract_number")
      .eq("id", delivery.contract_id)
      .single()

    if (contract) {
      const statusMsg = updates.status !== delivery.status
        ? `Delivery status changed to ${updates.status}`
        : "Delivery updated"

      const notifications = [
        contract.farmer_id,
        contract.offtaker_id,
        contract.broker_id,
      ].filter(Boolean).map((user_id) => ({
        user_id,
        title: "Delivery Update",
        body: `${statusMsg} for contract ${contract.contract_number}`,
        type: "delivery",
        action_url: `/driver-dashboard?tab=deliveries&id=${delivery_id}`,
      }))

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications)
      }

      // If delivery is DELIVERED, update contract status
      if (updates.status === "DELIVERED") {
        await supabase
          .from("contracts")
          .update({ status: "PENDING_SETTLEMENT" })
          .eq("id", delivery.contract_id)
      }
    }

    return json({ delivery: updated })
  } catch (error) {
    return json({ error: error.message }, 400)
  }
})
