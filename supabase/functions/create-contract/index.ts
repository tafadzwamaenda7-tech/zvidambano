// ============================================================
// Edge Function: create-contract
// Creates a contract with auto-generated contract number
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { farmer_id, offtaker_id, broker_id, commodity_id, listing_id, quantity, unit, farmer_price, offtaker_price, broker_commission } = await req.json()

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

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

    return new Response(JSON.stringify({ contract }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
</arg_value><task_progress>- [x] Create Supabase SQL schema
- [x] Update .env with instructions
- [x] Read existing realtime.ts
- [ ] Create Supabase Edge Functions for backend logic
- [ ] Create WebSocket/realtime setup guide
- [ ] Create Storage configuration
- [ ] Provide comprehensive backend guide</task_progress>
</write_to_file>