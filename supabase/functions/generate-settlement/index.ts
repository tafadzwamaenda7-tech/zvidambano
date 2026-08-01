// ============================================================
// Edge Function: generate-settlement
// Generates farmer settlement, offtaker invoice, and broker commission
// when a contract reaches PENDING_SETTLEMENT status
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { contract_id } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get contract with all details
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contract_id)
      .single()

    if (contractError) throw contractError
    if (!contract) throw new Error("Contract not found")

    // Calculate amounts
    const totalAmount = (contract.quantity || 0) * (contract.offtaker_price || 0)
    const farmerPayout = (contract.quantity || 0) * (contract.farmer_price || 0)
    const brokerCommission = (contract.quantity || 0) * (contract.broker_commission || 0)
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

    return new Response(JSON.stringify({
      settlement,
      invoice,
      commission,
      summary: {
        total_amount: totalAmount,
        farmer_payout: farmerPayout,
        broker_commission: brokerCommission,
        spread: spread,
      },
    }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
})
