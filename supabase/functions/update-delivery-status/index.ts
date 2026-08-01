// ============================================================
// Edge Function: update-delivery-status
// Updates delivery status with GPS tracking and notifications
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const STATUS_FLOW: Record<string, string> = {
  PENDING: "LOADING",
  LOADING: "FIRST_WEIGHT",
  FIRST_WEIGHT: "IN_TRANSIT",
  IN_TRANSIT: "SECOND_WEIGHT",
  SECOND_WEIGHT: "DELIVERED",
}

serve(async (req) => {
  try {
    const { delivery_id, status, gps_lat, gps_lng, weight_data } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get current delivery
    const { data: delivery, error: fetchError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", delivery_id)
      .single()

    if (fetchError) throw fetchError
    if (!delivery) throw new Error("Delivery not found")

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

    return new Response(JSON.stringify({ delivery: updated }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
