// ============================================================
// Edge Function: generate-settlement
// Generates farmer settlement, offtaker invoice, and broker commission.
// Authorization: admin/broker only. Rate limited. Idempotent.
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    if (!(await isPrivileged(client, user.id))) {
      return json({ error: "Forbidden: requires admin or broker role" }, 403)
    }

    if (!(await checkRateLimit(supabase, `generate-settlement:${user.id}`, 20, "1 hour"))) {
      return json({ error: "Rate limit exceeded" }, 429)
    }

    const { contract_id } = await req.json()

    if (!contract_id) {
      return json({ error: "contract_id is required" }, 400)
    }

    // Get contract with all details
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contract_id)
      .single()

    if (contractError || !contract) {
      return json({ error: "Contract not found" }, 404)
    }

    // Idempotency: refuse if a settlement or invoice already exists
    const { data: existingSettlement } = await supabase
      .from("farmer_settlements")
      .select("id")
      .eq("contract_id", contract_id)
      .maybeSingle()
    const { data: existingInvoice } = await supabase
      .from("offtaker_invoices")
      .select("id")
      .eq("contract_id", contract_id)
      .maybeSingle()

    if (existingSettlement || existingInvoice) {
      return json({ error: "Settlement already generated for this contract" }, 409)
    }

    // Calculate amounts — prices are per tonne but quantity is stored in kg,
    // so convert to tonnes before multiplying (matches the dashboards).
    const tonnes = (contract.unit || "kg") === "kg"
      ? (contract.quantity || 0) / 1000
      : (contract.quantity || 0)
    const totalAmount = tonnes * (contract.offtaker_price || 0)
    const farmerPayout = tonnes * (contract.farmer_price || 0)
    const brokerCommission = tonnes * (contract.broker_commission || 0)
    const spread = totalAmount - farmerPayout - brokerCommission

    // Create farmer settlement
    const { data: settlement, error: settlementError } = await supabase
      .from("farmer_settlements")
      .insert({
        contract_id: contract_id,
        farmer_id: contract.farmer_id,
        gross_amount: farmerPayout,
        net_payout: farmerPayout,
        amount: farmerPayout,
        status: "PENDING",
      })
      .select()
      .single()

    if (settlementError) throw settlementError

    // Create offtaker invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("offtaker_invoices")
      .insert({
        contract_id: contract_id,
        offtaker_id: contract.offtaker_id,
        total_amount: totalAmount,
        amount: totalAmount,
        status: "PENDING",
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create broker commission entry
    const { data: commission, error: commissionError } = await supabase
      .from("broker_commission_ledger")
      .insert({
        contract_id: contract_id,
        broker_id: contract.broker_id,
        commission_amount: brokerCommission,
        farmer_buy_price: contract.farmer_price,
        offtaker_sell_price: contract.offtaker_price,
        spread: spread,
        amount: brokerCommission,
        status: "PENDING",
      })
      .select()
      .single()

    if (commissionError) throw commissionError

    // Update contract status to SUCCESSFUL
    await supabase
      .from("contracts")
      .update({ status: "SUCCESSFUL" })
      .eq("id", contract_id)

    // Send notifications to all parties
    const notifications = [
      { user_id: contract.farmer_id, title: "Settlement Generated", body: `Your settlement of $${farmerPayout} is pending for contract ${contract.contract_number}.`, type: "payment" },
      { user_id: contract.offtaker_id, title: "Invoice Generated", body: `Your invoice of $${totalAmount} is pending for contract ${contract.contract_number}.`, type: "payment" },
      { user_id: contract.broker_id, title: "Commission Recorded", body: `Commission of $${brokerCommission} recorded for contract ${contract.contract_number}.`, type: "payment" },
    ].filter(n => n.user_id)

    if (notifications.length > 0) {
      await supabase.from("notifications").insert(notifications)
    }

    return json({
      settlement,
      invoice,
      commission,
      summary: {
        total_amount: totalAmount,
        farmer_payout: farmerPayout,
        broker_commission: brokerCommission,
        spread: spread,
      },
    })
  } catch (error) {
    return json({ error: error.message }, 400)
  }
})
